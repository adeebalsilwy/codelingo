import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../db/schema";
import {
  challengeOptions,
  challenges,
  chapters,
  courses,
  lessons,
  units,
  userProgress,
  challengeProgress,
} from "../db/schema";
import db from "@/db/drizzle";

async function main() {
  try {
    // Delete existing data first
    await Promise.all([
      db.delete(schema.courses),
      db.delete(schema.units),
      db.delete(schema.chapters),
      db.delete(schema.lessons),
      db.delete(schema.challenges),
      db.delete(schema.challengeOptions),
    ]);

    // Create Programming Language Courses
    const programmingCourses = [
      { title: "Python", imageSrc: "/python.svg" },
      { title: "C++", imageSrc: "/cpp.svg" },
      { title: "C#", imageSrc: "/csharp.svg" },
    ];

    const createdCourses = await Promise.all(
      programmingCourses.map(async (course) => {
        const [createdCourse] = await db.insert(courses).values(course).returning();
        return createdCourse;
      })
    );

    // Create Units for each course
    for (const course of createdCourses) {
      const unitsData = [
        {
          title: "Programming Fundamentals",
          description: `Learn the basics of ${course.title}`,
          courseId: course.id,
          order: 1,
        },
        {
          title: "Data Structures",
          description: `Master data structures in ${course.title}`,
          courseId: course.id,
          order: 2,
        },
        {
          title: "Advanced Concepts",
          description: `Advanced programming concepts in ${course.title}`,
          courseId: course.id,
          order: 3,
        },
      ];

      const createdUnits = await Promise.all(
        unitsData.map(async (unit) => {
          const [createdUnit] = await db.insert(units).values(unit).returning();
          return createdUnit;
        })
      );

      // Create Chapters for each unit
      for (const unit of createdUnits) {
        const chaptersData = getChaptersData(course.title, unit.title).map((chapter: Omit<ChapterData, 'unitId'>) => ({
          ...chapter,
          unitId: unit.id
        }));

        const createdChapters = await Promise.all(
          chaptersData.map(async (chapter: ChapterData) => {
            const [createdChapter] = await db.insert(chapters).values(chapter).returning();
            return createdChapter;
          })
        );

        // Create lessons for each chapter
        for (const chapter of createdChapters) {
          const lessonsData = getLessonsData(course.title, chapter.title).map((lesson: Omit<LessonData, 'chapterId' | 'unitId'>) => ({
            ...lesson,
              chapterId: chapter.id,
            unitId: unit.id
          }));
            
          const createdLessons = await Promise.all(
            lessonsData.map(async (lesson: LessonData) => {
            const [createdLesson] = await db.insert(lessons).values(lesson).returning();

              // Create challenges for each lesson
              const challengesData = getChallengesData(course.title, lesson.title);
              
              const createdChallenges = await Promise.all(
                challengesData.map(async (challenge: Omit<ChallengeData, 'lessonId'>) => {
                  const [createdChallenge] = await db.insert(challenges).values({
                    ...challenge,
                    lessonId: createdLesson.id,
                  }).returning();

                  // Create challenge options
                  const optionsData = getChallengeOptionsData(course.title, challenge.question);
                  await db.insert(challengeOptions).values(
                    optionsData.map((option: Omit<ChallengeOptionData, 'challengeId'>) => ({
                      ...option,
                      challengeId: createdChallenge.id,
                    }))
                  );

                  return createdChallenge;
                })
              );

              return createdLesson;
            })
          );
        }
      }
    }

    console.log("✅ Programming courses seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding programming courses:", error);
    throw error;
  }
}

interface ChapterData {
  title: string;
  description: string;
  content: string;
  video_youtube: string;
  order: number;
  unitId: number;
}

interface LessonData {
  title: string;
  order: number;
  chapterId: number;
  unitId: number;
}

interface ChallengeData {
  type: "SELECT" | "ASSIST";
  question: string;
  order: number;
  lessonId: number;
}

interface ChallengeOptionData {
  text: string;
  correct: boolean;
  challengeId: number;
}

