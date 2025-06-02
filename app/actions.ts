"use server";

import { SignJWT } from "jose";
import { GenderOption, NameStyleOption } from "./lib/premiumSystemPrompts";
import { nanoid } from "nanoid";

// JWT 토큰 생성 함수
export async function createNameGenerationToken({
  name,
  gender,
  nameStyle,
  isPremium,
  creditApplied = false,
}: {
  name: string;
  gender: GenderOption;
  nameStyle: NameStyleOption;
  isPremium: boolean;
  creditApplied?: boolean;
}) {
  // JWT 비밀 키 확인
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set in environment variables.");
  }

  // 요청 고유 ID 생성
  const requestId = nanoid();

  // JWT 토큰 생성
  const token = await new SignJWT({
    name,
    gender,
    nameStyle,
    isPremium,
    requestId,
    creditApplied,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m") // 15분 유효 기간
    .sign(new TextEncoder().encode(jwtSecret));

  return { token };
}
