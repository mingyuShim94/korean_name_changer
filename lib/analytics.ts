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
        user_type?: string;
        name_style?: string;
        name_generation_count?: number;
        conversion_value?: number;
        currency?: string;
        transaction_id?: string;
        items?: Array<{
          item_id: string;
          item_name: string;
          price?: number;
          quantity?: number;
        }>;
        [key: string]: unknown;
      }
    ) => void;
  }
}

// 사용자 유형 정의
export type UserType = "free" | "paid" | "guest";

// 이름 스타일 정의
export type NameStyle =
  | "masculine"
  | "feminine"
  | "neutral"
  | "hanja"
  | "pure_korean";

/**
 * Google Analytics 이벤트를 추적하는 함수
 * @param action 이벤트 이름 (예: 'click', 'submit', 'view')
 * @param category 이벤트 카테고리 (예: 'button', 'form', 'page')
 * @param label 이벤트 레이블 (예: 'free_name_generation', 'premium_name_generation')
 * @param value 이벤트 값 (선택 사항)
 * @param additionalParams 추가 매개변수 (선택 사항)
 */
export function trackEvent(
  action: string,
  category: string,
  label: string,
  value?: number,
  additionalParams?: Record<string, unknown>
) {
  // window.gtag가 정의되어 있는지 확인
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...additionalParams,
    });
  } else {
    console.warn("Google Analytics not loaded");
  }
}

// 버튼 클릭 이벤트 추적을 위한 헬퍼 함수
export function trackButtonClick(
  buttonName: string,
  additionalInfo?: string,
  additionalParams?: Record<string, unknown>
) {
  trackEvent(
    "click",
    "button",
    additionalInfo ? `${buttonName}_${additionalInfo}` : buttonName,
    undefined,
    additionalParams
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
export function trackPageView(
  pagePath: string,
  pageTitle: string,
  userType?: UserType
) {
  if (typeof window !== "undefined" && window.gtag) {
    // 페이지 경로를 단순화하여 쿼리 파라미터 제거
    const cleanPagePath = sanitizeUrl(pagePath);

    // 페이지 제목이 너무 길면 잘라내기 (최대 100자)
    const trimmedPageTitle =
      pageTitle.length > 100 ? pageTitle.substring(0, 97) + "..." : pageTitle;

    const params: Record<string, unknown> = {
      page_path: cleanPagePath,
      page_title: trimmedPageTitle,
    };

    // 사용자 유형이 있으면 추가
    if (userType) {
      params.user_type = userType;
    }

    window.gtag("event", "page_view", params);
  }
}

// 이름 생성 이벤트 추적
export function trackNameGeneration(
  nameStyle: NameStyle,
  isSuccess: boolean,
  userType: UserType = "free"
) {
  trackEvent(
    "name_generation",
    "feature",
    isSuccess ? "success" : "failure",
    undefined,
    {
      name_style: nameStyle,
      user_type: userType,
      name_generation_count: 1, // 커스텀 측정항목 사용
    }
  );
}

// 결제 시작 이벤트 추적
export function trackPaymentInitiated(
  amount: number,
  currency: string = "USD",
  productId: string
) {
  trackEvent("begin_checkout", "ecommerce", productId, amount, {
    currency,
    items: [
      {
        item_id: productId,
        item_name: "Korean Name Generator Premium",
        price: amount,
        quantity: 1,
      },
    ],
  });
}

// 결제 완료 이벤트 추적
export function trackPaymentCompleted(
  amount: number,
  currency: string = "USD",
  productId: string,
  transactionId: string
) {
  trackEvent("purchase", "ecommerce", productId, amount, {
    transaction_id: transactionId,
    currency,
    conversion_value: amount,
    items: [
      {
        item_id: productId,
        item_name: "Korean Name Generator Premium",
        price: amount,
        quantity: 1,
      },
    ],
  });
}

// 공유 이벤트 추적
export function trackShare(method: string) {
  trackEvent("share", "engagement", method);
}

// 검색 이벤트 추적
export function trackSearch(searchTerm: string) {
  trackEvent("search", "engagement", searchTerm);
}

// 사용자 참여 시간 추적
export function trackEngagementTime(seconds: number) {
  trackEvent("engagement_time", "engagement", "time_on_page", seconds);
}

// 오류 이벤트 추적
export function trackError(
  errorMessage: string,
  errorContext?: Record<string, unknown>
) {
  trackEvent("error", "system", errorMessage, undefined, errorContext);
}
