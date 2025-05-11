declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      NEXT_PUBLIC_APP_URL: string;
      NEXT_PUBLIC_APP_ENV: string;
      NEXT_PUBLIC_APP_NAME: string;
      NEXT_PUBLIC_APP_DESCRIPTION: string;
      NEXT_IGNORE_TS_ERRORS?: 'true' | 'false';
      DATABASE_URL: string;
      [key: string]: string | undefined;
    }
  }
}

export {}; 