function getChaptersData(courseTitle: string, unitTitle: string) {
  const chaptersMap: Record<string, any> = {
    "Programming Fundamentals": [
      {
        title: "Introduction to Variables and Data Types",
        description: `Learn about variables and data types in ${courseTitle}`,
        content: getContentForChapter(courseTitle, "variables"),
        video_youtube: getYouTubeUrl(courseTitle, "variables"),
        order: 1,
      },
      {
        title: "Control Structures",
        description: `Master control structures in ${courseTitle}`,
        content: getContentForChapter(courseTitle, "control"),
        video_youtube: getYouTubeUrl(courseTitle, "control"),
        order: 2,
      },
      {
        title: "Functions and Methods",
        description: `Understanding functions and methods in ${courseTitle}`,
        content: getContentForChapter(courseTitle, "functions"),
        video_youtube: getYouTubeUrl(courseTitle, "functions"),
        order: 3,
      },
    ],
    "Data Structures": [
      {
        title: "Arrays and Collections",
        description: `Working with arrays and collections in ${courseTitle}`,
        content: getContentForChapter(courseTitle, "arrays"),
        video_youtube: getYouTubeUrl(courseTitle, "arrays"),
        order: 1,
      },
      {
        title: "Linked Lists",
        description: `Understanding linked lists in ${courseTitle}`,
        content: getContentForChapter(courseTitle, "linkedlists"),
        video_youtube: getYouTubeUrl(courseTitle, "linkedlists"),
        order: 2,
      },
      {
        title: "Stacks and Queues",
        description: `Learning about stacks and queues in ${courseTitle}`,
        content: getContentForChapter(courseTitle, "stacks"),
        video_youtube: getYouTubeUrl(courseTitle, "stacks"),
        order: 3,
      },
    ],
    "Advanced Concepts": [
      {
        title: "Object-Oriented Programming",
        description: `Master OOP concepts in ${courseTitle}`,
        content: getContentForChapter(courseTitle, "oop"),
        video_youtube: getYouTubeUrl(courseTitle, "oop"),
        order: 1,
      },
      {
        title: "Exception Handling",
        description: `Understanding exception handling in ${courseTitle}`,
        content: getContentForChapter(courseTitle, "exceptions"),
        video_youtube: getYouTubeUrl(courseTitle, "exceptions"),
        order: 2,
      },
      {
        title: "File I/O Operations",
        description: `Working with files in ${courseTitle}`,
        content: getContentForChapter(courseTitle, "files"),
        video_youtube: getYouTubeUrl(courseTitle, "files"),
        order: 3,
      },
    ],
  };

  return chaptersMap[unitTitle] || [];
}

function getLessonsData(courseTitle: string, chapterTitle: string) {
  const lessonsMap: Record<string, any> = {
    "Introduction to Variables and Data Types": [
      { title: "Basic Data Types", order: 1 },
      { title: "Variable Declaration and Initialization", order: 2 },
      { title: "Type Conversion", order: 3 },
      { title: "Constants and Literals", order: 4 },
      { title: "Scope and Lifetime", order: 5 },
    ],
    "Control Structures": [
      { title: "If-Else Statements", order: 1 },
      { title: "Loops and Iteration", order: 2 },
      { title: "Switch Statements", order: 3 },
      { title: "Break and Continue", order: 4 },
      { title: "Nested Control Structures", order: 5 },
    ],
    "Functions and Methods": [
      { title: "Function Definition and Calling", order: 1 },
      { title: "Parameters and Return Values", order: 2 },
      { title: "Function Overloading", order: 3 },
      { title: "Recursive Functions", order: 4 },
      { title: "Lambda Functions", order: 5 },
    ],
    "Arrays and Collections": [
      { title: "Array Basics", order: 1 },
      { title: "Array Operations", order: 2 },
      { title: "Multidimensional Arrays", order: 3 },
      { title: "Array Methods", order: 4 },
      { title: "Array Manipulation", order: 5 },
    ],
    "Linked Lists": [
      { title: "Singly Linked Lists", order: 1 },
      { title: "Doubly Linked Lists", order: 2 },
      { title: "Circular Linked Lists", order: 3 },
      { title: "List Operations", order: 4 },
      { title: "List Applications", order: 5 },
    ],
    "Stacks and Queues": [
      { title: "Stack Implementation", order: 1 },
      { title: "Queue Implementation", order: 2 },
      { title: "Priority Queues", order: 3 },
      { title: "Stack Applications", order: 4 },
      { title: "Queue Applications", order: 5 },
    ],
    "Object-Oriented Programming": [
      { title: "Classes and Objects", order: 1 },
      { title: "Inheritance", order: 2 },
      { title: "Polymorphism", order: 3 },
      { title: "Encapsulation", order: 4 },
      { title: "Abstraction", order: 5 },
    ],
    "Exception Handling": [
      { title: "Try-Catch Blocks", order: 1 },
      { title: "Exception Types", order: 2 },
      { title: "Custom Exceptions", order: 3 },
      { title: "Exception Propagation", order: 4 },
      { title: "Best Practices", order: 5 },
    ],
    "File I/O Operations": [
      { title: "File Reading", order: 1 },
      { title: "File Writing", order: 2 },
      { title: "File Manipulation", order: 3 },
      { title: "Binary Files", order: 4 },
      { title: "File Streams", order: 5 },
    ],
  };

  return lessonsMap[chapterTitle] || [];
}

