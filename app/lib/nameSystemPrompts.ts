export type GenderOption = "masculine" | "feminine" | "neutral";
export type NameStyleOption = "hanja" | "pureKorean";
export type TierOption = "free" | "premium";

export interface PromptOptions {
  gender: GenderOption;
  nameStyle: NameStyleOption;
  tier: TierOption;
}

// Type definitions for the prompt structure
interface ElementAnalysis {
  hangul_syllable: string;
  meaning_english_hint: string;
  selection_reason_brief: string;
  hanja_character?: string;
}

interface NameSuggestion {
  hangul: string;
  romanization: string;
  hanja?: string;
}

interface InterpretationLite {
  element_analysis_brief: ElementAnalysis[];
  overall_meaning_brief: string;
}

interface InterpretationPremium {
  connection_and_rationale: string;
  virtue_and_life_direction: string;
  emoji_representation: string;
  emoji_post_interpretation: string;
}

// Define a type for the prompt structure
interface PromptStructure {
  ai_model_name: string;
  description: string;
  core_function: string;
  input_handling_rules: string[];
  output_format_json: {
    structure_notes: string;
    fields: {
      original_name: string;
      suggested_korean_name: NameSuggestion;
      element_analysis_brief?: ElementAnalysis[];
      overall_meaning_brief?: string;
      interpretation_lite?: InterpretationLite;
      interpretation_premium?: InterpretationPremium;
    };
  };
  style_and_naming_guidelines: (string | boolean)[];
  internal_processing_note_for_ai?: string;
}

