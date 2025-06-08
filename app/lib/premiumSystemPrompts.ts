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
export interface SimplifiedKoreanNamePromptOptions {
  gender: GenderOption;
  nameStyle: NameStyleOption;
}

// 새로운 JSON 구조에 맞는 타입 정의
export interface OriginalNameComponent {
  name: string;
  meanings: string[];
  symbols: string[];
}

export interface OriginalName {
  full: string;
  components: OriginalNameComponent[];
  summary: string;
}

export interface KoreanNameSyllable {
  syllable: string;
  romanized: string;
  hanja: string;
  keywords: string[];
  explanation: string;
}

export interface KoreanName {
  full: string;
  romanized: string;
  syllables: KoreanNameSyllable[];
  integrated_meaning: string;
}

export interface LifeValues {
  text: string;
}

export interface CulturalImpression {
  text: string;
}

// 새로운 프롬프트 구조 타입 정의
interface SimplifiedKoreanNamePromptStructure {
  title: string;
  description: string;
  input_rules: string[];
  output_format: {
    structure: {
      original_name: OriginalName;
      korean_name: KoreanName;
      life_values: LifeValues;
      cultural_impression: CulturalImpression;
    };
  };
  style_guidelines: string[];
}

/**
 * 간소화된 한국어 이름 생성을 위한 시스템 프롬프트를 생성합니다.
 * @param options - 이름 생성 옵션 (성별, 이름 스타일)
 * @returns 시스템 프롬프트 JSON 문자열
 */
