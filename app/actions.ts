"use server"; // runtime = "edge"

import {
  GenerateNameParams,
  ActionResult,
  FreeKoreanNameData,
  PremiumKoreanNameData,
  generateKoreanNameWithGemini,
} from "./lib/geminiAPI";

export async function generateKoreanNameAction(
  params: GenerateNameParams
): Promise<ActionResult> {
  console.log("Server Action 실행 (Edge Runtime): 이름 생성 요청", params);

  try {
    // 1. API를 직접 호출하는 방식 - Edge 환경에서 최적화
    // API 키가 있는지 확인
    if (process.env.GEMINI_API_KEY_FREE || process.env.GEMINI_API_KEY_PAID) {
      try {
        console.log("Gemini API 직접 호출 시도 (Edge Runtime)");

        // 공통 로직을 사용하여 한국 이름 생성
        const result = await generateKoreanNameWithGemini(params);
        if (result.data) {
          return { data: result.data };
        }
        if (result.error) {
          // 오류가 있으면 API 라우트 방식으로 폴백
          console.error("직접 호출 중 오류 발생:", result.error);
        }
      } catch (directApiError) {
        console.error("Gemini API 직접 호출 실패:", directApiError);
        // 오류 발생 시 API 라우트 방식으로 폴백
      }
    }

    // 2. API 라우트를 통한 호출 (폴백 방식)
    console.log("API 라우트 방식으로 호출 시도");

    // baseUrl 설정 방식 개선
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    console.log("Server Action 실행: baseUrl =", baseUrl);

    const response = await fetch(`${baseUrl}/api/generate-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    console.log("API 응답 완료");
    // console.log("API 응답 상태:", response.json());

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `API request failed with status ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        console.error("응답 오류 파싱 실패:", e);
        console.error("원본 오류 응답:", errorText.substring(0, 200));
      }

      return { error: errorMessage };
    }

    const responseText = await response.text();

    try {
      const data = JSON.parse(responseText) as
        | FreeKoreanNameData
        | PremiumKoreanNameData;
      return { data };
    } catch (parseError) {
      console.error("API 응답 JSON 파싱 오류:", parseError);
      console.error(
        "응답 텍스트 프리뷰:",
        responseText.substring(0, 200) + "..."
      );
      return { error: "Failed to parse API response as JSON" };
    }
  } catch (err) {
    console.error("이름 생성 중 오류 발생:", err);
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "An unknown error occurred during name generation." };
  }
}
