import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">الصفحة غير موجودة</h2>
      <p className="mb-8 text-muted-foreground">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Button asChild>
        <Link href="/">
          العودة للصفحة الرئيسية
        </Link>
      </Button>
    </div>
  );
} 