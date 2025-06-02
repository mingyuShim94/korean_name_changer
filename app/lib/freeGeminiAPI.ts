import { GoogleGenAI, Type } from "@google/genai";
import {
  GenderOption,
  NameStyleOption,
  KoreanNamePromptOptions,
  KoreanNameSuggestion,
  SocialShareContent,
  generateKoreanNameSystemPrompt,
} from "./freeSystemPrompts";

// 모델 이름 상수
export const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

// Generation parameters
export const generationParams = {
  temperature: 0.8,
  topK: 32,
  topP: 1,
  maxOutputTokens: 8192,
};

// 응답 데이터 타입 정의 (무료 버전)
export interface KoreanNameData {
  original_name: string;
  korean_name_suggestion: KoreanNameSuggestion;
  social_share_content: SocialShareContent;
}

// 파라미터 타입
export interface GenerateNameParams {
  name: string;
  gender: GenderOption;
  nameStyle?: NameStyleOption; // 옵션으로 추가
}

export interface ActionResult {
  data?: KoreanNameData;
  error?: string;
}

// API 키 가져오기
export function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY_FREE || "";
  console.log(`API Key Length (Free): ${key.length}`);
  return key;
}

// 응답 텍스트에서 JSON만 추출하는 헬퍼 함수
export function extractJsonFromText(text: string): string {
  try {
    // 일단 유효한 JSON인지 시도
    try {
      JSON.parse(text);
      return text; // 이미 유효한 JSON이면 그대로 반환
    } catch {
      // 유효하지 않은 경우 계속 진행
    }

    // 1. 여러 줄의 텍스트에서 JSON 객체 찾기
    // JSON 시작과 끝 찾기 (중첩된 중괄호 고려)
    const jsonStart = text.indexOf("{");
    if (jsonStart === -1) return text; // JSON이 없으면 원본 반환

    let openBraces = 0;
    let jsonEnd = -1;

    for (let i = jsonStart; i < text.length; i++) {
      if (text[i] === "{") {
        openBraces++;
      } else if (text[i] === "}") {
        openBraces--;
        if (openBraces === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
    }

    if (jsonEnd === -1) {
      console.error("균형 잡힌 JSON을 찾을 수 없음");
      return text;
    }

    // 추출된 JSON 문자열
    let jsonString = text.substring(jsonStart, jsonEnd);

    // 2. 정리: 불필요한 이스케이프나 서식 제거
    jsonString = jsonString
      .replace(/\\n/g, " ")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");

    // 3. 유효성 검사
    try {
      // 테스트 파싱
      const parsedJson = JSON.parse(jsonString);
      // 정상적으로 파싱되면 정리된 형식으로 반환
      return JSON.stringify(parsedJson);
    } catch (validationError) {
      console.error("추출된 JSON 검증 실패:", validationError);

      // 4. 마지막 시도: 정규식으로 첫 번째 JSON 객체 추출
      const jsonRegex = /{[^]*?}(?=[^{]*$)/;
      const matches = text.match(jsonRegex);

      if (matches && matches[0]) {
        try {
          JSON.parse(matches[0]);
          return matches[0];
        } catch {
          console.error("정규식으로 추출한 JSON도 유효하지 않음");
        }
      }

      return jsonString; // 그래도 추출된 문자열 반환
    }
  } catch (error) {
    console.error("JSON 추출 실패:", error);
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

// Gemini API를 사용하여 한국 이름 생성하는 함수 (무료 버전)
export async function generateKoreanNameWithGemini(
  params: GenerateNameParams
): Promise<{
  data?: KoreanNameData;
  error?: string;
}> {
  try {
    const { name, gender, nameStyle = "hanja" } = params;
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
      "Selected System Prompt String (일부):",
      dynamicSystemInstruction.substring(0, 200) + "..."
    );

    // API 키 가져오기
    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        error: "API key missing for free service.",
      };
    }

    // 새 GoogleGenAI 인스턴스 생성
    const genAI = new GoogleGenAI({ apiKey });

    // 명확한 JSON 응답 요청
    const explicitJsonInstruction = `IMPORTANT: Respond with a valid JSON object that matches the output_format structure exactly. Do not include any text outside the JSON object. Do not include any explanations or commentary.`;
    const enhancedSystemInstruction =
      dynamicSystemInstruction + "\n\n" + explicitJsonInstruction;

    // 스트림 모드로 API 호출
    console.log("스트림 모드로 Gemini API 호출...");

    const streamResponse = await genAI.models.generateContentStream({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: userMessageParts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["korean_name_suggestion", "social_share_content"],
          properties: {
            korean_name_suggestion: {
              type: Type.OBJECT,
              required: ["full_name", "syllables", "rationale"],
              properties: {
                full_name: {
                  type: Type.STRING,
                },
                syllables: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["syllable", "romanization", "hanja", "meaning"],
                    properties: {
                      syllable: {
                        type: Type.STRING,
                      },
                      romanization: {
                        type: Type.STRING,
                      },
                      hanja: {
                        type: Type.STRING,
                      },
                      meaning: {
                        type: Type.STRING,
                      },
                    },
                  },
                },
                rationale: {
                  type: Type.STRING,
                },
              },
            },
            social_share_content: {
              type: Type.OBJECT,
              required: ["formatted", "summary"],
              properties: {
                formatted: {
                  type: Type.STRING,
                },
                summary: {
                  type: Type.STRING,
                },
              },
            },
          },
        },
        systemInstruction: [{ text: enhancedSystemInstruction }],
      },
      ...generationParams,
    });

    let fullResponse = "";
    for await (const chunk of streamResponse) {
      fullResponse += chunk.text || "";
    }

    console.log("스트림 응답 길이:", fullResponse.length);
    console.log("전체 응답:", fullResponse);

    // 받은 텍스트에서 JSON 추출
    const jsonText = extractJsonFromText(fullResponse);

    try {
      // 추가 검증: 유효한 JSON인지 확인
      const parsedJsonText = JSON.parse(jsonText);
      // 변환된 JSON 문자열로 작업
      const jsonData = parsedJsonText;
      console.log("JSON 구문 분석 성공, 데이터 구조 검증 중...");

      // API 응답에 original_name 필드 추가 (요구 사항)
      jsonData.original_name = name;

      // 공통 데이터 구조 검증
      if (jsonData.korean_name_suggestion && jsonData.social_share_content) {
        console.log("데이터 구조 검증 성공");

        // 데이터 타입을 KoreanNameData로 통일
        const koreanNameData = jsonData as KoreanNameData;
        return { data: koreanNameData };
      } else {
        console.error(
          "응답 데이터 구조 검증 실패:",
          JSON.stringify(jsonData, null, 2).substring(0, 200) + "..."
        );
        return {
          error: "Invalid response format from AI service",
        };
      }
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError);
      console.error("응답 텍스트 샘플:", jsonText.substring(0, 200) + "...");
      return {
        error:
          "JSON 파싱 실패: " +
          (parseError instanceof Error
            ? parseError.message
            : String(parseError)),
      };
    }
  } catch (err) {
    console.error("이름 생성 중 오류 발생:", err);
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "An unknown error occurred during name generation." };
  }
}
