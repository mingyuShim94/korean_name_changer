"use server"; // runtime = "edge"

import { GoogleGenAI } from "@google/genai";
// system prompt 및 타입 import
import {
  getSystemInstruction,
  GenderOption,
  NameStyleOption,
} from "./lib/nameSystemPrompts";

// KoreanNameData 인터페이스 (API Route 및 page.tsx와 동일한 구조 유지)
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

// 프리미엄용 응답 데이터 타입 정의 (더 자세한 해석을 위함)
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

// 파라미터 타입도 수정
interface GenerateNameParams {
  name: string;
  gender: GenderOption;
  nameStyle?: NameStyleOption; // 옵션으로 추가
  isPremium?: boolean; // 프리미엄 모드 여부
}

interface ActionResult {
  data?: KoreanNameData | PremiumKoreanNameData;
  error?: string;
}

// 직접 호출을 위한 추가 상수 및 함수
const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const API_KEY = process.env.GEMINI_API_KEY_FREE || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

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
    if (API_KEY) {
      try {
        console.log("Gemini API 직접 호출 시도 (Edge Runtime)");

        const { name, gender, nameStyle = "hanja", isPremium = false } = params; // 기본값 설정
        const userMessageParts = [{ text: name }];
        const dynamicSystemInstruction = getSystemInstruction(
          gender,
          nameStyle,
          isPremium // isPremium 매개변수 전달
        );

        const result = await genAI.models.generateContent({
          model: MODEL_NAME,
          contents: [{ role: "user", parts: userMessageParts }],
          config: {
            responseMimeType: "application/json",
            systemInstruction: [{ text: dynamicSystemInstruction }],
          },
          ...generationParams,
        });

        let responseText = "";
        if (result?.candidates?.[0]?.content?.parts?.[0]?.text) {
          responseText = result.candidates[0].content.parts[0].text;
          console.log("Gemini API 직접 호출 성공");

          try {
            const jsonData = JSON.parse(responseText);

            // 프리미엄 모드인 경우 다른 형식으로 처리
            if (isPremium) {
              // 프리미엄 데이터 구조 확인
              if (
                typeof jsonData.original_name === "string" &&
                jsonData.suggested_korean_name &&
                jsonData.interpretation
              ) {
                const premiumData = jsonData as PremiumKoreanNameData;
                return { data: premiumData };
              }
            } else {
              // 일반 모드 처리 - 새로운 JSON 구조에 맞게 수정
              if (
                typeof jsonData.original_name === "string" &&
                jsonData.suggested_korean_name &&
                jsonData.interpretation &&
                jsonData.interpretation.core_meaning_summary &&
                jsonData.interpretation.element_analysis &&
                jsonData.interpretation.connection_and_rationale &&
                jsonData.interpretation.poetic_interpretation_of_korean_name
              ) {
                // 구조가 맞으면 그대로 반환
                const resultData = jsonData as KoreanNameData;
                return { data: resultData };
              }
            }
          } catch (parseError) {
            console.error("JSON 파싱 오류:", parseError);
            // 파싱 오류 시 API 라우트 방식으로 폴백
          }
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

    console.log("API 응답 상태:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      return {
        error:
          errorData.error ||
          `API request failed with status ${response.status}`,
      };
    }

    const data: KoreanNameData | PremiumKoreanNameData = await response.json();
    return { data };
  } catch (err) {
    console.error("이름 생성 중 오류 발생:", err);
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "An unknown error occurred during name generation." };
  }
}
