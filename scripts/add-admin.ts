// import "dotenv/config";
// import db from "../db/client";
// import { courses, units, chapters, lessons, challenges, challengeOptions, challengeProgress, userProgress } from "../db/schema";
// import { randomUUID } from "crypto";

// async function main() {
//   try {
//     // Delete all existing data in reverse order of dependencies
//     console.log("Deleting existing data...");
//     await db.delete(challengeOptions);
//     await db.delete(userProgress);
//     await db.delete(challengeProgress);
//     await db.delete(challenges);
//     await db.delete(lessons);
//     await db.delete(chapters);
//     await db.delete(units);
//     await db.delete(courses);
//     console.log("Existing data deleted successfully");

//     // Create programming courses
//     const [cppCourse, pythonCourse, javaCourse, jsCourse] = await db.insert(courses).values([
//       {
//         title: "C++ Programming",
//         imageSrc: "/cpp.svg"
//       },
//       {
//         title: "Python Programming",
//         imageSrc: "/python.svg"
//       },
//       {
//         title: "Java Programming",
//         imageSrc: "/java.svg"
//       },
//       {
//         title: "JavaScript Programming",
//         imageSrc: "/javascript.svg"
//       }
//     ]).returning();

//     // C++ Course Units
//     const cppUnits = await db.insert(units).values([
//       {
//         title: "أساسيات ++C",
//         description: "تعلم المفاهيم الأساسية في لغة ++C",
//         courseId: cppCourse.id,
//         order: 1
//       },
//       {
//         title: "البرمجة الشيئية",
//         description: "تعلم مفاهيم البرمجة كائنية التوجه في ++C",
//         courseId: cppCourse.id,
//         order: 2
//       },
//       {
//         title: "هياكل البيانات",
//         description: "تعلم هياكل البيانات الأساسية في ++C",
//         courseId: cppCourse.id,
//         order: 3
//       }
//     ]).returning();

//     // C++ Chapters with real content
//     const cppChapters = await db.insert(chapters).values([
//       // الوحدة الأولى: أساسيات ++C
//       {
//         title: "المتغيرات وأنواع البيانات",
//         description: "تعلم المتغيرات وأنواع البيانات الأساسية",
//         content: `
// # المتغيرات وأنواع البيانات في ++C

// ## أنواع البيانات الأساسية
// - \`int\`: للأعداد الصحيحة
// - \`float\`: للأعداد العشرية
// - \`double\`: للأعداد العشرية بدقة مضاعفة
// - \`char\`: للمحارف
// - \`bool\`: للقيم المنطقية

// ## تعريف المتغيرات
// \`\`\`cpp
// int age = 25;
// float height = 1.75;
// char grade = 'A';
// bool isStudent = true;
// \`\`\`
//         `,
//         video_youtube: "https://www.youtube.com/watch?v=zB9RI8_wExo",
//         unitId: cppUnits[0].id,
//         order: 1
//       },
//       {
//         title: "العمليات الحسابية والمنطقية",
//         description: "تعلم العمليات الحسابية والمنطقية الأساسية",
//         content: `
// # العمليات في ++C

// ## العمليات الحسابية
// \`\`\`cpp
// int a = 10, b = 3;
// int sum = a + b;    // 13
// int diff = a - b;   // 7
// int prod = a * b;   // 30
// int quot = a / b;   // 3
// int rem = a % b;    // 1
// \`\`\`

// ## العمليات المنطقية
// \`\`\`cpp
// bool x = true, y = false;
// bool result1 = x && y;  // false
// bool result2 = x || y;  // true
// bool result3 = !x;      // false
// \`\`\`
//         `,
//         video_youtube: "https://www.youtube.com/watch?v=_r5i5ZtUpUM",
//         unitId: cppUnits[0].id,
//         order: 2
//       },
//       // الوحدة الثانية: البرمجة الشيئية
//       {
//         title: "الفئات والكائنات",
//         description: "تعلم أساسيات الفئات والكائنات",
//         content: `
// # الفئات والكائنات في ++C

// ## تعريف الفئة
// \`\`\`cpp
// class Student {
// private:
//     string name;
//     int age;
// public:
//     Student(string n, int a) {
//         name = n;
//         age = a;
//     }
//     void display() {
//         cout << name << " is " << age << " years old";
//     }
// };
// \`\`\`

