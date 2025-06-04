"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { NameInputForm } from "@/components/name-input-form";
import { Card, CardContent } from "@/components/ui/card";
import { createNameGenerationToken } from "../actions"; // JWT 토큰 생성 액션 추가
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { useSupabase } from "../providers";
import {
  checkPremiumCredit,
  getTotalPremiumCredits,
  applyPremiumCredit,
} from "@/lib/premium";
import { PaymentPendingDialog } from "@/components/ui/payment-pending-dialog";

// 성별 느낌 옵션 정의 수정
type GenderOption = "masculine" | "feminine" | "neutral";
// 이름 스타일 옵션 정의 추가
type NameStyleOption = "hanja" | "pureKorean";

export default function GeneratePage() {
  const router = useRouter();
  const { user, loading } = useSupabase();
  const [error, setError] = React.useState<string | null>(null);
  const [selectedGender, setSelectedGender] =
    React.useState<GenderOption>("masculine");
  const [selectedNameStyle, setSelectedNameStyle] =
    React.useState<NameStyleOption>("hanja");
  const [activeTab, setActiveTab] = React.useState<"free" | "premium">("free");
  const [inputName, setInputName] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [hasPremiumCredit, setHasPremiumCredit] = React.useState(false);
  const [premiumCredits, setPremiumCredits] = React.useState(0);
  const [isClient, setIsClient] = React.useState(false);

  // 클라이언트 사이드 렌더링 확인
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // 페이지 로드 시 페이지 조회 이벤트 추적
  React.useEffect(() => {
    if (isClient) {
      trackPageView("/generate", "Generate Page - Korean Name Generator");
    }
  }, [isClient]);

  // 로그인 상태 확인 및 리다이렉션
  React.useEffect(() => {
    if (isClient && !loading && !user) {
      // 로그인되지 않은 사용자는 로그인 페이지로 리다이렉션
      router.push("/auth");
    }
  }, [isClient, loading, user, router]);

  // 프리미엄 크레딧 상태 체크
  React.useEffect(() => {
    const checkCredit = async () => {
      if (isClient && user) {
        try {
          const credit = await checkPremiumCredit();
          setHasPremiumCredit(!!credit);

          // 총 크레딧 수 확인
          const totalCredits = await getTotalPremiumCredits();
          setPremiumCredits(totalCredits);
        } catch (error) {
          console.error("크레딧 확인 중 오류 발생:", error);
        }
      } else {
        // 사용자가 로그인하지 않은 경우 프리미엄 상태 초기화
        setHasPremiumCredit(false);
        setPremiumCredits(0);
      }
    };
    checkCredit();
  }, [isClient, user]);

  // 로그아웃 이벤트 리스너 추가
  React.useEffect(() => {
    if (!isClient) return;

    // 로그아웃 이벤트 핸들러
    const handleLogout = () => {
      // 프리미엄 상태 초기화
      setHasPremiumCredit(false);
      setPremiumCredits(0);
      // 필요시 탭 상태도 free로 변경
      setActiveTab("free");
      // 로그인 페이지로 리다이렉션
      router.push("/");
    };

    // 이벤트 리스너 등록
    window.addEventListener("user-logout", handleLogout);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("user-logout", handleLogout);
    };
  }, [isClient, router]);

  const handleTabChange = (value: string) => {
    if (!isClient) return; // 클라이언트 사이드에서만 실행

    trackButtonClick("tab_switch", value);
    setActiveTab(value as "free" | "premium");
  };

  const handleFreeNameSubmit = async (
    name: string,
    gender: GenderOption,
    nameStyle: NameStyleOption
  ) => {
    if (!isClient) return; // 클라이언트 사이드에서만 실행

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
      setIsLoading(true);

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
      console.error("Error generating name:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while generating the name."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePremiumNameSubmit = async (
    name: string,
    gender: GenderOption,
    nameStyle: NameStyleOption
  ) => {
    if (!isClient) return; // 클라이언트 사이드에서만 실행

    // Google Analytics 이벤트 추적
    trackButtonClick("generate_korean_name", `premium_${gender}_${nameStyle}`);

    try {
      setIsLoading(true);

      // 프리미엄 크레딧 확인
      const credit = await checkPremiumCredit();

      if (!credit || credit.credits_remaining <= 0) {
        setError(
          "사용 가능한 프리미엄 크레딧이 없습니다. 먼저 프리미엄 이용권을 구매해주세요."
        );
        return;
      }

      // 먼저 토큰 생성 (크레딧 차감 전)
      const { token } = await createNameGenerationToken({
        name,
        gender,
        nameStyle,
        isPremium: true,
        creditApplied: true, // 차감 예정임을 표시
      });

      // 토큰 생성 성공 후 크레딧 차감
      try {
        const result = await applyPremiumCredit(credit.id);
        console.log("크레딧 차감 결과:", result);
      } catch (creditError) {
        console.error("크레딧 차감 중 오류 발생:", creditError);
        throw creditError;
      }

      // 크레딧 정보 업데이트
      const totalCredits = await getTotalPremiumCredits();
      console.log("업데이트된 총 크레딧:", totalCredits);
      setPremiumCredits(totalCredits);

      // 토큰과 함께 리다이렉션
      router.push(`/payment-successful?token=${token}`);
    } catch (error) {
      console.error("Error handling premium name generation:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while processing your request."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseClick = () => {
    if (!isClient) return; // 클라이언트 사이드에서만 실행

    // 로그인 확인 (이미 로그인된 사용자만 이 페이지에 접근 가능)

    // URL에 사용자 정보와 식별 정보를 custom_fields로 추가
    // 브라우저 API는 클라이언트 사이드에서만 실행해야 함
    let requestId = "";
    let timestamp = 0;

    // 브라우저 API 사용은 클라이언트 사이드에서만 실행
    requestId = crypto.randomUUID(); // 요청 고유 ID 생성
    timestamp = Date.now(); // 현재 시간

    const customFields = encodeURIComponent(
      JSON.stringify({
        userId: user?.id, // 사용자 ID 추가
        email: user?.email, // 사용자 이메일 추가
        timestamp: timestamp,
        requestId: requestId,
      })
    );

    const productId = "oauri";
    // Gumroad URL 생성 및 새 창에서 열기
    const gumroadUrl = `https://gumroad.com/l/${productId}?wanted=true&custom_fields=${customFields}`;

    // 결제 대기 팝업 표시
    setShowPaymentDialog(true);

    // Gumroad 결제 페이지 열기
    window.open(gumroadUrl.toString(), "_blank");
  };

  const handlePaymentComplete = async () => {
    if (!isClient) return; // 클라이언트 사이드에서만 실행

    setShowPaymentDialog(false);
    // 결제가 완료되면 새로고침하여 프리미엄 이용권을 다시 확인
    router.refresh();
  };

  // 스켈레톤 UI 렌더링
  if (!isClient || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="h-12 w-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-6 w-64 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-40 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우 (이미 useEffect에서 리다이렉션 처리됨)
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-8 max-w-4xl mx-auto px-4">
      <div className="text-center space-y-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl w-full">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900 dark:text-white whitespace-normal">
          <span className="inline-block">Generate Your</span>{" "}
          <span className="inline-block">Korean Name</span>
        </h1>
        <p className="text-gray-700 dark:text-gray-200 max-w-[600px] mx-auto font-medium text-base md:text-lg whitespace-normal break-keep">
          Enter your name and select options to create a personalized Korean
          name that reflects your identity
        </p>
      </div>

      <Card className="w-full max-w-md shadow-xl rounded-2xl border-t-4 border-primary">
        <CardContent className="p-8 space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="premium">
                ✨ Premium
                {hasPremiumCredit &&
                  premiumCredits > 0 &&
                  ` (${premiumCredits} times)`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="free" className="pt-6">
              <NameInputForm
                onSubmit={(name) =>
                  handleFreeNameSubmit(name, selectedGender, selectedNameStyle)
                }
                isLoading={isLoading}
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
                </p>
              </div>
              {!hasPremiumCredit && (
                <Button
                  onClick={handlePurchaseClick}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  ✨ Purchase Premium Access
                </Button>
              )}
              <NameInputForm
                onSubmit={(name) =>
                  handlePremiumNameSubmit(
                    name,
                    selectedGender,
                    selectedNameStyle
                  )
                }
                isLoading={isLoading}
                selectedGender={selectedGender}
                onGenderChange={(gender) => setSelectedGender(gender)}
                selectedNameStyle={selectedNameStyle}
                onNameStyleChange={(style) => setSelectedNameStyle(style)}
                isPremium={true}
                inputName={inputName}
                onNameChange={setInputName}
                hasPremiumCredit={hasPremiumCredit}
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

      {showPaymentDialog && (
        <PaymentPendingDialog
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPaymentDialog(false)}
        />
      )}
    </div>
  );
}
