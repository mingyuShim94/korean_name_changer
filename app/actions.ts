"use server"; // runtime = "edge"

import { GoogleGenAI } from "@google/genai";
// krNameSystemPrompts 사용하도록 변경
import {
  generateKoreanNameSystemPrompt,
  GenderOption,
  NameStyleOption,
  KoreanNamePromptOptions,
  OriginalNameAnalysis,
  KoreanNameSuggestion,
  SocialShareContent,
} from "./lib/krNameSystemPrompts";

// 새로운 응답 데이터 타입 정의 - 무료 버전
interface FreeKoreanNameData {
  original_name: string;
  original_name_analysis: {
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    syllables: {
      syllable: string;
      hanja: string;
      meaning: string;
    }[];
    rationale: string;
  };
}

// 새로운 응답 데이터 타입 정의 - 프리미엄 버전
interface PremiumKoreanNameData {
  original_name: string;
  original_name_analysis: OriginalNameAnalysis;
  korean_name_suggestion: KoreanNameSuggestion;
  social_share_content: SocialShareContent;
}

// 파라미터 타입도 수정
interface GenerateNameParams {
  name: string;
  gender: GenderOption;
  nameStyle?: NameStyleOption; // 옵션으로 추가
  isPremium?: boolean; // 프리미엄 모드 여부
}

interface ActionResult {
  data?: FreeKoreanNameData | PremiumKoreanNameData;
  error?: string;
}

// 직접 호출을 위한 추가 상수 및 함수
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

// Generation parameters
const generationParams = {
  temperature: 0.8,
  topK: 32,
  topP: 1,
  maxOutputTokens: 8192,
};

export async function generateKoreanNameAction(
  params: GenerateNameParams
): Promise<ActionResult> {
  console.log("Server Action 실행 (Edge Runtime): 이름 생성 요청", params);

  try {
    // 1. API를 직접 호출하는 방식 - Edge 환경에서 최적화
    // API 키가 있는지 확인
    if (process.env.GEMINI_API_KEY_FREE || process.env.GEMINI_API_KEY_PAID) {
      try {
        console.log("Gemini API 직접 호출 시도 (Edge Runtime)");

        const { name, gender, nameStyle = "hanja", isPremium = false } = params; // 기본값 설정
        const userMessageParts = [{ text: name }];

        // prompt 옵션 객체 생성
        const promptOptions: KoreanNamePromptOptions = {
          gender,
          nameStyle,
        };

        // 동적 시스템 프롬프트 생성
        const dynamicSystemInstruction =
          generateKoreanNameSystemPrompt(promptOptions);

        console.log(
          "Selected System Prompt String in Action (일부):",
          dynamicSystemInstruction.substring(0, 200) + "..."
        );

        // isPremium에 따라 적절한 API 키 사용
        const apiKey = getApiKey(isPremium);
        if (!apiKey) {
          return {
            error: `API key missing for ${
              isPremium ? "premium" : "free"
            } service.`,
          };
        }

        // 새 GoogleGenAI 인스턴스 생성
        const genAI = new GoogleGenAI({ apiKey });

        // 스트림 모드만 사용
        console.log("스트림 모드로 Gemini API 호출...");

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

        try {
          const jsonData = JSON.parse(jsonText);
          console.log("JSON 구문 분석 성공, 데이터 구조 검증 중...");

          // API 응답에 original_name 필드 추가 (요구 사항)
          jsonData.original_name = name;

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
              return { data: premiumData };
            } else {
              console.error(
                "응답 데이터 구조 검증 실패 (Premium):",
                JSON.stringify(jsonData, null, 2).substring(0, 200) + "..."
              );
              return {
                error: "Invalid response format from AI service (Premium mode)",
              };
            }
          } else {
            // 무료 모드 처리 - 필요한 데이터만 필터링
            if (
              jsonData.original_name_analysis &&
              jsonData.korean_name_suggestion
            ) {
              console.log("무료 데이터 구조 검증 성공");
              // 무료 모드에 맞게 데이터 필터링
              const freeData: FreeKoreanNameData = {
                original_name: name,
                original_name_analysis: {
                  summary: jsonData.original_name_analysis.summary,
                },
                korean_name_suggestion: {
                  full_name: jsonData.korean_name_suggestion.full_name,
                  syllables: jsonData.korean_name_suggestion.syllables,
                  rationale: jsonData.korean_name_suggestion.rationale,
                },
              };
              return { data: freeData };
            } else {
              console.error(
                "응답 데이터 구조 검증 실패 (Free):",
                JSON.stringify(jsonData, null, 2).substring(0, 200) + "..."
              );
              return {
                error: "Invalid response format from AI service (Free mode)",
              };
            }
          }
        } catch (parseError) {
          console.error("JSON 파싱 오류:", parseError);
          console.error(
            "응답 텍스트 샘플:",
            jsonText.substring(0, 200) + "..."
          );
          return {
            error:
              "JSON 파싱 실패: " +
              (parseError instanceof Error
                ? parseError.message
                : String(parseError)),
          };
        }
      } catch (directApiError) {
        console.error("Gemini API 직접 호출 실패:", directApiError);
        // 오류 발생 시 API 라우트 방식으로 폴백
      }
    }

    // 2. API 라우트를 통한 호출 (폴백 방식)
    console.log("API 라우트 방식으로 호출 시도");

    // baseUrl 설정 방식 개선
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    console.log("Server Action 실행: baseUrl =", baseUrl);

    const response = await fetch(`${baseUrl}/api/generate-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    console.log("API 응답 완료");

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API request failed with status ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error("응답 오류 파싱 실패:", e);
        console.error("원본 오류 응답:", errorText.substring(0, 200));
      }

      return { error: errorMessage };
    }

    const responseText = await response.text();

    try {
      const data = JSON.parse(responseText) as
        | FreeKoreanNameData
        | PremiumKoreanNameData;
      return { data };
    } catch (parseError) {
      console.error("API 응답 JSON 파싱 오류:", parseError);
      console.error(
        "응답 텍스트 프리뷰:",
        responseText.substring(0, 200) + "..."
      );
      return { error: "Failed to parse API response as JSON" };
    }
  } catch (err) {
    console.error("이름 생성 중 오류 발생:", err);
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "An unknown error occurred during name generation." };
  }
}
