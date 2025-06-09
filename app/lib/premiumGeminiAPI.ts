import { GoogleGenAI, Type } from "@google/genai";
import {
  GenderOption,
  NameStyleOption,
  SimplifiedKoreanNamePromptOptions,
  OriginalName,
  KoreanName,
  LifeValues,
  CulturalImpression,
  generateSimplifiedKoreanNameSystemPrompt,
} from "./premiumSystemPrompts";

// 모델 이름 상수
export const MODEL_NAME = "gemini-2.5-flash-preview-05-20";

// Generation parameters
export const generationParams = {
  temperature: 0.7,
  topK: 32,
  topP: 1,
  maxOutputTokens: 8192,
};

// 간소화된 응답 데이터 타입 정의
export interface SimplifiedKoreanNameData {
  original_name: OriginalName;
  korean_name: KoreanName;
  life_values: LifeValues;
  cultural_impression: CulturalImpression;
}

// 파라미터 타입
export interface GenerateSimplifiedNameParams {
  name: string;
  gender: GenderOption;
  nameStyle?: NameStyleOption; // 옵션으로 추가
}

export interface SimplifiedActionResult {
  data?: SimplifiedKoreanNameData;
  error?: string;
}

// API 키 가져오기
export function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY_PAID || "";
  console.log(`API Key Length (Simplified): ${key.length}`);
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

// Gemini API를 사용하여 간소화된 한국 이름 생성하는 함수
export async function generateSimplifiedKoreanNameWithGemini(
  params: GenerateSimplifiedNameParams
): Promise<SimplifiedActionResult> {
  try {
    const { name, gender, nameStyle = "hanja" } = params;
    const userMessageParts = [{ text: name }];

    // prompt 옵션 객체 생성
    const promptOptions: SimplifiedKoreanNamePromptOptions = {
      gender,
      nameStyle,
    };

    // 동적 시스템 프롬프트 생성
    const dynamicSystemInstruction =
      generateSimplifiedKoreanNameSystemPrompt(promptOptions);

    console.log(
      "Selected Simplified System Prompt String (일부):",
      dynamicSystemInstruction.substring(0, 200) + "..."
    );

    // API 키 가져오기
    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        error: "API key missing for simplified service.",
      };
    }

    // 새 GoogleGenAI 인스턴스 생성
    const genAI = new GoogleGenAI({ apiKey });

    // 명확한 JSON 응답 요청
    const explicitJsonInstruction = `IMPORTANT: Respond with a valid JSON object that matches the output_format structure exactly. Do not include any text outside the JSON object. Do not include any explanations or commentary.`;
    const enhancedSystemInstruction =
      dynamicSystemInstruction + "\n\n" + explicitJsonInstruction;

    // 스트림 모드로 API 호출
    console.log("스트림 모드로 Simplified Gemini API 호출...");

    const streamResponse = await genAI.models.generateContentStream({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: userMessageParts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "original_name",
            "korean_name",
            "life_values",
            "cultural_impression",
          ],
          properties: {
            original_name: {
              type: Type.OBJECT,
              required: ["full", "components", "summary"],
              properties: {
                full: {
                  type: Type.STRING,
                },
                components: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: ["name", "meanings", "symbols"],
                    properties: {
                      name: {
                        type: Type.STRING,
                      },
                      meanings: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.STRING,
                        },
                      },
                      symbols: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.STRING,
                        },
                      },
                    },
                  },
                },
                summary: {
                  type: Type.STRING,
                },
              },
            },
            korean_name: {
              type: Type.OBJECT,
              required: [
                "full",
                "romanized",
                "syllables",
                "integrated_meaning",
              ],
              properties: {
                full: {
                  type: Type.STRING,
                },
                romanized: {
                  type: Type.STRING,
                },
                syllables: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    required: [
                      "syllable",
                      "romanized",
                      "hanja",
                      "keywords",
                      "explanation",
                    ],
                    properties: {
                      syllable: {
                        type: Type.STRING,
                      },
                      romanized: {
                        type: Type.STRING,
                      },
                      hanja: {
                        type: Type.STRING,
                      },
                      keywords: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.STRING,
                        },
                      },
                      explanation: {
                        type: Type.STRING,
                      },
                    },
                  },
                },
                integrated_meaning: {
                  type: Type.STRING,
                },
              },
            },
            life_values: {
              type: Type.OBJECT,
              required: ["text"],
              properties: {
                text: {
                  type: Type.STRING,
                },
              },
            },
            cultural_impression: {
              type: Type.OBJECT,
              required: ["text"],
              properties: {
                text: {
                  type: Type.STRING,
                },
              },
            },
          },
        },
        systemInstruction: [{ text: enhancedSystemInstruction }],
        // thinkingConfig: {
        //   thinkingBudget: 0,
        // },
      },
      ...generationParams,
    });

    let fullResponse = "";
    for await (const chunk of streamResponse) {
      fullResponse += chunk.text || "";
    }

    console.log("간소화된 스트림 응답 길이:", fullResponse.length);
    console.log("전체 응답:", fullResponse);

    // 받은 텍스트에서 JSON 추출
    const jsonText = extractJsonFromText(fullResponse);

    try {
      // 추가 검증: 유효한 JSON인지 확인
      const parsedJsonText = JSON.parse(jsonText);
      // 변환된 JSON 문자열로 작업
      const jsonData = parsedJsonText;
      console.log("JSON 구문 분석 성공, 간소화된 데이터 구조 검증 중...");

      // 간소화된 데이터 구조 검증
      if (
        jsonData.original_name &&
        jsonData.korean_name &&
        jsonData.life_values &&
        jsonData.cultural_impression
      ) {
        console.log("간소화된 데이터 구조 검증 성공");

        // 데이터 타입을 SimplifiedKoreanNameData로 캐스팅
        const simplifiedKoreanNameData = jsonData as SimplifiedKoreanNameData;
        return { data: simplifiedKoreanNameData };
      } else {
        console.error(
          "간소화된 응답 데이터 구조 검증 실패:",
          JSON.stringify(jsonData, null, 2).substring(0, 200) + "..."
        );
        return {
          error: "Invalid response format from simplified AI service",
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
    console.error("간소화된 이름 생성 중 오류 발생:", err);
    if (err instanceof Error) {
      return { error: err.message };
    }
    return {
      error: "An unknown error occurred during simplified name generation.",
    };
  }
}
