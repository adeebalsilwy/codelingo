-- Drop existing tables and types
DROP TABLE IF EXISTS "challenge_options" CASCADE;
DROP TABLE IF EXISTS "challenges" CASCADE;
DROP TABLE IF EXISTS "lessons" CASCADE;
DROP TABLE IF EXISTS "chapters" CASCADE;
DROP TABLE IF EXISTS "units" CASCADE;
DROP TABLE IF EXISTS "courses" CASCADE;
DROP TABLE IF EXISTS "user_progress" CASCADE;
DROP TABLE IF EXISTS "user_course_progress" CASCADE;
DROP TABLE IF EXISTS "challenge_progress" CASCADE;
DROP TABLE IF EXISTS "user_subscription" CASCADE;
DROP TABLE IF EXISTS "admins" CASCADE;

-- Drop existing type if it exists
DROP TYPE IF EXISTS "challenge_type";

-- Create challenge_type enum
CREATE TYPE "challenge_type" AS ENUM ('SELECT', 'ASSIST', 'TYPE');

-- Create tables with proper types and constraints
CREATE TABLE IF NOT EXISTS "courses" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "imageSrc" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "units" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "courseId" INTEGER NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "chapters" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "content" TEXT,
  "videoYoutube" TEXT,
  "unitId" INTEGER NOT NULL REFERENCES "units"("id") ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "lessons" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "unitId" INTEGER NOT NULL REFERENCES "units"("id") ON DELETE CASCADE,
  "chapterId" INTEGER NOT NULL REFERENCES "chapters"("id") ON DELETE CASCADE,
  "order" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "challenges" (
  "id" SERIAL PRIMARY KEY,
  "lessonId" INTEGER NOT NULL REFERENCES "lessons"("id") ON DELETE CASCADE,
  "type" challenge_type NOT NULL,
  "question" TEXT NOT NULL,
  "explanation" TEXT,
  "order" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "challenge_options" (
  "id" SERIAL PRIMARY KEY,
  "challengeId" INTEGER NOT NULL REFERENCES "challenges"("id") ON DELETE CASCADE,
  "text" TEXT NOT NULL,
  "correct" BOOLEAN NOT NULL,
  "imageSrc" TEXT,
  "audioSrc" TEXT,
  "explanation" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "user_progress" (
  "userId" TEXT PRIMARY KEY,
  "userName" TEXT NOT NULL,
  "userImageSrc" TEXT,
  "activeCourseId" INTEGER REFERENCES "courses"("id") ON DELETE CASCADE,
  "lastActiveUnitId" INTEGER REFERENCES "units"("id") ON DELETE SET NULL,
  "lastLessonId" INTEGER REFERENCES "lessons"("id") ON DELETE SET NULL,
  "hearts" INTEGER NOT NULL DEFAULT 5,
  "points" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "user_course_progress" (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user_progress"("userId") ON DELETE CASCADE,
  "courseId" INTEGER NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "lastActiveUnitId" INTEGER REFERENCES "units"("id") ON DELETE SET NULL,
  "lastLessonId" INTEGER REFERENCES "lessons"("id") ON DELETE SET NULL,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "points" INTEGER NOT NULL DEFAULT 0,
  "completed" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "courseId")
);

CREATE TABLE IF NOT EXISTS "challenge_progress" (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "challengeId" INTEGER NOT NULL REFERENCES "challenges"("id") ON DELETE CASCADE,
  "completed" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "challengeId")
);

CREATE TABLE IF NOT EXISTS "user_subscription" (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "stripeCustomerId" TEXT UNIQUE,
  "stripeSubscriptionId" TEXT UNIQUE,
  "stripePriceId" TEXT,
  "stripeCurrentPeriodEnd" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "admins" (
  "id" SERIAL PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "updated_at" TIMESTAMP DEFAULT NOW()
); 