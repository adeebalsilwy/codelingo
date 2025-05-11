'use client';

import { 
  SimpleForm, 
  Create, 
  TextInput, 
  ReferenceInput, 
  NumberInput, 
  required,
  SelectInput,
  useTranslate
} from "react-admin";
import { useI18n } from "@/app/i18n/client";
import { useEffect } from "react";

export const LessonCreate = () => {
  const { t: i18nT, language, dir } = useI18n();
  const translate = useTranslate();
  const isRtl = dir === 'rtl';
  
  // Sync react-admin translations with our i18n system
  useEffect(() => {
    // This is a workaround since we can't directly modify react-admin's translations
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    
    // Add RTL class to the admin container if needed
    const adminRoot = document.querySelector('.RaLayout-root');
    if (adminRoot) {
      if (isRtl) {
        adminRoot.classList.add('rtl');
      } else {
        adminRoot.classList.remove('rtl');
      }
    }
  }, [language, dir, isRtl]);

  return (
    <Create title={i18nT('admin.lessons')}>
      <SimpleForm>
        <TextInput 
          source="title" 
          validate={[required()]} 
          label={i18nT('admin.title')}
          fullWidth
          className={isRtl ? "rtl-input" : ""}
        />
        <ReferenceInput
          source="unitId"
          reference="units"
          label={i18nT('admin.unit')}
        >
          <SelectInput optionText="title" />
        </ReferenceInput>
        <ReferenceInput
          source="chapterId"
          reference="chapters"
          label={i18nT('admin.chapter')}
          filter={(data: { unitId?: number }) => ({ unitId: data.unitId })}
        >
          <SelectInput optionText="title" />
        </ReferenceInput>
        <NumberInput
          source="order"
          validate={[required()]}
          label={i18nT('admin.order')}
          defaultValue={1}
        />
      </SimpleForm>
    </Create>
  );
};
