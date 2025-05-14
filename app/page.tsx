"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NameInputForm } from "@/components/name-input-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FullScreenLoader } from "@/components/ui/fullscreen-loader";
import { generateKoreanNameAction } from "./actions";

// 성별 느낌 옵션 정의 수정
type GenderOption = "masculine" | "feminine";
// 이름 스타일 옵션 정의 추가
type NameStyleOption = "hanja" | "pureKorean";

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [selectedGender, setSelectedGender] =
    React.useState<GenderOption>("masculine");
  // 이름 스타일 상태 추가 (기본값은 한자 이름)
  const [selectedNameStyle, setSelectedNameStyle] =
    React.useState<NameStyleOption>("hanja");

  const handleNameSubmit = (
    name: string,
    gender: GenderOption,
    nameStyle: NameStyleOption
  ) => {
    setError(null);
    startTransition(async () => {
      console.log(
        "Submitting with Server Action: Name:",
        name,
        "Gender:",
        gender,
        "Style:",
        nameStyle
      );
      const result = await generateKoreanNameAction({
        name,
        gender,
        nameStyle,
      });

      if (result.error) {
        setError(result.error);
        console.error("Server Action Error:", result.error);
      } else if (result.data) {
        router.push(
          `/result?data=${encodeURIComponent(
            JSON.stringify(result.data)
          )}&nameStyle=${nameStyle}`
        );
      } else {
        // 예상치 못한 경우 (데이터도 없고 에러도 없는 경우)
        setError("An unexpected issue occurred. No data or error returned.");
      }
    });
  };

  if (isPending) {
    return (
      <FullScreenLoader message="AI is creating a Korean name. Please wait a moment..." />
    );
  }

  return (
    <main className="flex min-h-fit sm:min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-muted/40">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl sm:text-4xl font-bold">
            Convert Your Name to a Korean Name!
          </CardTitle>
          <CardDescription className="text-lg sm:text-xl text-muted-foreground pt-2">
            Enter a name in any language (e.g., English, Japanese, Arabic) and
            discover a beautiful Korean name. Choose the nuance and style for
            your Korean name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NameInputForm
            onSubmit={(name) =>
              handleNameSubmit(name, selectedGender, selectedNameStyle)
            }
            isLoading={isPending}
            selectedGender={selectedGender}
            onGenderChange={(newGender: GenderOption) =>
              setSelectedGender(newGender)
            }
            selectedNameStyle={selectedNameStyle}
            onNameStyleChange={(newStyle: NameStyleOption) =>
              setSelectedNameStyle(newStyle)
            }
          />

          {error && (
            <div className="mt-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 rounded-md p-4 text-sm">
              <h3 className="font-semibold mb-1">Error occurred:</h3>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
