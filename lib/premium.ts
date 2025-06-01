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

  // premium_credits 테이블에서 사용 가능한 크레딧 확인
  const { data: credits, error: creditError } = await supabase
    .from("premium_credits")
    .select("*")
    .eq("user_id", user.id)
    .gt("credits_remaining", 0)
    .gte("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true })
    .limit(1);

  if (creditError) {
    console.error("크레딧 확인 중 오류 발생:", creditError);
    throw creditError;
  }

  // 사용 가능한 크레딧이 없는 경우
  if (!credits || credits.length === 0) {
    return null;
  }

  return credits[0];
}

/**
 * 프리미엄 이용권 사용 처리
 */
export async function applyPremiumCredit(creditId: string) {
  const supabase = createClientComponentClient<Database>();

  // 트랜잭션이 필요하지만 클라이언트 측에서는 불가능하므로 순차적으로 처리

  // 1. 현재 크레딧 정보 조회
  const { data: credit, error: fetchError } = await supabase
    .from("premium_credits")
    .select("*")
    .eq("id", creditId)
    .single();

  if (fetchError) {
    console.error("크레딧 정보 조회 중 오류 발생:", fetchError);
    throw fetchError;
  }

  if (credit.credits_remaining <= 0) {
    throw new Error("사용 가능한 크레딧이 없습니다.");
  }

  // 2. 크레딧 사용 처리
  const { error: updateError } = await supabase
    .from("premium_credits")
    .update({
      credits_remaining: credit.credits_remaining - 1,
      credits_used: credit.credits_used + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", creditId);

  if (updateError) {
    console.error("크레딧 사용 처리 중 오류 발생:", updateError);
    throw updateError;
  }

  return true;
}

/**
 * 사용자의 프리미엄 크레딧 총 개수 확인
 */
export async function getTotalPremiumCredits() {
  const supabase = createClientComponentClient<Database>();

  // 현재 로그인한 사용자 확인
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  // 모든 유효한 크레딧의 합계 계산
  const { data, error } = await supabase
    .from("premium_credits")
    .select("credits_remaining")
    .eq("user_id", user.id)
    .gte("expires_at", new Date().toISOString());

  if (error) {
    console.error("크레딧 합계 계산 중 오류 발생:", error);
    throw error;
  }

  // 크레딧 합계 계산
  const totalCredits = data.reduce(
    (sum, credit) => sum + credit.credits_remaining,
    0
  );

  return totalCredits;
}
