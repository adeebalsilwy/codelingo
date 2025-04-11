"use client";

import { Admin, Resource, defaultLightTheme, defaultDarkTheme } from "react-admin";
import { School, Book, Class, Assignment, QuestionAnswer, Extension } from "@mui/icons-material";

import { dataProvider } from "./dataProvider";
import { AdminThemeProvider } from "./theme-provider";
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

import { QueryClient } from 'react-query';

// Configure React Query client with improved cache settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set reasonable cache time
      cacheTime: 0, // 5 minutes
      // Don't retry failed queries excessively
      retry: 1,
      // Refetch data automatically when window regains focus
      refetchOnWindowFocus: true,
      // Set reasonable stale time
      staleTime: 30 * 1000, // 30 seconds
      // Always refetch on mount
      refetchOnMount: 'always',
      // Disable automatic refetching for more stability
      refetchInterval: false,
    },
    mutations: {
      // Use error boundary for mutations
      useErrorBoundary: true,
      // Try again once on failure
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <AdminThemeProvider>
      <Admin 
        dataProvider={dataProvider} 
        requireAuth
        queryClient={queryClient}
        // Disable standard cache 
        disableTelemetry
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
