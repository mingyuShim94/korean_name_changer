import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Edge 런타임에서 Node.js 런타임으로 변경
export const runtime = "nodejs";

// 타입 정의 (프론트엔드와 공유 가능)
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

// 프론트엔드에서 전달받을 성별 타입
type GenderOption = "masculine" | "feminine" | "neutral";

const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const API_KEY = process.env.GEMINI_API_KEY || "";

// API 키가 없을 경우 로드 시점에 오류 발생 또는 경고
if (!API_KEY) {
  console.error(
    "CRITICAL: GEMINI_API_KEY is not set in environment variables."
  );
  // 프로덕션 환경에서는 여기서 애플리케이션을 중단하거나, 기능을 비활성화할 수 있습니다.
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

// 기본 시스템 명령어 템플릿
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
- Select meaningful Hanja that poetically reflect the original name\'s imagery and values.
- Be respectful, elegant, and thoughtful in tone — names are deeply personal.
{GENDER_SPECIFIC_INSTRUCTION}
✅ Example:

{
  "original_name": "Sophia Loren",
  "korean_name": "이예지 (李藝智, Lee Ye-ji)",
  "connection_explanation": "The name 'Sophia' means 'wisdom' in Greek, signifying deep understanding and insight, which inspired the Korean given name 'Ye-ji' (예지), meaning 'artistic wisdom' or 'cultivated intelligence.' The surname 'Loren' is associated with a timeless elegance and classic beauty, much like the common and historically significant Korean surname 'Lee' (이, 李 - originally meaning 'plum tree'), which conveys a sense of graceful tradition and resilience.",
  "hanja_breakdown": [
    {
      "character": "李",
      "meaning": "A widespread and traditional Korean surname, symbolizing steadfastness and classic elegance, referencing the plum tree."
    },
    {
      "character": "藝",
      "meaning": "Art, skill, talent, cultivation — reflecting Sophia Loren's masterful artistry and refined presence."
    },
    {
      "character": "智",
      "meaning": "Wisdom, intelligence — directly corresponding to the meaning of the original name 'Sophia'."
    }
  ],
  "poetic_interpretation": "'Lee Ye-ji' embodies the image of a wise and cultivated spirit, possessing both deep insight and artistic grace. It captures the essence of classic beauty combined with profound inner strength, much like a plum tree blooming with quiet, intelligent beauty."
}
`;

// 성별에 따른 시스템 명령어 생성 함수
function getSystemInstruction(gender: GenderOption): string {
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
  console.log("API 요청이 시작되었습니다.");
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

  try {
    const reqBody = await request.json();
    foreignName = reqBody.name as string;
    // gender 값 유효성 검사 및 할당
    if (
      reqBody.gender &&
      ["masculine", "feminine", "neutral"].includes(reqBody.gender)
    ) {
      gender = reqBody.gender as GenderOption;
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
    const dynamicSystemInstruction = getSystemInstruction(gender);

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

    const jsonData = JSON.parse(responseText) as KoreanNameData;

    // 응답 데이터 구조 검증 (선택적이지만 권장)
    if (
      !jsonData.original_name ||
      !jsonData.korean_name ||
      !jsonData.connection_explanation ||
      !jsonData.hanja_breakdown ||
      !jsonData.poetic_interpretation
    ) {
      console.warn(
        "API_RESPONSE_MALFORMED: Received data does not match expected structure.",
        jsonData
      );
      // 여기서 커스텀 오류를 발생시키거나, 기본값을 채워넣을 수 있습니다.
      throw new Error(
        "API_RESPONSE_MALFORMED: Received data does not match expected structure."
      );
    }

    return NextResponse.json(jsonData);
  } catch (error) {
    // error 타입을 Error 또는 unknown으로 변경
    let errorMessage =
      "An unexpected error occurred while processing your request.";
    const errorDetails = error instanceof Error ? error.message : String(error);
    const statusCode = 500; // 기본 상태 코드를 500으로 설정

    // 콘솔에 더 자세한 오류 정보 로깅
    console.error(
      `Error in POST /api/generate-name for input: '${foreignName}', gender: '${gender}':`, // 요청 값 로깅
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
