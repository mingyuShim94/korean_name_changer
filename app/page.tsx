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

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  // selectedGender 초기값 변경
  const [selectedGender, setSelectedGender] =
    React.useState<GenderOption>("masculine");

  const handleNameSubmit = (name: string, gender: GenderOption) => {
    setError(null);
    startTransition(async () => {
      console.log(
        "Submitting with Server Action: Name:",
        name,
        "Gender:",
        gender
      );
      const result = await generateKoreanNameAction({ name, gender });

      if (result.error) {
        setError(result.error);
        console.error("Server Action Error:", result.error);
      } else if (result.data) {
        router.push(
          `/result?data=${encodeURIComponent(JSON.stringify(result.data))}`
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
      <div className="w-full max-w-2xl mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-500/50 rounded-md text-yellow-700 dark:text-yellow-200">
        <p className="text-sm">
          The domain{" "}
          <code className="font-semibold">https://mykoreanname.me/</code> is
          currently undergoing bug fixes. Please use{" "}
          <a
            href="https://korean-name-changer.pages.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline hover:text-yellow-800 dark:hover:text-yellow-100"
          >
            https://korean-name-changer.pages.dev/
          </a>{" "}
          for testing.
        </p>
      </div>
      <div className="w-full max-w-2xl mb-6 p-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-400 dark:border-orange-500/50 rounded-md text-orange-700 dark:text-orange-200">
        <p className="text-sm">
          Additionally, I&apos;m currently unable to reply to messages on Reddit
          as my account has been temporarily banned for 3 days. This is due to
          sending too many links to the Korean name changing site, which was
          flagged as spam. I apologize for any inconvenience and appreciate your
          understanding.
        </p>
      </div>
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl sm:text-4xl font-bold">
            Convert Your Name to a Korean Name!
          </CardTitle>
          <CardDescription className="text-lg sm:text-xl text-muted-foreground pt-2">
            Enter a name in any language (e.g., English, Japanese, Arabic) and
            discover a beautiful Korean name. Choose the nuance for your Korean
            name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NameInputForm
            onSubmit={(name) => handleNameSubmit(name, selectedGender)}
            isLoading={isPending}
            selectedGender={selectedGender}
            onGenderChange={(newGender: GenderOption) =>
              setSelectedGender(newGender)
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
