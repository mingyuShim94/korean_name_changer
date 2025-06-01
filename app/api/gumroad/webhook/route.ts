import { NextRequest } from "next/server";
import { trackPaymentCompleted } from "@/lib/analytics";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
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
  order_number: number;
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
  name: string;
  gender: string;
  nameStyle: string;
  userId?: string; // 로그인한 사용자 ID
}

const SELLER_ID = "XATOQA5pze16J8TX5p5S8w==";

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

    // custom_fields 파싱 (url_params에서 가져오기)
    let customFields: CustomFields | null = null;
    try {
      const customFieldsStr = data["url_params[custom_fields]"];
      customFields = JSON.parse(customFieldsStr) as CustomFields;
      console.log("\n[Custom Fields]");
      console.log(JSON.stringify(customFields, null, 2));
    } catch (error) {
      console.error("\n[에러] Custom fields 파싱 실패:", error);
    }

    // Supabase 클라이언트 초기화 (service_role로 초기화)
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>(
      {
        cookies: () => cookieStore,
      },
      {
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      }
    );

    // 사용자 찾기 (custom_fields의 userId 우선, 없으면 이메일로 검색)
    let userId = customFields?.userId;
    if (!userId && data.email) {
      // 이메일로 사용자 검색
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
      product_id: data.product_id,
      sale_id: data.sale_id,
      amount: data.price,
      currency_code: data.currency,
      status: "completed",
      payment_data: JSON.parse(JSON.stringify(data)) as Json,
      custom_fields: customFields
        ? (JSON.parse(JSON.stringify(customFields)) as Json)
        : null,
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

    // 프리미엄 이용권 생성
    const creditData: Database["public"]["Tables"]["premium_credits"]["Insert"] =
      {
        user_id: userId,
        payment_id: payment.id,
      };

    const { error: creditError } = await supabase
      .from("premium_credits")
      .insert(creditData);

    if (creditError) {
      console.error("\n[에러] 프리미엄 이용권 생성 실패:", creditError);
      return new Response("Failed to create premium credit", { status: 500 });
    }

    // 결제 완료 이벤트 추적
    await trackPaymentCompleted(
      data.price,
      data.currency,
      data.product_id,
      data.sale_id
    );

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("\n[에러] 웹훅 처리 중 오류 발생:", error);
    return new Response(
      error instanceof Error ? error.message : "Internal server error",
      { status: 500 }
    );
  }
}
