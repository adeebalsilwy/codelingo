import { Metadata } from 'next';

declare module 'next' {
  export interface PageProps {
    params: Record<string, string>;
    searchParams?: Record<string, string | string[] | undefined>;
  }
}

declare global {
  // إضافة تعريف عالمي لأنواع الصفحات
  export interface PageParams {
    [key: string]: string;
  }
}

export {}; 