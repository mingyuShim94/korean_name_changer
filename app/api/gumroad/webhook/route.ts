import { NextRequest } from "next/server";
import { trackPaymentCompleted } from "@/lib/analytics";
import { createClient } from "@supabase/supabase-js";
import { Database, Json } from "@/types/supabase";

// Gumroad 웹훅 데이터 타입 정의
interface GumroadWebhookData {
  seller_id: string;
  product_id: string;
  product_name: string;
  permalink: string;
  product_permalink: string;
  short_product_id: string;
  email: string;
  price: number;
  gumroad_fee: number;
  currency: string;
  quantity: number;
  discover_fee_charged: boolean;
  can_contact: boolean;
  referrer: string;
  card: {
    visual: string;
    type: string;
    bin: string;
    expiry_month: string;
    expiry_year: string;
  };
  order_number: string;
  sale_id: string;
  sale_timestamp: string;
  purchaser_id: number;
  subscription_id: string;
  test: boolean;
  ip_country: string;
  recurrence: string;
  is_gift_receiver_purchase: boolean;
  refunded: boolean;
  resource_name: string;
  disputed: boolean;
  dispute_won: boolean;
  "url_params[action]": string;
  "url_params[controller]": string;
  "url_params[custom_fields]": string;
  "url_params[format]": string;
  "url_params[id]": string;
  "variants[Tier]": string;
}

interface CustomFields {
  userId?: string;
  email?: string;
  timestamp?: number;
  requestId?: string;
  // 아래 필드들은 더 이상 전송되지 않지만 이전 버전 호환성을 위해 유지
  name?: string;
  gender?: string;
  nameStyle?: string;
}

const SELLER_ID = "XATOQA5pze16J8TX5p5S8w==";
// 프리미엄 크레딧 기본값 (구매당 제공되는 크레딧 수)
const DEFAULT_PREMIUM_CREDITS = 5;
// 프리미엄 크레딧 만료 기간 (일)
const PREMIUM_CREDITS_EXPIRY_DAYS = 365;

type FormDataValue = string | number | boolean;
type FormDataRecord = Record<string, FormDataValue>;

