declare namespace NodeJS {
  interface ProcessEnv {
    PADDLE_API_KEY: string;
    WEBHOOK_SECRET_KEY: string;
    GEMINI_API_KEY_FREE: string;
    GEMINI_API_KEY_PAID: string;
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_GA_ID: string;
    GOOGLE_TTS_API_KEY: string;
    NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: string;
    NEXT_PUBLIC_PADDLE_ENVIRONMENT: string;
  }
}
