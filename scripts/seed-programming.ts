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
        imageSrc: "/cpp_course.jpg"
      },
      {
        title: "Python Programming",
        imageSrc: "/python_course.jpg"
      },
      {
        title: "Java Programming",
        imageSrc: "/java_course.jpg"
      },
      {
        title: "JavaScript Programming",
        imageSrc: "/javascript_course.jpg"
      }
    ]).returning();

    // Create units for C++ Course
    const cppUnits = await db.insert(units).values([
      {
        title: "مقدمة في ++C",
        description: "تعلم أساسيات لغة البرمجة ++C وتاريخها ومميزاتها وأهميتها",
        courseId: cppCourse.id,
        order: 1
      },
      {
        title: "أنواع البيانات والمتغيرات",
        description: "تعلم أنواع البيانات المختلفة والمتغيرات في ++C وكيفية استخدامها",
        courseId: cppCourse.id,
        order: 2
      },
      {
        title: "العمليات الحسابية والمنطقية",
        description: "تعلم العمليات الحسابية والمنطقية في ++C وكيفية استخدامها",
        courseId: cppCourse.id,
        order: 3
      }
    ]).returning();

    // Create chapters for first unit (Introduction)
    const unit1Chapters = await db.insert(chapters).values([
      {
        title: "تعريف لغة ++C",
        description: "مقدمة عن لغة ++C وتاريخها",
        content: "C++ هي لغة برمجة عامة الغرض تم تطويرها في أوائل الثمانينات. تتميز بقوتها في تطوير البرمجيات والألعاب ونظم التشغيل.",
        unitId: cppUnits[0].id,
        order: 1
      },
      {
        title: "مميزات ++C",
        description: "تعرف على أهم مميزات لغة ++C",
        content: "تتميز لغة ++C بالأداء المرتفع والبرمجة الموجهة للكائنات والتحكم الكامل بالموارد وقابلية التوسع وتنوع الاستخدامات.",
        unitId: cppUnits[0].id,
        order: 2
      },
      {
        title: "أهمية ++C",
        description: "تعرف على أهمية لغة ++C",
        content: "تستخدم لغة ++C في تطوير البرمجيات الأساسية وصناعة الألعاب والبرمجة العلمية وتوفر فرص عمل كثيرة.",
        unitId: cppUnits[0].id,
        order: 3
      },
      {
        title: "بيئة التطوير",
        description: "إعداد بيئة التطوير للغة ++C",
        content: "تعلم كيفية تثبيت وإعداد بيئة التطوير المتكاملة للغة ++C.",
        unitId: cppUnits[0].id,
        order: 4
      }
    ]).returning();

    // Create chapters for second unit (Data Types)
    const unit2Chapters = await db.insert(chapters).values([
      {
        title: "أنواع البيانات الأساسية",
        description: "تعرف على أنواع البيانات الأساسية في ++C",
        content: "تشمل أنواع البيانات الأساسية: int للأعداد الصحيحة، double للأعداد العشرية، char للحروف، bool للقيم المنطقية.",
        unitId: cppUnits[1].id,
        order: 1
      },
      {
        title: "المتغيرات وتعريفها",
        description: "كيفية تعريف واستخدام المتغيرات",
        content: "المتغير هو مساحة في الذاكرة لتخزين قيمة من نوع معين. يتم تعريف المتغير بتحديد نوعه واسمه.",
        unitId: cppUnits[1].id,
        order: 2
      },
      {
        title: "نطاق المتغيرات",
        description: "فهم نطاق المتغيرات في البرنامج",
        content: "يحدد نطاق المتغير أين يمكن استخدامه في البرنامج. قد يكون محلياً أو عاماً.",
        unitId: cppUnits[1].id,
        order: 3
      },
      {
        title: "الثوابت",
        description: "تعريف واستخدام الثوابت",
        content: "الثابت هو قيمة لا يمكن تغييرها بعد تعريفها. يتم تعريف الثابت باستخدام const.",
        unitId: cppUnits[1].id,
        order: 4
      }
    ]).returning();

    // Create chapters for third unit (Operations)
    const unit3Chapters = await db.insert(chapters).values([
      {
        title: "العمليات الحسابية الأساسية",
        description: "تعلم العمليات الحسابية الأساسية",
        content: "العمليات الحسابية الأساسية تشمل: الجمع (+)، الطرح (-)، الضرب (*)، القسمة (/)، باقي القسمة (%).",
        unitId: cppUnits[2].id,
        order: 1
      },
      {
        title: "العمليات المنطقية",
        description: "فهم العمليات المنطقية",
        content: "العمليات المنطقية تشمل: AND (&&)، OR (||)، NOT (!).",
        unitId: cppUnits[2].id,
        order: 2
      },
      {
        title: "عمليات المقارنة",
        description: "تعلم عمليات المقارنة",
        content: "عمليات المقارنة تشمل: يساوي (==)، لا يساوي (!=)، أكبر من (>)، أصغر من (<).",
        unitId: cppUnits[2].id,
        order: 3
      },
      {
        title: "أولويات العمليات",
        description: "فهم أولويات العمليات",
        content: "ترتيب تنفيذ العمليات يعتمد على أولوياتها. مثلاً: الضرب والقسمة قبل الجمع والطرح.",
        unitId: cppUnits[2].id,
        order: 4
      }
    ]).returning();

    // Create lessons and challenges for Unit 1
    const lessons1 = await db.insert(lessons).values([
      {
        title: "مقدمة في لغة ++C",
        unitId: cppUnits[0].id,
        chapterId: unit1Chapters[0].id,
        order: 1
      }
    ]).returning();

    const challenges1 = await db.insert(challenges).values([
      {
        lessonId: lessons1[0].id,
        type: "SELECT",
        question: "متى تم تطوير لغة ++C؟",
        order: 1
      },
      {
        lessonId: lessons1[0].id,
        type: "SELECT",
        question: "ما هي أهم مميزات لغة ++C؟",
        order: 2
      },
      {
        lessonId: lessons1[0].id,
        type: "SELECT",
        question: "ما هي أهم مجالات استخدام لغة ++C؟",
        order: 3
      }
    ]).returning();

    // Create challenge options for Unit 1
    await db.insert(challengeOptions).values([
      {
        challengeId: challenges1[0].id,
        text: "أوائل الثمانينات",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges1[0].id,
        text: "أواخر السبعينات",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges1[0].id,
        text: "أوائل التسعينات",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges1[1].id,
        text: "الأداء المرتفع والبرمجة الموجهة للكائنات",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges1[1].id,
        text: "سهولة التعلم فقط",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges1[1].id,
        text: "البرمجة الهيكلية فقط",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges1[2].id,
        text: "تطوير البرمجيات وصناعة الألعاب",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges1[2].id,
        text: "تصميم المواقع فقط",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges1[2].id,
        text: "تطوير تطبيقات الموبايل فقط",
        correct: false,
        imageSrc: null,
        audioSrc: null
      }
    ]);

    // Create lessons and challenges for Unit 2
    const lessons2 = await db.insert(lessons).values([
      {
        title: "أنواع البيانات الأساسية",
        unitId: cppUnits[1].id,
        chapterId: unit2Chapters[0].id,
        order: 1
      }
    ]).returning();

    const challenges2 = await db.insert(challenges).values([
      {
        lessonId: lessons2[0].id,
        type: "SELECT",
        question: "ما هو نوع البيانات المستخدم للأعداد الصحيحة في ++C؟",
        order: 1
      },
      {
        lessonId: lessons2[0].id,
        type: "SELECT",
        question: "كيف يتم تعريف متغير من نوع int في ++C؟",
        order: 2
      },
      {
        lessonId: lessons2[0].id,
        type: "SELECT",
        question: "ما هو نوع البيانات المستخدم للقيم المنطقية في ++C؟",
        order: 3
      }
    ]).returning();

    // Create challenge options for Unit 2
    await db.insert(challengeOptions).values([
      {
        challengeId: challenges2[0].id,
        text: "int",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges2[0].id,
        text: "string",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges2[0].id,
        text: "char",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges2[1].id,
        text: "int x;",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges2[1].id,
        text: "x = int;",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges2[1].id,
        text: "variable int;",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges2[2].id,
        text: "bool",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges2[2].id,
        text: "boolean",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges2[2].id,
        text: "logical",
        correct: false,
        imageSrc: null,
        audioSrc: null
      }
    ]);

    // Create lessons and challenges for Unit 3
    const lessons3 = await db.insert(lessons).values([
      {
        title: "العمليات الحسابية الأساسية",
        unitId: cppUnits[2].id,
        chapterId: unit3Chapters[0].id,
        order: 1
      }
    ]).returning();

    const challenges3 = await db.insert(challenges).values([
      {
        lessonId: lessons3[0].id,
        type: "SELECT",
        question: "ما هي العملية المستخدمة للحصول على باقي القسمة في ++C؟",
        order: 1
      },
      {
        lessonId: lessons3[0].id,
        type: "SELECT",
        question: "ما هي العملية المنطقية AND في ++C؟",
        order: 2
      },
      {
        lessonId: lessons3[0].id,
        type: "SELECT",
        question: "أي من العمليات التالية لها أولوية أعلى في التنفيذ؟",
        order: 3
      }
    ]).returning();

    // Create challenge options for Unit 3
    await db.insert(challengeOptions).values([
      {
        challengeId: challenges3[0].id,
        text: "%",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges3[0].id,
        text: "/",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges3[0].id,
        text: "*",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges3[1].id,
        text: "&&",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges3[1].id,
        text: "||",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges3[1].id,
        text: "!",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges3[2].id,
        text: "الضرب والقسمة",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges3[2].id,
        text: "الجمع والطرح",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges3[2].id,
        text: "العمليات المنطقية",
        correct: false,
        imageSrc: null,
        audioSrc: null
      }
    ]);

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Error seeding the database:", error);
    throw error;
  }
}

main();