export async function POST(request: NextRequest) {
  try {
    console.log("\n=== Gumroad Webhook 요청 받음 ===");
    console.log("시간:", new Date().toISOString());

    // Form 데이터 파싱
    const formData = await request.formData();
    console.log("\n[원본 FormData 엔트리]");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const rawData: Record<string, FormDataValue | FormDataRecord> = {};

    // FormData를 객체로 변환
    for (const [key, value] of formData.entries()) {
      const strValue = String(value);

      // 중첩된 객체(card, purchaser) 처리
      if (key.startsWith("card[") || key.startsWith("purchaser[")) {
        const [parent, child] = key.replace("]", "").split("[");
        if (!rawData[parent]) {
          rawData[parent] = {};
        }
        const parentObj = rawData[parent] as FormDataRecord;
        parentObj[child] = strValue;
      } else {
        // boolean 값 변환
        if (strValue === "true") rawData[key] = true;
        else if (strValue === "false") rawData[key] = false;
        // number 값 변환
        else if (!isNaN(Number(strValue))) rawData[key] = Number(strValue);
        else rawData[key] = strValue;
      }
    }

    // 타입 캐스팅
    const data = rawData as unknown as GumroadWebhookData;

    console.log("\n[변환된 데이터]");
    console.log(JSON.stringify(data, null, 2));

    // seller_id 검증
    if (data.seller_id !== SELLER_ID) {
      console.error("\n[에러] 잘못된 seller_id:", data.seller_id);
      return new Response("Invalid seller ID", { status: 403 });
    }

    // 테스트 웹훅 로깅
    if (data.test) {
      console.log("\n[알림] 테스트 웹훅 감지됨 - 계속 처리합니다.");
    }

    // 환불되거나 분쟁이 있는 거래 무시
    if (data.refunded || data.disputed) {
      console.log("\n[알림] 환불 또는 분쟁 거래 감지됨");
      console.log("환불:", data.refunded);
      console.log("분쟁:", data.disputed);
      return new Response("Refunded or disputed transaction", { status: 200 });
    }

    // Supabase 클라이언트 초기화 (service_role로 초기화)
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // custom_fields 파싱
    let customFields: CustomFields = {};
    try {
      if (data["url_params[custom_fields]"]) {
        customFields = JSON.parse(
          decodeURIComponent(String(data["url_params[custom_fields]"]))
        );
        console.log("\n[파싱된 custom_fields]", customFields);
      }
    } catch (error) {
      console.error("\n[에러] custom_fields 파싱 실패:", error);
    }

    // 사용자 ID 확인 (custom_fields에서 먼저 확인, 없으면 이메일로 검색)
    let userId = customFields.userId;

    // custom_fields에 userId가 없으면 이메일로 사용자 검색
    if (!userId && data.email) {
      const { data: users, error: userError } =
        await supabase.auth.admin.listUsers();

      if (userError) {
        console.error("\n[에러] 사용자 찾기 실패:", userError);
      } else {
        const user = users.users.find((u) => u.email === data.email);
        if (user) {
          userId = user.id;
        }
      }
    }

    if (!userId) {
      console.error("\n[에러] 사용자를 찾을 수 없음");
      return new Response("User not found", { status: 400 });
    }

    // 결제 정보 저장
    const paymentData: Database["public"]["Tables"]["payments"]["Insert"] = {
      user_id: userId,
      payment_id: data.sale_id,
      order_number: data.order_number,
      product_id: data.product_id,
      product_name: data.product_name,
      amount: data.price,
      currency: data.currency,
      payment_status: "completed",
      custom_fields: customFields as Json,
      webhook_data: rawData as Json,
      request_id: customFields.requestId,
      email: data.email,
    };

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (paymentError) {
      console.error("\n[에러] 결제 정보 저장 실패:", paymentError);
      return new Response("Failed to save payment", { status: 500 });
    }

    // 만료일 계산 (현재 시간 + 365일)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + PREMIUM_CREDITS_EXPIRY_DAYS);

    // 기존 프리미엄 크레딧 확인
    const { data: existingCredit, error: creditCheckError } = await supabase
      .from("premium_credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (creditCheckError && creditCheckError.code !== "PGRST116") {
      // PGRST116는 결과가 없다는 의미이므로 무시
      console.error("\n[에러] 기존 크레딧 확인 실패:", creditCheckError);
    }

    if (existingCredit) {
      // 기존 크레딧이 있으면 업데이트
      const { error: updateError } = await supabase
        .from("premium_credits")
        .update({
          credits_remaining:
            existingCredit.credits_remaining + DEFAULT_PREMIUM_CREDITS,
          last_purchase_id: payment.id,
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCredit.id);

      if (updateError) {
        console.error("\n[에러] 프리미엄 크레딧 업데이트 실패:", updateError);
        return new Response("Failed to update premium credits", {
          status: 500,
        });
      }
    } else {
      // 기존 크레딧이 없으면 새로 생성
      const creditData: Database["public"]["Tables"]["premium_credits"]["Insert"] =
        {
          user_id: userId,
          credits_remaining: DEFAULT_PREMIUM_CREDITS,
          credits_used: 0,
          last_purchase_id: payment.id,
          expires_at: expiresAt.toISOString(),
        };

      const { error: creditError } = await supabase
        .from("premium_credits")
        .insert(creditData);

      if (creditError) {
        console.error("\n[에러] 프리미엄 크레딧 생성 실패:", creditError);
        return new Response("Failed to create premium credits", {
          status: 500,
        });
      }
    }

    // 결제 완료 이벤트 추적
    await trackPaymentCompleted(
      data.price,
      data.currency,
      data.product_id,
      data.sale_id
    );

    console.log("\n[성공] 결제 처리 완료");
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("\n[에러] 웹훅 처리 중 오류 발생:", error);
    return new Response(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}
