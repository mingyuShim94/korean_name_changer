import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
// krNameSystemPrompts 사용하도록 변경
import {
  generateKoreanNameSystemPrompt,
  GenderOption,
  NameStyleOption,
  KoreanNamePromptOptions,
  OriginalNameAnalysis,
  KoreanNameSuggestion,
  SocialShareContent,
} from "../../lib/krNameSystemPrompts";

// Cloudflare Pages에서는 Edge Runtime이 필수입니다
export const runtime = "edge";

// 새로운 응답 데이터 타입 정의 - 무료 버전
interface FreeKoreanNameData {
  original_name: string;
  original_name_analysis: {
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
  };
  social_share_content: {
    formatted: string;
  };
}

// 새로운 응답 데이터 타입 정의 - 프리미엄 버전
interface PremiumKoreanNameData {
  original_name: string;
  original_name_analysis: OriginalNameAnalysis;
  korean_name_suggestion: KoreanNameSuggestion;
  social_share_content: SocialShareContent;
}

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
// isPremium 여부에 따라 다른 API 키 사용
function getApiKey(isPremium: boolean): string {
  const key = isPremium
    ? process.env.GEMINI_API_KEY_PAID || ""
    : process.env.GEMINI_API_KEY_FREE || "";

  console.log(
    `API Key Length (${isPremium ? "Premium" : "Free"}): ${key.length}`
  );
  return key;
}

// 응답 텍스트에서 JSON만 추출하는 헬퍼 함수
function extractJsonFromText(text: string): string {
  try {
    // JSON 문자열의 시작과 끝을 찾습니다
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}") + 1;

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      const jsonString = text.substring(jsonStart, jsonEnd);
      // 유효한 JSON인지 테스트
      JSON.parse(jsonString);
      return jsonString;
    }

    // JSON 형식이 아닌 경우 원본 반환
    return text;
  } catch (error) {
    console.error("JSON 추출 실패:", error);
    // 원본 텍스트에 JSON이 포함된 곳을 찾아 출력
    console.log(
      "텍스트 내 JSON 범위 추정:",
      text.indexOf("{"),
      "부터",
      text.lastIndexOf("}"),
      "까지"
    );
    console.log("텍스트 샘플(처음 50자):", text.substring(0, 50));
    console.log("텍스트 샘플(마지막 50자):", text.substring(text.length - 50));
    return text;
  }
}

// API 키 검증
if (!process.env.GEMINI_API_KEY_FREE || !process.env.GEMINI_API_KEY_PAID) {
  console.error(
    "CRITICAL: One or more Gemini API keys are not set in environment variables."
  );
  // 프로덕션 환경에서는 여기서 애플리케이션을 중단하거나, 기능을 비활성화할 수 있습니다.
}

// Generation parameters (temperature, topK 등)
const generationParams = {
  temperature: 0.8,
  topK: 32,
  topP: 1,
  maxOutputTokens: 8192,
};

