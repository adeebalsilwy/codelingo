'use client';

import { useState } from 'react';
import { useI18n } from '@/app/i18n/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SaveCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
}

export const SaveCodeModal = ({
  isOpen,
  onClose,
  code,
  language,
}: SaveCodeModalProps) => {
  const { t, dir } = useI18n();
  const isRtl = dir === 'rtl';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error(isRtl ? 'يرجى إدخال عنوان' : 'Please enter a title');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/code/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          code,
          language,
          isPublic,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isRtl ? 'تم حفظ الكود بنجاح' : 'Code saved successfully');
        onClose();
      } else {
        toast.error(data.error || (isRtl ? 'فشل في حفظ الكود' : 'Failed to save code'));
      }
    } catch (error) {
      toast.error(isRtl ? 'حدث خطأ أثناء حفظ الكود' : 'Error saving code');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(isRtl ? 'rtl' : '')}>
        <DialogHeader>
          <DialogTitle>{t('editor.save')}</DialogTitle>
          <DialogDescription>
            {isRtl
              ? 'أدخل عنوانًا ووصفًا اختياريًا لحفظ الكود الخاص بك.'
              : 'Enter a title and optional description to save your code.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">{isRtl ? 'العنوان' : 'Title'}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder={isRtl ? 'أدخل عنوانًا' : 'Enter a title'}
              className={isRtl ? 'text-right' : ''}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">{isRtl ? 'الوصف' : 'Description'}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder={isRtl ? 'أدخل وصفًا (اختياري)' : 'Enter a description (optional)'}
              className={isRtl ? 'text-right' : ''}
            />
          </div>
          <div className={cn(
            'flex items-center space-x-2',
            isRtl ? 'flex-row-reverse space-x-reverse' : ''
          )}>
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public">{isRtl ? 'عام' : 'Public'}</Label>
          </div>
        </div>
        <DialogFooter className={isRtl ? 'flex-row-reverse' : ''}>
          <Button  onClick={onClose}>
            {t('admin.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                {isRtl ? 'جاري الحفظ...' : 'Saving...'}
              </>
            ) : (
              t('editor.save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 