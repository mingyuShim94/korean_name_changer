"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { saveResultDataToStorage } from "@/lib/storage-utils"; // 유틸리티 파일에서 함수 임포트

// 토큰을 안전하게 저장하는 함수
const storeTokenSecurely = (token: string): void => {
  if (typeof window !== "undefined") {
    // 세션 스토리지에 토큰 저장 (브라우저 세션 동안만 유지)
    sessionStorage.setItem("korean_name_auth_token", token);
  }
};

// 토큰 검증 및 사용 후 삭제하는 함수
const getAndClearToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const token = sessionStorage.getItem("korean_name_auth_token");
  if (token) {
    // 사용 후 즉시 삭제 (일회용으로 만들기)
    sessionStorage.removeItem("korean_name_auth_token");
  }
  return token;
};

export default function PaymentSuccessfulPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [redirecting, setRedirecting] = React.useState(false);
  const requestSentRef = React.useRef(false); // Track request status using useRef

  // API call function separated and wrapped with useCallback
  const generateName = React.useCallback(
    async (token: string) => {
      try {
        console.log("API request started - Korean name generation");
        const res = await fetch("/api/generate-name", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const data = await res.json();
          // 429 error (request limit exceeded) handling
          if (res.status === 429) {
            console.log("429 error occurred: Request limit exceeded");
            throw new Error(
              "Service is currently limited due to high traffic. Please try again later."
            );
          }
          throw new Error(data.error || `API request failed (${res.status})`);
        }

        const data = await res.json();
        setRedirecting(true);

        // Extract necessary information from response data
        const type = data.isPremium ? "premium" : "free";
        const gender = data.gender || "neutral";
        const nameStyle = data.nameStyle || "hanja";

        // 결과 데이터를 세션 스토리지에 저장하고 ID 받기
        const resultId = saveResultDataToStorage(data);

        if (!resultId) {
          throw new Error("Failed to store result data");
        }

        // 결과 ID만 URL에 포함하여 리다이렉트
        router.push(
          `/result?resultId=${resultId}&nameStyle=${nameStyle}&type=${type}&gender=${gender}`
        );
      } catch (err: unknown) {
        console.error("API call error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while generating the name.";
        setError(errorMessage);
        setIsProcessing(false);
        // Reset flag to allow retry after error
        requestSentRef.current = false;
      }
    },
    [router]
  );

  React.useEffect(() => {
    // Prevent duplicate execution if request already sent
    if (requestSentRef.current) return;

    // 토큰 처리 로직
    const handleToken = () => {
      // 1. URL에서 토큰 확인
      const urlToken = searchParams.get("token");

      // 2. 세션 스토리지에서 토큰 확인
      const storedToken = getAndClearToken();

      // 3. 토큰 우선순위: URL 토큰 > 저장된 토큰
      const token = urlToken || storedToken;

      if (!token) {
        setError("Invalid access. Authentication token required.");
        setIsProcessing(false);
        return;
      }

      // 4. URL에 토큰이 있었다면 안전하게 저장하고 URL에서 제거
      if (urlToken && typeof window !== "undefined") {
        storeTokenSecurely(urlToken);

        // URL에서 토큰 제거 (보안을 위해)
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      }

      // Mark request status
      requestSentRef.current = true;
      console.log("API request started - Duplicate prevention flag set");

      // Use separated API call function
      generateName(token);
    };

    // 컴포넌트 마운트 시 토큰 처리
    handleToken();
  }, [searchParams, router, generateName]);

  if (isProcessing || redirecting) {
    // Display loading message
    return <FullScreenLoader message="Generating Korean name..." />;
  }

  if (error) {
    const isRateLimitError =
      error.includes("Service is currently limited") ||
      error.includes("Too Many Requests");

    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            {isRateLimitError ? "Service Limitation" : "An Error Occurred"}
          </h1>

          {isRateLimitError ? (
            <p className="mb-6 text-gray-700">
              Service is currently limited due to high traffic. Please try again
              later.
            </p>
          ) : (
            <p className="mb-6 text-gray-700">{error}</p>
          )}

          {isRateLimitError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
              <p>Free mode may have temporary API usage limitations.</p>
              <p className="mt-1">
                For more reliable service, please consider using the premium
                mode.
              </p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => {
                requestSentRef.current = false;
                router.push("/");
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Return to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  // This should never be shown now, but keeping as a fallback
  return <FullScreenLoader message="Redirecting to results page..." />;
}