export async function POST(request: NextRequest) {
  console.log("API 요청이 시작되었습니다 (Edge Runtime)");

  let foreignName: string | undefined;
  let gender: GenderOption = "neutral"; // 기본값을 neutral로 설정
  let nameStyle: NameStyleOption = "hanja"; // 기본값을 hanja로 설정
  let isPremium: boolean = false; // 기본값을 false로 설정

  try {
    // Edge Runtime에서 안정적으로 실행되도록 요청 처리 최적화
    const body = await request.json().catch((e) => {
      console.error("요청 JSON 파싱 오류:", e);
      return {};
    });

    console.log("API 요청 본문:", JSON.stringify(body));

    foreignName = body?.name as string;
    // gender 값 유효성 검사 및 할당
    if (
      body?.gender &&
      ["masculine", "feminine", "neutral"].includes(body.gender)
    ) {
      gender = body.gender as GenderOption;
    }

    // nameStyle 값 유효성 검사 및 할당
    if (body?.nameStyle && ["hanja", "pureKorean"].includes(body.nameStyle)) {
      nameStyle = body.nameStyle as NameStyleOption;
    }

    // isPremium 값 확인
    if (typeof body?.isPremium === "boolean") {
      isPremium = body.isPremium;
    }

    if (
      !foreignName ||
      typeof foreignName !== "string" ||
      foreignName.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Name parameter is required and must be a non-empty string." },
        { status: 400 }
      );
    }

    console.log(
      `API 요청 파라미터: name=${foreignName}, gender=${gender}, nameStyle=${nameStyle}, isPremium=${isPremium}`
    );

    const userMessageParts = [{ text: foreignName }];

    // 프롬프트 옵션 객체 생성
    const promptOptions: KoreanNamePromptOptions = {
      gender,
      nameStyle,
    };

    // 동적 시스템 프롬프트 생성
    const dynamicSystemInstruction =
      generateKoreanNameSystemPrompt(promptOptions);

    // 선택된 시스템 프롬프트 문자열을 콘솔에 출력
    console.log(
      "Selected System Prompt String in API Route (일부):",
      dynamicSystemInstruction.substring(0, 200) + "..."
    );

    // isPremium에 따라 적절한 API 키 사용
    const apiKey = getApiKey(isPremium);
    if (!apiKey) {
      return NextResponse.json(
        {
          error: `API key missing for ${
            isPremium ? "premium" : "free"
          } service.`,
        },
        { status: 500 }
      );
    }

    // 매번 새로운 GoogleGenAI 인스턴스 생성
    const genAI = new GoogleGenAI({ apiKey });

    // 스트림 모드로 API 호출
    console.log("스트림 모드로 Gemini API 호출 시작...");

    const streamResponse = await genAI.models.generateContentStream({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: userMessageParts }],
      config: {
        responseMimeType: "application/json",
        systemInstruction: [{ text: dynamicSystemInstruction }],
      },
      ...generationParams,
    });

    let fullResponse = "";
    for await (const chunk of streamResponse) {
      fullResponse += chunk.text || "";
    }

    console.log("스트림 응답 길이:", fullResponse.length);
    console.log("응답 샘플:", fullResponse.substring(0, 100) + "...");

    // 받은 텍스트에서 JSON 추출
    const jsonText = extractJsonFromText(fullResponse);

    if (!jsonText) {
      console.error("API_RESPONSE_EMPTY: 응답에 텍스트가 없습니다.");
      return NextResponse.json(
        { error: "Empty response from Gemini API" },
        { status: 500 }
      );
    }

    try {
      const jsonData = JSON.parse(jsonText);
      console.log("JSON 구문 분석 성공, 데이터 구조 검증 중...");

      // API 응답에 original_name 필드 추가 (요구 사항)
      jsonData.original_name = foreignName;

      // 프리미엄 모드인 경우 전체 데이터 반환
      if (isPremium) {
        // 프리미엄 응답 구조 검증
        if (
          jsonData.original_name_analysis &&
          jsonData.korean_name_suggestion &&
          jsonData.social_share_content
        ) {
          console.log("프리미엄 데이터 구조 검증 성공");
          const premiumData = jsonData as PremiumKoreanNameData;
          return NextResponse.json(premiumData);
        } else {
          console.error(
            "응답 데이터 구조 검증 실패 (Premium):",
            JSON.stringify(jsonData, null, 2).substring(0, 200) + "..."
          );
          return NextResponse.json(
            {
              error: "Received premium data does not match expected structure",
            },
            { status: 500 }
          );
        }
      } else {
        // 무료 모드 처리 - 필요한 데이터만 필터링
        if (
          jsonData.original_name_analysis &&
          jsonData.korean_name_suggestion &&
          jsonData.social_share_content
        ) {
          console.log("무료 데이터 구조 검증 성공");
          // 무료 모드에 맞게 데이터 필터링
          const freeData: FreeKoreanNameData = {
            original_name: foreignName,
            original_name_analysis: {
              summary: jsonData.original_name_analysis.summary,
            },
            korean_name_suggestion: {
              full_name: jsonData.korean_name_suggestion.full_name,
            },
            social_share_content: {
              formatted: jsonData.social_share_content.formatted,
            },
          };
          return NextResponse.json(freeData);
        } else {
          console.error(
            "응답 데이터 구조 검증 실패 (Free):",
            JSON.stringify(jsonData, null, 2).substring(0, 200) + "..."
          );
          return NextResponse.json(
            { error: "Received data does not match expected structure" },
            { status: 500 }
          );
        }
      }
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      console.error(
        "응답 텍스트의 처음 300자:",
        jsonText.substring(0, 300) + "..."
      );
      return NextResponse.json(
        {
          error: "Failed to parse Gemini API response as JSON",
          details:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    // error 타입을 Error 또는 unknown으로 변경
    let errorMessage =
      "An unexpected error occurred while processing your request.";
    const errorDetails = error instanceof Error ? error.message : String(error);
    const statusCode = 500; // 기본 상태 코드를 500으로 설정

    // 콘솔에 더 자세한 오류 정보 로깅
    console.error(
      `Error in POST /api/generate-name for input: '${foreignName}', gender: '${gender}', style: '${nameStyle}', isPremium: '${isPremium}':`, // 요청 값 로깅
      errorDetails,
      error instanceof Error ? error.stack : "No stack trace available", // 에러 스택 로깅
      error // 전체 에러 객체 로깅
    );

    if (error instanceof Error) {
      if (error.message?.includes("API_RESPONSE_EMPTY")) {
        errorMessage = "Gemini API returned an empty response.";
      } else if (error.message?.includes("API_RESPONSE_MALFORMED")) {
        errorMessage = "Received malformed data from Gemini API.";
      } else if (error.name === "SyntaxError") {
        // JSON.parse 오류
        errorMessage =
          "Failed to parse response from Gemini API. Response was not valid JSON.";
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
}
