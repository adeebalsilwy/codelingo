'use client';

import { useState } from 'react';
import { Chat } from "@/app/components/Chat";
import { useI18n } from "@/app/i18n/client";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

const modelInfo = {
  'deepseek': {
    name: 'DeepSeek',
    description: {
      en: 'High-performance open-source model with excellent reasoning capabilities and coding expertise',
      ar: 'نموذج مفتوح المصدر عالي الأداء مع قدرات ممتازة في المنطق والبرمجة'
    }
  },
  'gpt-4o': {
    name: 'GPT-4o',
    description: {
      en: 'OpenAI\'s newest and most advanced model with multimodal capabilities',
      ar: 'أحدث وأقوى نموذج من OpenAI بقدرات متعددة الوسائط'
    }
  },
  'gpt-4': {
    name: 'GPT-4',
    description: {
      en: 'Advanced OpenAI model, best for complex tasks and detailed responses',
      ar: 'نموذج OpenAI متقدم، الأفضل للمهام المعقدة والردود المفصلة'
    }
  },
  'gpt-3.5': {
    name: 'GPT-3.5 Turbo',
    description: {
      en: 'Fast and reliable OpenAI model, good balance of capability and speed',
      ar: 'نموذج OpenAI سريع وموثوق، توازن جيد بين القدرة والسرعة'
    }
  },
  'falcon': {
    name: 'Falcon-7B',
    description: {
      en: 'Open-source model by TII, good for general conversation and coding help',
      ar: 'نموذج مفتوح المصدر من TII، جيد للمحادثة العامة والمساعدة في البرمجة'
    }
  },
  'bloom': {
    name: 'BLOOM',
    description: {
      en: 'Multilingual open-source model, supports many languages including Arabic',
      ar: 'نموذج مفتوح المصدر متعدد اللغات، يدعم العديد من اللغات بما فيها العربية'
    }
  },
  'flan': {
    name: 'Flan-T5',
    description: {
      en: 'Google\'s instruction-tuned model, good for specific tasks and questions',
      ar: 'نموذج Google المدرب على التعليمات، جيد للمهام والأسئلة المحددة'
    }
  }
};

export default function ChatPage() {
  const { t, dir, language } = useI18n();
  const isRtl = dir === 'rtl';
  const [selectedModel, setSelectedModel] = useState('deepseek');

  return (
    <div className={cn(
      'container mx-auto py-8',
      isRtl ? 'rtl' : ''
    )}>
      <div className="flex flex-col gap-6 mb-8">
        <h1 className="text-3xl font-bold">
          {isRtl ? 'المحادثة مع المساعد الذكي' : 'Chat with AI Assistant'}
        </h1>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={isRtl ? "اختر النموذج" : "Select Model"} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>
                  {isRtl ? "النماذج المميزة" : "Featured Models"}
                </SelectLabel>
                <SelectItem value="deepseek">DeepSeek (Recommended)</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>
                  {isRtl ? "نماذج OpenAI" : "OpenAI Models"}
                </SelectLabel>
                <SelectItem value="gpt-4o">GPT-4o (Latest & Greatest)</SelectItem>
                <SelectItem value="gpt-4">GPT-4 (Advanced)</SelectItem>
                <SelectItem value="gpt-3.5">GPT-3.5 Turbo (Fast)</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>
                  {isRtl ? "النماذج المجانية" : "Free Models"}
                </SelectLabel>
                <SelectItem value="falcon">Falcon-7B</SelectItem>
                <SelectItem value="bloom">BLOOM</SelectItem>
                <SelectItem value="flan">Flan-T5</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="flex items-start gap-2 text-muted-foreground">
            <Info className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="text-sm">
              {isRtl 
                ? modelInfo[selectedModel as keyof typeof modelInfo].description.ar
                : modelInfo[selectedModel as keyof typeof modelInfo].description.en
              }
            </p>
          </div>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-8">
        {isRtl 
          ? 'يمكنك التحدث مع المساعد الذكي للحصول على المساعدة في تعلم البرمجة وحل المشكلات البرمجية. اختر من بين مجموعة من نماذج الذكاء الاصطناعي المتطورة.'
          : 'Chat with the AI assistant to get help with learning programming and solving coding problems. Choose from a range of advanced AI models.'
        }
      </p>
      
      <Chat selectedModel={selectedModel} />
    </div>
  );
} 