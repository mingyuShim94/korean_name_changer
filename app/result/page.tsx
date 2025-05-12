"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { NameResultDisplay } from "@/components/name-result-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function ResultPage() {
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-muted/40">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl sm:text-4xl font-bold">
            Your Korean Name Result
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
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
          )}
          {resultData && !error && (
            <NameResultDisplay loading={false} data={resultData} />
          )}
          {!resultData && !error && (
            // 데이터 로딩 중이거나, 아직 searchParams 처리가 완료되지 않은 경우 (useEffect 실행 전)
            // 또는 dataString이 초기에 null일 때 명시적인 메시지를 보여주고 싶다면 여기에 추가
            // 일반적으로는 useEffect가 실행되면서 error 또는 resultData가 설정됨
            <p className="text-center text-muted-foreground">
              결과를 불러오는 중...
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
