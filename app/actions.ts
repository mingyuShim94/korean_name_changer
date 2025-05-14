"use server"; // runtime = "edge"

import { GoogleGenAI } from "@google/genai";

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

// 성별 옵션 타입
type GenderOption = "masculine" | "feminine" | "neutral";
// 이름 스타일 옵션 추가
type NameStyleOption = "hanja" | "pureKorean";

// 파라미터 타입도 수정
interface GenerateNameParams {
  name: string;
  gender: GenderOption;
  nameStyle?: NameStyleOption; // 옵션으로 추가
}

interface ActionResult {
  data?: KoreanNameData;
  error?: string;
}

// 직접 호출을 위한 추가 상수 및 함수
const MODEL_NAME = "gemini-2.5-flash-preview-04-17";
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: API_KEY });

// 한자 기반 시스템 프롬프트
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

// 성별 및 스타일에 따른 시스템 명령어 생성 함수
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

        const { name, gender, nameStyle = "hanja" } = params; // 기본값 설정
        const userMessageParts = [{ text: name }];
        const dynamicSystemInstruction = getSystemInstruction(
          gender,
          nameStyle
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
