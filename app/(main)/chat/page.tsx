'use client';

import { Chat } from "@/app/components/Chat";
import { useI18n } from "@/app/i18n/client";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { t, dir } = useI18n();
  const isRtl = dir === 'rtl';

  return (
    <div className={cn(
      'container mx-auto py-8',
      isRtl ? 'rtl' : ''
    )}>
      <h1 className="text-3xl font-bold mb-6">
        {isRtl ? 'المحادثة مع المساعد الذكي' : 'Chat with AI Assistant'}
      </h1>
      
      <p className="text-muted-foreground mb-8">
        {isRtl 
          ? 'يمكنك التحدث مع المساعد الذكي للحصول على المساعدة في تعلم البرمجة وحل المشكلات البرمجية.'
          : 'You can chat with the AI assistant to get help with learning programming and solving coding problems.'
        }
      </p>
      
      <Chat />
    </div>
  );
} 