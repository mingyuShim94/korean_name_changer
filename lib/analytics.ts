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

// 페이지 조회 이벤트 추적을 위한 헬퍼 함수
export function trackPageView(pagePath: string, pageTitle: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
}
