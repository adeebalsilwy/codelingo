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

    // Create lessons for all chapters in Unit 1 (C++)
    const lessons1 = await db.insert(lessons).values([
      {
        title: "مقدمة في لغة ++C",
        unitId: cppUnits[0].id,
        chapterId: unit1Chapters[0].id,
        order: 1
      },
      {
        title: "تاريخ تطور لغة ++C",
        unitId: cppUnits[0].id,
        chapterId: unit1Chapters[0].id,
        order: 2
      },
      {
        title: "مميزات البرمجة كائنية التوجه",
        unitId: cppUnits[0].id,
        chapterId: unit1Chapters[1].id,
        order: 1
      },
      {
        title: "التحكم في الذاكرة",
        unitId: cppUnits[0].id,
        chapterId: unit1Chapters[1].id,
        order: 2
      }
    ]).returning();

    // Create more challenges for Unit 1 lessons
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
        question: "من هو مطور لغة ++C؟",
        order: 2
      },
      {
        lessonId: lessons1[1].id,
        type: "SELECT",
        question: "ما هي اللغة التي تطورت عنها ++C؟",
        order: 1
      },
      {
        lessonId: lessons1[2].id,
        type: "SELECT",
        question: "ما هو مفهوم البرمجة كائنية التوجه؟",
        order: 1
      }
    ]).returning();

    // Create more challenge options for Unit 1
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
        challengeId: challenges1[1].id,
        text: "بيارن ستروستروب",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges1[1].id,
        text: "دينيس ريتشي",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges1[2].id,
        text: "لغة C",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: challenges1[2].id,
        text: "لغة Java",
        correct: false,
        imageSrc: null,
        audioSrc: null
      }
    ]);

    // Create units for Python Course
    const pythonUnits = await db.insert(units).values([
      {
        title: "مقدمة في Python",
        description: "تعلم أساسيات لغة Python وتاريخها ومميزاتها",
        courseId: pythonCourse.id,
        order: 1
      },
      {
        title: "هياكل البيانات في Python",
        description: "تعلم القوائم والقواميس والمجموعات في Python",
        courseId: pythonCourse.id,
        order: 2
      },
      {
        title: "البرمجة الموجهة للكائنات في Python",
        description: "تعلم مفاهيم OOP في Python",
        courseId: pythonCourse.id,
        order: 3
      }
    ]).returning();

    // Create chapters for Python first unit
    const pythonUnit1Chapters = await db.insert(chapters).values([
      {
        title: "مقدمة عن Python",
        description: "تعرف على لغة Python وتاريخها",
        content: "Python هي لغة برمجة عالية المستوى، سهلة التعلم وقوية في نفس الوقت.",
        unitId: pythonUnits[0].id,
        order: 1
      },
      {
        title: "تثبيت Python",
        description: "خطوات تثبيت Python وإعداد بيئة التطوير",
        content: "تعلم كيفية تثبيت Python وإعداد محرر النصوص المناسب.",
        unitId: pythonUnits[0].id,
        order: 2
      }
    ]).returning();

    // Create chapters for Python second unit (Data Structures)
    const pythonUnit2Chapters = await db.insert(chapters).values([
      {
        title: "القوائم في Python",
        description: "تعلم كيفية استخدام القوائم",
        content: "القوائم هي هياكل بيانات مرنة تسمح بتخزين مجموعة من العناصر.",
        unitId: pythonUnits[1].id,
        order: 1
      },
      {
        title: "القواميس في Python",
        description: "تعلم كيفية استخدام القواميس",
        content: "القواميس هي هياكل بيانات تستخدم مفاتيح لتخزين واسترجاع القيم.",
        unitId: pythonUnits[1].id,
        order: 2
      },
      {
        title: "المجموعات في Python",
        description: "تعلم كيفية استخدام المجموعات",
        content: "المجموعات هي هياكل بيانات تخزن عناصر فريدة بدون ترتيب محدد.",
        unitId: pythonUnits[1].id,
        order: 3
      }
    ]).returning();

    // Create more lessons for Python
    const pythonLessons2 = await db.insert(lessons).values([
      {
        title: "عمليات القوائم الأساسية",
        unitId: pythonUnits[1].id,
        chapterId: pythonUnit2Chapters[0].id,
        order: 1
      },
      {
        title: "التعامل مع القواميس",
        unitId: pythonUnits[1].id,
        chapterId: pythonUnit2Chapters[1].id,
        order: 1
      },
      {
        title: "عمليات المجموعات",
        unitId: pythonUnits[1].id,
        chapterId: pythonUnit2Chapters[2].id,
        order: 1
      }
    ]).returning();

    // Create more challenges for Python
    const pythonChallenges2 = await db.insert(challenges).values([
      {
        lessonId: pythonLessons2[0].id,
        type: "SELECT",
        question: "كيف يتم إضافة عنصر إلى نهاية قائمة في Python؟",
        order: 1
      },
      {
        lessonId: pythonLessons2[1].id,
        type: "SELECT",
        question: "ما هي طريقة إضافة زوج مفتاح-قيمة جديد إلى قاموس؟",
        order: 1
      }
    ]).returning();

    // Create more challenge options for Python
    await db.insert(challengeOptions).values([
      {
        challengeId: pythonChallenges2[0].id,
        text: "list.append(item)",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: pythonChallenges2[0].id,
        text: "list.add(item)",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: pythonChallenges2[1].id,
        text: "dict[key] = value",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: pythonChallenges2[1].id,
        text: "dict.add(key, value)",
        correct: false,
        imageSrc: null,
        audioSrc: null
      }
    ]);

    // Create units for Java Course
    const javaUnits = await db.insert(units).values([
      {
        title: "مقدمة في Java",
        description: "تعلم أساسيات لغة Java وبيئة التطوير",
        courseId: javaCourse.id,
        order: 1
      },
      {
        title: "البرمجة الأساسية في Java",
        description: "تعلم المتغيرات والعمليات الأساسية",
        courseId: javaCourse.id,
        order: 2
      }
    ]).returning();

    // Create chapters for Java first unit
    const javaUnit1Chapters = await db.insert(chapters).values([
      {
        title: "ما هي Java؟",
        description: "تعرف على لغة Java وتاريخها",
        content: "Java هي لغة برمجة قوية تستخدم في تطوير التطبيقات المختلفة.",
        unitId: javaUnits[0].id,
        order: 1
      },
      {
        title: "إعداد بيئة التطوير",
        description: "تثبيت JDK وإعداد IDE",
        content: "خطوات تثبيت Java Development Kit وإعداد بيئة التطوير المتكاملة.",
        unitId: javaUnits[0].id,
        order: 2
      }
    ]).returning();

    // Create chapters for Java second unit
    const javaUnit2Chapters = await db.insert(chapters).values([
      {
        title: "المصفوفات في Java",
        description: "تعلم كيفية استخدام المصفوفات",
        content: "المصفوفات هي هياكل بيانات تستخدم لتخزين مجموعة من العناصر من نفس النوع.",
        unitId: javaUnits[1].id,
        order: 1
      },
      {
        title: "التحكم في البرنامج",
        description: "تعلم هياكل التحكم في Java",
        content: "هياكل التحكم مثل if-else وswitch تستخدم للتحكم في تدفق البرنامج.",
        unitId: javaUnits[1].id,
        order: 2
      },
      {
        title: "الحلقات التكرارية",
        description: "تعلم الحلقات التكرارية في Java",
        content: "الحلقات التكرارية مثل for وwhile تستخدم لتكرار تنفيذ مجموعة من الأوامر.",
        unitId: javaUnits[1].id,
        order: 3
      }
    ]).returning();

    // Create more lessons for Java
    const javaLessons2 = await db.insert(lessons).values([
      {
        title: "إنشاء واستخدام المصفوفات",
        unitId: javaUnits[1].id,
        chapterId: javaUnit2Chapters[0].id,
        order: 1
      },
      {
        title: "جمل الشرط if-else",
        unitId: javaUnits[1].id,
        chapterId: javaUnit2Chapters[1].id,
        order: 1
      },
      {
        title: "حلقة for",
        unitId: javaUnits[1].id,
        chapterId: javaUnit2Chapters[2].id,
        order: 1
      }
    ]).returning();

    // Create more challenges for Java
    const javaChallenges2 = await db.insert(challenges).values([
      {
        lessonId: javaLessons2[0].id,
        type: "SELECT",
        question: "كيف يتم إنشاء مصفوفة من الأعداد الصحيحة في Java؟",
        order: 1
      },
      {
        lessonId: javaLessons2[1].id,
        type: "SELECT",
        question: "ما هو الشكل الصحيح لكتابة جملة if في Java؟",
        order: 1
      }
    ]).returning();

    // Create more challenge options for Java
    await db.insert(challengeOptions).values([
      {
        challengeId: javaChallenges2[0].id,
        text: "int[] numbers = new int[5];",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: javaChallenges2[0].id,
        text: "array numbers = new array(5);",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: javaChallenges2[1].id,
        text: "if (condition) { }",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: javaChallenges2[1].id,
        text: "if condition then { }",
        correct: false,
        imageSrc: null,
        audioSrc: null
      }
    ]);

    // Create units for JavaScript Course
    const jsUnits = await db.insert(units).values([
      {
        title: "مقدمة في JavaScript",
        description: "تعلم أساسيات لغة JavaScript",
        courseId: jsCourse.id,
        order: 1
      },
      {
        title: "DOM وتطوير الويب",
        description: "تعلم التعامل مع DOM وتطوير صفحات الويب",
        courseId: jsCourse.id,
        order: 2
      }
    ]).returning();

    // Create chapters for JavaScript first unit
    const jsUnit1Chapters = await db.insert(chapters).values([
      {
        title: "ما هي JavaScript؟",
        description: "تعرف على لغة JavaScript وأهميتها",
        content: "JavaScript هي لغة البرمجة الأساسية للويب.",
        unitId: jsUnits[0].id,
        order: 1
      },
      {
        title: "المتغيرات والثوابت",
        description: "تعلم المتغيرات والثوابت في JavaScript",
        content: "كيفية تعريف واستخدام المتغيرات والثوابت في JavaScript.",
        unitId: jsUnits[0].id,
        order: 2
      }
    ]).returning();

    // Create chapters for JavaScript second unit (DOM)
    const jsUnit2Chapters = await db.insert(chapters).values([
      {
        title: "مقدمة إلى DOM",
        description: "تعلم ما هو DOM وكيفية التعامل معه",
        content: "DOM هو واجهة برمجة تمثل صفحة الويب كشجرة من العناصر.",
        unitId: jsUnits[1].id,
        order: 1
      },
      {
        title: "التعامل مع العناصر",
        description: "تعلم كيفية اختيار وتعديل عناصر الصفحة",
        content: "كيفية اختيار وتعديل وإضافة وحذف عناصر HTML باستخدام JavaScript.",
        unitId: jsUnits[1].id,
        order: 2
      },
      {
        title: "معالجة الأحداث",
        description: "تعلم كيفية التعامل مع أحداث المستخدم",
        content: "كيفية الاستجابة لأحداث المستخدم مثل النقر والكتابة وغيرها.",
        unitId: jsUnits[1].id,
        order: 3
      }
    ]).returning();

    // Create more lessons for JavaScript
    const jsLessons2 = await db.insert(lessons).values([
      {
        title: "اختيار العناصر",
        unitId: jsUnits[1].id,
        chapterId: jsUnit2Chapters[1].id,
        order: 1
      },
      {
        title: "تعديل المحتوى",
        unitId: jsUnits[1].id,
        chapterId: jsUnit2Chapters[1].id,
        order: 2
      },
      {
        title: "إضافة مستمعي الأحداث",
        unitId: jsUnits[1].id,
        chapterId: jsUnit2Chapters[2].id,
        order: 1
      }
    ]).returning();

    // Create more challenges for JavaScript
    const jsChallenges2 = await db.insert(challenges).values([
      {
        lessonId: jsLessons2[0].id,
        type: "SELECT",
        question: "كيف يتم اختيار عنصر باستخدام معرف ID في JavaScript؟",
        order: 1
      },
      {
        lessonId: jsLessons2[2].id,
        type: "SELECT",
        question: "كيف تتم إضافة مستمع حدث النقر لعنصر؟",
        order: 1
      }
    ]).returning();

    // Create more challenge options for JavaScript
    await db.insert(challengeOptions).values([
      {
        challengeId: jsChallenges2[0].id,
        text: "document.getElementById('id')",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: jsChallenges2[0].id,
        text: "document.findById('id')",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: jsChallenges2[1].id,
        text: "element.addEventListener('click', function() { })",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: jsChallenges2[1].id,
        text: "element.onClick = function() { }",
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
