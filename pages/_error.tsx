import { Button } from '@/components/ui/button';
import { NextPage } from 'next';

interface ErrorProps {
  statusCode?: number;
}

const Error: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-4xl font-bold text-red-500 mb-4">
        {statusCode
          ? `خطأ ${statusCode}`
          : 'حدث خطأ ما'}
      </h1>
      <p className="mb-8 text-muted-foreground">
        نأسف، حدث خطأ أثناء معالجة طلبك. الرجاء المحاولة مرة أخرى.
      </p>
      <Button onClick={() => window.location.href = '/'}>
        العودة للصفحة الرئيسية
      </Button>
    </div>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 