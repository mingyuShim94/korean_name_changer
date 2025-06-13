"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ImprovedResultDisplay } from "@/components/improved-result-display";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import { GenderOption, NameStyleOption } from "@/app/lib/freeSystemPrompts";
import { Share2, Sparkles } from "lucide-react";
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

// 소셜 공유 컴포넌트
function SocialShareCard({
  koreanName,
  romanized,
}: {
  koreanName: string;
  romanized: string;
}) {
  const shareText = `🇰🇷 My Korean name is ${koreanName} (${romanized})! Discover your Korean name too! ✨`;
  const shareUrl = typeof window !== "undefined" ? window.location.origin : "";

  const handleShare = async (platform: string) => {
    trackButtonClick("social_share", platform);

    if (platform === "native" && navigator.share) {
      try {
        await navigator.share({
          title: "My Korean Name",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      let url = "";
      switch (platform) {
        case "twitter":
          url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            shareText
          )}&url=${encodeURIComponent(shareUrl)}`;
          break;
        case "facebook":
          url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
          )}&quote=${encodeURIComponent(shareText)}`;
          break;
        case "whatsapp":
          url = `https://wa.me/?text=${encodeURIComponent(
            shareText + " " + shareUrl
          )}`;
          break;
      }
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      // TODO: Add toast notification
      trackButtonClick("copy_result", "clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
      <div className="flex items-center gap-3 mb-4">
        <Share2 className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-purple-800">
          Share Your Korean Name
        </h3>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        Show your friends your beautiful Korean name!
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("twitter")}
          className="border-blue-200 hover:bg-blue-50 text-blue-700"
        >
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("facebook")}
          className="border-blue-600 hover:bg-blue-50 text-blue-600"
        >
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleShare("whatsapp")}
          className="border-green-500 hover:bg-green-50 text-green-600"
        >
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="border-gray-400 hover:bg-gray-50 text-gray-700"
        >
          Copy Link
        </Button>
      </div>
    </div>
  );
}

// 향상된 프리미엄 업셀 카드 컴포넌트
function EnhancedPremiumUpsellCard() {
  const handlePremiumClick = () => {
    trackButtonClick("premium_upsell", "from_result_enhanced");
    window.location.href = "/pricing";
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-red-400 rounded-2xl p-1">
      <div className="bg-white rounded-xl p-6 h-full">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full mb-3">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">
              PREMIUM UPGRADE
            </span>
          </div>

          <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Unlock Your Complete Korean Identity
          </h3>

          <p className="text-gray-600 mt-2">
            Get the full cultural experience with advanced insights
          </p>
        </div>

        {/* 기능 비교 */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 현재 (무료) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              Current (Free)
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Basic Korean name</li>
              <li>✓ Romanization</li>
              <li>✓ Simple meaning</li>
              <li className="text-gray-400">✗ Audio pronunciation</li>
              <li className="text-gray-400">✗ Deep cultural analysis</li>
              <li className="text-gray-400">✗ Life values insight</li>
            </ul>
          </div>

          {/* 프리미엄 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-200">
            <h4 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
              Premium Experience
            </h4>
            <ul className="text-sm text-amber-800 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-amber-500">🔊</span>
                Native pronunciation audio
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500">🔍</span>
                Original name deep analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-500">💎</span>
                Life values & personality insights
              </li>
              <li className="flex items-center gap-2">
                <span className="text-pink-500">🌸</span>
                Cultural impression & social meaning
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✨</span>5 premium generations
                included
              </li>
            </ul>
          </div>
        </div>

        {/* CTA 버튼들 */}
        <div className="space-y-3">
          <Button
            onClick={handlePremiumClick}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Upgrade to Premium - $1.90
          </Button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Secure payment • Instant access • 100% satisfaction guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  // 한국어 이름 정보 추출 함수
  const getKoreanNameInfo = () => {
    if (!resultData) return null;

    // 새로운 데이터 구조
    if ("korean_name" in resultData && resultData.korean_name) {
      return {
        full: resultData.korean_name.full,
        romanized: resultData.korean_name.romanized,
      };
    }

    // 레거시 데이터 구조
    if (
      "korean_name_suggestion" in resultData &&
      resultData.korean_name_suggestion
    ) {
      return {
        full: resultData.korean_name_suggestion.full_name,
        romanized: resultData.korean_name_suggestion.syllables
          .map((s) => s.romanization)
          .join(" "),
      };
    }

    return null;
  };

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😔</span>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <Button asChild className="bg-red-600 hover:bg-red-700">
            <Link
              href="/"
              onClick={() => trackButtonClick("return_to_home", "from_error")}
            >
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const koreanInfo = getKoreanNameInfo();

  // Use improved ImprovedResultDisplay component
  return (
    <div className="space-y-6">
      <ImprovedResultDisplay
        data={resultData}
        loading={false}
        nameStyle={nameStyle}
        isPremium={isPremium}
        gender={gender}
      />

      {/* 소셜 공유 카드 */}
      {resultData && koreanInfo && (
        <SocialShareCard
          koreanName={koreanInfo.full}
          romanized={koreanInfo.romanized}
        />
      )}

      {/* 무료 사용자에게만 향상된 업셀 컴포넌트 표시 */}
      {!isPremium && resultData && koreanInfo && <EnhancedPremiumUpsellCard />}

      {/* 하단 액션 버튼들 */}
      {resultData && (
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3"
            asChild
          >
            <Link
              href="/generate"
              onClick={() =>
                trackButtonClick("generate_another_name", "from_result_page")
              }
            >
              Generate Another Name
            </Link>
          </Button>

          <Button
            variant="outline"
            className="sm:w-auto border-gray-300 hover:bg-gray-50"
            asChild
          >
            <Link
              href="/"
              onClick={() =>
                trackButtonClick("back_to_home", "from_result_page")
              }
            >
              Back to Home
            </Link>
          </Button>
        </div>
      )}
    </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Your Korean Name Result
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the beauty and meaning behind your personalized Korean
            name, crafted with cultural authenticity and modern sensibility.
          </p>
        </div>

        {/* 메인 콘텐츠 카드 */}
        <Card className="shadow-2xl rounded-3xl border-0 overflow-hidden bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <React.Suspense
              fallback={
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">
                    Loading your beautiful Korean name...
                  </p>
                </div>
              }
            >
              <ResultContent />
            </React.Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
