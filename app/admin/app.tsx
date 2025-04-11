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

// Configure React Query client with balanced cache settings to prevent excessive refreshing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set reasonable cache time (5 minutes)
      cacheTime: 0,
      // Don't retry failed queries excessively
      retry: 1,
      // Refetch data when window regains focus, but not too aggressively
      refetchOnWindowFocus: false,
      // Set reasonable stale time (2 minutes)
      staleTime: 2 * 60 * 1000,
      // Don't always refetch on mount
      refetchOnMount: true,
      // Disable automatic refetching
      refetchInterval: false,
      // Use error boundary
      useErrorBoundary: false,
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