// ## إنشاء الكائنات
// \`\`\`cpp
// Student s1("Ahmed", 20);
// s1.display();
// \`\`\`
//         `,
//         video_youtube: "https://www.youtube.com/watch?v=ABRP_5RYhqU",
//         unitId: cppUnits[1].id,
//         order: 1
//       },
//       // الوحدة الثالثة: هياكل البيانات
//       {
//         title: "المصفوفات",
//         description: "تعلم التعامل مع المصفوفات",
//         content: `
// # المصفوفات في ++C

// ## تعريف المصفوفة
// \`\`\`cpp
// int numbers[5] = {1, 2, 3, 4, 5};
// int matrix[2][3] = {{1, 2, 3}, {4, 5, 6}};
// \`\`\`

// ## العمليات على المصفوفات
// \`\`\`cpp
// // الوصول للعناصر
// int first = numbers[0];    // 1
// int value = matrix[1][2];  // 6

// // التكرار على المصفوفة
// for(int i = 0; i < 5; i++) {
//     cout << numbers[i] << " ";
// }
// \`\`\`
//         `,
//         video_youtube: "https://www.youtube.com/watch?v=v2jfGMyeClI",
//         unitId: cppUnits[2].id,
//         order: 1
//       }
//     ]).returning();

//     // C++ Lessons with key concepts
//     const cppLessons = await db.insert(lessons).values([
//       // دروس الوحدة الأولى
//       {
//         title: "التعامل مع المتغيرات",
//         unitId: cppUnits[0].id,
//         chapterId: cppChapters[0].id,
//         order: 1
//       },
//       {
//         title: "تحويل أنواع البيانات",
//         unitId: cppUnits[0].id,
//         chapterId: cppChapters[0].id,
//         order: 2
//       },
//       {
//         title: "العمليات الحسابية",
//         unitId: cppUnits[0].id,
//         chapterId: cppChapters[1].id,
//         order: 3
//       },
//       {
//         title: "العمليات المنطقية",
//         unitId: cppUnits[0].id,
//         chapterId: cppChapters[1].id,
//         order: 4
//       },
//       // دروس الوحدة الثانية
//       {
//         title: "إنشاء الفئات",
//         unitId: cppUnits[1].id,
//         chapterId: cppChapters[2].id,
//         order: 1
//       },
//       {
//         title: "الخصائص والدوال",
//         unitId: cppUnits[1].id,
//         chapterId: cppChapters[2].id,
//         order: 2
//       },
//       // دروس الوحدة الثالثة
//       {
//         title: "المصفوفات أحادية البعد",
//         unitId: cppUnits[2].id,
//         chapterId: cppChapters[3].id,
//         order: 1
//       },
//       {
//         title: "المصفوفات متعددة الأبعاد",
//         unitId: cppUnits[2].id,
//         chapterId: cppChapters[3].id,
//         order: 2
//       }
//     ]).returning();

//     // C++ Challenges with real programming questions
//     const cppChallenges = await db.insert(challenges).values([
//       // تحديات درس التعامل مع المتغيرات
//       {
//         lessonId: cppLessons[0].id,
//         type: "SELECT",
//         question: "ما هو نوع البيانات المناسب لتخزين عمر شخص؟",
//         order: 1
//       },
//       {
//         lessonId: cppLessons[0].id,
//         type: "SELECT",
//         question: "كيف يتم تعريف متغير من نوع float في ++C؟",
//         order: 2
//       },
//       // تحديات درس تحويل أنواع البيانات
//       {
//         lessonId: cppLessons[1].id,
//         type: "SELECT",
//         question: "ما هي نتيجة تحويل الرقم 5.7 إلى int؟",
//         order: 1
//       },
//       {
//         lessonId: cppLessons[1].id,
//         type: "SELECT",
//         question: "أي من التحويلات التالية يمكن أن يؤدي إلى فقدان البيانات؟",
//         order: 2
//       },
//       // تحديات درس العمليات الحسابية
//       {
//         lessonId: cppLessons[2].id,
//         type: "SELECT",
//         question: "ما هي نتيجة العملية: 15 % 4؟",
//         order: 1
//       },
//       {
//         lessonId: cppLessons[2].id,
//         type: "SELECT",
//         question: "ما هي نتيجة العملية: 7 / 2 في حالة المتغيرات من نوع int؟",
//         order: 2
//       }
//     ]).returning();

