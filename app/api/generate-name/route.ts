import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
// system prompt 및 타입 import
import {
  getSystemInstruction,
  GenderOption,
  NameStyleOption,
} from "../../lib/nameSystemPrompts";

// Cloudflare Pages에서는 Edge Runtime이 필수입니다
export const runtime = "edge";

// 타입 정의 (프론트엔드와 공유 가능)
interface KoreanNameData {
  original_name: string;
  suggested_korean_name: {
    hangul: string;
    hanja?: string;
    romanization: string;
  };
  interpretation: {
    core_meaning_summary: string;
    element_analysis: Array<{
      hangul_syllable: string;
      hanja_character?: string;
      meaning_english_hint: string;
      relevance_to_name: string;
    }>;
    connection_and_rationale: string;
    poetic_interpretation_of_korean_name: string;
  };
}

// 프리미엄용 응답 데이터 타입 정의
interface PremiumKoreanNameData {
  original_name: string;
  suggested_korean_name: {
    hangul: string;
    hanja?: string;
    romanization: string;
  };
  interpretation: {
    core_meaning_summary: string;
    element_analysis: Array<{
      hangul_syllable: string;
      hanja_character?: string;
      meaning_english_hint: string;
      relevance_to_name: string;
    }>;
    connection_and_rationale: string;
    synthesized_meaning_and_aspiration: string;
    poetic_interpretation_of_korean_name: string;
    virtue_and_life_direction: string;
    cultural_blessing_note: string;
    full_interpretation_text_narrative: string;
  };
}

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const API_KEY = process.env.GEMINI_API_KEY_FREE || "";

// API 키가 없을 경우 로드 시점에 오류 발생 또는 경고
if (!API_KEY) {
  console.error(
    "CRITICAL: GEMINI_API_KEY_FREE is not set in environment variables."
  );
  // 프로덕션 환경에서는 여기서 애플리케이션을 중단하거나, 기능을 비활성화할 수 있습니다.
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

// Generation parameters (temperature, topK 등)
const generationParams = {
  temperature: 0.8,
  topK: 32,
  topP: 1,
  maxOutputTokens: 8192,
};

// SafetySettings는 @google/genai에서의 정확한 사용법 확인 필요. 현재는 생략.
// const safetySettings = [ ... ];

export async function POST(request: NextRequest) {
  console.log("API 요청이 시작되었습니다 (Edge Runtime)");
  if (!API_KEY) {
    console.error("API_KEY가 없습니다. 환경 변수를 확인하세요.");
    // 클라이언트에는 좀 더 일반적인 오류 메시지를 반환합니다.
    return NextResponse.json(
      { error: "Server configuration error. API key might be missing." },
      { status: 500 }
    );
  }

  let foreignName: string | undefined;
  let gender: GenderOption = "neutral"; // 기본값을 neutral로 설정
  let nameStyle: NameStyleOption = "hanja"; // 기본값을 hanja로 설정
  let isPremium: boolean = false; // 기본값을 false로 설정

  try {
    // Edge Runtime에서 안정적으로 실행되도록 요청 처리 최적화
    const body = await request.json().catch(() => ({}));
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

    const userMessageParts = [{ text: foreignName }];
    const dynamicSystemInstruction = getSystemInstruction(
      gender,
      nameStyle,
      isPremium
    );

    // API 호출 시 동적 시스템 명령어 사용
    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: userMessageParts }],
      config: {
        // config 객체를 직접 생성하여 전달
        responseMimeType: "application/json",
        systemInstruction: [{ text: dynamicSystemInstruction }],
      },
      ...generationParams,
    });

    let responseText = "";
    if (result && result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts.length > 0
      ) {
        responseText = candidate.content.parts[0].text || "";
      }
    }

    if (!responseText) {
      throw new Error(
        "API_RESPONSE_EMPTY: Gemini API did not return text, or text could not be extracted from response structure."
      );
    }

    const jsonData = JSON.parse(responseText);

    // 프리미엄 모드인 경우 다른 형식으로 검증
    if (isPremium) {
      // 프리미엄 응답 구조 검증
      if (
        !jsonData.original_name ||
        !jsonData.suggested_korean_name ||
        !jsonData.interpretation
      ) {
        console.warn(
          "API_RESPONSE_MALFORMED: Received premium data does not match expected structure.",
          jsonData
        );
        throw new Error(
          "API_RESPONSE_MALFORMED: Received premium data does not match expected structure."
        );
      }
      // 프리미엄 데이터 그대로 반환
      return NextResponse.json(jsonData as PremiumKoreanNameData);
    } else {
      // 일반 모드 처리
      // 응답 데이터 구조 검증
      if (
        !jsonData.original_name ||
        !jsonData.suggested_korean_name ||
        !jsonData.interpretation ||
        !jsonData.interpretation.core_meaning_summary ||
        !jsonData.interpretation.element_analysis ||
        !jsonData.interpretation.connection_and_rationale ||
        !jsonData.interpretation.poetic_interpretation_of_korean_name
      ) {
        console.warn(
          "API_RESPONSE_MALFORMED: Received data does not match expected structure.",
          jsonData
        );
        throw new Error(
          "API_RESPONSE_MALFORMED: Received data does not match expected structure."
        );
      }

      return NextResponse.json(jsonData as KoreanNameData);
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
      // GoogleGenerativeAI 에러 객체 확인 (존재한다면)
      // if (error.httpErrorCode) { statusCode = error.httpErrorCode; }
      // 혹은 error.status, error.code 등 API 에러 객체의 속성을 확인하여 상태 코드 조정
    }

    // statusCode를 JSON 응답에 포함시킵니다.
    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
}
