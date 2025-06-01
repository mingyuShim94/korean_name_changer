"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { Loader2, X } from "lucide-react";
import { Button } from "./button";
import { checkPremiumCredit } from "@/lib/premium";

interface PaymentPendingDialogProps {
  onPaymentComplete: () => void;
  onClose: () => void;
}

export function PaymentPendingDialog({
  onPaymentComplete,
  onClose,
}: PaymentPendingDialogProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  const handleVerifyPayment = async () => {
    setIsChecking(true);
    setError(null);

    try {
      // 현재 사용자 확인
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("사용자 인증에 실패했습니다. 다시 로그인해주세요.");
      }

      // 프리미엄 크레딧 확인
      try {
        const premiumCredit = await checkPremiumCredit();

        if (premiumCredit && premiumCredit.credits_remaining > 0) {
          // 팝업 닫고 결제 완료 처리
          onClose();
          onPaymentComplete();

          // payment-successful 페이지로 자동 이동하지 않음
          return;
        }
      } catch (creditError) {
        console.error(
          "[PaymentPendingDialog] Credit check error:",
          creditError
        );
      }

      // 최근 결제 내역 확인 (백업 확인 방법)
      const { data: recentPayments, error: paymentError } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .eq("payment_status", "completed")
        .order("created_at", { ascending: false })
        .limit(1);

      if (paymentError) {
        console.error(
          "[PaymentPendingDialog] Payment check error:",
          paymentError
        );
      }

      // 최근 결제가 있지만 크레딧이 없는 경우 (웹훅이 아직 처리되지 않은 경우)
      if (recentPayments && recentPayments.length > 0) {
        const lastPaymentTime = new Date(recentPayments[0].created_at);
        const now = new Date();
        const diffMinutes =
          (now.getTime() - lastPaymentTime.getTime()) / (1000 * 60);

        if (diffMinutes < 5) {
          // 5분 이내에 결제한 경우
          setError(
            "결제는 확인되었으나 크레딧이 아직 처리 중입니다. 잠시 후 (약 1분 이내) 다시 확인해주세요."
          );
          return;
        }
      }

      setError(
        "결제 내역이 아직 처리 중입니다. 잠시 후 (약 1분 이내) 다시 확인해주세요."
      );
    } catch (err) {
      console.error("[PaymentPendingDialog] Payment check error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "결제 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          aria-label="닫기"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
            결제 확인
          </h3>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              결제를 완료하셨나요? 아래 버튼을 클릭하여 결제 상태를
              확인해주세요.
            </p>
            {error && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md">
                <p className="text-amber-800 dark:text-amber-200 text-sm">
                  {error}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Button
                onClick={handleVerifyPayment}
                className="w-full"
                disabled={isChecking}
              >
                {isChecking ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>확인 중...</span>
                  </div>
                ) : (
                  "결제 완료 확인하기"
                )}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
                disabled={isChecking}
              >
                닫기
              </Button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              결제 처리에는 최대 1분 정도 소요될 수 있습니다.
              <br />
              잠시 후 다시 확인해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
