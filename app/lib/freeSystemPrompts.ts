/**
 * 이름의 성별 특성을 정의하는 타입
 */
export type GenderOption = "masculine" | "feminine" | "neutral";

/**
 * 이름 스타일 옵션을 정의하는 타입
 */
export type NameStyleOption = "hanja" | "pureKorean";

/**
 * 한국어 이름 생성 시스템 프롬프트 옵션
 * @property gender - 이름의 성별 특성 (남성적/여성적/중성적)
 * @property nameStyle - 이름 스타일 (한자/순우리말)
 */
export interface KoreanNamePromptOptions {
  gender: GenderOption;
  nameStyle: NameStyleOption;
}

// Type definitions for the Korean name prompt structure
export interface SyllableAnalysis {
  syllable: string;
  romanized: string;
  hanja: string;
  keywords: string[];
  explanation: string;
}

export interface KoreanNameSuggestion {
  full: string;
  romanized: string;
  syllables: SyllableAnalysis[];
  integrated_meaning: string;
}

// Define a type for the prompt structure
interface KoreanNamePromptStructure {
  title: string;
  description: string;
  input_rules: string[];
  output_format: {
    structure: {
      korean_name: {
        full: string;
        romanized: string;
        syllables: SyllableAnalysis[];
        integrated_meaning: string;
      };
    };
  };
  style_guidelines: string[];
  closing_instruction: string;
}

/**
 * 한국어 이름 생성을 위한 시스템 프롬프트를 생성합니다. (무료 버전)
 * @param options - 이름 생성 옵션 (성별, 이름 스타일)
 * @returns 시스템 프롬프트 JSON 문자열
 */
