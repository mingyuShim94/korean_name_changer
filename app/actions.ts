"use server";

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

export async function generateKoreanNameAction(
  params: GenerateNameParams
): Promise<ActionResult> {
  try {
    // 현재 Next.js 프로젝트가 실행 중인 기본 URL을 알아내야 합니다.
    // 일반적으로 개발 환경에서는 http://localhost:3000 입니다.
    // Vercel과 같은 환경에 배포된 경우, 환경 변수(NEXT_PUBLIC_APP_URL 또는 VERCEL_URL)를 사용해야 합니다.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/generate-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

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
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "An unknown error occurred during name generation." };
  }
}
