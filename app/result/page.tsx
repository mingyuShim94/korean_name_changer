"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ImprovedResultDisplay } from "@/components/improved-result-display";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import { GenderOption, NameStyleOption } from "@/app/lib/krNameSystemPrompts";

// New interface definition - Free version
interface FreeKoreanNameData {
  original_name: string;
  original_name_analysis: {
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    rationale?: string;
    syllables?: {
      syllable: string;
      romanization: string;
      hanja?: string;
      meaning: string;
    }[];
  };
  korean_name_impression?: string;
  social_share_content: {
    formatted: string;
  };
}

// New interface definition - Premium version
interface PremiumKoreanNameData {
  original_name: string;
  original_name_analysis: {
    letters: {
      letter: string;
      meaning: string;
    }[];
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    syllables: {
      syllable: string;
      romanization: string;
      hanja: string;
      meaning: string;
    }[];
    rationale: string;
    life_values: string;
  };
  korean_name_impression: string;
  social_share_content: {
    formatted: string;
    summary: string;
  };
}

// Result data union type
type ResultData = FreeKoreanNameData | PremiumKoreanNameData;

// Extended free tier data type with syllables information - unified with existing interface
interface UpgradedFreeKoreanNameData extends FreeKoreanNameData {
  korean_name_suggestion: {
    full_name: string;
    rationale?: string;
    syllables?: {
      syllable: string;
      romanization: string;
      hanja?: string;
      meaning: string;
    }[];
  };
}

// 세션 스토리지에서 데이터를 가져오는 함수
const getResultDataFromStorage = (resultId: string): ResultData | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedData = sessionStorage.getItem(`korean_name_result_${resultId}`);
    return storedData ? JSON.parse(storedData) : null;
  } catch (e) {
    console.error("Failed to retrieve data from session storage:", e);
    return null;
  }
};

// 세션 스토리지에 데이터를 저장하는 함수
export const saveResultDataToStorage = (data: ResultData): string => {
  if (typeof window === "undefined") return "";

  try {
    // 고유 ID 생성 (타임스탬프 + 랜덤 문자열)
    const resultId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 10)}`;
    sessionStorage.setItem(
      `korean_name_result_${resultId}`,
      JSON.stringify(data)
    );
    return resultId;
  } catch (e) {
    console.error("Failed to save data to session storage:", e);
    return "";
  }
};

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
        setResultData(storedData);
      } else {
        setError("결과 데이터를 찾을 수 없습니다. 다시 시도해주세요.");
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
            const freeData: UpgradedFreeKoreanNameData = {
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
        setError(
          "결과 데이터를 불러오는데 실패했습니다. 형식이 올바르지 않을 수 있습니다."
        );
      }
    } else {
      // Case where there is no data, for example, direct access to /result
      setError(
        "표시할 결과 데이터가 없습니다. 홈 페이지로 돌아가서 다시 시도해주세요."
      );
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="mt-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 rounded-md p-4 text-sm">
        <h3 className="font-semibold mb-1">오류:</h3>
        <p>{error}</p>
        <Link
          href="/"
          className="mt-2 inline-block text-blue-600 hover:underline"
          onClick={() => trackButtonClick("return_to_home", "from_error")}
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  // Use improved ImprovedResultDisplay component
  return (
    <>
      <div className="text-center space-y-4 mb-6">
        <h1 className="flex flex-col gap-2 text-3xl font-bold tracking-tighter sm:text-4xl">
          <span className="text-primary">Your Korean Name</span>
          <span>Meaning & Translation</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-[600px] mx-auto">
          Explore the deep meaning and cultural significance of your
          personalized Korean name, complete with Hanja characters and
          pronunciation guide.
        </p>
      </div>
      <ImprovedResultDisplay
        data={resultData}
        loading={false}
        nameStyle={nameStyle}
        isPremium={isPremium}
        gender={gender}
      />
      {resultData && (
        <CardFooter className="flex p-6 pt-0 sm:p-8 sm:pt-0">
          <div className="flex flex-col w-full gap-3">
            <Button className="w-full text-sm md:text-base text-center" asChild>
              <Link
                href="/"
                onClick={() =>
                  trackButtonClick("generate_another_name", "from_result_page")
                }
              >
                다른 이름 생성하기
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
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-muted/40">
      <div className="w-full max-w-4xl mx-auto px-4 flex flex-col items-center space-y-8">
        <div className="text-center space-y-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl w-full">
          <h1 className="flex flex-col gap-2 text-3xl font-bold tracking-tighter sm:text-4xl text-gray-900 dark:text-white">
            <span className="text-primary">Your Korean Name</span>
            <span>Meaning & Translation</span>
          </h1>
          <p className="text-gray-700 dark:text-gray-200 max-w-[600px] mx-auto font-medium text-lg">
            Explore the deep meaning and cultural significance of your
            personalized Korean name, complete with Hanja characters and
            pronunciation guide.
          </p>
        </div>

        <Card className="w-full max-w-lg shadow-xl rounded-2xl border-t-4 border-primary relative">
          <CardContent className="p-6 sm:p-8">
            <React.Suspense
              fallback={
                <p className="text-center text-muted-foreground">
                  결과를 불러오는 중...
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
