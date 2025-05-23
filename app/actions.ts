"use server";

import { SignJWT } from "jose";
import { GenderOption, NameStyleOption } from "./lib/krNameSystemPrompts";

// 이름 생성 요청 매개변수 인터페이스
interface NameGenerationParams {
  name: string;
  gender: GenderOption;
  nameStyle: NameStyleOption;
  isPremium: boolean;
}

/**
 * 간단한 고유 ID 생성 함수
 * 실제 UUID는 아니지만 충분히 고유한 값을 생성합니다
 */
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * 이름 생성을 위한 JWT 토큰을 생성하는 서버 액션
 *
 * @param params 이름 생성에 필요한 매개변수
 * @returns JWT 토큰
 */
export async function createNameGenerationToken(
  params: NameGenerationParams
): Promise<{ token: string }> {
  console.log("JWT 토큰 생성 요청:", params);

  try {
    // JWT 비밀키 확인
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
    }

    // 고유 요청 ID 생성
    const requestId = generateUniqueId();

    // JWT 토큰 생성 (5분 유효)
    const token = await new SignJWT({
      ...params,
      requestId,
      createdAt: Date.now(),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("5m") // 5분 유효
      .sign(new TextEncoder().encode(jwtSecret));

    console.log("JWT 토큰 생성 완료:", { requestId });

    return { token };
  } catch (error) {
    console.error("JWT 토큰 생성 중 오류:", error);
    throw new Error("인증 토큰 생성에 실패했습니다.");
  }
}
