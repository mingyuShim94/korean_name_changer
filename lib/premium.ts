import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

/**
 * 사용 가능한 프리미엄 이용권이 있는지 확인
 */
export async function checkPremiumCredit() {
  const supabase = createClientComponentClient<Database>();

  // 현재 로그인한 사용자 확인
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  // available_premium_credits 뷰를 사용하여 사용 가능한 크레딧 확인
  const { data: credit, error: creditError } = await supabase
    .from("premium_credits")
    .select("id, user_id, payment_id, used_at, created_at")
    .eq("user_id", user.id)
    .is("used_at", null)
    .single();

  if (creditError) {
    if (creditError.code === "PGRST116") {
      // 사용 가능한 이용권이 없음
      return null;
    }
    throw creditError;
  }

  return credit;
}

/**
 * 프리미엄 이용권 사용 처리
 */
export async function usePremiumCredit(creditId: string) {
  const supabase = createClientComponentClient<Database>();

  const { error } = await supabase
    .from("premium_credits")
    .update({ used_at: new Date().toISOString() })
    .eq("id", creditId);

  if (error) {
    throw error;
  }
}
