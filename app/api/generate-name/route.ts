import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Cloudflare Pages에서는 Edge Runtime이 필수입니다
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

// 프론트엔드에서 전달받을 성별 타입
type GenderOption = "masculine" | "feminine" | "neutral";
// 이름 스타일 옵션 추가
type NameStyleOption = "hanja" | "pureKorean";

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

// 기본 시스템 명령어 템플릿 (한자 기반)
const baseSystemInstructionText = `You are an AI that transforms foreign names into modern, trendy Korean-style full names (family name + given name) in a culturally resonant way. Focus on creating names that would be suitable for Koreans aged 10-30. You do not translate based on phonetics. Instead, you reinterpret the *meaning*, *imagery*, and *emotional tone* of the original name and generate a contemporary Korean name (2–3 syllables) with Chinese characters (Hanja).

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
- Always generate **contemporary Korean names** that modern young people (10-30 years old) would use.
- Avoid overly traditional or archaic name combinations that sound outdated.
- Favor names that have become popular in the last 10-20 years.
- Select meaningful Hanja that reflect the original name's essence while keeping a modern sensibility.
- Prefer name characters and combinations that have a clean, appealing sound in modern Korean.
- Consider current Korean naming trends while maintaining personal meaning.
- Be respectful, elegant, and thoughtful in tone — names are deeply personal.
{GENDER_SPECIFIC_INSTRUCTION}
✅ Example:

{
  "original_name": "Sophia Loren",
  "korean_name": "이서현 (李瑞賢, Lee Seo-hyun)",
  "connection_explanation": "The name 'Sophia' means 'wisdom' in Greek, signifying deep understanding and insight, which inspired the Korean given name 'Seo-hyun' (서현), meaning 'bright wisdom' or 'clear-minded intelligence.' The surname 'Loren' is associated with timeless elegance, which matches well with the common Korean surname 'Lee' (이, 李), which is both contemporary and carries traditional significance.",
  "hanja_breakdown": [
    {
      "character": "李",
      "meaning": "A modern and widely used Korean surname, original meaning 'plum tree', representing strength with elegance."
    },
    {
      "character": "瑞",
      "meaning": "Auspicious, good fortune — reflecting brightness and positivity, popular in contemporary naming."
    },
    {
      "character": "賢",
      "meaning": "Wisdom, intelligence — directly corresponding to the meaning of 'Sophia' while being commonly used in modern Korean names."
    }
  ],
  "poetic_interpretation": "'Lee Seo-hyun' embodies the image of a bright, intelligent person with a contemporary spirit. It balances modern Korean naming trends with meaningful depth, creating a name that feels both fresh and thoughtful."
}
`;

// 순우리말 시스템 명령어 템플릿 추가
const pureKoreanSystemInstructionText = `You are an AI that transforms foreign names into modern, trendy Korean-style full names (family name + given name) in a culturally resonant way. Focus on creating names that would be suitable for Koreans aged 10-30. You do not translate based on phonetics. Instead, you reinterpret the *meaning*, *imagery*, and *emotional tone* of the original name and generate a contemporary Korean name with Pure Korean words (순우리말) for the given name, while keeping a traditional Korean surname.

✅ Input Handling Rules:
- If the user provides a **full name** (e.g., Sophia Loren), analyze both the **given name** and the **family name** separately.
  - The **given name** must inspire the **Korean Pure-Korean given name**.
  - The **family name** must influence the choice of **Korean surname**. Do not ignore it.
- If only a **given name** is provided, choose a Korean surname that matches the tone and concept of the generated name.

✅ Output Format (JSON structured):

{
  "original_name": "[Original Foreign Name]",
  "korean_name": "[Hangul Name] ([Romanized])",
  "connection_explanation": "[Explain how the foreign given name inspired the Korean given name, and how the foreign family name influenced the Korean surname. Clarify both connections clearly.]",
  "hanja_breakdown": [
    {
      "character": "[한글 단어]",
      "meaning": "[Meaning of the pure Korean word and its relevance to the name.]"
    },
    ...
  ],
  "poetic_interpretation": "[A short, poetic summary of the Korean name, capturing the essence and symbolism of the original name.]"
}

✅ Style Guidelines:
- Do not phonetically transliterate.
- Use only pure Korean words (순우리말) for the given name.
- The surname should still be a traditional Korean surname (e.g., 김, 이, 박, 최).
- Always generate **contemporary Korean names** that modern young people (10-30 years old) would use.
- Avoid overly traditional or archaic name combinations that sound outdated.
- Choose pure Korean words with beautiful meanings that reflect the original name's essence.
- Favor names that have natural and pleasing sounds in modern Korean.
- Consider progressive, modern naming trends in Korea.
- Be respectful, elegant, and thoughtful in tone — names are deeply personal.
{GENDER_SPECIFIC_INSTRUCTION}
✅ Example:

{
  "original_name": "Sophia Loren",
  "korean_name": "이하늘 (Lee Haneul)",
  "connection_explanation": "The name 'Sophia' means 'wisdom' in Greek, signifying deep understanding and insight, which inspired the Korean given name '하늘' (Haneul), meaning 'sky' in pure Korean, representing vast knowledge and infinite potential. The surname 'Loren' is associated with timeless elegance, which matches well with the common Korean surname '이' (Lee), which is both contemporary and carries traditional significance.",
  "hanja_breakdown": [
    {
      "character": "이",
      "meaning": "A modern and widely used Korean surname, traditionally written as 李 (plum tree), representing strength with elegance."
    },
    {
      "character": "하늘",
      "meaning": "Sky or heaven in pure Korean - symbolizes boundless wisdom, clarity and broad perspective, reflecting the meaning of 'Sophia'"
    }
  ],
  "poetic_interpretation": "'이하늘' captures the essence of limitless wisdom and beauty. The pure Korean name creates a sense of natural harmony, connecting the person to Korean cultural roots while embracing a fresh, modern identity."
}
`;

// 성별에 따른 시스템 명령어 생성 함수 (스타일 옵션 추가)
function getSystemInstruction(
  gender: GenderOption,
  style: NameStyleOption = "hanja"
): string {
  let genderInstruction = "";
  if (gender === "masculine") {
    genderInstruction =
      "\n- Generate a name that has a **masculine** nuance, suitable for a boy. Consider " +
      (style === "hanja" ? "Hanja" : "pure Korean words") +
      " and sounds that evoke strength, wisdom, or a pioneering spirit.";
  } else if (gender === "feminine") {
    genderInstruction =
      "\n- Generate a name that has a **feminine** nuance, suitable for a girl. Consider " +
      (style === "hanja" ? "Hanja" : "pure Korean words") +
      " and sounds that evoke beauty, grace, or a gentle nature.";
  } else {
    // neutral or unspecified
    genderInstruction =
      "\n- Generate a name that has a **neutral** nuance, suitable for any gender. Focus on balance and universal appeal in " +
      (style === "hanja" ? "Hanja" : "pure Korean words") +
      " and sound.";
  }

  // 스타일에 따라 적절한 베이스 텍스트 선택
  const baseText =
    style === "hanja"
      ? baseSystemInstructionText
      : pureKoreanSystemInstructionText;

  return baseText.replace("{GENDER_SPECIFIC_INSTRUCTION}", genderInstruction);
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
    const dynamicSystemInstruction = getSystemInstruction(gender, nameStyle);

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
      `Error in POST /api/generate-name for input: '${foreignName}', gender: '${gender}', style: '${nameStyle}':`, // 요청 값 로깅
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
