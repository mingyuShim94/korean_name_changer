"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ImprovedResultDisplay } from "@/components/improved-result-display";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackButtonClick, trackPageView } from "@/lib/analytics";

// KoreanNameData 인터페이스 (app/page.tsx와 동일한 구조)
interface KoreanNameData {
  original_name: string;
  korean_name: string;
  connection_explanation: string;
  hanja_breakdown: Array<{
    character: string;
    meaning: string;
  }>;
  poetic_interpretation: string;
  virtue_and_life_direction: string;
}

// 프리미엄 결과 데이터 인터페이스
interface PremiumKoreanNameData {
  original_name: string;
  suggested_korean_name: {
    hangul: string;
    hanja?: string;
    romanization: string;
  };
  interpretation: {
    core_meaning_summary: string;
    element_analysis: Array<{
      hangul_syllable: string;
      hanja_character?: string;
      meaning_english_hint: string;
      relevance_to_name: string;
    }>;
    connection_and_rationale: string;
    synthesized_meaning_and_aspiration: string;
    poetic_interpretation_of_korean_name: string;
    virtue_and_life_direction: string;
    cultural_blessing_note: string;
    full_interpretation_text_narrative: string;
  };
}

// 결과 데이터 유니온 타입
type ResultData = KoreanNameData | PremiumKoreanNameData;

// SearchParams를 읽고 결과를 표시하는 내부 컴포넌트
function ResultContent() {
  const searchParams = useSearchParams();
  const [resultData, setResultData] = React.useState<ResultData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPremium, setIsPremium] = React.useState<boolean>(false);

  React.useEffect(() => {
    const dataString = searchParams.get("data");
    const type = searchParams.get("type") || "free";

    setIsPremium(type === "premium");

    if (dataString) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataString));
        setResultData(parsedData);
      } catch (e) {
        console.error("Failed to parse result data:", e);
        setError(
          "결과 데이터를 불러오는 데 실패했습니다. 형식이 올바르지 않을 수 있습니다."
        );
      }
    } else {
      // 데이터가 없는 경우, 예를 들어 직접 /result로 접근한 경우
      // 이 경우 에러 메시지를 설정하거나, 홈페이지로 리디렉션 할 수 있습니다.
      // 여기서는 에러 메시지를 설정합니다.
      setError(
        "표시할 결과 데이터가 없습니다. 홈으로 돌아가 다시 시도해주세요."
      );
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="mt-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 rounded-md p-4 text-sm">
        <h3 className="font-semibold mb-1">오류 발생:</h3>
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

  // 개선된 ImprovedResultDisplay 컴포넌트 사용
  const nameStyle =
    searchParams.get("nameStyle") === "pureKorean" ? "pureKorean" : "hanja";
  return (
    <ImprovedResultDisplay
      data={resultData}
      loading={false}
      nameStyle={nameStyle}
      isPremium={isPremium}
    />
  );
}

export default function ResultPage() {
  const searchParams = useSearchParams();
  const [data, setData] = React.useState<ResultData | null>(null);

  // 페이지 로드 시 이벤트 추적
  React.useEffect(() => {
    const type = searchParams.get("type") || "free";
    const nameStyle = searchParams.get("nameStyle") || "hanja";

    // 결과 페이지 조회 이벤트 추적
    trackPageView(
      "/result",
      `Result Page - ${
        type === "premium" ? "Premium" : "Free"
      } ${nameStyle} Name`
    );
  }, [searchParams]);

  React.useEffect(() => {
    // URL 쿼리 파라미터에서 데이터 파싱
    const dataParam = searchParams.get("data");
    if (dataParam) {
      try {
        // URL-인코딩된 JSON 문자열을 디코딩하고 파싱
        const parsedData = JSON.parse(decodeURIComponent(dataParam));
        setData(parsedData);
      } catch (error) {
        console.error("Error parsing data from URL:", error);
      }
    }
  }, [searchParams]);

  // 홈으로 돌아가기 버튼 클릭 이벤트 처리
  const handleGoHomeClick = () => {
    trackButtonClick("generate_another_name", "from_result_page");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-muted/40">
      <Card className="w-full max-w-lg shadow-lg relative">
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
        {data && (
          <CardFooter className="flex p-6 pt-0 sm:p-8 sm:pt-0">
            <Button className="w-full text-sm md:text-base text-center" asChild>
              <Link href="/" onClick={handleGoHomeClick}>
                Generate Another Name
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}
