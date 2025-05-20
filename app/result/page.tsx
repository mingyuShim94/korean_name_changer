"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ImprovedResultDisplay } from "@/components/improved-result-display";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import { GenderOption, NameStyleOption } from "@/app/lib/krNameSystemPrompts";

// 새로운 인터페이스 정의 - 무료 버전
interface FreeKoreanNameData {
  original_name: string;
  original_name_analysis: {
    summary: string;
  };
  korean_name_suggestion: {
    full_name: string;
    syllables: {
      syllable: string;
      hanja: string;
      meaning: string;
    }[];
    rationale: string;
  };
}

// 새로운 인터페이스 정의 - 프리미엄 버전
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
      hanja: string;
      meaning: string;
    }[];
    rationale: string;
    life_values: string;
  };
  social_share_content: {
    formatted: string;
    summary: string;
  };
}

// 결과 데이터 유니온 타입
type ResultData = FreeKoreanNameData | PremiumKoreanNameData;

// SearchParams를 읽고 결과를 표시하는 내부 컴포넌트
function ResultContent() {
  const searchParams = useSearchParams();
  const [resultData, setResultData] = React.useState<ResultData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isPremium, setIsPremium] = React.useState<boolean>(false);
  const [nameStyle, setNameStyle] = React.useState<NameStyleOption>("hanja");
  const [gender, setGender] = React.useState<GenderOption>("neutral");

  React.useEffect(() => {
    const dataString = searchParams.get("data");

    // 검색 파라미터에서 필요한 값들 추출
    const type = searchParams.get("type") || "free";
    const style = searchParams.get("nameStyle") || "hanja";
    const genderParam = searchParams.get("gender") || "neutral";

    setIsPremium(type === "premium");
    setNameStyle(style as NameStyleOption);
    setGender(genderParam as GenderOption);

    if (dataString) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataString));

        // 파싱된 데이터가 올바른 형식인지 검증
        if (parsedData && parsedData.original_name) {
          // premium 데이터인지 확인
          const isPremiumResult =
            type === "premium" ||
            ("social_share_content" in parsedData &&
              parsedData.korean_name_suggestion?.life_values);

          setIsPremium(isPremiumResult);
          setResultData(parsedData);
        } else {
          throw new Error("Data format is invalid");
        }
      } catch (e) {
        console.error("Failed to parse result data:", e);
        setError(
          "결과 데이터를 불러오는 데 실패했습니다. 형식이 올바르지 않을 수 있습니다."
        );
      }
    } else {
      // 데이터가 없는 경우, 예를 들어 직접 /result로 접근한 경우
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
        <CardFooter className="flex p-6 pt-0 sm:p-8 sm:pt-0">
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
        </CardFooter>
      )}
    </>
  );
}

export default function ResultPage() {
  const searchParams = useSearchParams();

  // 페이지 로드 시 이벤트 추적
  React.useEffect(() => {
    const type = searchParams.get("type") || "free";
    const nameStyle = searchParams.get("nameStyle") || "hanja";
    const gender = searchParams.get("gender") || "neutral";

    // 결과 페이지 조회 이벤트 추적
    trackPageView(
      "/result",
      `Result Page - ${
        type === "premium" ? "Premium" : "Free"
      } ${nameStyle} Name (${gender})`
    );
  }, [searchParams]);

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
      </Card>
    </main>
  );
}
