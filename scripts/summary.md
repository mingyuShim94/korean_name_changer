# NameToKorean - AI 기반 한국어 이름 생성 서비스

## 🎯 서비스 개요

**NameToKorean**은 외국 이름을 의미 있는 한국어 이름으로 변환해주는 AI 기반 웹 서비스입니다. 단순한 발음 변환이 아닌, 원래 이름의 어원, 상징성, 감성을 분석하여 한국의 문화적 감성과 전통을 담은 아름다운 한국어 이름을 생성합니다.

### 핵심 가치

- **의미 있는 연결**: 원래 이름과 의미적으로 연결된 한국어 이름 제공
- **시적 감성**: 단순 번역을 넘어선 시적이고 감성적인 해석
- **문화적 이해**: 한국 성씨와 이름의 문화적 배경과 의미 전달
- **다양한 옵션**: 성별 뉘앙스와 이름 스타일 선택 가능

## 🛠️ 현재 구현된 기능

### 1. 메인 랜딩 페이지 (`app/page.tsx`)

- **히어로 섹션**: "What's Your Korean Name? Find Out Instantly! 🇰🇷"
- **실시간 예시**: Harry Porter → 박도현 (Park Do-Hyun) 변환 사례
- **음성 재생**: 한국어 이름 발음 듣기 기능
- **CTA 버튼**: 무료 한국어 이름 생성으로 유도

### 2. 사용자 인증 시스템

- **Supabase 기반 인증**: JWT 토큰을 통한 보안 인증
- **OAuth 콜백**: 소셜 로그인 지원 구조
- **세션 관리**: 안전한 사용자 세션 유지

### 3. 이름 입력 폼 (`components/name-input-form.tsx`)

- **이름 입력**: 다국어 이름 입력 지원 (영어, 일본어, 아랍어 등)
- **성별 뉘앙스 선택**:
  - Masculine (남성적)
  - Feminine (여성적)
  - Neutral (중성적)
- **이름 스타일 선택**:
  - Hanja-based (한자 기반)
  - Pure Korean (순우리말)
- **반응형 디자인**: 모바일/데스크톱 최적화

### 4. AI 이름 생성 API (`app/api/generate-name/route.ts`)

- **Google Gemini API 통합**:
  - Free 모드: 기본 한국어 이름 생성
  - Premium 모드: 상세한 분석과 해석
- **Edge Runtime**: Cloudflare Pages 최적화
- **JWT 인증**: 보안 토큰 검증
- **중복 요청 방지**: 캐시 기반 중복 처리 방지
- **CORS 설정**: 다양한 도메인 지원

### 5. 결과 표시 컴포넌트들

- **기본 결과 표시** (`components/improved-result-display.tsx`):

  - 원래 이름 분석
  - 한국어 이름 제안 (성+이름)
  - 음절별 의미 (한자, 로마자, 뜻)
  - 통합된 의미 해석
  - 삶의 가치와 문화적 인상
  - 공유 가능한 콘텐츠

- **프리미엄 결과 표시** (`components/premium-result-display.tsx`):
  - 글자별 상세 분석
  - 더 깊은 문화적 해석
  - 인생 방향성 가이드

### 6. 오디오 기능 (`components/audio-player.tsx`)

- **발음 재생**: 한국어 이름 정확한 발음 제공
- **ElevenLabs API**: 고품질 음성 생성 (`app/api/generate-audio/route.ts`)

### 7. 결제 시스템

- **Gumroad 통합** (`app/api/gumroad/webhook/route.ts`): 프리미엄 기능 결제
- **결제 성공 페이지** (`app/payment-successful/`): 결제 완료 후 처리

### 8. 분석 및 모니터링

- **Google Analytics** (`components/GoogleAnalytics.tsx`): 사용자 행동 분석
- **이벤트 트래킹**: 버튼 클릭, 페이지 뷰 추적

## 📋 데이터 구조

### Free Mode 응답 형식

```json
{
  "original_name": "사용자 입력 이름",
  "original_name_analysis": {
    "summary": "원래 이름의 본질 기반 분석"
  },
  "korean_name_suggestion": {
    "full_name": "이예지",
    "rationale": "이름 선택 근거",
    "syllables": [
      {
        "syllable": "이",
        "romanization": "Lee",
        "hanja": "李",
        "meaning": "자두나무, 전통적 우아함"
      }
    ]
  },
  "korean_name_impression": "이름이 주는 전체적 인상",
  "social_share_content": {
    "formatted": "공유용 형식화된 텍스트"
  }
}
```

### Premium Mode 추가 필드

- `original_name_analysis.letters[]`: 글자별 상세 의미
- `korean_name_suggestion.life_values`: 삶의 가치 지향점
- `social_share_content.summary`: 요약된 설명

## 🏗️ 기술 스택

### Frontend

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Shadcn UI**: 일관된 디자인 시스템
- **Lucide React**: 아이콘

### Backend & APIs

- **Google Gemini API**: AI 이름 생성 엔진
- **ElevenLabs API**: 음성 생성
- **Supabase**: 인증 및 데이터베이스
- **JWT**: 보안 토큰 관리

### Infrastructure

- **Edge Runtime**: 최적화된 성능
- **Cloudflare Pages**: 배포 플랫폼
- **Vercel**: 대안 배포 옵션

### 외부 서비스

- **Gumroad**: 결제 처리
- **Google Analytics**: 사용자 분석

## 🎨 UI/UX 특징

### 디자인 시스템

- **반응형 웹**: 모바일 우선 설계
- **다크 모드 지원**: 자동 테마 전환
- **Accessibility**: 접근성 고려된 인터페이스
- **터치 최적화**: 모바일 터치 인터페이스

### 사용자 경험

- **직관적 흐름**: 이름 입력 → 옵션 선택 → 결과 확인
- **로딩 상태**: 명확한 진행 상황 표시
- **에러 처리**: 친화적인 오류 메시지
- **즉시 피드백**: 실시간 유효성 검사

## 🔒 보안 및 성능

### 보안 기능

- **JWT 토큰**: 안전한 API 인증
- **CORS 정책**: 허용된 도메인만 접근
- **환경 변수**: API 키 보안 관리
- **중복 요청 방지**: 캐시 기반 보호

### 성능 최적화

- **Edge Runtime**: 빠른 응답 시간
- **메모리 캐시**: 중복 요청 최적화
- **이미지 최적화**: Next.js 자동 최적화
- **코드 분할**: 동적 임포트 활용

## 🌟 주요 특징

1. **문화적 정확성**: 한국 전통과 현대적 감성의 조화
2. **개인화**: 사용자 선택에 따른 맞춤형 결과
3. **교육적 가치**: 한국 문화와 언어에 대한 이해 증진
4. **접근성**: 다국어 입력 지원으로 글로벌 사용자 대상
5. **품질**: AI 기반 고품질 이름 생성과 의미 해석

## 🎯 타겟 사용자

- **한국 문화 애호가**: K-pop, 드라마 팬들
- **다문화 가정**: 한국어 이름이 필요한 부모들
- **창작자**: 캐릭터나 펜네임 필요한 작가들
- **외국인 거주자**: 한국 사회 적응을 위한 한국어 이름
- **언어 학습자**: 한국어와 문화 학습 도구로 활용

이 서비스는 단순한 이름 변환을 넘어서 문화적 교류와 이해를 촉진하는 의미 있는 플랫폼으로 설계되었습니다.
