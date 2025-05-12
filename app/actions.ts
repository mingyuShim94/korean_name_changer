"use server";

import { GoogleGenAI } from "@google/genai";

// Edge 환경에서의 실행을 위한 런타임 설정
export const runtime = "edge";

// KoreanNameData 인터페이스 (API Route 및 page.tsx와 동일한 구조 유지)
interface KoreanNameData {
  original_name: string;
  korean_name: string;
  connection_explanation: string;
  hanja_breakdown: Array<{
    character: string;
    meaning: string;
  }>;
  poetic_interpretation: string;
}

interface GenerateNameParams {
  name: string;
  gender: "masculine" | "feminine";
}

interface ActionResult {
  data?: KoreanNameData;
  error?: string;
}

// 직접 호출을 위한 추가 상수 및 함수
const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

// 성별에 따른 시스템 명령어 생성 함수
function getSystemInstruction(
  gender: "masculine" | "feminine" | "neutral"
): string {
  const baseSystemInstructionText = `You are an AI that transforms foreign names into Korean-style full names (family name + given name) in a poetic and culturally resonant way. You do not translate based on phonetics. Instead, you reinterpret the *meaning*, *imagery*, and *emotional tone* of the original name and generate a natural-sounding Korean name (2–3 syllables) with Chinese characters (Hanja).

✅ Input Handling Rules:
- If the user provides a **full name** (e.g., Sophia Loren), analyze both the **given name** and the **family name** separately.
  - The **given name** must inspire the **Korean given name**.
  - The **family name** must influence the choice of **Korean surname**. Do not ignore it.
- If only a **given name** is provided, choose a Korean surname that matches the tone and concept of the generated name.

✅ Output Format (JSON structured):

{
  "original_name": "[Original Foreign Name]",
  "korean_name": "[Hangul Name] ([Hanja Name], Romanized)",
  "connection_explanation": "[Explain how the foreign given name inspired the Korean given name, and how the foreign family name influenced the Korean surname. Clarify both connections clearly.]",
  "hanja_breakdown": [
    {
      "character": "[Hanja Character]",
      "meaning": "[Symbolic meaning of the character and its relevance to the name.]"
    },
    ...
  ],
  "poetic_interpretation": "[A short, poetic summary of the Korean name, capturing the essence and symbolism of the original name.]"
}

✅ Style Guidelines:
- Do not phonetically transliterate.
- Always generate **natural Korean names** that real people could have.
- Select meaningful Hanja that poetically reflect the original name's imagery and values.
- Be respectful, elegant, and thoughtful in tone — names are deeply personal.
{GENDER_SPECIFIC_INSTRUCTION}`;

  let genderInstruction = "";
  if (gender === "masculine") {
    genderInstruction =
      "\n- Generate a name that has a **masculine** nuance, suitable for a boy. Consider Hanja and sounds that evoke strength, wisdom, or a pioneering spirit.";
  } else if (gender === "feminine") {
    genderInstruction =
      "\n- Generate a name that has a **feminine** nuance, suitable for a girl. Consider Hanja and sounds that evoke beauty, grace, or a gentle nature.";
  } else {
    // neutral or unspecified
    genderInstruction =
      "\n- Generate a name that has a **neutral** nuance, suitable for any gender. Focus on balance and universal appeal in Hanja and sound.";
  }
  return baseSystemInstructionText.replace(
    "{GENDER_SPECIFIC_INSTRUCTION}",
    genderInstruction
  );
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
    if (API_KEY) {
      try {
        console.log("Gemini API 직접 호출 시도 (Edge Runtime)");

        const { name, gender } = params;
        const userMessageParts = [{ text: name }];
        const dynamicSystemInstruction = getSystemInstruction(gender);

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
            const jsonData = JSON.parse(responseText) as KoreanNameData;

            // 응답 데이터 구조 검증
            if (
              jsonData.original_name &&
              jsonData.korean_name &&
              jsonData.connection_explanation &&
              jsonData.hanja_breakdown &&
              jsonData.poetic_interpretation
            ) {
              return { data: jsonData };
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

    const data: KoreanNameData = await response.json();
    return { data };
  } catch (err) {
    console.error("이름 생성 중 오류 발생:", err);
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "An unknown error occurred during name generation." };
  }
}
