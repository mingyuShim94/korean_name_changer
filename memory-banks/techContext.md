# Technical Context

## Development Environment

- Node.js 18+
- pnpm 패키지 매니저
- VS Code + Cursor IDE
- Git 버전 관리

## Core Technologies

### Frontend

- **Next.js 13+**

  - App Router
  - Server Components
  - Client Components
  - API Routes

- **TypeScript**

  - 엄격한 타입 체크
  - 인터페이스 정의
  - 타입 안전성

- **Tailwind CSS**

  - Utility-first CSS
  - Custom 컴포넌트
  - Responsive 디자인

- **shadcn/ui**
  - 재사용 가능한 UI 컴포넌트
  - Radix UI 기반
  - 커스텀 테마

### Backend

- **Next.js API Routes**

  - RESTful API
  - Edge Runtime
  - API 미들웨어

- **Redis**
  - 결과 캐싱
  - 성능 최적화
  - Rate Limiting

### Infrastructure

- **Vercel**

  - 호스팅 플랫폼
  - Edge Functions
  - Analytics

- **Paddle**
  - 결제 시스템
  - Subscription 관리
  - Webhook 처리

## Dependencies

```json
{
  "dependencies": {
    "next": "^13.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0",
    "@radix-ui/react": "^1.0.0",
    "paddle-sdk": "^1.0.0",
    "redis": "^4.0.0"
  }
}
```

## Development Tools

- ESLint
- Prettier
- Husky
- Commitlint
- Jest
- React Testing Library
- Playwright

## Deployment Process

1. GitHub Actions CI/CD
2. Vercel 자동 배포
3. Edge Functions 최적화
4. 성능 모니터링

## Technical Constraints

- Edge Runtime 제약사항
- API Rate Limits
- 브라우저 호환성
- 모바일 최적화

## Security Considerations

- API 보안
- 결제 데이터 보호
- CORS 정책
- Rate Limiting
- Input Validation
