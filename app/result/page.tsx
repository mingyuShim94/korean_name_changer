"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ImprovedResultDisplay } from "@/components/improved-result-display";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import { GenderOption, NameStyleOption } from "@/app/lib/freeSystemPrompts";
import {
  getResultDataFromStorage,
  saveResultDataToStorage,
} from "@/lib/storage-utils";

// 새로운 간소화된 데이터 구조 (Free/Premium 통합)
type NewKoreanNameData = {
  korean_name: {
    full: string;
    romanized: string;
    syllables: {
      syllable: string;
      romanized: string;
      hanja: string;
      keywords: string[];
      explanation: string;
    }[];
    integrated_meaning: string;
  };
};

// 새로운 프리미엄 데이터 구조
type NewPremiumKoreanNameData = {
  original_name: {
    full: string;
    components: {
      name: string;
      meanings: string[];
      symbols: string[];
    }[];
    summary: string;
  };
  korean_name: {
    full: string;
    romanized: string;
    syllables: {
      syllable: string;
      romanized: string;
      hanja: string;
      keywords: string[];
      explanation: string;
    }[];
    integrated_meaning: string;
  };
  life_values: {
    text: string;
  };
  cultural_impression: {
    text: string;
  };
};

// 레거시 타입 (기존 호환성용)
type LegacyKoreanNameData = {
  original_name: string;
  original_name_analysis?: {
    summary?: string;
    letters?: {
      letter: string;
      meaning: string;
    }[];
  };
  korean_name_suggestion: {
    full_name: string;
    rationale?: string;
    syllables: {
      syllable: string;
      romanization: string;
      hanja?: string;
      meaning: string;
    }[];
    life_values?: string;
  };
  korean_name_impression?: string;
  social_share_content?: {
    formatted: string;
    summary?: string;
  };
};

type ResultData =
  | NewKoreanNameData
  | NewPremiumKoreanNameData
  | LegacyKoreanNameData;

// 세션 스토리지 함수들은 lib/storage-utils.ts로 이동했습니다

// Internal component that reads SearchParams and displays results
function ResultContent() {
  const searchParams = useSearchParams();
  const [resultData, setResultData] = React.useState<ResultData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPremium, setIsPremium] = React.useState<boolean>(false);
  const [nameStyle, setNameStyle] = React.useState<NameStyleOption>("hanja");
  const [gender, setGender] = React.useState<GenderOption>("neutral");

  React.useEffect(() => {
    // 결과 ID 또는 레거시 데이터 문자열 가져오기
    const resultId = searchParams.get("resultId");
    const legacyDataString = searchParams.get("data");

    // Extract required values from search parameters
    const type = searchParams.get("type") || "free";
    const style = searchParams.get("nameStyle") || "hanja";
    const genderParam = searchParams.get("gender") || "neutral";

    // Determine premium status based on URL parameters (not dependent on data structure)
    setIsPremium(type === "premium");
    setNameStyle(style as NameStyleOption);
    setGender(genderParam as GenderOption);

    // 새 방식: 세션 스토리지에서 데이터 가져오기
    if (resultId) {
      const storedData = getResultDataFromStorage(resultId);
      if (storedData) {
        setResultData(storedData as ResultData);
      } else {
        setError("Result data not found. Please try again.");
      }
    }
    // 레거시 방식: URL에서 데이터 가져오기 (이전 버전과의 호환성 유지)
    else if (legacyDataString) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(legacyDataString));

        // Validate if parsed data has the correct format
        if (parsedData && parsedData.original_name) {
          // Filter data for free users (based on URL parameter)
          if (type !== "premium") {
            // Include syllables information in free tier to enable similar UI structure as premium
            const freeData = {
              original_name: parsedData.original_name,
              original_name_analysis: {
                summary:
                  parsedData.original_name_analysis?.summary ||
                  "Your Korean name is based on your original name's essence.",
              },
              korean_name_suggestion: {
                full_name: parsedData.korean_name_suggestion?.full_name || "",
                rationale: parsedData.korean_name_suggestion?.rationale || "",
                // Use syllables information from server if available
                syllables: parsedData.korean_name_suggestion?.syllables || [],
              },
              korean_name_impression:
                parsedData.korean_name_impression || undefined,
              social_share_content: {
                formatted:
                  parsedData.social_share_content?.formatted ||
                  `${parsedData.original_name} : ${
                    parsedData.korean_name_suggestion?.full_name || ""
                  }`,
                summary: parsedData.social_share_content?.summary || "",
              },
            };

            // 데이터를 세션 스토리지에 저장하고 URL 업데이트 (다음 새로고침을 위해)
            const newResultId = saveResultDataToStorage(freeData);
            if (newResultId && typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.delete("data");
              url.searchParams.set("resultId", newResultId);
              window.history.replaceState({}, "", url.toString());
            }

            setResultData(freeData as ResultData);
          } else {
            // Provide full data for premium users
            // 데이터를 세션 스토리지에 저장하고 URL 업데이트 (다음 새로고침을 위해)
            const newResultId = saveResultDataToStorage(parsedData);
            if (newResultId && typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.delete("data");
              url.searchParams.set("resultId", newResultId);
              window.history.replaceState({}, "", url.toString());
            }

            setResultData(parsedData);
          }
        } else {
          throw new Error("Data format is invalid");
        }
      } catch (e) {
        console.error("Failed to parse result data:", e);
        setError("Failed to load result data. The format may be incorrect.");
      }
    } else {
      // Case where there is no data, for example, direct access to /result
      setError(
        "No result data to display. Please return to the home page and try again."
      );
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="mt-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 rounded-md p-4 text-sm">
        <h3 className="font-semibold mb-1">Error:</h3>
        <p>{error}</p>
        <Link
          href="/"
          className="mt-2 inline-block text-blue-600 hover:underline"
          onClick={() => trackButtonClick("return_to_home", "from_error")}
        >
          Return to Home
        </Link>
      </div>
    );
  }

  // Use improved ImprovedResultDisplay component
  return (
    <>
      <ImprovedResultDisplay
        data={resultData}
        loading={false}
        nameStyle={nameStyle}
        isPremium={isPremium}
        gender={gender}
      />
      {resultData && (
        <CardFooter className="flex p-3 pt-0 sm:p-6 sm:pt-0 md:p-8 md:pt-0">
          <div className="flex flex-col w-full gap-3">
            <Button className="w-full text-sm md:text-base text-center" asChild>
              <Link
                href="/"
                onClick={() =>
                  trackButtonClick("generate_another_name", "from_result_page")
                }
              >
                Generate Another Name
              </Link>
            </Button>
          </div>
        </CardFooter>
      )}
    </>
  );
}

export default function ResultPage() {
  const searchParams = useSearchParams();

  // Track event on page load
  React.useEffect(() => {
    const type = searchParams.get("type") || "free";
    const nameStyle = searchParams.get("nameStyle") || "hanja";
    const gender = searchParams.get("gender") || "neutral";

    // Track result page view event
    trackPageView(
      "/result",
      `Result Page - ${
        type === "premium" ? "Premium" : "Free"
      } ${nameStyle} Name (${gender})`
    );
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-3 sm:p-6 md:p-12 bg-muted/40">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 flex flex-col items-center space-y-4 sm:space-y-8">
        <Card className="w-full max-w-lg shadow-xl rounded-2xl border-t-4 border-primary relative">
          <CardContent className="p-3 sm:p-6 md:p-8">
            <React.Suspense
              fallback={
                <p className="text-center text-muted-foreground">
                  Loading results...
                </p>
              }
            >
              <ResultContent />
            </React.Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