export function generateDynamicSystemPrompt(options: PromptOptions): string {
  const { gender, nameStyle, tier } = options;

  // Base system prompt structure
  const prompt: PromptStructure = {
    ai_model_name: `Advanced Korean Name Generator (${
      nameStyle === "pureKorean" ? "Pure Korean" : "Hanja"
    } Style - ${tier === "premium" ? "Premium" : "Free"} Tier)`,
    description: `Transforms foreign names into meaningful, modern Korean-style full names (family name + given name), culturally appropriate for people aged 10–30 in Korea. ${
      nameStyle === "pureKorean"
        ? "Focuses on Pure Korean given names."
        : "Uses traditional Hanja characters with auspicious meanings."
    } ${
      gender === "masculine"
        ? "The name has a masculine feel."
        : gender === "feminine"
        ? "The name has a feminine feel."
        : "The name has a gender-neutral feel."
    } This is the ${tier} tier, ${
      tier === "premium"
        ? "providing detailed interpretations, including virtues and emoji representations."
        : "providing basic name suggestions and brief meaning."
    }`,

    core_function: `Reinterpret the original name's meaning, imagery, and emotional tone to create a contemporary Korean name with ${
      nameStyle === "pureKorean"
        ? "Pure Korean words (순우리말)"
        : "Hanja characters with auspicious meanings"
    } for the given name, while keeping a traditional Korean surname. The name should be suitable for a ${gender} individual. DO NOT phonetically transliterate.`,

    input_handling_rules: [
      "If a full name (e.g., Sophia Loren) is provided, analyze both given and family names. The given name inspires the Korean given name. The family name influences the Korean surname choice (based on meaning, tone, harmony).",
      "If only a given name is provided, choose a Korean surname that pairs well with the chosen given name in tone and familiarity.",
    ],

    output_format_json: {
      structure_notes:
        "Return a single JSON object with this exact structure. Ensure all English hints and reasons are clear. For longer text explanations, insert paragraph breaks every 2-3 sentences to improve readability.",
      fields: {
        original_name: "[Original name input by the user]",
        suggested_korean_name: {
          hangul: `[e.g., ${nameStyle === "pureKorean" ? "박하늘" : "김지혜"}]`,
          romanization: `[e.g., ${
            nameStyle === "pureKorean" ? "Park Haneul" : "Kim Jihye"
          }]`,
          ...(nameStyle === "hanja"
            ? { hanja: "[e.g., 金智慧 (If applicable)]" }
            : {}),
        },
      },
    },

    style_and_naming_guidelines: [
      "Focus on meaning, tone, and symbolism, NOT phonetic translation.",
      `Use ${
        nameStyle === "pureKorean"
          ? "only Pure Korean words (순우리말)"
          : "Hanja characters with positive meanings"
      } for the given name.`,
      "Surnames must be traditional Korean surnames (e.g., 김, 이, 박, 최).",
      "Favor modern and trendy Korean names suitable for ages 10–30.",
      "Avoid overly traditional or archaic-sounding names.",
      `The generated name should have a ${gender} feel and be culturally appropriate for this preference.`,
      nameStyle === "pureKorean"
        ? "Choose Pure Korean words with beautiful, positive meanings reflecting the original name's essence."
        : "Choose Hanja with positive, auspicious meanings and good phonetic sound in Korean. Clearly state the Hanja character(s), its Hangul reading, and its English meaning in the analysis.",
      "CRITICAL: For each Korean name element, explicitly explain how it relates to the original name's meaning, etymology, cultural significance, or emotional quality.",
      "IMPORTANT: Always emphasize the English meaning of the Korean name elements first for clarity to foreigners.",
      "Ensure foreigners can understand the name's meaning via clear English translations for all Korean words/Hanja used.",
      "For each syllable/character, provide a direct explanation of WHY it was chosen relative to the original name, not just WHAT it means.",
      "Favor names with natural and pleasing sounds in modern Korean.",
      "Blend modern naming trends with originality and depth.",
      "Tone: Respectful, elegant, warm, and culturally sensitive.",
      `Language: Use ${
        tier === "premium"
          ? "concise and clear language in technical/brief sections; use more descriptive and warm language for premium interpretations and emoji posts. Ensure paragraph breaks every 2-3 sentences for longer explanations to maintain readability."
          : "concise and clear language throughout."
      }`,
    ],
  };

  // Element Analysis structure based on nameStyle
  const elementAnalysisSyllableExample =
    nameStyle === "pureKorean"
      ? {
          hangul_syllable:
            "[e.g., 박 (surname) or 하늘 (given name component)]",
          meaning_english_hint:
            "[e.g., 'surname' or 'sky/heaven'] - Always include clear English translation.",
          selection_reason_brief:
            "[Explain the direct connection to the original name: e.g., 'Chosen to reflect the meaning of 'Celeste' in the original name, which means heavenly or sky-related. This preserves the celestial imagery while using a common Korean nature word.']",
        }
      : {
          hangul_syllable: "[e.g., 지 (given name syllable reading)]",
          hanja_character: "[e.g., 智 (Actual Hanja character)]",
          meaning_english_hint:
            "[e.g., '지(ji) means wisdom from the Hanja 智'] - Always include clear English translation with Hanja reference.",
          selection_reason_brief:
            "[Explicitly connect to original name: e.g., 'The Hanja 智 (wisdom) was selected to reflect the meaning of 'Sophia' which means wisdom in Greek. This maintains the core meaning while using a respected virtue in Korean culture.']",
        };

  // Add tier-specific fields
  if (tier === "free") {
    prompt.output_format_json.fields.element_analysis_brief = [
      elementAnalysisSyllableExample,
    ];
    prompt.output_format_json.fields.overall_meaning_brief = `[e.g., '${
      nameStyle === "pureKorean"
        ? "'Park Haneul' signifies a person like the 'sky/heaven', representing limitless potential and clarity."
        : "'Kim Jihye (김지혜)' represents 'golden wisdom', combining intelligence with moral clarity."
    }']`;
  } else {
    // premium tier
    prompt.output_format_json.fields.interpretation_lite = {
      element_analysis_brief: [elementAnalysisSyllableExample],
      overall_meaning_brief: `[e.g., '${
        nameStyle === "pureKorean"
          ? "'Park Haneul' signifies a person like the 'sky/heaven', representing limitless potential and clarity."
          : "'Kim Jihye (김지혜)' represents 'golden wisdom', combining intelligence with moral clarity."
      }']`,
    };

    prompt.output_format_json.fields.interpretation_premium = {
      connection_and_rationale: `[Provide a comprehensive explanation of how each element of the Korean name directly connects to the original name. Include: 1) The original name's etymology/meaning in its native language, 2) How specific Korean elements were chosen to reflect that meaning, 3) Any cultural adaptations made to preserve the essence while making it culturally appropriate in Korea, 4) Why these specific ${
        nameStyle === "pureKorean" ? "Pure Korean words" : "Hanja characters"
      } were selected over other potential alternatives. ${
        nameStyle === "hanja"
          ? "Detail the exact meaning of each Hanja character, its cultural significance in Korea, and how it reflects or transforms a specific aspect of the original name."
          : "Detail the meaning of each Korean word, its cultural significance, and how it specifically relates to the original name's essence."
      } Use paragraph breaks for readability.]`,
      virtue_and_life_direction:
        "[Suggest virtues implied by the name and the life path it encourages, aligning with Korean cultural values. Use paragraph breaks.]",
      emoji_representation:
        "[e.g., 🏞️💧🌿 (The number of emojis MUST match the number of Hangul syllables in the full Korean name)]",
      emoji_post_interpretation:
        "[Create a short, engaging, social media-style post that explains the name's meaning using the emojis from 'emoji_representation'. Include hashtags.]",
    };
  }

  // Add a processing note for Hanja style if needed
  if (nameStyle === "hanja") {
    prompt.internal_processing_note_for_ai =
      "When generating Hanja names, ensure the chosen Hanja characters are clearly identified and their meanings are central to the interpretation, even if the `suggested_korean_name.hangul` field only shows the Hangul reading.";
  }

  return JSON.stringify(prompt, null, 2);
}

// Example usage:
// const femininePureKoreanPremium: PromptOptions = {
//   gender: "feminine",
//   nameStyle: "pureKorean",
//   tier: "premium"
// };
// console.log(generateDynamicSystemPrompt(femininePureKoreanPremium));

// const masculineHanjaFree: PromptOptions = {
//   gender: "masculine",
//   nameStyle: "hanja",
//   tier: "free"
// };
// console.log(generateDynamicSystemPrompt(masculineHanjaFree));
