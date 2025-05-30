'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // تسجيل الخطأ في وحدة التحليلات أو خدمة تتبع الأخطاء
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold text-red-500 mb-4">حدث خطأ ما</h1>
      <p className="mb-8 text-muted-foreground">
        نأسف، حدث خطأ أثناء معالجة طلبك. الرجاء المحاولة مرة أخرى.
      </p>
      <Button onClick={reset}>
        إعادة المحاولة
      </Button>
    </div>
  );
} 