function getChallengesData(courseTitle: string, lessonTitle: string) {
  const challengesMap: Record<string, any> = {
    "Basic Data Types": [
      {
        type: "SELECT",
        question: `What is the correct way to declare an integer variable in ${courseTitle}?`,
        order: 1,
      },
      {
        type: "SELECT",
        question: `Which data type is used for decimal numbers in ${courseTitle}?`,
        order: 2,
      },
      {
        type: "SELECT",
        question: `What is the size of a boolean type in ${courseTitle}?`,
        order: 3,
      },
      {
        type: "SELECT",
        question: `How do you declare a character variable in ${courseTitle}?`,
        order: 4,
      },
      {
        type: "SELECT",
        question: `What is the range of values for an integer in ${courseTitle}?`,
        order: 5,
      },
    ],
    "Variable Declaration and Initialization": [
      {
        type: "SELECT",
        question: `How do you declare and initialize a string variable in ${courseTitle}?`,
        order: 1,
      },
      {
        type: "SELECT",
        question: `What is the difference between declaration and initialization in ${courseTitle}?`,
        order: 2,
      },
      {
        type: "SELECT",
        question: `How do you declare multiple variables in ${courseTitle}?`,
        order: 3,
      },
      {
        type: "SELECT",
        question: `What is the default value of an uninitialized variable in ${courseTitle}?`,
        order: 4,
      },
      {
        type: "SELECT",
        question: `How do you declare a constant in ${courseTitle}?`,
        order: 5,
      },
    ],
    "Type Conversion": [
      {
        type: "SELECT",
        question: `How do you convert a string to an integer in ${courseTitle}?`,
        order: 1,
      },
      {
        type: "SELECT",
        question: `What is type casting in ${courseTitle}?`,
        order: 2,
      },
    ],
    "Constants and Literals": [
      {
        type: "SELECT",
        question: `How do you declare a constant in ${courseTitle}?`,
        order: 1,
      },
      {
        type: "SELECT",
        question: `What are literal values in ${courseTitle}?`,
        order: 2,
      },
    ],
    "Scope and Lifetime": [
      {
        type: "SELECT",
        question: `What is variable scope in ${courseTitle}?`,
        order: 1,
      },
      {
        type: "SELECT",
        question: `What is the lifetime of a variable in ${courseTitle}?`,
        order: 2,
      },
    ],
    // Add default challenges for any lesson
    "default": [
      {
        type: "SELECT",
        question: `What is the main topic of this lesson in ${courseTitle}?`,
        order: 1,
      },
      {
        type: "SELECT",
        question: `Can you explain the key concept of this lesson in ${courseTitle}?`,
        order: 2,
      },
    ],
  };

  return challengesMap[lessonTitle] || challengesMap["default"];
}

function getChallengeOptionsData(courseTitle: string, question: string) {
  const optionsMap: Record<string, any> = {
    [`What is the correct way to declare an integer variable in ${courseTitle}?`]: [
      { text: getVariableDeclarationExample(courseTitle, "integer"), correct: true },
      { text: "var number = 42;", correct: false },
      { text: "string number = 42;", correct: false },
      { text: "const number = 42;", correct: false },
    ],
    [`Which data type is used for decimal numbers in ${courseTitle}?`]: [
      { text: getDecimalType(courseTitle), correct: true },
      { text: "int", correct: false },
      { text: "string", correct: false },
      { text: "bool", correct: false },
    ],
    [`What is the size of a boolean type in ${courseTitle}?`]: [
      { text: "1 byte", correct: true },
      { text: "2 bytes", correct: false },
      { text: "4 bytes", correct: false },
      { text: "8 bytes", correct: false },
    ],
    [`How do you declare a character variable in ${courseTitle}?`]: [
      { text: getVariableDeclarationExample(courseTitle, "char"), correct: true },
      { text: "char c = 'A';", correct: true },
      { text: "string c = 'A';", correct: false },
      { text: "int c = 'A';", correct: false },
    ],
    // Add default options for any question
    "default": [
      { text: "Option A", correct: true },
      { text: "Option B", correct: false },
      { text: "Option C", correct: false },
      { text: "Option D", correct: false },
    ],
  };

  return optionsMap[question] || optionsMap["default"];
}

