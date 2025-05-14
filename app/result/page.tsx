"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { NameResultDisplay } from "@/components/name-result-display";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
}

// SearchParams를 읽고 결과를 표시하는 내부 컴포넌트
function ResultContent() {
  const searchParams = useSearchParams();
  const [resultData, setResultData] = React.useState<KoreanNameData | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const dataString = searchParams.get("data");
    if (dataString) {
      try {
        const parsedData: KoreanNameData = JSON.parse(
          decodeURIComponent(dataString)
        );
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
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (resultData) {
    return (
      <NameResultDisplay
        loading={false}
        data={resultData}
        nameStyle={
          searchParams.get("nameStyle") === "pureKorean"
            ? "pureKorean"
            : "hanja"
        }
      />
    );
  }

  // 데이터는 있지만 아직 resultData가 설정되지 않았거나, dataString이 없는 초기 상태에서 error도 없는 경우
  // useEffect가 실행되기 전 또는 다른 예상치 못한 상황을 대비한 로딩 메시지 (Suspense fallback과 별개)
  // 일반적으로 Suspense fallback이 먼저 표시되지만, 만약을 위해 남겨둘 수 있습니다.
  return <p className="text-center text-muted-foreground">결과 확인 중...</p>;
}

export default function ResultPage() {
  const searchParams = useSearchParams();
  const [data, setData] = React.useState<KoreanNameData | null>(null);

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
              <Link href="/">Generate Another Name</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    </main>
  );
}
