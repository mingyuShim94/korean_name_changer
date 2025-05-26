"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { getCookie, setCookie } from "cookies-next";

export default function GoogleAnalytics() {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-0H6KXZD065";
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  // 쿠키 동의 상태 확인
  useEffect(() => {
    const cookieConsent = getCookie("analytics-consent");
    setConsentGiven(cookieConsent === "true");
  }, []);

  // 동의 설정 함수
  const setConsent = (consent: boolean) => {
    setCookie("analytics-consent", consent.toString(), {
      maxAge: 60 * 60 * 24 * 365, // 1년
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    setConsentGiven(consent);

    // 동의 상태에 따라 GA 설정 업데이트
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: consent ? "granted" : "denied",
      });
    }
  };

  // 쿠키 동의 배너가 필요한 경우 표시
  if (consentGiven === null) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50 text-sm">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            이 웹사이트는 사용자 경험 개선을 위해 쿠키를 사용합니다. 분석 쿠키
            사용에 동의하시겠습니까?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConsent(true)}
              className="px-4 py-1 bg-blue-500 hover:bg-blue-600 rounded"
            >
              동의
            </button>
            <button
              onClick={() => setConsent(false)}
              className="px-4 py-1 bg-gray-600 hover:bg-gray-700 rounded"
            >
              거부
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 동의하지 않은 경우 GA 스크립트를 로드하지 않음
  if (consentGiven === false) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            send_page_view: true,
            anonymize_ip: true,
            cookie_flags: 'SameSite=None;Secure',
            cookie_expires: 63072000, // 2년 (초 단위)
            custom_map: {
              dimension1: 'user_type',
              dimension2: 'name_style',
              metric1: 'name_generation_count'
            }
          });
          
          // 기본 동의 상태 설정
          gtag('consent', 'default', {
            'analytics_storage': 'granted'
          });
        `}
      </Script>
    </>
  );
}
