'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { requestNotificationPermission } from '@/lib/notifications';
import { useI18n } from '@/app/i18n/client';

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const { t, dir } = useI18n();
  const isRtl = dir === 'rtl';

  useEffect(() => {
    if (!("Notification" in window)) {
      return;
    }

    if (Notification.permission === "default") {
      setShowPrompt(true);
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast.success(
        isRtl ? 'تم تفعيل الإشعارات بنجاح' : 'Notifications enabled successfully'
      );
      setShowPrompt(false);
    } else {
      toast.error(
        isRtl ? 'فشل في تفعيل الإشعارات' : 'Failed to enable notifications'
      );
    }
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 ${isRtl ? 'right-4' : 'left-4'} p-4 bg-white rounded-lg shadow-lg max-w-sm border`}>
      <h3 className="font-semibold mb-2">
        {isRtl ? 'تفعيل الإشعارات' : 'Enable Notifications'}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {isRtl 
          ? 'قم بتفعيل الإشعارات للبقاء على اطلاع بآخر المستجدات والتحديثات.'
          : 'Enable notifications to stay updated with the latest updates and announcements.'
        }
      </p>
      <div className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
        <Button onClick={handleEnableNotifications}>
          {isRtl ? 'تفعيل' : 'Enable'}
        </Button>
        <Button variant="secondary" onClick={() => setShowPrompt(false)}>
          {isRtl ? 'لاحقاً' : 'Later'}
        </Button>
      </div>
    </div>
  );
} 