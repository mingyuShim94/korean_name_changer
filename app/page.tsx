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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
// import { initializePaddle } from "@paddle/paddle-js"; // Paddle 잠시 비활성화

// window에 커스텀 속성 타입 선언
declare global {
  interface Window {
    __paddleInitialized?: boolean;
  }
}

// 성별 느낌 옵션 정의 수정
type GenderOption = "masculine" | "feminine" | "neutral";
// 이름 스타일 옵션 정의 추가
type NameStyleOption = "hanja" | "pureKorean";

// PremiumRequestData 인터페이스가 비었으므로 제거 또는 주석 처리
// interface PremiumRequestData {
//   preferredSyllables?: string;
// }

export default function Home() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [selectedGender, setSelectedGender] =
    React.useState<GenderOption>("masculine");
  const [selectedNameStyle, setSelectedNameStyle] =
    React.useState<NameStyleOption>("hanja");
  const [activeTab, setActiveTab] = React.useState<"free" | "premium">("free");
  const [inputName, setInputName] = React.useState<string>("");

  // 페이지 로드 시 페이지 조회 이벤트 추적
  React.useEffect(() => {
    trackPageView("/", "Home Page - Korean Name Generator");
  }, []);

  const handleFreeNameSubmit = (
    name: string,
    gender: GenderOption,
    nameStyle: NameStyleOption
  ) => {
    // Google Analytics 이벤트 추적
    trackButtonClick("generate_korean_name", `free_${gender}_${nameStyle}`);

    setError(null);
    startTransition(async () => {
      console.log(
        "Submitting FREE with Server Action: Name:",
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
        isPremium: false,
      });

      if (result.error) {
        setError(result.error);
        console.error("Server Action Error (Free):", result.error);
      } else if (result.data) {
        router.push(
          `/result?data=${encodeURIComponent(
            JSON.stringify(result.data)
          )}&nameStyle=${nameStyle}&type=free&gender=${gender}`
        );
      } else {
        setError("An unexpected issue occurred. No data or error returned.");
      }
    });
  };

  const handlePremiumNameSubmit = (
    name: string,
    gender: GenderOption,
    nameStyle: NameStyleOption
  ) => {
    // Google Analytics 이벤트 추적
    trackButtonClick("generate_korean_name", `premium_${gender}_${nameStyle}`);

    setError(null);
    startTransition(async () => {
      // Paddle.js 초기화 부분 주석 처리 (결제 비활성화)
      /* 
      if (typeof window !== "undefined" && !window.__paddleInitialized) {
        try {
          const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || "";
          if (!token) {
            setError("Paddle 클라이언트 토큰이 설정되지 않았습니다.");
            return;
          }
          await initializePaddle({ token });
          window.__paddleInitialized = true;
          console.log("Paddle.js 초기화 완료");
        } catch (e) {
          setError("Paddle.js 초기화 중 오류 발생: " + (e as Error).message);
          return;
        }
      }
      */

      console.log(
        "Submitting PREMIUM: Name:",
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
        isPremium: true,
      });

      if (result.error) {
        setError(result.error);
        console.error("Server Action Error (Premium):", result.error);
      } else if (result.data) {
        router.push(
          `/result?data=${encodeURIComponent(
            JSON.stringify(result.data)
          )}&nameStyle=${nameStyle}&type=premium&gender=${gender}`
        );
      } else {
        setError(
          "An unexpected issue occurred (Premium). No data or error returned."
        );
      }
    });
  };

  // Tab 전환 시 이벤트 추적
  const handleTabChange = (value: string) => {
    trackButtonClick("tab_switch", value);
    setActiveTab(value as "free" | "premium");
  };

  if (isPending) {
    return (
      <FullScreenLoader message="AI is creating a Korean name. Please wait a moment..." />
    );
  }

  return (
    <main className="flex min-h-fit sm:min-h-screen flex-col items-center justify-center bg-transparent">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl sm:text-4xl font-bold">
            Convert Your Name to a Korean Name!
          </CardTitle>
          <CardDescription className="text-lg sm:text-xl text-muted-foreground pt-2">
            Enter a name in any language and discover a beautiful Korean name.
            Choose the nuance and style.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="premium">
                ✨ Premium(Free during beta test)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="free" className="pt-6">
              <NameInputForm
                onSubmit={(name) =>
                  handleFreeNameSubmit(name, selectedGender, selectedNameStyle)
                }
                isLoading={isPending}
                selectedGender={selectedGender}
                onGenderChange={(gender) => setSelectedGender(gender)}
                selectedNameStyle={selectedNameStyle}
                onNameStyleChange={(style) => setSelectedNameStyle(style)}
                isPremium={false}
                inputName={inputName}
                onNameChange={setInputName}
              />
            </TabsContent>
            <TabsContent value="premium" className="pt-6 space-y-4">
              <div className="p-4 border rounded-md bg-gradient-to-r from-yellow-100 via-amber-50 to-yellow-100 dark:from-yellow-800/30 dark:via-amber-900/20 dark:to-yellow-800/30">
                <h4 className="font-semibold text-lg mb-2 text-amber-700 dark:text-amber-400">
                  🌟 The Special Features of Premium Name Generation!
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  The premium service offers a more diverse and in-depth
                  interpretation of the generated names. Discover the cultural
                  meanings, pronunciation characteristics, and deep meanings of
                  the hanja contained in the names.
                  <br />
                  🎉 During the beta test, this premium service is available for
                  free!
                </p>
              </div>
              <NameInputForm
                onSubmit={(name) =>
                  handlePremiumNameSubmit(
                    name,
                    selectedGender,
                    selectedNameStyle
                  )
                }
                isLoading={isPending}
                selectedGender={selectedGender}
                onGenderChange={(gender) => setSelectedGender(gender)}
                selectedNameStyle={selectedNameStyle}
                onNameStyleChange={(style) => setSelectedNameStyle(style)}
                isPremium={true}
                inputName={inputName}
                onNameChange={setInputName}
              />
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/50 rounded-md p-4 text-sm">
              <h3 className="font-semibold mb-1">오류 발생:</h3>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