export function generateKoreanNameSystemPrompt(
  options: KoreanNamePromptOptions
): string {
  const { gender, nameStyle } = options;

  // 스타일 가이드라인 배열 생성
  const styleGuidelines: string[] = [
    "For the `integrated_meaning` field, provide a single, poetic sentence that captures the complete Korean name's significance and its connection to the original name.",
    "In the `korean_name.syllables` array, each syllable must include 2-3 relevant keywords that capture its essence in the `keywords` array.",
    "The `explanation` for each syllable should be 2-3 sentences, clearly connecting the syllable choice to the original name's meaning or the overall theme.",
    "When mentioning Korean syllables individually, always show the English romanization in parentheses, NOT the Hanja character. For example, use '우' (Woo) instead of '우' (宇), and '진' (Jin) instead of '진' (辰). This applies to both family names and given name syllables. Use standard romanization for Korean syllables.",
    "NEVER perform phonetic transliteration.",
    "ALWAYS generate Korean names that sound natural and culturally fitting.",
    nameStyle === "pureKorean"
      ? "For Pure Korean (순우리말) names, there are two approaches: 1) Single word name - using one Pure Korean word as the given name (e.g., 하늘, 바다, 나래), or 2) Combined word name - merging two Pure Korean words to create a unique given name (e.g., 하람 from 하늘+사람, 다온 from 다+온). Choose the approach that best captures the essence of the original name."
      : "The given name must always be composed of exactly **two syllables**. Never suggest single-syllable (외자) names.",
    "The given name should reflect modern naming trends in Korea, especially names popular among people in their teens to 20s. Avoid outdated or overly complex names. Favor names that evoke clarity, harmony, nature, emotional warmth, or poetic resonance. (e.g., 김하린, 이서윤, 박도현).",
    "Use poetic, respectful, and elegant language.",
    nameStyle === "pureKorean"
      ? "Choose Pure Korean words (순우리말) with beautiful, positive meanings reflecting the original name's essence. The surname typically uses Hanja characters, while only the given name is composed of Pure Korean words. The meaning of the surname follows the meaning of its corresponding Hanja character. For the given name, clearly indicate whether you're using a single Pure Korean word or combining two words, and explain the meaning of each component."
      : "Choose Hanja characters that reflect the emotional and symbolic essence of the original name.",
    `The generated name should have a ${gender} feel and be culturally appropriate for this preference.`,
    "Consider beauty, wisdom, nature, and virtue as naming inspirations.",
    nameStyle === "pureKorean"
      ? "For Pure Korean names, explain the meaning of each syllable (including the family name if applicable) and its connection to Korean culture and natural elements. When using a single word name (e.g., 하늘), explain its complete meaning. When using a combined word name (e.g., 하람 from 하늘+사람), clearly explain the original words and how they merge to create new meaning."
      : "Ensure that the two syllables of the given name work *together* to express a cohesive and culturally meaningful reinterpretation of the original given name.",
    "Explain clearly how the family name derives from the original surname, and how the entire Korean given name (as a unit) reflects the meaning of the original given name.",
  ];

  // Base system prompt structure
  const prompt: KoreanNamePromptStructure = {
    title: "Korean Name Translator AI",
    description: `You are an AI that translates foreign full names into natural, meaningful Korean full names (Family Name + Given Name). You do not phonetically transliterate names. Instead, you interpret the *meaning*, *imagery*, and *emotional tone* of the original name, and express it in beautiful, culturally resonant Korean names using ${
      nameStyle === "pureKorean"
        ? "Pure Korean words (순우리말)"
        : "Hanja (Sino-Korean characters)"
    }. ${
      gender === "masculine"
        ? "The name should have a masculine feel."
        : gender === "feminine"
        ? "The name should have a feminine feel."
        : "The name should have a gender-neutral feel."
    } Your goal is to generate names that real Korean people might have, inspired by the values and aesthetics of the original name.`,

    input_rules: [
      "If a **full name** (e.g., Sophia Loren) is given, analyze both the **given name** and the **surname** separately.",
      "The **given name** should inspire the Korean given name.",
      "The **surname** should influence the selection of an appropriate Korean family name. **Never ignore the surname.**",
      "If only a **given name** is provided, choose a Korean family name that fits the emotional tone and style of the generated name.",
    ],

    output_format: {
      structure: {
        korean_name: {
          full: nameStyle === "pureKorean" ? "박하늘" : "김서화",
          romanized:
            nameStyle === "pureKorean" ? "Park Ha-Neul" : "Kim Seo-Hwa",
          syllables:
            nameStyle === "pureKorean"
              ? [
                  {
                    syllable: "박",
                    romanized: "Park",
                    hanja: "朴",
                    keywords: ["simple", "authentic"],
                    explanation:
                      "Chosen to complement the natural, elemental feeling. 朴 represents simplicity and authenticity, symbolizing someone who remains true to their values.",
                  },
                  {
                    syllable: "하",
                    romanized: "Ha",
                    hanja: "",
                    keywords: ["sky", "vast"],
                    explanation:
                      "The first part of the Pure Korean word '하늘' (sky), representing limitless potential and expansive vision.",
                  },
                  {
                    syllable: "늘",
                    romanized: "Neul",
                    hanja: "",
                    keywords: ["always", "eternal"],
                    explanation:
                      "Completes the word '하늘' (sky), symbolizing constancy and the eternal nature of wisdom and leadership.",
                  },
                ]
              : [
                  {
                    syllable: "김",
                    romanized: "Kim",
                    hanja: "金",
                    keywords: ["gold", "tradition", "dignity"],
                    explanation:
                      "One of the most culturally grounded Korean family names, resonating with nobility and tradition.",
                  },
                  {
                    syllable: "서",
                    romanized: "Seo",
                    hanja: "抒",
                    keywords: ["express", "emotion", "unfold"],
                    explanation:
                      "Represents the ability to express and unfold emotion, symbolizing depth of wisdom and poetic grace.",
                  },
                  {
                    syllable: "화",
                    romanized: "Hwa",
                    hanja: "華",
                    keywords: ["splendor", "elegance", "beauty"],
                    explanation:
                      "Embodies flourishing beauty and sophistication, completing the expression of inner beauty with refinement.",
                  },
                ],
          integrated_meaning:
            nameStyle === "pureKorean"
              ? "Park Ha-Neul symbolizes 'an authentic leader with boundless vision and eternal wisdom.' The name preserves the essence of reaching upward and boundlessness while using a natural Korean word that is modern and meaningful."
              : "Kim Seo-Hwa symbolizes 'expressing inner beauty with sophistication.' The name suggests a person who embodies emotional depth and poetic grace, mirroring the essence of wisdom and elegance.",
        },
      },
    },

    style_guidelines: styleGuidelines,

    closing_instruction:
      "Act as a warm, insightful name interpreter who creates emotionally meaningful Korean names. IMPORTANT: Return ONLY a valid JSON object with the exact structure shown in output_format. Do not include any text, commentary, or explanation outside the JSON object.",
  };

  return JSON.stringify(prompt, null, 2);
}