//     // C++ Challenge Options with correct answers
//     await db.insert(challengeOptions).values([
//       // خيارات تحدي نوع البيانات المناسب للعمر
//       {
//         challengeId: cppChallenges[0].id,
//         text: "int",
//         correct: true,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: cppChallenges[0].id,
//         text: "float",
//         correct: false,
//         imageSrc: null,
//         audioSrc: null
//       },
//       // خيارات تحدي تعريف float
//       {
//         challengeId: cppChallenges[1].id,
//         text: "float x = 3.14;",
//         correct: true,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: cppChallenges[1].id,
//         text: "int x = 3.14;",
//         correct: false,
//         imageSrc: null,
//         audioSrc: null
//       },
//       // خيارات تحدي تحويل 5.7 إلى int
//       {
//         challengeId: cppChallenges[2].id,
//         text: "5",
//         correct: true,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: cppChallenges[2].id,
//         text: "6",
//         correct: false,
//         imageSrc: null,
//         audioSrc: null
//       },
//       // خيارات تحدي فقدان البيانات
//       {
//         challengeId: cppChallenges[3].id,
//         text: "double إلى int",
//         correct: true,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: cppChallenges[3].id,
//         text: "int إلى double",
//         correct: false,
//         imageSrc: null,
//         audioSrc: null
//       },
//       // خيارات تحدي باقي القسمة
//       {
//         challengeId: cppChallenges[4].id,
//         text: "false",
//         correct: true,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: cppChallenges[4].id,
//         text: "true",
//         correct: false,
//         imageSrc: null,
//         audioSrc: null
//       }
//     ]);

//     // Python Course Units
//     const pythonUnits = await db.insert(units).values([
//       {
//         title: "أساسيات Python",
//         description: "تعلم أساسيات لغة Python وبناء التطبيقات البسيطة",
//         courseId: pythonCourse.id,
//         order: 1
//       }
//     ]).returning();

//     // Python Chapters
//     const pythonChapters = await db.insert(chapters).values([
//       {
//         title: "مقدمة في Python",
//         description: "تعلم أساسيات لغة Python",
//         content: `
// # مقدمة في Python

// Python هي لغة برمجة عالية المستوى، سهلة التعلم وقوية. تتميز بما يلي:

// ## المميزات الرئيسية
// - بناء جملة واضح وبسيط
// - مكتبة قياسية غنية
// - تدعم البرمجة كائنية التوجه
// - ديناميكية الأنواع

// ## المتغيرات والأنواع الأساسية
// \`\`\`python
// # الأعداد
// x = 5       # integer
// y = 3.14    # float

// # النصوص
// name = "Ahmed"

// # القوائم
// numbers = [1, 2, 3, 4, 5]

// # القواميس
// person = {
//     "name": "Omar",
//     "age": 25
// }
// \`\`\`
//     `,
//         video_youtube: "https://www.youtube.com/watch?v=Y8Tko2YC5hA",
//         unitId: pythonUnits[0].id,
//         order: 1
//       }
//     ]).returning();

//     // Python Lessons
//     const pythonLessons = await db.insert(lessons).values([
//       {
//         title: "تثبيت Python وبيئة التطوير",
//         unitId: pythonUnits[0].id,
//         chapterId: pythonChapters[0].id,
//         order: 1
//       }
//     ]).returning();

//     // Python Challenges
//     const pythonChallenges = await db.insert(challenges).values([
//       {
//         lessonId: pythonLessons[0].id,
//         type: "SELECT",
//         question: "أي من التالي يمثل تعريف قائمة (list) صحيح في Python؟",
//         order: 1
//       }
//     ]).returning();

//     // Python Challenge Options
//     await db.insert(challengeOptions).values([
//       {
//         challengeId: pythonChallenges[0].id,
//         text: "numbers = [1, 2, 3]",
//         correct: true,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: pythonChallenges[0].id,
//         text: "numbers = {1, 2, 3}",
//         correct: false,
//         imageSrc: null,
//         audioSrc: null
//       }
//     ]);

//     // Java Course Units
//     const javaUnits = await db.insert(units).values([
//       {
//         title: "أساسيات Java",
//         description: "تعلم أساسيات لغة Java وبناء التطبيقات البسيطة",
//         courseId: javaCourse.id,
//         order: 1
//       }
//     ]).returning();

