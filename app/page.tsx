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
// import { FullScreenLoader } from "@/components/ui/fullscreen-loader"; // 더 이상 사용하지 않음
// import { generateKoreanNameAction } from "./actions"; // 더 이상 사용하지 않음
import { createNameGenerationToken } from "./actions"; // JWT 토큰 생성 액션 추가
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackButtonClick, trackPageView } from "@/lib/analytics";

// import { initializePaddle } from "@paddle/paddle-js";

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
  // const [isPending, startTransition] = React.useTransition(); // 더 이상 사용하지 않음
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

  const handleFreeNameSubmit = async (
    name: string,
    gender: GenderOption,
    nameStyle: NameStyleOption
  ) => {
    // Google Analytics 이벤트 추적
    trackButtonClick("generate_korean_name", `free_${gender}_${nameStyle}`);

    setError(null);
    console.log(
      "Submitting FREE: Name:",
      name,
      "Gender:",
      gender,
      "Style:",
      nameStyle
    );

    try {
      // JWT 토큰 생성
      const { token } = await createNameGenerationToken({
        name,
        gender,
        nameStyle,
        isPremium: false,
      });

      // 토큰과 함께 리다이렉션
      router.push(`/payment-successful?token=${token}`);
    } catch (error) {
      console.error("Token generation error:", error);
      setError(
        "An error occurred while preparing the name generation request."
      );
    }

    /* 기존 직접 처리 코드는 payment-successful 페이지로 이동
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
    */
  };

  //test card number: 4242424242424242
  //test card cvv: 100
  //test card expiration date: 12/2025

  // const initializePaddlePayment = async (token: string) => {
  //   const paddleToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  //   if (paddleToken) {
  //     initializePaddle({
  //       environment: "production",
  //       token: paddleToken,
  //       debug: false,
  //     }).then((instance) => {
  //       if (instance) {
  //         instance.Checkout.open({
  //           items: [
  //             {
  //               priceId: "pri_01jvyxzq6j0spngbb4f26t5ava",
  //               quantity: 1,
  //             },
  //           ],
  //           settings: {
  //             successUrl: `${
  //               window.location.origin
  //             }/payment-successful?token=${encodeURIComponent(token)}`,
  //           },
  //         });
  //       } else {
  //         console.warn("instance is not initialized", instance);
  //       }
  //     });
  //   } else {
  //     console.error("Paddle client token is not defined");
  //     setError(
  //       "Failed to initialize payment system. Please contact administrator."
  //     );
  //   }
  // };

  const handlePremiumNameSubmit = async (
    name: string,
    gender: GenderOption,
    nameStyle: NameStyleOption
  ) => {
    // Google Analytics 이벤트 추적
    trackButtonClick("generate_korean_name", `premium_${gender}_${nameStyle}`);

    setError(null);
    console.log(
      "Submitting PREMIUM: Name:",
      name,
      "Gender:",
      gender,
      "Style:",
      nameStyle
    );

    try {
      // JWT 토큰 생성
      const { token } = await createNameGenerationToken({
        name,
        gender,
        nameStyle,
        isPremium: true,
      });

      // 결제 기능 비활성화하고 바로 payment-successful 페이지로 이동
      router.push(`/payment-successful?token=${token}`);

      // Paddle 결제 시스템 초기화 코드 임시 비활성화
      // initializePaddlePayment(token);
    } catch (error) {
      console.error("Token generation error:", error);
      setError(
        "An error occurred while preparing the name generation request."
      );
    }

    // 결과 페이지로 리다이렉트하는 코드는 주석 처리
    /*
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
    */
  };

  // Tab 전환 시 이벤트 추적
  const handleTabChange = (value: string) => {
    trackButtonClick("tab_switch", value);
    setActiveTab(value as "free" | "premium");
  };

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
                isLoading={false}
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
                isLoading={false}
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
              <h3 className="font-semibold mb-1">Error:</h3>
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
