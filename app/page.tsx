"use client";

import * as React from "react";
import { NameInputForm } from "@/components/name-input-form";
import { NameResultDisplay } from "@/components/name-result-display";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// KoreanNameData 인터페이스 (API Route와 동일한 구조 유지)
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

export default function Home() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [resultData, setResultData] = React.useState<KoreanNameData | null>(
    null
  );
  const [error, setError] = React.useState<string | null>(null);

  const handleNameSubmit = async (name: string) => {
    setIsLoading(true);
    setResultData(null);
    setError(null);

    try {
      const response = await fetch("/api/generate-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        // 서버에서 오류 응답을 보냈을 경우 (e.g., 4xx, 5xx)
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API request failed with status ${response.status}`
        );
      }

      const data: KoreanNameData = await response.json();
      setResultData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during name conversion.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-muted/40">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl sm:text-4xl font-bold">
            Convert Your Name to a Korean Name!
          </CardTitle>
          <CardDescription className="text-lg sm:text-xl text-muted-foreground pt-2">
            Enter a your name and discover a beautiful Korean name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NameInputForm onSubmit={handleNameSubmit} isLoading={isLoading} />

          {error && (
            <div className="mt-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 rounded-md p-4 text-sm">
              <h3 className="font-semibold mb-1">Error occurred:</h3>
              <p>{error}</p>
            </div>
          )}

          <NameResultDisplay loading={isLoading} data={resultData} />
        </CardContent>
      </Card>
    </main>
  );
}