//     // Java Chapters
//     const javaChapters = await db.insert(chapters).values([
//       {
//         title: "مقدمة في Java",
//         description: "تعرف على لغة Java وبيئة التطوير",
//         content: `
// # مقدمة في لغة Java

// Java هي لغة برمجة قوية وشائعة الاستخدام:
// - تدعم البرمجة الشيئية بشكل كامل
// - تعمل على جميع المنصات
// - آمنة وموثوقة
// - مناسبة لتطوير التطبيقات المؤسسية

// ## تثبيت JDK
// 1. تحميل Java Development Kit
// 2. تثبيت وإعداد متغيرات البيئة
// 3. التحقق من التثبيت
//         `,
//         video_youtube: "https://www.youtube.com/watch?v=eIrMbAQSU34",
//         unitId: javaUnits[0].id,
//         order: 1
//       },
//       {
//         title: "البرمجة كائنية التوجه في Java",
//         description: "تعلم مفاهيم البرمجة كائنية التوجه في Java",
//         content: `
// # البرمجة كائنية التوجه في Java

// ## الفئات والكائنات
// الفئة (Class) هي القالب الذي يحدد خصائص وسلوكيات الكائن.

// \`\`\`java
// public class Car {
//     // الخصائص
//     private String brand;
//     private int year;
    
//     // Constructor المُنشئ
//     public Car(String brand, int year) {
//         this.brand = brand;
//         this.year = year;
//     }
    
//     // Getter methods دوال الحصول
//     public String getBrand() {
//         return brand;
//     }
    
//     public int getYear() {
//         return year;
//     }
    
//     // Method دالة
//     public void startEngine() {
//         System.out.println("The " + brand + " engine is starting...");
//     }
// }

// // إنشاء كائن
// Car myCar = new Car("Toyota", 2023);
// myCar.startEngine();
// \`\`\`

// ## الوراثة (Inheritance)
// \`\`\`java
// public class ElectricCar extends Car {
//     private int batteryCapacity;
    
//     public ElectricCar(String brand, int year, int batteryCapacity) {
//         super(brand, year);
//         this.batteryCapacity = batteryCapacity;
//     }
// }
// \`\`\`
//     `,
//         video_youtube: "https://www.youtube.com/watch?v=pTB0EiLXUC8",
//         unitId: javaUnits[0].id,
//         order: 2
//       }
//     ]).returning();

//     // Java Lessons
//     const javaLessons = await db.insert(lessons).values([
//       {
//         title: "تثبيت Java Development Kit",
//         unitId: javaUnits[0].id,
//         chapterId: javaChapters[0].id,
//         order: 1
//       },
//       {
//         title: "البرمجة كائنية التوجه في Java",
//         unitId: javaUnits[0].id,
//         chapterId: javaChapters[1].id,
//         order: 2
//       }
//     ]).returning();

//     // Java Challenges
//     const javaChallenges = await db.insert(challenges).values([
//       {
//         lessonId: javaLessons[0].id,
//         type: "SELECT",
//         question: "ما هو الامتداد الصحيح لملفات الجافا المصدرية؟",
//         order: 1
//       },
//       {
//         lessonId: javaLessons[1].id,
//         type: "SELECT",
//         question: "ما هي الكلمة المفتاحية المستخدمة للوراثة في Java؟",
//         order: 1
//       }
//     ]).returning();

//     // Java Challenge Options
//     await db.insert(challengeOptions).values([
//       {
//         challengeId: javaChallenges[0].id,
//         text: ".java",
//         correct: true,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: javaChallenges[0].id,
//         text: ".class",
//         correct: false,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: javaChallenges[1].id,
//         text: "extends",
//         correct: true,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: javaChallenges[1].id,
//         text: "implements",
//         correct: false,
//         imageSrc: null,
//         audioSrc: null
//       }
//     ]);

//     // JavaScript Course Units
//     const jsUnits = await db.insert(units).values([
//       {
//         title: "أساسيات JavaScript",
//         description: "تعلم أساسيات لغة JavaScript وبرمجة الويب",
//         courseId: jsCourse.id,
//         order: 1
//       }
//     ]).returning();

