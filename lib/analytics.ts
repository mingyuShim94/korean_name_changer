// Google Analytics 이벤트 추적 유틸리티 함수

// Google Analytics 타입 정의
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: {
        event_category?: string;
        event_label?: string;
        value?: number;
        page_path?: string;
        page_title?: string;
        [key: string]: unknown;
      }
    ) => void;
  }
}

/**
 * Google Analytics 이벤트를 추적하는 함수
 * @param action 이벤트 이름 (예: 'click', 'submit', 'view')
 * @param category 이벤트 카테고리 (예: 'button', 'form', 'page')
 * @param label 이벤트 레이블 (예: 'free_name_generation', 'premium_name_generation')
 * @param value 이벤트 값 (선택 사항)
 */
export function trackEvent(
  action: string,
  category: string,
  label: string,
  value?: number
) {
  // window.gtag가 정의되어 있는지 확인
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } else {
    console.warn("Google Analytics not loaded");
  }
}

// 버튼 클릭 이벤트 추적을 위한 헬퍼 함수
export function trackButtonClick(buttonName: string, additionalInfo?: string) {
  trackEvent(
    "click",
    "button",
    additionalInfo ? `${buttonName}_${additionalInfo}` : buttonName
  );
}

// URL에서 실제 페이지 경로만 추출하는 함수
function sanitizeUrl(url: string): string {
  try {
    // URL에서 경로만 추출 (쿼리 파라미터 제외)
    const urlObj = new URL(url, window.location.origin);
    return urlObj.pathname;
  } catch {
    // URL 파싱에 실패한 경우 입력값 그대로 반환
    return url;
  }
}

// 페이지 조회 이벤트 추적을 위한 헬퍼 함수
export function trackPageView(pagePath: string, pageTitle: string) {
  if (typeof window !== "undefined" && window.gtag) {
    // 페이지 경로를 단순화하여 쿼리 파라미터 제거
    const cleanPagePath = sanitizeUrl(pagePath);

    // 페이지 제목이 너무 길면 잘라내기 (최대 100자)
    const trimmedPageTitle =
      pageTitle.length > 100 ? pageTitle.substring(0, 97) + "..." : pageTitle;

    window.gtag("event", "page_view", {
      page_path: cleanPagePath,
      page_title: trimmedPageTitle,
    });
  }
}
