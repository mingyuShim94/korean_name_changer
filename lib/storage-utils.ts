// 세션 스토리지 관련 유틸리티 함수

// 결과 데이터 타입 정의
interface FreeKoreanNameData {
  original_name: string;
  original_name_analysis: {
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    rationale?: string;
    syllables?: {
      syllable: string;
      romanization: string;
      hanja?: string;
      meaning: string;
    }[];
  };
  korean_name_impression?: string;
  social_share_content: {
    formatted: string;
    summary: string;
  };
}

interface PremiumKoreanNameData {
  original_name: string;
  original_name_analysis: {
    letters: {
      letter: string;
      meaning: string;
    }[];
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    syllables: {
      syllable: string;
      romanization: string;
      hanja: string;
      meaning: string;
    }[];
    rationale: string;
    life_values: string;
  };
  korean_name_impression: string;
  social_share_content: {
    formatted: string;
    summary: string;
  };
}

// 결과 데이터 유니온 타입
export type ResultData = FreeKoreanNameData | PremiumKoreanNameData;

// 세션 스토리지에서 데이터를 가져오는 함수
export const getResultDataFromStorage = (
  resultId: string
): ResultData | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedData = sessionStorage.getItem(`korean_name_result_${resultId}`);
    return storedData ? JSON.parse(storedData) : null;
  } catch (e) {
    console.error("Failed to retrieve data from session storage:", e);
    return null;
  }
};

// 세션 스토리지에 데이터를 저장하는 함수
export const saveResultDataToStorage = (data: ResultData): string => {
  if (typeof window === "undefined") return "";

  try {
    // 고유 ID 생성 (타임스탬프 + 랜덤 문자열)
    const resultId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    sessionStorage.setItem(
      `korean_name_result_${resultId}`,
      JSON.stringify(data)
    );
    return resultId;
  } catch (e) {
    console.error("Failed to save data to session storage:", e);
    return "";
  }
};
