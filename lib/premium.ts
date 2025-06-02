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
  // console.log("applyPremiumCredit 함수 호출됨, creditId:", creditId);
  const supabase = createClientComponentClient<Database>();

  // 현재 로그인한 사용자 확인 - RLS 정책 적용을 위해 필요
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("사용자 인증 실패:", userError);
    throw new Error("로그인이 필요합니다.");
  }

  // console.log("인증된 사용자:", user.id);

  // 트랜잭션이 필요하지만 클라이언트 측에서는 불가능하므로 순차적으로 처리

  // 1. 현재 크레딧 정보 조회
  console.log("크레딧 정보 조회 시작");
  const { data: credit, error: fetchError } = await supabase
    .from("premium_credits")
    .select("*")
    .eq("id", creditId)
    .eq("user_id", user.id) // 사용자 ID 조건 추가
    .single();

  if (fetchError) {
    console.error("크레딧 정보 조회 중 오류 발생:", fetchError);
    throw fetchError;
  }

  // console.log("조회된 크레딧 정보:", credit);
  if (credit.credits_remaining <= 0) {
    throw new Error("사용 가능한 크레딧이 없습니다.");
  }

  // 2. 크레딧 사용 처리
  console.log("크레딧 차감 쿼리 실행 시작");

  // 새로운 값 계산
  const newCreditsRemaining = credit.credits_remaining - 1;
  const newCreditsUsed = credit.credits_used + 1;
  const now = new Date().toISOString();

  // console.log("업데이트할 값:", {
  //   credits_remaining: newCreditsRemaining,
  //   credits_used: newCreditsUsed,
  //   updated_at: now,
  // });

  const { error: updateError } = await supabase
    .from("premium_credits")
    .update({
      credits_remaining: newCreditsRemaining,
      credits_used: newCreditsUsed,
      updated_at: now,
    })
    .eq("id", creditId)
    .eq("user_id", user.id) // 사용자 ID 조건 추가
    .select();

  if (updateError) {
    console.error("크레딧 사용 처리 중 오류 발생:", updateError);
    throw updateError;
  }

  // console.log("크레딧 차감 완료, 업데이트된 데이터:", updateData);
  return true;
}

/**
 * 사용자의 프리미엄 크레딧 총 개수 확인
 */
export async function getTotalPremiumCredits() {
  // console.log("getTotalPremiumCredits 함수 호출됨");
  const supabase = createClientComponentClient<Database>();

  // 현재 로그인한 사용자 확인
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  // console.log("사용자 확인됨:", user.id);

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

  // console.log("조회된 크레딧 데이터:", data);

  // 크레딧 합계 계산
  const totalCredits = data.reduce(
    (sum, credit) => sum + credit.credits_remaining,
    0
  );

  console.log("계산된 총 크레딧:", totalCredits);
  return totalCredits;
}
