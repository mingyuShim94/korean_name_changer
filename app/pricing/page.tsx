"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { trackButtonClick, trackPageView } from "@/lib/analytics";
import { useSupabase } from "../providers";
import { PaymentPendingDialog } from "@/components/ui/payment-pending-dialog";

export default function PricingPage() {
  const router = useRouter();
  const { user } = useSupabase();
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  // 클라이언트 사이드 렌더링 확인
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Track page view on component mount
  React.useEffect(() => {
    if (isClient) {
      trackPageView("/pricing", "Pricing Page");
    }
  }, [isClient]);

  const handleButtonClick = (tier: string) => {
    if (!isClient) return;

    trackButtonClick(`select_${tier}_tier`, "from_pricing_page");

    if (tier === "free") {
      router.push("/");
    } else if (tier === "premium") {
      // 로그인 확인
      if (!user) {
        // 로그인되지 않은 사용자는 로그인 페이지로 리다이렉션
        router.push("/auth");
        return;
      }
      // 로그인된 사용자는 결제 진행
      handlePurchaseClick();
    }
  };

  const handlePurchaseClick = () => {
    if (!isClient || !user) return;

    // 결제 분석 이벤트 추적
    trackButtonClick("purchase_premium", "from_pricing_page");

    // URL에 사용자 정보와 식별 정보를 custom_fields로 추가
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
    if (!isClient) return;

    setShowPaymentDialog(false);
    // 결제가 완료되면 generate 페이지로 이동
    router.push("/generate");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24 bg-muted/40">
      <div className="max-w-5xl w-full mx-auto space-y-12">
        {/* 헤더 섹션 */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your perfect Korean name with our thoughtfully designed
            plans
          </p>
        </div>

        {/* 기능 비교표 */}
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-6 text-center">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">
                    Free ($0)
                  </th>
                  <th className="text-center py-3 px-4 font-medium">
                    Premium ($1.90)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3 px-4">Korean Name Generation</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Syllable Analysis</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Hanja Characters & Keywords</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Integrated Name Meaning</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Romanization Guide</td>
                  <td className="text-center py-3 px-4">✅</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Original Name Analysis</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Name Components Breakdown</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Symbolic Associations</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Life Values Interpretation</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Cultural Impression Analysis</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Audio Pronunciation</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Enhanced Shareable Content</td>
                  <td className="text-center py-3 px-4">❌</td>
                  <td className="text-center py-3 px-4">✅</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Credits Included</td>
                  <td className="text-center py-3 px-4">free</td>
                  <td className="text-center py-3 px-4">5 times</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">
            Ready to Begin Your Korean Name Journey?
          </h2>
          <div className="flex justify-center gap-4">
            <Button onClick={() => handleButtonClick("free")} variant="outline">
              Try Free Tier
            </Button>
            <Button onClick={() => handleButtonClick("premium")}>
              Get Premium ($1.90 for 5 Credits)
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Start with free tier and upgrade to premium anytime
          </p>
        </div>
      </div>

      {/* 결제 대기 팝업 */}
      {showPaymentDialog && (
        <PaymentPendingDialog
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPaymentDialog(false)}
        />
      )}
    </main>
  );
}