function getContentForChapter(courseTitle: string, topic: string): string {
  const contentMap: Record<string, any> = {
    variables: {
      Python: `
        <h2>Variables in Python</h2>
        <p>Python is a dynamically typed language, which means you don't need to declare variable types explicitly.</p>
        <pre><code>
        # Variable declaration examples
        name = "John"
        age = 25
        height = 1.75
        is_student = True
        </code></pre>
        <p>Key points about Python variables:</p>
        <ul>
          <li>Variables are case-sensitive</li>
          <li>Names can contain letters, numbers, and underscores</li>
          <li>Cannot start with a number</li>
          <li>Cannot be a reserved keyword</li>
        </ul>
      `,
      "C++": `
        <h2>Variables in C++</h2>
        <p>C++ is a statically typed language, requiring explicit type declaration.</p>
        <pre><code>
        // Variable declaration examples
        string name = "John";
        int age = 25;
        double height = 1.75;
        bool isStudent = true;
        </code></pre>
        <p>Key points about C++ variables:</p>
        <ul>
          <li>Variables must be declared before use</li>
          <li>Types must be specified explicitly</li>
          <li>Names are case-sensitive</li>
          <li>Cannot be reserved keywords</li>
        </ul>
      `,
      "C#": `
        <h2>Variables in C#</h2>
        <p>C# is a strongly typed language with type inference capabilities.</p>
        <pre><code>
        // Variable declaration examples
        string name = "John";
        int age = 25;
        double height = 1.75;
        bool isStudent = true;
        </code></pre>
        <p>Key points about C# variables:</p>
        <ul>
          <li>Variables must be declared before use</li>
          <li>Types can be inferred using 'var'</li>
          <li>Names are case-sensitive</li>
          <li>Cannot be reserved keywords</li>
        </ul>
      `,
    },
    // Add default content for any topic
    "default": `
      <h2>${topic} in ${courseTitle}</h2>
      <p>This section covers ${topic} in ${courseTitle}.</p>
      <pre><code>
      // Example code will be added here
      </code></pre>
      <p>Key points about ${topic}:</p>
      <ul>
        <li>Point 1</li>
        <li>Point 2</li>
        <li>Point 3</li>
      </ul>
    `,
  };

  return contentMap[topic]?.[courseTitle] || contentMap["default"];
}

function getYouTubeUrl(courseTitle: string, topic: string): string {
  const videoMap: Record<string, any> = {
    variables: {
      Python: "https://www.youtube.com/watch?v=khKv-8q7YmY",
      "C++": "https://www.youtube.com/watch?v=8XAQzcJvOHk",
      "C#": "https://www.youtube.com/watch?v=GhQdlIFylQ8",
    },
    // Add default video URL
    "default": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  };

  return videoMap[topic]?.[courseTitle] || videoMap["default"];
}

function getVariableDeclarationExample(courseTitle: string, type: string): string {
  const examples: Record<string, any> = {
    Python: {
      integer: "number = 42",
      string: 'name = "John"',
      float: "price = 19.99",
    },
    "C++": {
      integer: "int number = 42;",
      string: 'string name = "John";',
      float: "double price = 19.99;",
    },
    "C#": {
      integer: "int number = 42;",
      string: 'string name = "John";',
      float: "double price = 19.99;",
    },
  };

  return examples[courseTitle]?.[type] || "Example not available";
}

function getDecimalType(courseTitle: string): string {
  const types: Record<string, any> = {
    Python: "float",
    "C++": "double",
    "C#": "double",
  };

  return types[courseTitle] || "Type not available";
}

main().catch((err) => {
  console.error("❌ Error running seed script:", err);
  process.exit(1);
});