import { Metadata } from 'next';

// تعريف أنماط الصفحات في Next.js 15 لضمان توافقها مع Vercel
declare module 'next' {
  export interface PageProps {
    params: { [key: string]: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  }
}

// تعريف أنماط عالمية للصفحات
declare global {
  interface PageParams {
    [key: string]: string;
  }
  
  // تعريف الأنماط التي تستخدم على مستوى المشروع
  namespace JSX {
    interface IntrinsicElements {
      // اضافة أي عناصر مخصصة
    }
  }
  
  // تعريف مساعد لمنع الخطأ الشائع
  interface Error {
    digest?: string;
  }
}

export {}; 