# 한국어 이름 생성기 (Korean Name Generator)

> AI 기반으로 외국 이름을 의미 있는 한국어 이름으로 변환해주는 웹 서비스
> 👉 [직접 사용해보세요](https://nametokorean.com/)

> 
## 🎯 프로젝트 소개

**한국어 이름 생성기**는 외국 이름을 단순히 발음으로 변환하는 것이 아니라, 원래 이름의 어원과 의미를 분석하여 한국의 전통과 문화적 감성을 담은 아름다운 한국어 이름을 생성하는 AI 기반 웹 서비스입니다.

### 주요 특징

- 🤖 **AI 기반 의미 분석**: Google Gemini API를 사용한 깊이 있는 이름 의미 해석
- 🎭 **문화적 연결**: 단순 번역이 아닌 문화적 맥락을 고려한 이름 생성
- 🎵 **발음 서비스**: ElevenLabs API를 통한 정확한 한국어 발음 제공
- 📱 **반응형 웹**: 모바일과 데스크톱에 최적화된 사용자 경험
- 🎨 **개인화**: 성별 뉘앙스와 이름 스타일 선택 가능

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Shadcn UI** - 일관된 디자인 시스템

### Backend & APIs
- **Google Gemini API** - AI 이름 생성 엔진
- **ElevenLabs API** - 음성 생성
- **Supabase** - 인증 및 데이터베이스
- **JWT** - 보안 토큰 관리

### Infrastructure
- **Cloudflare Pages** - 배포 플랫폼
- **Edge Runtime** - 최적화된 성능
- **Gumroad** - 프리미엄 기능 결제

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0 이상
- npm 또는 yarn 패키지 매니저

### 설치 및 실행

1. 저장소 클론
```bash
git clone https://github.com/yourusername/korean_name_changer.git
cd korean_name_changer
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env.local
```

필요한 환경 변수:
- `GOOGLE_GEMINI_API_KEY` - Google Gemini API 키
- `ELEVENLABS_API_KEY` - ElevenLabs API 키
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 익명 키
- `SUPABASE_JWT_SECRET` - JWT 서명용 시크릿

4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속

## 📋 주요 기능

### 1. 이름 변환 프로세스
- 다국어 이름 입력 지원 (영어, 일본어, 아랍어 등)
- 성별 뉘앙스 선택 (남성적/여성적/중성적)
- 이름 스타일 선택 (한자 기반/순우리말)

### 2. AI 분석 결과
- **무료 모드**: 기본적인 한국어 이름 생성과 의미 설명
- **프리미엄 모드**: 상세한 글자별 분석과 문화적 해석

### 3. 추가 기능
- 한국어 이름 정확한 발음 제공
- 결과 공유 기능
- 사용자 인증 시스템
- 결제 시스템 (프리미엄 기능)

## 🏗️ 프로젝트 구조

```
korean_name_changer/
├── app/                          # Next.js App Router
│   ├── api/                     # API 라우트
│   │   ├── generate-name/       # 이름 생성 API
│   │   ├── generate-audio/      # 음성 생성 API
│   │   └── gumroad/             # 결제 웹훅
│   ├── auth/                    # 인증 페이지
│   ├── generate/                # 이름 생성 페이지
│   ├── result/                  # 결과 페이지
│   └── pricing/                 # 가격 페이지
├── components/                  # 재사용 가능한 컴포넌트
│   ├── ui/                     # Shadcn UI 컴포넌트
│   ├── auth/                   # 인증 관련 컴포넌트
│   └── layout/                 # 레이아웃 컴포넌트
├── lib/                        # 유틸리티 및 설정
└── types/                      # TypeScript 타입 정의
```

## 🔧 스크립트

```bash
# 개발 서버 실행 (Turbopack 사용)
npm run dev

# 프로덕션 빌드
npm run build

# Cloudflare Pages 빌드
npm run cf:build

# Cloudflare Pages 배포
npm run cf:deploy

# 린팅
npm run lint
```

## 🌐 배포

### Cloudflare Pages 배포

1. Cloudflare Pages 빌드
```bash
npm run cf:build
```

2. 배포 실행
```bash
npm run cf:deploy
```

### Vercel 배포

Vercel CLI를 사용하거나 GitHub 연동을 통해 자동 배포 가능

## 📊 사용 예시

### 입력 예시
- 이름: "Harry Potter"
- 성별 뉘앙스: 남성적
- 스타일: 한자 기반

### 출력 예시
```
한국어 이름: 박도현 (Park Do-Hyun)

이름 분석:
- 박 (朴): 자연의 순수함과 정직함
- 도 (道): 올바른 길과 도덕적 가치
- 현 (賢): 지혜롭고 현명함

전체 의미: 자연스러운 지혜와 올바른 도덕성을 지닌 사람
```

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 만듭니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고하세요.

## 📞 지원 및 문의

- 이슈 제보: [GitHub Issues](https://github.com/mingyuShim94/korean_name_changer/issues)
- 이메일: gguggulab@gmail.com

## 🙏 감사의 말

- Google Gemini API 팀
- ElevenLabs 음성 AI 팀
- Supabase 팀
- 오픈소스 커뮤니티

---

> 이 프로젝트는 문화적 교류와 이해를 촉진하며, 한국 문화의 아름다움을 세계에 알리는 것을 목표로 합니다.
