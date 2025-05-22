"use server"; // runtime = "edge"

import {
  GenerateNameParams,
  ActionResult,
  KoreanNameData,
  generateKoreanNameWithGemini,
} from "./lib/geminiAPI";

// 도메인에 따른 API 호출 주소 설정
const API_ENDPOINTS = {
  default: process.env.NEXT_PUBLIC_APP_URL || "",
  // Pages.dev 배포 URL 추가
  pagesDev: "https://korean-name-changer.pages.dev",
};

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

    // 현재 요청 URL 확인 (서버사이드에서는 headers를 통해 확인)
    let currentUrl = "";
    try {
      // 브라우저에서는 window.location.origin을 사용할 수 있지만
      // 서버 사이드에서는 불가능하므로 환경 변수나 헤더를 통해 확인
      currentUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      console.log("현재 URL 확인:", currentUrl);
    } catch (error) {
      console.error("현재 URL 확인 중 오류:", error);
    }

    // URL에 따라 API 엔드포인트 선택
    // mykoreanname.me 도메인에서 접근하더라도 pages.dev 도메인을 통해 API 호출
    let baseUrl;
    if (currentUrl.includes("mykoreanname.me")) {
      // mykoreanname.me에서 요청할 경우 pages.dev로 요청
      baseUrl = API_ENDPOINTS.pagesDev;
      console.log(
        "mykoreanname.me 도메인에서 요청 - pages.dev 엔드포인트 사용"
      );
    } else {
      // 그 외 도메인에서는 설정된 기본 URL 사용
      baseUrl = API_ENDPOINTS.default;
    }

    console.log("Server Action 실행: baseUrl =", baseUrl);

    const response = await fetch(`${baseUrl}/api/generate-name`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 실제 Origin 정보 전달 (CORS 처리를 위해)
        Origin: currentUrl || API_ENDPOINTS.default,
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
      const data = JSON.parse(responseText) as KoreanNameData;
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
