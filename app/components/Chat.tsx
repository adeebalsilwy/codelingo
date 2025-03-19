'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/app/i18n/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Loader2, Send, Copy, Check } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatProps {
  selectedModel: string;
}

export const Chat = ({ selectedModel }: ChatProps) => {
  const { t, dir } = useI18n();
  const isRtl = dir === 'rtl';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset the selected model if it changes
  useEffect(() => {
    if (messages.length > 0) {
      toast({
        title: isRtl ? "تم تغيير النموذج" : "Model Changed",
        description: isRtl 
          ? `تم تغيير النموذج إلى ${selectedModel}. المحادثة السابقة لن تؤثر على هذا النموذج.` 
          : `Model switched to ${selectedModel}. Previous conversation won't affect this model.`,
      });
    }
  }, [selectedModel, isRtl, toast, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: isRtl ? "حدث خطأ" : "Error",
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: "destructive",
      });
      
      // Remove the user's message if the API call fails
      setMessages(prev => prev.slice(0, -1));
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Process message content to detect and format code blocks
  const formatMessageContent = (content: string) => {
    // Split the content by code block markers (```language...```)
    const parts = content.split(/(```[a-z]*\n[\s\S]*?\n```)/g);
    
    return parts.map((part, index) => {
      // Check if this part is a code block
      const codeBlockMatch = part.match(/```([a-z]*)\n([\s\S]*?)\n```/);
      
      if (codeBlockMatch) {
        const language = codeBlockMatch[1] || 'text';
        const code = codeBlockMatch[2];
        const blockId = `code-${index}`;
        
        return (
          <div key={blockId} className="relative my-2 rounded-md bg-gray-100 dark:bg-gray-800 p-4 font-mono text-sm overflow-x-auto">
            {language && (
              <div className="absolute top-2 right-2 text-xs text-muted-foreground">
                {language}
              </div>
            )}
            <pre className="overflow-x-auto">{code}</pre>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-14 text-xs p-1 h-6"
              onClick={() => copyToClipboard(code, blockId)}
            >
              {copiedId === blockId ? (
                <Check className="h-3 w-3" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>
        );
      }
      
      // If this is not a code block, just split by newlines and render as paragraphs
      return (
        <div key={`text-${index}`}>
          {part.split('\n').map((line, i) => (
            <p key={i} className="my-1">{line}</p>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden bg-background shadow-lg">
      <div className="p-4 border-b bg-primary/5 backdrop-blur supports-[backdrop-filter]:bg-primary/5">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-3 w-3 rounded-full",
            isLoading ? "bg-yellow-500" : "bg-green-500",
            isLoading ? "animate-pulse" : ""
          )} />
          <h2 className="text-lg font-semibold">
            {isRtl ? 'المساعد الذكي' : 'AI Assistant'} ({selectedModel})
          </h2>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              {isRtl 
                ? 'ابدأ محادثة مع المساعد الذكي بكتابة سؤال أدناه.' 
                : 'Start a conversation with the AI assistant by typing a question below.'}
            </div>
          )}
          
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
                      : 'bg-primary text-primary-foreground',
                    message.role === 'assistant' && 'prose prose-sm dark:prose-invert'
                  )}
                >
                  {message.role === 'assistant' 
                    ? formatMessageContent(message.content)
                    : message.content.split('\n').map((line, index) => (
                        <p key={index} className="my-1">{line}</p>
                      ))
                  }
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
          <div ref={messagesEndRef} />
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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
            className={cn(
              "shrink-0",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className={cn(
                "h-4 w-4",
                isRtl ? "rotate-180" : ""
              )} />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};