//     // JavaScript Chapters
//     const jsChapters = await db.insert(chapters).values([
//       {
//         title: "مقدمة في JavaScript",
//         description: "تعرف على لغة JavaScript وأساسياتها",
//         content: `
// # مقدمة في لغة JavaScript

// JavaScript هي لغة برمجة أساسية للويب:
// - تعمل في جميع المتصفحات
// - تدعم البرمجة الوظيفية والشيئية
// - غنية بالمكتبات والأطر
// - مناسبة لتطوير واجهات المستخدم

// ## بيئة التطوير
// 1. محرر النصوص (VS Code)
// 2. متصفح حديث
// 3. أدوات المطور
//         `,
//         video_youtube: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
//         unitId: jsUnits[0].id,
//         order: 1
//       },
//       {
//         title: "التعامل مع المصفوفات في JavaScript",
//         description: "تعلم طرق التعامل مع المصفوفات وأهم الدوال المتاحة",
//         content: `
// # التعامل مع المصفوفات في JavaScript

// ## إنشاء المصفوفات
// \`\`\`javascript
// // طرق إنشاء المصفوفات
// const numbers = [1, 2, 3, 4, 5];
// const fruits = new Array('apple', 'banana', 'orange');

// // المصفوفات متعددة الأنواع
// const mixed = [1, 'hello', true, { name: 'John' }];
// \`\`\`

// ## دوال المصفوفات الأساسية
// \`\`\`javascript
// const arr = [1, 2, 3, 4, 5];

// // إضافة عناصر
// arr.push(6);         // [1, 2, 3, 4, 5, 6]
// arr.unshift(0);      // [0, 1, 2, 3, 4, 5, 6]

// // حذف عناصر
// arr.pop();           // [0, 1, 2, 3, 4, 5]
// arr.shift();         // [1, 2, 3, 4, 5]

// // البحث والتصفية
// const found = arr.find(x => x > 3);     // 4
// const filtered = arr.filter(x => x > 3); // [4, 5]

// // التحويل
// const doubled = arr.map(x => x * 2);     // [2, 4, 6, 8, 10]
// \`\`\`

// ## التكرار على المصفوفات
// \`\`\`javascript
// const numbers = [1, 2, 3];

// // for...of loop
// for (const num of numbers) {
//     console.log(num);
// }

// // forEach method
// numbers.forEach(num => console.log(num));
// \`\`\`
//     `,
//         video_youtube: "https://www.youtube.com/watch?v=rRgD1yVwIvE",
//         unitId: jsUnits[0].id,
//         order: 2
//       }
//     ]).returning();

//     // JavaScript Lessons
//     const jsLessons = await db.insert(lessons).values([
//       {
//         title: "مقدمة في JavaScript",
//         unitId: jsUnits[0].id,
//         chapterId: jsChapters[0].id,
//         order: 1
//       },
//       {
//         title: "التعامل مع المصفوفات في JavaScript",
//         unitId: jsUnits[0].id,
//         chapterId: jsChapters[1].id,
//         order: 2
//       }
//     ]).returning();

//     // JavaScript Challenges
//     const jsChallenges = await db.insert(challenges).values([
//       {
//         lessonId: jsLessons[0].id,
//         type: "SELECT",
//         question: "أي من التالي يستخدم لطباعة نص في وحدة تحكم المتصفح؟",
//         order: 1
//       },
//       {
//         lessonId: jsLessons[1].id,
//         type: "SELECT",
//         question: "أي من الدوال التالية تستخدم لإضافة عنصر في نهاية المصفوفة؟",
//         order: 1
//       }
//     ]).returning();

//     // JavaScript Challenge Options
//     await db.insert(challengeOptions).values([
//       {
//         challengeId: jsChallenges[0].id,
//         text: "console.log()",
//         correct: true,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: jsChallenges[0].id,
//         text: "System.out.println()",
//         correct: false,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: jsChallenges[1].id,
//         text: "push()",
//         correct: true,
//         imageSrc: null,
//         audioSrc: null
//       },
//       {
//         challengeId: jsChallenges[1].id,
//         text: "unshift()",
//         correct: false,
//         imageSrc: null,
//         audioSrc: null
//       }
//     ]);

//     console.log("Seed completed successfully");
//     process.exit(0);
//   } catch (error) {
//     console.error("Error seeding database:", error);
//     process.exit(1);
//   }
// }

// main();


