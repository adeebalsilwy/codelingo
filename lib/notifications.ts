'use client';

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
}

// Function to show code execution notifications
export function showCodeExecutionNotification(language: string, success: boolean, isRtl: boolean) {
  const title = success 
    ? (isRtl ? `تم تنفيذ كود ${language} بنجاح` : `${language} code executed successfully`)
    : (isRtl ? `فشل في تنفيذ كود ${language}` : `Failed to execute ${language} code`);

  const options: NotificationOptions = {
    icon: '/icons/icon-192x192.png',
    body: success 
      ? (isRtl ? 'يمكنك رؤية النتيجة في منطقة المخرجات' : 'You can see the output in the results area')
      : (isRtl ? 'يرجى التحقق من الكود وإصلاح الأخطاء' : 'Please check your code for errors'),
    dir: isRtl ? 'rtl' as const : 'ltr' as const
  };

  showNotification(title, options);
} 