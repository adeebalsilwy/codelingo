"use client";

import { 
  Admin, Resource, 
  Layout, AppBar, 
  ToggleThemeButton, 
  defaultTheme as raDefaultTheme, 
  localStorageStore, 
  TitlePortal
} from "react-admin";
import { 
  School, Book, Class, Assignment, QuestionAnswer, Extension, 
  Home, Language
} from "@mui/icons-material";
import { 
  Button, Box, IconButton, Tooltip, 
  Stack, Divider, useMediaQuery, Theme
} from "@mui/material";
import Link from "next/link";
import { useState, useEffect } from "react";

import { dataProvider } from "./dataProvider";
import { AdminThemeProvider } from "./theme-provider";
import { lightTheme, darkTheme } from "./theme";
import { CourseList } from "./course/list";
import { CourseEdit } from "./course/edit";
import { CourseCreate } from "./course/create";

import { UnitList } from "./unit/list";
import { UnitEdit } from "./unit/edit";
import { UnitCreate } from "./unit/create";

import { LessonList } from "./lesson/list";
import { LessonEdit } from "./lesson/edit";
import { LessonCreate } from "./lesson/create";

import { ChallengeList } from "./challenge/list";
import { ChallengeEdit } from "./challenge/edit";
import { ChallengeCreate } from "./challenge/create";

import { ChallengeOptionList } from "./challengeOption/list";
import { ChallengeOptionEdit } from "./challengeOption/edit";
import { ChallengeOptionCreate } from "./challengeOption/create";

import ChapterList from "./chapter/list";
import { ChapterEdit } from "./chapter/edit";
import { ChapterCreate } from "./chapter/create";

import { QueryClient } from '@tanstack/react-query';

// Configure React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 2 * 60 * 1000,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Custom AppBar component that integrates with React Admin
const CustomAppBar = (props) => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const isSmall = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  
  // Toggle language
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  };
  
  // Manage language preference
  useEffect(() => {
    // Get initial language from localStorage if available
    const savedLanguage = localStorage.getItem('admin-language') as 'ar' | 'en';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);
  
  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('admin-language', language);
    // Set direction for whole document based on language
    document.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);
  
  return (
    <AppBar {...props} color="primary">
      <TitlePortal />
      
      <Box sx={{ flex: 1 }} />
      
      <Stack 
        direction="row" 
        spacing={1}
        alignItems="center"
        sx={{ 
          '& button': { 
            color: 'inherit' 
          },
          marginRight: 1
        }}
      >
        <Tooltip title={language === 'ar' ? 'تبديل اللغة' : 'Toggle Language'}>
          <IconButton onClick={toggleLanguage} color="inherit" size="small">
            <Language fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <ToggleThemeButton />
        
        {!isSmall && (
          <>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'white', opacity: 0.2 }} />
            
            <Link href="/" passHref style={{ textDecoration: 'none' }}>
              <Button 
                variant="outlined" 
                startIcon={<Home />}
                size="small"
                color="inherit"
                sx={{
                  borderColor: 'rgba(255,255,255,0.5)',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.12)'
                  }
                }}
              >
                {language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
              </Button>
            </Link>
          </>
        )}
      </Stack>
    </AppBar>
  );
};

// Custom Layout component
const CustomLayout = (props) => {
  return <Layout {...props} appBar={CustomAppBar} />;
};

const App = () => {
  return (
    <AdminThemeProvider>
      <Admin 
        dataProvider={dataProvider} 
        queryClient={queryClient}
        disableTelemetry
        layout={CustomLayout}
        store={localStorageStore()}
        theme={lightTheme as any}
        darkTheme={darkTheme as any}
      >
        <Resource
          name="courses"
          list={CourseList}
          create={CourseCreate}
          edit={CourseEdit}
          recordRepresentation="title"
          icon={School}
        />
        <Resource
          name="units"
          list={UnitList}
          create={UnitCreate}
          edit={UnitEdit}
          recordRepresentation="title"
          icon={Book}
        />
        <Resource
          name="chapters"
          list={ChapterList}
          create={ChapterCreate}
          edit={ChapterEdit}
          recordRepresentation="title"
          icon={Class}
        />
        <Resource
          name="lessons"
          list={LessonList}
          create={LessonCreate}
          edit={LessonEdit}
          recordRepresentation="title"
          icon={Assignment}
        />
        <Resource
          name="challenges"
          list={ChallengeList}
          create={ChallengeCreate}
          edit={ChallengeEdit}
          recordRepresentation="question"
          icon={QuestionAnswer}
        />
        <Resource
          name="challengeOptions"
          list={ChallengeOptionList}
          create={ChallengeOptionCreate}
          edit={ChallengeOptionEdit}
          recordRepresentation="text"
          options={{ label: "Challenge Options" }}
          icon={Extension}
        />
      </Admin>
    </AdminThemeProvider>
  );
};

export default App;
