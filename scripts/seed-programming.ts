import "dotenv/config";
import db from "../db/drizzle";
import { courses, units, chapters, lessons, challenges, challengeOptions } from "../db/schema";

async function main() {
  try {
    // Delete all existing data in reverse order of dependencies
    console.log("Deleting existing data...");
    await db.delete(challengeOptions);
    await db.delete(challenges);
    await db.delete(lessons);
    await db.delete(chapters);
    await db.delete(units);
    await db.delete(courses);
    console.log("Existing data deleted successfully");

    // Create programming courses
    const [cppCourse, pythonCourse, javaCourse, jsCourse] = await db.insert(courses).values([
      {
        title: "C++ Programming",
        imageSrc: "/uploads/1741215595501-cpp.svg"
      },
      {
        title: "Python Programming",
        imageSrc: "/uploads/1741216013564-python.svg"
      },
      {
        title: "Java Programming",
        imageSrc: "/uploads/1741216045987-java.svg"
      },
      {
        title: "JavaScript Programming",
        imageSrc: "/uploads/1741216398222-javascript.svg"
      }
    ]).returning();

    // C++ Course Units
    const cppUnits = await db.insert(units).values([
      {
        title: "مقدمة في ++C",
        description: "تعلم أساسيات لغة البرمجة ++C وتاريخها ومميزاتها وأهميتها",
        courseId: cppCourse.id,
        order: 1
      },
      {
        title: "البرمجة الشيئية في ++C",
        description: "تعلم مفاهيم البرمجة الشيئية وتطبيقاتها في ++C",
        courseId: cppCourse.id,
        order: 2
      },
      {
        title: "الهياكل البيانية في ++C",
        description: "تعلم هياكل البيانات وتطبيقاتها في ++C",
        courseId: cppCourse.id,
        order: 3
      }
    ]).returning();

    // C++ Chapters
    const cppChapters = await db.insert(chapters).values([
      {
        title: "مقدمة وتثبيت البيئة",
        description: "تعرف على لغة ++C وقم بتثبيت بيئة التطوير المتكاملة",
        content: "سنتعرف في هذا الدرس على لغة ++C وكيفية تثبيت بيئة التطوير...",
        video_youtube: "https://www.youtube.com/watch?v=ZzaPdXTrSb8",
        unitId: cppUnits[0].id,
        order: 1
      },
      {
        title: "المتغيرات وأنواع البيانات",
        description: "تعلم المتغيرات وأنواع البيانات في ++C",
        content: "سنتعرف على المتغيرات وأنواع البيانات المختلفة في ++C...",
        video_youtube: "https://www.youtube.com/watch?v=zB9RI8_wExo",
        unitId: cppUnits[0].id,
        order: 2
      },
      {
        title: "العمليات الحسابية والمنطقية",
        description: "تعلم العمليات الحسابية والمنطقية في ++C",
        content: "سنتعرف على العمليات الحسابية والمنطقية وكيفية استخدامها...",
        video_youtube: "https://www.youtube.com/watch?v=_r5i5ZtUpUM",
        unitId: cppUnits[0].id,
        order: 3
      },
      {
        title: "الدوال والمصفوفات",
        description: "تعلم كيفية إنشاء واستخدام الدوال والمصفوفات",
        content: "سنتعرف على كيفية إنشاء الدوال والمصفوفات واستخدامها...",
        video_youtube: "https://www.youtube.com/watch?v=TqQXS8G93Fs",
        unitId: cppUnits[1].id,
        order: 4
      },
      {
        title: "البرمجة الشيئية",
        description: "مقدمة في البرمجة الشيئية والكائنات",
        content: "سنتعرف على مفاهيم البرمجة الشيئية والكائنات...",
        video_youtube: "https://www.youtube.com/watch?v=wN0x9eZLix4",
        unitId: cppUnits[1].id,
        order: 5
      }
    ]).returning();

    // C++ Lessons
    const cppLessons = await db.insert(lessons).values([
      // Unit 1 Lessons
      {
        title: "تثبيت بيئة التطوير Code::Blocks",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[0].id,
        order: 1
      },
      {
        title: "كتابة أول برنامج Hello World",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[0].id,
        order: 2
      },
      {
        title: "المتغيرات وأنواع البيانات الأساسية",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[1].id,
        order: 3
      },
      {
        title: "العمليات الحسابية",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[2].id,
        order: 4
      },
      {
        title: "العمليات المنطقية وجمل الشرط",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[2].id,
        order: 5
      },
      // Unit 2 Lessons
      {
        title: "مقدمة في الدوال",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[3].id,
        order: 6
      },
      {
        title: "المصفوفات أحادية البعد",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[3].id,
        order: 7
      },
      {
        title: "المصفوفات ثنائية البعد",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[3].id,
        order: 8
      },
      {
        title: "مفهوم الكائنات والفئات",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[4].id,
        order: 9
      },
      {
        title: "الخصائص والطرق",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[4].id,
        order: 10
      }
    ]).returning();

    // C++ Challenges
    const cppChallenges = await db.insert(challenges).values([
      {
        lessonId: cppLessons[0].id,
        type: "SELECT",
        question: "ما هو البرنامج المستخدم لتطوير تطبيقات ++C؟",
        order: 1
      },
      {
        lessonId: cppLessons[1].id,
        type: "SELECT",
        question: "ما هي الدالة الرئيسية في برنامج ++C؟",
        order: 1
      }
    ]).returning();

    // C++ Challenge Options
    await db.insert(challengeOptions).values([
      {
        challengeId: cppChallenges[0].id,
        text: "Code::Blocks",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[0].id,
        text: "Visual Studio",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[0].id,
        text: "Eclipse",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[1].id,
        text: "main()",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[1].id,
        text: "start()",
        correct: false,
        imageSrc: null,
        audioSrc: null
      }
    ]);

    // Python Course Units
    const pythonUnits = await db.insert(units).values([
      {
        title: "أساسيات Python",
        description: "تعلم أساسيات لغة Python وبناء التطبيقات البسيطة",
        courseId: pythonCourse.id,
        order: 1
      },
      {
        title: "البرمجة المتقدمة في Python",
        description: "تعلم المفاهيم المتقدمة في Python",
        courseId: pythonCourse.id,
        order: 2
      },
      {
        title: "تطوير التطبيقات بـ Python",
        description: "بناء تطبيقات حقيقية باستخدام Python",
        courseId: pythonCourse.id,
        order: 3
      }
    ]).returning();

    // Python Chapters
    const pythonChapters = await db.insert(chapters).values([
      {
        title: "مقدمة في Python",
        description: "تعرف على لغة Python وميزاتها",
        content: "Python هي لغة برمجة عالية المستوى...",
        video_youtube: "https://www.youtube.com/watch?v=rfscVS0vtbw",
        unitId: pythonUnits[0].id,
        order: 1
      },
      {
        title: "المتغيرات والعمليات",
        description: "تعلم المتغيرات والعمليات في Python",
        content: "سنتعرف على المتغيرات وكيفية استخدامها...",
        video_youtube: "https://www.youtube.com/watch?v=khKv-8q7YmY",
        unitId: pythonUnits[0].id,
        order: 2
      },
      {
        title: "هياكل التحكم والدوال",
        description: "تعلم هياكل التحكم والدوال في Python",
        content: "سنتعرف على جمل الشرط والحلقات والدوال...",
        video_youtube: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
        unitId: pythonUnits[1].id,
        order: 3
      },
      {
        title: "القوائم والقواميس",
        description: "تعلم التعامل مع القوائم والقواميس",
        content: "سنتعرف على هياكل البيانات في Python...",
        video_youtube: "https://www.youtube.com/watch?v=W8KRzm-HUcc",
        unitId: pythonUnits[1].id,
        order: 4
      }
    ]).returning();

    // Python Lessons
    const pythonLessons = await db.insert(lessons).values([
      // Unit 1 Lessons
      {
        title: "تثبيت Python وبيئة التطوير",
        unitId: pythonUnits[0].id,
        chapterId: pythonChapters[0].id,
        order: 1
      },
      {
        title: "أول برنامج بلغة Python",
        unitId: pythonUnits[0].id,
        chapterId: pythonChapters[0].id,
        order: 2
      },
      {
        title: "المتغيرات وأنواع البيانات",
        unitId: pythonUnits[0].id,
        chapterId: pythonChapters[1].id,
        order: 3
      },
      {
        title: "العمليات الحسابية والمنطقية",
        unitId: pythonUnits[0].id,
        chapterId: pythonChapters[1].id,
        order: 4
      },
      // Unit 2 Lessons
      {
        title: "جمل الشرط if",
        unitId: pythonUnits[1].id,
        chapterId: pythonChapters[2].id,
        order: 5
      },
      {
        title: "الحلقات التكرارية",
        unitId: pythonUnits[1].id,
        chapterId: pythonChapters[2].id,
        order: 6
      },
      {
        title: "الدوال وإعادة القيم",
        unitId: pythonUnits[1].id,
        chapterId: pythonChapters[2].id,
        order: 7
      },
      {
        title: "القوائم وعملياتها",
        unitId: pythonUnits[1].id,
        chapterId: pythonChapters[3].id,
        order: 8
      }
    ]).returning();

    // Python Challenges
    const pythonChallenges = await db.insert(challenges).values([
      {
        lessonId: pythonLessons[0].id,
        type: "SELECT",
        question: "ما هو الامتداد الافتراضي لملفات Python؟",
        order: 1
      },
      {
        lessonId: pythonLessons[1].id,
        type: "SELECT",
        question: "ما هي الدالة المستخدمة للطباعة في Python؟",
        order: 1
      }
    ]).returning();

    // Python Challenge Options
    await db.insert(challengeOptions).values([
      {
        challengeId: pythonChallenges[0].id,
        text: ".py",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: pythonChallenges[0].id,
        text: ".python",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: pythonChallenges[1].id,
        text: "print()",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: pythonChallenges[1].id,
        text: "console.log()",
        correct: false,
        imageSrc: null,
        audioSrc: null
      }
    ]);

    // Java Course Units
    const javaUnits = await db.insert(units).values([
      {
        title: "أساسيات Java",
        description: "تعلم أساسيات لغة Java وبناء التطبيقات البسيطة",
        courseId: javaCourse.id,
        order: 1
      },
      {
        title: "البرمجة المتقدمة في Java",
        description: "تعلم المفاهيم المتقدمة في Java",
        courseId: javaCourse.id,
        order: 2
      }
    ]).returning();

    // JavaScript Course Units
    const jsUnits = await db.insert(units).values([
      {
        title: "أساسيات JavaScript",
        description: "تعلم أساسيات لغة JavaScript وبرمجة الويب",
        courseId: jsCourse.id,
        order: 1
      },
      {
        title: "البرمجة المتقدمة في JavaScript",
        description: "تعلم المفاهيم المتقدمة في JavaScript",
        courseId: jsCourse.id,
        order: 2
      }
    ]).returning();

    // Java Chapters
    const javaChapters = await db.insert(chapters).values([
      {
        title: "مقدمة في Java",
        description: "تعرف على لغة Java وبيئة التطوير",
        content: "Java هي لغة برمجة قوية وموجهة للكائنات...",
        video_youtube: "https://www.youtube.com/watch?v=eIrMbAQSU34",
        unitId: javaUnits[0].id,
        order: 1
      },
      {
        title: "أساسيات Java",
        description: "تعلم أساسيات البرمجة بلغة Java",
        content: "سنتعرف على المتغيرات والعمليات الأساسية...",
        video_youtube: "https://www.youtube.com/watch?v=RRubcjpTkks",
        unitId: javaUnits[0].id,
        order: 2
      },
      {
        title: "البرمجة الشيئية",
        description: "تعلم مفاهيم البرمجة الشيئية في Java",
        content: "سنتعرف على الكائنات والفئات والوراثة...",
        video_youtube: "https://www.youtube.com/watch?v=pTB0EiLXUC8",
        unitId: javaUnits[1].id,
        order: 3
      },
      {
        title: "معالجة الاستثناءات",
        description: "تعلم كيفية معالجة الأخطاء والاستثناءات",
        content: "سنتعرف على كيفية التعامل مع الأخطاء...",
        video_youtube: "https://www.youtube.com/watch?v=1XAfapkBQjk",
        unitId: javaUnits[1].id,
        order: 4
      }
    ]).returning();

    // JavaScript Chapters
    const jsChapters = await db.insert(chapters).values([
      {
        title: "مقدمة في JavaScript",
        description: "تعرف على لغة JavaScript وأساسياتها",
        content: "JavaScript هي لغة برمجة الويب الأساسية...",
        video_youtube: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
        unitId: jsUnits[0].id,
        order: 1
      },
      {
        title: "التعامل مع DOM",
        description: "تعلم كيفية التعامل مع عناصر الصفحة",
        content: "سنتعرف على كيفية التعامل مع DOM...",
        video_youtube: "https://www.youtube.com/watch?v=0ik6X4DJKCc",
        unitId: jsUnits[0].id,
        order: 2
      },
      {
        title: "الأحداث والنماذج",
        description: "تعلم التعامل مع الأحداث والنماذج",
        content: "سنتعرف على كيفية التعامل مع أحداث المستخدم...",
        video_youtube: "https://www.youtube.com/watch?v=e57ReoUn6kM",
        unitId: jsUnits[1].id,
        order: 3
      },
      {
        title: "AJAX والوعود",
        description: "تعلم التعامل مع الطلبات غير المتزامنة",
        content: "سنتعرف على AJAX والوعود في JavaScript...",
        video_youtube: "https://www.youtube.com/watch?v=DHvZLI7Db8E",
        unitId: jsUnits[1].id,
        order: 4
      }
    ]).returning();

    // Java Lessons
    const javaLessons = await db.insert(lessons).values([
      // Unit 1 Lessons
      {
        title: "تثبيت Java JDK",
        unitId: javaUnits[0].id,
        chapterId: javaChapters[0].id,
        order: 1
      },
      {
        title: "إعداد بيئة التطوير",
        unitId: javaUnits[0].id,
        chapterId: javaChapters[0].id,
        order: 2
      },
      {
        title: "المتغيرات وأنواع البيانات",
        unitId: javaUnits[0].id,
        chapterId: javaChapters[1].id,
        order: 3
      },
      {
        title: "العمليات والمصفوفات",
        unitId: javaUnits[0].id,
        chapterId: javaChapters[1].id,
        order: 4
      },
      // Unit 2 Lessons
      {
        title: "مفهوم الكائنات والفئات",
        unitId: javaUnits[1].id,
        chapterId: javaChapters[2].id,
        order: 5
      },
      {
        title: "الوراثة وتعدد الأشكال",
        unitId: javaUnits[1].id,
        chapterId: javaChapters[2].id,
        order: 6
      }
    ]).returning();

    // JavaScript Lessons
    const jsLessons = await db.insert(lessons).values([
      // Unit 1 Lessons
      {
        title: "مقدمة وإعداد بيئة العمل",
        unitId: jsUnits[0].id,
        chapterId: jsChapters[0].id,
        order: 1
      },
      {
        title: "المتغيرات والعمليات",
        unitId: jsUnits[0].id,
        chapterId: jsChapters[0].id,
        order: 2
      },
      {
        title: "التعامل مع DOM",
        unitId: jsUnits[0].id,
        chapterId: jsChapters[1].id,
        order: 3
      },
      {
        title: "تحديث محتوى الصفحة",
        unitId: jsUnits[0].id,
        chapterId: jsChapters[1].id,
        order: 4
      },
      // Unit 2 Lessons
      {
        title: "أحداث الماوس ولوحة المفاتيح",
        unitId: jsUnits[1].id,
        chapterId: jsChapters[2].id,
        order: 5
      },
      {
        title: "التحقق من النماذج",
        unitId: jsUnits[1].id,
        chapterId: jsChapters[2].id,
        order: 6
      },
      {
        title: "مقدمة في AJAX",
        unitId: jsUnits[1].id,
        chapterId: jsChapters[3].id,
        order: 7
      }
    ]).returning();

    // JavaScript Challenges
    const jsChallenges = await db.insert(challenges).values([
      {
        lessonId: jsLessons[0].id,
        type: "SELECT",
        question: "أين يتم كتابة كود JavaScript في صفحة HTML؟",
        order: 1
      },
      {
        lessonId: jsLessons[1].id,
        type: "SELECT",
        question: "ما هي الطريقة الصحيحة لتعريف متغير في JavaScript؟",
        order: 1
      }
    ]).returning();

    // JavaScript Challenge Options
    await db.insert(challengeOptions).values([
      {
        challengeId: jsChallenges[0].id,
        text: "داخل وسم <script>",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: jsChallenges[0].id,
        text: "داخل وسم <js>",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: jsChallenges[1].id,
        text: "let myVar = 5;",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: jsChallenges[1].id,
        text: "variable myVar = 5;",
        correct: false,
        imageSrc: null,
        audioSrc: null
      }
    ]);

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

main();


