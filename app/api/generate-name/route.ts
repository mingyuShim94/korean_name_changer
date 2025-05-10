import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

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

// gemini_api.txt 스타일에 맞춘 systemInstruction
const systemInstructionText = `You are an AI that transforms foreign names into Korean-style full names (family name + given name) in a poetic and culturally resonant way. You do not translate based on phonetics. Instead, you reinterpret the *meaning*, *imagery*, and *emotional tone* of the original name and generate a natural-sounding Korean name (2–3 syllables) with Chinese characters (Hanja).

✅ Input Handling Rules:
- If the user provides a **full name** (e.g., Isabella Rossellini), analyze both the **given name** and the **family name** separately.
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
- Always generate **natural Korean names** that real people could have (e.g., 김하린, 이서윤, 박도현).
- Select meaningful Hanja that poetically reflect the original name's imagery and values.
- Be respectful, elegant, and thoughtful in tone — names are deeply personal.

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

// gemini_api.txt 스타일에 맞춘 config 객체
const apiConfig = {
  responseMimeType: "application/json",
  systemInstruction: [{ text: systemInstructionText }], // 배열 안에 text 객체 형태
  // temperature, topK, topP, maxOutputTokens는 여기에 포함되지 않음 (gemini_api.txt 기준)
};

// Generation parameters (temperature, topK 등) - API 호출 시 직접 전달 시도
const generationParams = {
  temperature: 0.8,
  topK: 32,
  topP: 1,
  maxOutputTokens: 8192,
};

// SafetySettings는 @google/genai에서의 정확한 사용법 확인 필요. 현재는 생략.
// const safetySettings = [ ... ];

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    // 이 시점에는 API_KEY가 없으면 이미 콘솔에 에러가 찍혔을 것입니다.
    // 클라이언트에는 좀 더 일반적인 오류 메시지를 반환합니다.
    return NextResponse.json(
      { error: "Server configuration error. API key might be missing." },
      { status: 500 }
    );
  }

  try {
    const reqBody = await request.json();
    const foreignName = reqBody.name as string;

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

    // gemini_api.txt의 ai.models.generateContentStream 호출 구조를 최대한 따름
    // 단, 스트림이 아닌 단일 응답을 위해 generateContent 사용
    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: [{ role: "user", parts: userMessageParts }],
      config: apiConfig, // gemini_api.txt 스타일의 config 객체 전달
      // generationParams를 직접 전달하거나, config 내부에 포함해야 할 수 있음
      // @google/genai SDK 문서를 봐야 정확하나, 일단 config와 별개로 전달 시도
      ...generationParams, // temperature, topK 등을 직접 전달
    });

    // 응답 텍스트 추출 시도 (gemini_api.txt 스트림 예제의 chunk.text 참고)
    // 단일 응답의 경우 result.text 또는 result.candidates[0]...text 형태 예상
    // 이전 linter에서 result.response가 없다고 했으므로, result에서 직접 찾아야 함
    let responseText = "";
    // 응답 구조가 확실하지 않으므로 여러 가능성을 안전하게 확인
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
    // 만약 result.text() 와 같은 직접적인 메서드가 있다면 그것을 사용하는 것이 더 좋음
    // 현재는 가장 일반적인 상세 구조를 따라감.

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
    const statusCode = 500;

    console.error("Error calling Gemini API:", errorDetails, error);

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

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: statusCode }
    );
  }
}
