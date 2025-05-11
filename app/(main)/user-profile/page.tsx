'use client';

import { useEffect, useState } from 'react';
import { UserProfile } from '@clerk/nextjs';
import { useI18n } from '@/app/i18n/client';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

const UserProfilePage = () => {
  const { language, dir } = useI18n();
  const isRtl = dir === 'rtl';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-500 dark:text-gray-400">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col gap-6 p-4 md:p-6",
      isRtl ? "rtl" : ""
    )}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-8">
        <h1 className="text-2xl font-bold mb-6">
          {language === 'ar' ? 'تعديل بيانات الحساب' : 'Edit Profile'}
        </h1>
        
        <div className="clerk-profile-wrapper">
          <UserProfile
            appearance={{
              elements: {
                rootBox: {
                  width: '100%',
                  maxWidth: '100%',
                },
                card: {
                  border: 'none',
                  boxShadow: 'none',
                  width: '100%',
                  maxWidth: '100%',
                },
                navbar: {
                  display: 'none',
                },
                pageScrollBox: {
                  padding: 0,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;