export function generateSimplifiedKoreanNameSystemPrompt(
  options: SimplifiedKoreanNamePromptOptions
): string {
  const { gender, nameStyle } = options;

  // 기본 시스템 프롬프트 구조
  const prompt: SimplifiedKoreanNamePromptStructure = {
    title: "Simplified Korean Name Translator AI",
    description: `You are an AI that translates foreign full names into natural, meaningful Korean full names (Family Name + Given Name). You analyze the original name's meaning, cultural background, and emotional essence, then create Korean names using ${
      nameStyle === "pureKorean"
        ? "Pure Korean words (순우리말)"
        : "Hanja (Sino-Korean characters)"
    } that capture the same spirit. ${
      gender === "masculine"
        ? "The name should have a masculine feel."
        : gender === "feminine"
        ? "The name should have a feminine feel."
        : "The name should have a gender-neutral feel."
    } Your goal is to create names that real Korean people might have, reflecting the values and aesthetics of the original name.`,

    input_rules: [
      "If a **full name** (e.g., Harry Porter) is given, analyze both the **given name** and the **surname** separately in the components array.",
      "Each component should include the name part, its possible meanings, and symbolic associations.",
      "The **given name** should inspire the Korean given name creation.",
      "The **surname** should influence the selection of an appropriate Korean family name.",
      "If only a **given name** is provided, choose a Korean family name that complements the overall tone and meaning.",
      "Provide a summary that explains how the original name's essence guides the Korean name creation.",
    ],

    output_format: {
      structure: {
        original_name: {
          full: "Harry Porter",
          components: [
            {
              name: "Harry",
              meanings: ["home ruler", "army leader"],
              symbols: ["leadership", "authority", "responsibility"],
            },
            {
              name: "Porter",
              meanings: ["gatekeeper", "bearer", "one who carries"],
              symbols: ["devotion", "guardian", "quiet responsibility"],
            },
          ],
          summary:
            "Harry Porter represents a leader who protects the home—a guardian defined by responsibility and principle. Based on this, the Korean name was constructed around the theme of 'a wise and principled leader.'",
        },
        korean_name:
          nameStyle === "pureKorean"
            ? {
                full: "박하늘",
                romanized: "Park Ha-Neul",
                syllables: [
                  {
                    syllable: "박",
                    romanized: "Park",
                    hanja: "朴",
                    keywords: ["simple", "authentic"],
                    explanation:
                      "Chosen to reflect the steadfast, dependable qualities. 朴 represents simplicity and authenticity, symbolizing someone who remains true to their values.",
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
                ],
                integrated_meaning:
                  "Park Ha-Neul symbolizes 'an authentic leader with boundless vision and eternal wisdom.' It captures the essence of principled leadership while maintaining connection to natural, eternal values.",
              }
            : {
                full: "박도현",
                romanized: "Park Do-Hyun",
                syllables: [
                  {
                    syllable: "박",
                    romanized: "Park",
                    hanja: "朴",
                    keywords: ["grounded", "authentic"],
                    explanation:
                      "Chosen to reflect the devoted, dependable qualities associated with the surname Porter. 朴 is one of the most traditional Korean surnames, symbolizing simplicity, strength, and steadfastness—aligned with someone who fulfills their role with quiet determination.",
                  },
                  {
                    syllable: "도",
                    romanized: "Do",
                    hanja: "道",
                    keywords: ["principled", "directional"],
                    explanation:
                      "Inspired by Harry's meaning as a 'home ruler,' this syllable expresses moral clarity and leadership. 道 signifies philosophy, principle, and direction—characteristics of someone who guides others with integrity.",
                  },
                  {
                    syllable: "현",
                    romanized: "Hyun",
                    hanja: "賢",
                    keywords: ["wise", "virtuous"],
                    explanation:
                      "Represents wisdom and moral excellence, transforming Harry's authoritative image into a respected and trusted leader. 賢 embodies dignity and intelligence, adding refinement and depth to the name.",
                  },
                ],
                integrated_meaning:
                  "Park Do-Hyun symbolizes 'a wise and principled leader who walks the right path.' It reinterprets Harry Porter's core leadership and guardian-like qualities through a culturally resonant Korean identity.",
              },
        life_values: {
          text:
            nameStyle === "pureKorean"
              ? "This name represents someone who embodies the expansiveness of the sky, with natural leadership that inspires others through openness, vision, and unwavering moral compass."
              : "This name represents someone who is steady at their core, leads through action rather than words, and inspires others through integrity and trust.",
        },
        cultural_impression: {
          text:
            nameStyle === "pureKorean"
              ? "The name 'Ha-Neul' conveys a fresh, modern impression in Korean society. It evokes natural beauty, freedom, and progressive thinking while maintaining cultural authenticity. The name feels contemporary and aspirational."
              : "The name 'Do-Hyun' conveys intelligence, integrity, and strong character in Korean society. It is seen as modern and respectable, suitable for individuals in professional or leadership roles. The name evokes a sense of calm authority and is well-received across generations.",
        },
      },
    },

    style_guidelines: [
      "Each component in the `original_name.components` array should include 2-3 meaningful interpretations in the `meanings` array and 2-4 symbolic associations in the `symbols` array.",
      "The `summary` field should clearly explain how the analysis of the original name led to the Korean name concept, establishing a thematic bridge.",
      "In the `korean_name.syllables` array, each syllable must include 2-3 relevant keywords that capture its essence.",
      "The `explanation` for each syllable should be 2-3 sentences, clearly connecting the syllable choice to the original name's meaning or the overall theme.",
      nameStyle === "pureKorean"
        ? "For Pure Korean names, explain how Pure Korean words (순우리말) preserve the original name's essence. The family name typically uses Hanja, but the given name uses Pure Korean elements."
        : "For Hanja names, ensure each syllable's Hanja character is meaningful and contributes to a cohesive interpretation of the original name.",
      "The `integrated_meaning` should be a single, poetic sentence that captures the complete Korean name's significance and its connection to the original name.",
      "The `life_values.text` should be written in an inspirational tone, describing the character traits and life philosophy the name embodies.",
      "The `cultural_impression.text` should provide realistic insights into how the Korean name would be perceived in modern Korean society, including generational appeal and social contexts.",
      `The generated name should have a ${gender} feel and be culturally appropriate for this gender preference.`,
      "Use modern, natural-sounding Korean names that would be realistic for people in their teens to 30s.",
      "Avoid overly traditional, complex, or uncommon names that might sound outdated.",
      "Focus on positive, harmonious meanings that reflect virtues like wisdom, integrity, nature, and emotional warmth.",
      "For longer explanations, use paragraph breaks every 2-3 sentences for better readability.",
      "NEVER perform phonetic transliteration - always focus on meaning and cultural adaptation.",
      "Ensure cultural sensitivity and authenticity in Korean naming conventions.",
    ],
  };

  return JSON.stringify(prompt, null, 2);
}
