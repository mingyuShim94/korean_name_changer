"use server"; // runtime = "edge"

import { GoogleGenAI } from "@google/genai";
import { headers } from "next/headers"; // headers 함수 임포트

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
  message?: string;
  details?: string;
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
  let baseUrl = "";

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
            if (
              jsonData.original_name &&
              jsonData.korean_name &&
              jsonData.connection_explanation &&
              jsonData.hanja_breakdown &&
              jsonData.poetic_interpretation
            ) {
              return { data: jsonData };
            }
            console.warn(
              "[Action] Direct API call: Malformed JSON data from Gemini.",
              responseText
            );
            // Malformed JSON이면 폴백 로직으로 갈 수 있도록 여기서 에러를 던지거나 처리하지 않고 넘어감
          } catch (parseError) {
            console.error(
              "[Action] Direct API call: JSON parsing error.",
              parseError,
              responseText
            );
            // 파싱 오류 시 API 라우트 방식으로 폴백 (아래 로직으로 이어짐)
          }
        } else {
          console.warn("[Action] Direct API call: Empty response from Gemini.");
          // 빈 응답 시 API 라우트 방식으로 폴백 (아래 로직으로 이어짐)
        }
      } catch (directApiError) {
        console.error("[Action] Direct API call: Failed.", directApiError);
        // 직접 API 호출 실패 시 API 라우트 방식으로 폴백 (아래 로직으로 이어짐)
      }
    }
    // 만약 직접 API 호출이 성공해서 여기서 return { data: jsonData } 가 실행됐다면, 아래 폴백 로직은 실행되지 않습니다.

    // 2. API 라우트를 통한 호출 (폴백 방식)
    console.log("API 라우트 방식으로 호출 시도 (폴백)");

    const heads = await headers();
    const host = heads.get("host");
    const protocolHeader = heads.get("x-forwarded-proto");
    const protocol =
      protocolHeader ||
      (process.env.NODE_ENV === "development" ? "http" : "https");
    baseUrl = `${protocol}://${host}`;

    console.log("Server Action 실행 (폴백): baseUrl =", baseUrl);

    const response = await fetch(`${baseUrl}/api/generate-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    console.log("API 응답 상태 (폴백):", response.status);

    if (!response.ok) {
      // API 라우트가 JSON 에러를 반환할 것으로 예상
      const errorData = await response.json().catch(() => {
        // 만약 response.json() 파싱도 실패하면 (정말 예외적인 HTML 오류 페이지 등)
        console.error(
          "[Action] Fallback API call: Failed to parse error response as JSON. Status:",
          response.status
        );
        return {
          error: "API Error",
          message: `API request failed with status ${response.status}. Response was not valid JSON.`,
          serverErrorDetails: "The server returned a non-JSON error response.",
        };
      });
      console.error(
        "[Action] Fallback API call: Error response from API route.",
        errorData
      );
      // route.ts 에서 보낸 error, message, serverErrorDetails를 그대로 전달하거나, 여기서 가공
      return {
        error: errorData.error || "API Request Failed",
        message:
          errorData.message ||
          `API request failed with status ${response.status}`,
        details:
          errorData.serverErrorDetails || "No further details from server.", // 클라이언트에서 사용할 필드명
      };
    }

    const data: KoreanNameData = await response.json();
    return { data };
  } catch (err) {
    console.error("[Action] Outer catch block: 이름 생성 중 오류 발생:", err);
    let errorMessage = "An unknown error occurred during name generation.";
    let errorDetails = "No specific details.";

    if (err instanceof Error) {
      errorMessage = err.message;
      const errorWithCause = err as Error & { cause?: unknown };
      if (
        errorWithCause.cause &&
        typeof errorWithCause.cause === "object" &&
        "message" in errorWithCause.cause &&
        typeof (errorWithCause.cause as { message: unknown }).message ===
          "string" &&
        (errorWithCause.cause as { message: string }).message.includes(
          "Invalid URL"
        )
      ) {
        console.error("[Action] Invalid URL error in outer catch:", err);
        errorMessage = `Failed to fetch API: Invalid URL. Attempted URL was ${baseUrl}/api/generate-name`;
        errorDetails = (errorWithCause.cause as { message: string }).message;
      }
    }
    return {
      error: "Action Error",
      message: errorMessage,
      details: errorDetails,
    };
  }
}
