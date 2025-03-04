'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/app/i18n/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const Chat = () => {
  const { t, dir } = useI18n();
  const isRtl = dir === 'rtl';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date()
    }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.message,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      toast.error(isRtl ? 'حدث خطأ أثناء المحادثة' : 'Error in conversation');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat(isRtl ? 'ar' : 'en', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden bg-background shadow-lg">
      <div className="p-4 border-b bg-primary/5 backdrop-blur supports-[backdrop-filter]:bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-lg font-semibold">
            {isRtl ? 'المساعد الذكي' : 'AI Assistant'}
          </h2>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2",
                message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse',
                isRtl ? 'flex-row-reverse' : ''
              )}
            >
              <div className="flex flex-col gap-1 max-w-[80%]">
                <div
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm",
                    message.role === 'assistant' 
                      ? 'bg-muted/50 text-foreground' 
                      : 'bg-primary text-primary-foreground'
                  )}
                >
                  {message.content}
                </div>
                <span className="text-xs text-muted-foreground px-2">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={cn(
              "flex items-center gap-2 text-muted-foreground",
              isRtl ? "flex-row-reverse" : ""
            )}>
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
              </div>
              <span className="text-sm">
                {isRtl ? 'جاري الكتابة...' : 'Typing...'}
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRtl ? 'اكتب رسالتك هنا...' : 'Type your message here...'}
            disabled={isLoading}
            className={cn(
              "focus-visible:ring-primary",
              isRtl ? "text-right" : ""
            )}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading}
            className="shrink-0"
          >
            <Send className={cn(
              "h-4 w-4",
              isRtl ? "rotate-180" : ""
            )} />
          </Button>
        </div>
      </form>
    </div>
  );
}; 