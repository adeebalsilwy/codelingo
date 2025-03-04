'use client';

import { 
  Datagrid, 
  List, 
  TextField, 
  ReferenceField, 
  NumberField,
  TextInput,
  ReferenceInput,
  SelectInput,
  useTranslate
} from "react-admin";
import { useI18n } from "@/app/i18n/client";
import { useEffect } from "react";

export const LessonList = () => {
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

  const LessonFilters = [
    <TextInput key="title" source="title" label={i18nT('admin.title')} alwaysOn />,
    <ReferenceInput key="unitId" source="unitId" reference="units" label={i18nT('admin.unit')} alwaysOn>
      <SelectInput optionText="title" />
    </ReferenceInput>,
    <ReferenceInput key="chapterId" source="chapterId" reference="chapters" label={i18nT('admin.chapter')}>
      <SelectInput optionText="title" />
    </ReferenceInput>
  ];

  return (
    <List 
      filters={LessonFilters}
      title={i18nT('admin.lessons')}
    >
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="title" label={i18nT('admin.title')} />
        <ReferenceField 
          source="unitId" 
          reference="units" 
          label={i18nT('admin.unit')}
        >
          <TextField source="title" />
        </ReferenceField>
        <ReferenceField 
          source="chapterId" 
          reference="chapters" 
          label={i18nT('admin.chapter')}
        >
          <TextField source="title" />
        </ReferenceField>
        <NumberField source="order" label={i18nT('admin.order')} />
      </Datagrid>
    </List>
  );
};
