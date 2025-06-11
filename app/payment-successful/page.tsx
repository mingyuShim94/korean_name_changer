"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveResultDataToStorage } from "@/lib/storage-utils";

// 토큰을 안전하게 저장하는 함수
const storeTokenSecurely = (token: string): void => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("korean_name_auth_token", token);
  }
};

// 토큰 검증 및 사용 후 삭제하는 함수
const getAndClearToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const token = sessionStorage.getItem("korean_name_auth_token");
  if (token) {
    sessionStorage.removeItem("korean_name_auth_token");
  }
  return token;
};

// 로딩 단계 정의
const steps = [
  {
    id: 1,
    title: "Payment Verification",
    description: "Confirming secure payment completion",
  },
  {
    id: 2,
    title: "AI Analysis",
    description: "AI is analyzing your information",
  },
  {
    id: 3,
    title: "Name Generation",
    description: "Creating your perfect Korean name",
  },
  {
    id: 4,
    title: "Result Preparation",
    description: "Preparing cultural meanings and pronunciation guide",
  },
];

// 한국어 이름에 대한 흥미로운 팩트들
const koreanNameFacts = [
  "Korean names are usually composed of 2-3 characters, each carrying deep meaning.",
  "Traditional naming considers both the meaning of Chinese characters and phonetic harmony.",
  "Names often reflect seasons, nature, and virtues that parents hope their children will embody.",
  "The harmony between family name and given name is highly valued in Korean culture.",
  "Modern Korean names also embrace the beautiful sounds unique to the Korean language.",
];

export default function PaymentSuccessfulPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [redirecting, setRedirecting] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [currentFact, setCurrentFact] = React.useState(0);
  const requestSentRef = React.useRef(false);

  // 단계별 진행 효과
  React.useEffect(() => {
    if (!isProcessing || error) return;

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length) return prev + 1;
        return prev;
      });
    }, 3500);

    return () => clearInterval(stepInterval);
  }, [isProcessing, error]);

  // 팩트 로테이션 효과
  React.useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % koreanNameFacts.length);
    }, 3000);

    return () => clearInterval(factInterval);
  }, []);

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

        const type = data.isPremium ? "premium" : "free";
        const gender = data.gender || "neutral";
        const nameStyle = data.nameStyle || "hanja";

        const resultId = saveResultDataToStorage(data);

        if (!resultId) {
          throw new Error("Failed to store result data");
        }

        router.push(
          `/result?resultId=${resultId}&nameStyle=${nameStyle}&type=${type}&gender=${gender}`
        );
      } catch (err: unknown) {
        console.error("API call error:", err);
        const errorMessage =
          err instanceof Error
            ? err.message
            : "An error occurred while generating your name.";
        setError(errorMessage);
        setIsProcessing(false);
        requestSentRef.current = false;
      }
    },
    [router]
  );

  React.useEffect(() => {
    if (requestSentRef.current) return;

    const handleToken = () => {
      const urlToken = searchParams.get("token");
      const storedToken = getAndClearToken();
      const token = urlToken || storedToken;

      if (!token) {
        setError("Invalid access. Authentication token required.");
        setIsProcessing(false);
        return;
      }

      if (urlToken && typeof window !== "undefined") {
        storeTokenSecurely(urlToken);
        const url = new URL(window.location.href);
        url.searchParams.delete("token");
        window.history.replaceState({}, "", url.toString());
      }

      requestSentRef.current = true;
      console.log("API request started - Duplicate prevention flag set");
      generateName(token);
    };

    handleToken();
  }, [searchParams, router, generateName]);

  if (isProcessing || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* 메인 로딩 카드 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
                <svg
                  className="w-10 h-10 text-white animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {redirecting
                  ? "Redirecting to results..."
                  : "Creating Your Perfect Korean Name"}
              </h1>
              <p className="text-gray-600">
                Please wait a moment. We&apos;re crafting the perfect name for
                you.
              </p>
            </div>

            {/* 진행 단계 */}
            <div className="space-y-4 mb-8">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-4">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-blue-500 text-white animate-pulse"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      step.id
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-medium transition-colors duration-300 ${
                        currentStep >= step.id
                          ? "text-gray-900"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p
                      className={`text-sm transition-colors duration-300 ${
                        currentStep >= step.id
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* 한국어 이름 팩트 카드 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              Interesting Facts About Korean Names
            </h3>
            <p
              key={currentFact}
              className="text-gray-600 leading-relaxed animate-fadeIn"
            >
              {koreanNameFacts[currentFact]}
            </p>
            <div className="flex space-x-1 mt-4">
              {koreanNameFacts.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    index === currentFact ? "bg-blue-500" : "bg-gray-300"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isRateLimitError =
      error.includes("Service is currently limited") ||
      error.includes("high traffic") ||
      error.includes("Too Many Requests");

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* 에러 아이콘 */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            {isRateLimitError ? (
              <svg
                className="w-10 h-10 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-4">
            {isRateLimitError ? (
              <span className="text-orange-600">
                Service Temporarily Limited
              </span>
            ) : (
              <span className="text-red-600">An Error Occurred</span>
            )}
          </h1>

          <div className="text-gray-700 mb-6 space-y-3">
            <p>{error}</p>

            {isRateLimitError && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-800 text-sm">
                <p className="font-medium mb-1">💡 Solutions:</p>
                <ul className="text-left space-y-1">
                  <li>• Please try again in 5-10 minutes</li>
                  <li>• Premium service offers more reliable access</li>
                  <li>• Contact support if the issue persists</li>
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                requestSentRef.current = false;
                setError(null);
                setIsProcessing(true);
                setCurrentStep(1);
                // 토큰이 있다면 다시 시도
                const token = getAndClearToken() || searchParams.get("token");
                if (token) {
                  generateName(token);
                } else {
                  router.push("/");
                }
              }}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
            >
              Try Again
            </button>

            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Return to Home
            </button>
          </div>

          {/* 고객지원 링크 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Still having issues?</p>
            <button
              onClick={() => router.push("/contact")}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to results page...</p>
      </div>
    </div>
  );
}
