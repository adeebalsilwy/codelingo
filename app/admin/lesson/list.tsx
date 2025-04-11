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
  useTranslate,
  Pagination,
  TopToolbar,
  CreateButton,
  ExportButton
} from "react-admin";
import { useI18n } from "@/app/i18n/client";
import { useEffect } from "react";
import RefreshButton from "../utils/RefreshButton";

// Custom pagination component with selectable page sizes
const CustomPagination = () => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} />;

// Custom actions toolbar with refresh button
const ListActions = () => {
  const { t: i18nT } = useI18n();
  
  return (
    <TopToolbar>
      <CreateButton label={i18nT('admin.create')} />
      <ExportButton label={i18nT('admin.export')} />
      <RefreshButton resource="lessons" label={i18nT('admin.refresh')} />
    </TopToolbar>
  );
};

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
      pagination={false}
      perPage={-1}
      sort={{ field: "id", order: "DESC" }}
      actions={<ListActions />}
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
