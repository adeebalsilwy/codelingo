import "dotenv/config";
import { db } from "../db/client";
import { courses, units, chapters, lessons, challenges, challengeOptions, challengeProgress, userProgress } from "../db/schema";
import { randomUUID } from "crypto";

async function main() {
  try {
    // Delete all existing data in reverse order of dependencies
    console.log("Deleting existing data...");
    await db.delete(challengeOptions);
    await db.delete(userProgress);
    await db.delete(challengeProgress);
    await db.delete(challenges);
    await db.delete(lessons);
    await db.delete(chapters);
    await db.delete(units);
    await db.delete(courses);
    console.log("Existing data deleted successfully");
    
    // Create programming courses
    const [cppCourse, pythonCourse, javaCourse, jsCourse] = await db.insert(courses).values([
      {
        title: "برمجة ++C",
        imageSrc: "/cpp.svg"
      },
      {
        title: "برمجة Python",
        imageSrc: "/python.svg"
      },
      {
        title: "برمجة Java",
        imageSrc: "/java.svg"
      },
      {
        title: "برمجة JavaScript",
        imageSrc: "/javascript.svg"
      }
    ]).returning();

    // C++ Course Units
    const cppUnits = await db.insert(units).values([
      {
        title: "أساسيات ++C",
        description: "تعلم المفاهيم الأساسية في لغة ++C",
        courseId: cppCourse.id,
        order: 1
      },
      {
        title: "البرمجة الشيئية",
        description: "تعلم مفاهيم البرمجة كائنية التوجه في ++C",
        courseId: cppCourse.id,
        order: 2
      },
      {
        title: "هياكل البيانات",
        description: "تعلم هياكل البيانات الأساسية في ++C",
        courseId: cppCourse.id,
        order: 3
      },
      {
        title: "البرمجة المتقدمة",
        description: "تعلم تقنيات البرمجة المتقدمة في ++C",
        courseId: cppCourse.id,
        order: 4
      }
    ]).returning();

    // C++ Chapters with real content
    const cppChapters = await db.insert(chapters).values([
      // الوحدة الأولى: أساسيات ++C - الفصل 1
      {
        title: "المتغيرات وأنواع البيانات",
        description: "تعلم المتغيرات وأنواع البيانات الأساسية",
        content: `
# المتغيرات وأنواع البيانات في ++C

## أنواع البيانات الأساسية
- \`int\`: للأعداد الصحيحة
- \`float\`: للأعداد العشرية
- \`double\`: للأعداد العشرية بدقة مضاعفة
- \`char\`: للمحارف
- \`bool\`: للقيم المنطقية

## تعريف المتغيرات
\`\`\`cpp
int age = 25;
float height = 1.75;
char grade = 'A';
bool isStudent = true;
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=zB9RI8_wExo",
        unitId: cppUnits[0].id,
        order: 1
      },
      // الوحدة الأولى: أساسيات ++C - الفصل 2
      {
        title: "العمليات الحسابية والمنطقية",
        description: "تعلم العمليات الحسابية والمنطقية الأساسية",
        content: `
# العمليات في ++C

## العمليات الحسابية
\`\`\`cpp
int a = 10, b = 3;
int sum = a + b;    // 13
int diff = a - b;   // 7
int prod = a * b;   // 30
int quot = a / b;   // 3
int rem = a % b;    // 1
\`\`\`

## العمليات المنطقية
\`\`\`cpp
bool x = true, y = false;
bool result1 = x && y;  // false
bool result2 = x || y;  // true
bool result3 = !x;      // false
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=_r5i5ZtUpUM",
        unitId: cppUnits[0].id,
        order: 2
      },
      // الوحدة الأولى: أساسيات ++C - الفصل 3
      {
        title: "هياكل التحكم",
        description: "تعلم هياكل التحكم في البرنامج",
        content: `
# هياكل التحكم في ++C

## الشروط
\`\`\`cpp
int age = 18;
if (age >= 18) {
    cout << "بالغ";
} else {
    cout << "قاصر";
}

// العامل الثلاثي
string status = (age >= 18) ? "بالغ" : "قاصر";
\`\`\`

## الحلقات التكرارية
\`\`\`cpp
// حلقة for
for (int i = 0; i < 5; i++) {
    cout << i << " ";
}

// حلقة while
int j = 0;
while (j < 5) {
    cout << j << " ";
    j++;
}
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=qMlnFwYdqIw",
        unitId: cppUnits[0].id,
        order: 3
      },
      // الوحدة الأولى: أساسيات ++C - الفصل 4
      {
        title: "الدوال",
        description: "تعلم كيفية استخدام الدوال",
        content: `
# الدوال في ++C

## تعريف الدالة
\`\`\`cpp
int add(int a, int b) {
    return a + b;
}

void printMessage(string message) {
    cout << message << endl;
}
\`\`\`

## استدعاء الدالة
\`\`\`cpp
int result = add(5, 3);    // result = 8
printMessage("مرحبا بالعالم");
\`\`\`

## المعاملات الافتراضية
\`\`\`cpp
void greet(string name = "زائر") {
    cout << "مرحبا " << name << endl;
}

greet();        // مرحبا زائر
greet("أحمد");  // مرحبا أحمد
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=V9zuox47zr0",
        unitId: cppUnits[0].id,
        order: 4
      },
      // الوحدة الثانية: البرمجة الشيئية - الفصل 1
      {
        title: "الفئات والكائنات",
        description: "تعلم أساسيات الفئات والكائنات",
        content: `
# الفئات والكائنات في ++C

## تعريف الفئة
\`\`\`cpp
class Student {
private:
    string name;
    int age;
public:
    Student(string n, int a) {
        name = n;
        age = a;
    }
    void display() {
        cout << name << " is " << age << " years old";
    }
};
\`\`\`

## إنشاء الكائنات
\`\`\`cpp
Student s1("أحمد", 20);
s1.display();
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=ABRP_5RYhqU",
        unitId: cppUnits[1].id,
        order: 1
      },
      // الوحدة الثانية: البرمجة الشيئية - الفصل 2
      {
        title: "الوراثة",
        description: "تعلم الوراثة في البرمجة الشيئية",
        content: `
# الوراثة في ++C

## مفهوم الوراثة
الوراثة هي عملية إنشاء فئة جديدة من فئة موجودة، بحيث ترث الفئة الجديدة جميع خصائص وسلوكيات الفئة الأم.

## تطبيق الوراثة
\`\`\`cpp
class Person {
protected:
    string name;
    int age;
public:
    Person(string n, int a) {
        name = n;
        age = a;
    }
    void display() {
        cout << name << " is " << age << " years old";
    }
};

class Student : public Person {
private:
    int studentId;
public:
    Student(string n, int a, int id) : Person(n, a) {
        studentId = id;
    }
    void displayStudent() {
        display();
        cout << " with ID: " << studentId;
    }
};
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=X8nYM8wdNRE",
        unitId: cppUnits[1].id,
        order: 2
      },
      // الوحدة الثانية: البرمجة الشيئية - الفصل 3
      {
        title: "تعدد الأشكال",
        description: "تعلم مفهوم تعدد الأشكال في البرمجة الشيئية",
        content: `
# تعدد الأشكال في ++C

## المفهوم
تعدد الأشكال هو قدرة الكائن على اتخاذ أشكال متعددة.

## الدوال الافتراضية
\`\`\`cpp
class Shape {
public:
    virtual void draw() {
        cout << "رسم شكل";
    }
};

class Circle : public Shape {
public:
    void draw() override {
        cout << "رسم دائرة";
    }
};

class Rectangle : public Shape {
public:
    void draw() override {
        cout << "رسم مستطيل";
    }
};

// استخدام تعدد الأشكال
void drawShape(Shape* shape) {
    shape->draw();
}

int main() {
    Circle c;
    Rectangle r;
    
    drawShape(&c);  // رسم دائرة
    drawShape(&r);  // رسم مستطيل
    
    return 0;
}
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=wN0x9eZLix4",
        unitId: cppUnits[1].id,
        order: 3
      },
      // الوحدة الثانية: البرمجة الشيئية - الفصل 4
      {
        title: "التغليف والتجريد",
        description: "تعلم مفاهيم التغليف والتجريد في البرمجة الشيئية",
        content: `
# التغليف والتجريد في ++C

## التغليف (Encapsulation)
التغليف هو إخفاء تفاصيل التنفيذ وإتاحة واجهة بسيطة للتعامل مع الكائن.

\`\`\`cpp
class BankAccount {
private:
    string accountNumber;
    double balance;
    
public:
    BankAccount(string accNum, double initialBalance) {
        accountNumber = accNum;
        balance = initialBalance;
    }
    
    void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }
    
    bool withdraw(double amount) {
        if (amount > 0 && balance >= amount) {
            balance -= amount;
            return true;
        }
        return false;
    }
    
    double getBalance() {
        return balance;
    }
};
\`\`\`

## التجريد (Abstraction)
التجريد هو إخفاء التعقيد وإظهار الواجهة الضرورية فقط.

\`\`\`cpp
class AbstractDatabase {
public:
    virtual void connect() = 0;
    virtual void disconnect() = 0;
    virtual bool executeQuery(string query) = 0;
};

class MySQLDatabase : public AbstractDatabase {
public:
    void connect() override {
        // Implementation
    }
    
    void disconnect() override {
        // Implementation
    }
    
    bool executeQuery(string query) override {
        // Implementation
        return true;
    }
};
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=ZpFVogiA_Eg",
        unitId: cppUnits[1].id,
        order: 4
      },
      // الوحدة الثالثة: هياكل البيانات - الفصل 1
      {
        title: "المصفوفات",
        description: "تعلم التعامل مع المصفوفات",
        content: `
# المصفوفات في ++C

## تعريف المصفوفة
\`\`\`cpp
int numbers[5] = {1, 2, 3, 4, 5};
int matrix[2][3] = {{1, 2, 3}, {4, 5, 6}};
\`\`\`

## العمليات على المصفوفات
\`\`\`cpp
// الوصول للعناصر
int first = numbers[0];    // 1
int value = matrix[1][2];  // 6

// التكرار على المصفوفة
for(int i = 0; i < 5; i++) {
    cout << numbers[i] << " ";
}
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=v2jfGMyeClI",
        unitId: cppUnits[2].id,
        order: 1
      },
      // الوحدة الثالثة: هياكل البيانات - الفصل 2
      {
        title: "القوائم المرتبطة",
        description: "تعلم بناء واستخدام القوائم المرتبطة",
        content: `
# القوائم المرتبطة في ++C

## تعريف القائمة المرتبطة
القائمة المرتبطة هي سلسلة من العقد، حيث تحتوي كل عقدة على بيانات وإشارة للعقدة التالية.

## تنفيذ القائمة المرتبطة الأحادية
\`\`\`cpp
class Node {
public:
    int data;
    Node* next;
    
    Node(int value) {
        data = value;
        next = nullptr;
    }
};

class LinkedList {
private:
    Node* head;
    
public:
    LinkedList() {
        head = nullptr;
    }
    
    void insert(int value) {
        Node* newNode = new Node(value);
        
        if (head == nullptr) {
            head = newNode;
            return;
        }
        
        Node* temp = head;
        while (temp->next != nullptr) {
            temp = temp->next;
        }
        
        temp->next = newNode;
    }
    
    void display() {
        Node* temp = head;
        
        while (temp != nullptr) {
            cout << temp->data << " -> ";
            temp = temp->next;
        }
        
        cout << "NULL" << endl;
    }
};
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=NobHlGUjV3g",
        unitId: cppUnits[2].id,
        order: 2
      },
      // الوحدة الثالثة: هياكل البيانات - الفصل 3
      {
        title: "المكدسات والطوابير",
        description: "تعلم استخدام المكدسات والطوابير",
        content: `
# المكدسات والطوابير في ++C

## المكدس (Stack)
المكدس هو هيكل بيانات يتبع مبدأ LIFO (Last In First Out).

\`\`\`cpp
class Stack {
private:
    int arr[100];
    int top;
    
public:
    Stack() {
        top = -1;
    }
    
    bool isEmpty() {
        return top == -1;
    }
    
    bool isFull() {
        return top == 99;
    }
    
    void push(int value) {
        if (isFull()) {
            cout << "Stack Overflow!" << endl;
            return;
        }
        
        arr[++top] = value;
    }
    
    int pop() {
        if (isEmpty()) {
            cout << "Stack Underflow!" << endl;
            return -1;
        }
        
        return arr[top--];
    }
    
    int peek() {
        if (isEmpty()) {
            cout << "Stack is empty!" << endl;
            return -1;
        }
        
        return arr[top];
    }
};
\`\`\`

## الطابور (Queue)
الطابور هو هيكل بيانات يتبع مبدأ FIFO (First In First Out).

\`\`\`cpp
class Queue {
private:
    int arr[100];
    int front;
    int rear;
    
public:
    Queue() {
        front = -1;
        rear = -1;
    }
    
    bool isEmpty() {
        return front == -1;
    }
    
    bool isFull() {
        return rear == 99;
    }
    
    void enqueue(int value) {
        if (isFull()) {
            cout << "Queue Overflow!" << endl;
            return;
        }
        
        if (isEmpty()) {
            front = 0;
        }
        
        arr[++rear] = value;
    }
    
    int dequeue() {
        if (isEmpty()) {
            cout << "Queue Underflow!" << endl;
            return -1;
        }
        
        int value = arr[front];
        
        if (front == rear) {
            // Last element in the queue
            front = rear = -1;
        } else {
            front++;
        }
        
        return value;
    }
};
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=FfWi2dT5yEw",
        unitId: cppUnits[2].id,
        order: 3
      },
      // الوحدة الثالثة: هياكل البيانات - الفصل 4
      {
        title: "الأشجار والرسوم البيانية",
        description: "تعلم استخدام الأشجار والرسوم البيانية",
        content: `
# الأشجار والرسوم البيانية في ++C

## شجرة ثنائية البحث
\`\`\`cpp
class TreeNode {
public:
    int data;
    TreeNode* left;
    TreeNode* right;
    
    TreeNode(int value) {
        data = value;
        left = nullptr;
        right = nullptr;
    }
};

class BinarySearchTree {
private:
    TreeNode* root;
    
    TreeNode* insert(TreeNode* node, int value) {
        if (node == nullptr) {
            return new TreeNode(value);
        }
        
        if (value < node->data) {
            node->left = insert(node->left, value);
        } else if (value > node->data) {
            node->right = insert(node->right, value);
        }
        
        return node;
    }
    
    void inorderTraversal(TreeNode* node) {
        if (node == nullptr) {
            return;
        }
        
        inorderTraversal(node->left);
        cout << node->data << " ";
        inorderTraversal(node->right);
    }
    
public:
    BinarySearchTree() {
        root = nullptr;
    }
    
    void insert(int value) {
        root = insert(root, value);
    }
    
    void inorder() {
        inorderTraversal(root);
        cout << endl;
    }
};
\`\`\`

## الرسم البياني
\`\`\`cpp
class Graph {
private:
    int vertices;
    vector<vector<int>> adjacencyList;
    
public:
    Graph(int v) {
        vertices = v;
        adjacencyList.resize(v);
    }
    
    void addEdge(int u, int v) {
        adjacencyList[u].push_back(v);
        adjacencyList[v].push_back(u);  // لرسم بياني غير موجه
    }
    
    void BFS(int startVertex) {
        vector<bool> visited(vertices, false);
        queue<int> q;
        
        visited[startVertex] = true;
        q.push(startVertex);
        
        while (!q.empty()) {
            int current = q.front();
            q.pop();
            
            cout << current << " ";
            
            for (int neighbor : adjacencyList[current]) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.push(neighbor);
                }
            }
        }
    }
};
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=oSWTXtMglKE",
        unitId: cppUnits[2].id,
        order: 4
      },
      // الوحدة الرابعة: البرمجة المتقدمة - الفصل 1
      {
        title: "القوالب",
        description: "تعلم استخدام القوالب في البرمجة",
        content: `
# القوالب في ++C

## قوالب الدوال
القوالب تسمح بكتابة دوال وفئات عامة تعمل مع أنواع بيانات مختلفة.

\`\`\`cpp
// قالب دالة
template <typename T>
T findMax(T a, T b) {
    return (a > b) ? a : b;
}

// استخدام قالب الدالة
int maxInt = findMax<int>(3, 7);        // 7
double maxDouble = findMax<double>(3.14, 2.71);  // 3.14
char maxChar = findMax<char>('a', 'z');  // 'z'
\`\`\`

## قوالب الفئات
\`\`\`cpp
// قالب فئة
template <typename T>
class Stack {
private:
    T arr[100];
    int top;
    
public:
    Stack() {
        top = -1;
    }
    
    void push(T value) {
        if (top < 99) {
            arr[++top] = value;
        }
    }
    
    T pop() {
        if (top >= 0) {
            return arr[top--];
        }
        throw "Stack Underflow";
    }
};

// استخدام قالب الفئة
Stack<int> intStack;
Stack<string> stringStack;

intStack.push(10);
stringStack.push("Hello");
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=I-hZkUa9mIs",
        unitId: cppUnits[3].id,
        order: 1
      },
      // الوحدة الرابعة: البرمجة المتقدمة - الفصل 2
      {
        title: "استثناءات",
        description: "تعلم التعامل مع الاستثناءات",
        content: `
# الاستثناءات في ++C

## مفهوم الاستثناءات
الاستثناءات هي آلية للتعامل مع الأخطاء أثناء تنفيذ البرنامج.

## بناء الاستثناءات
\`\`\`cpp
// تعريف استثناء مخصص
class DivideByZeroException : public exception {
public:
    const char* what() const throw() {
        return "محاولة قسمة على صفر!";
    }
};

// استخدام الاستثناءات
double divide(int a, int b) {
    if (b == 0) {
        throw DivideByZeroException();
    }
    return static_cast<double>(a) / b;
}

int main() {
    try {
        double result = divide(10, 2);  // 5.0
        cout << "النتيجة: " << result << endl;
        
        result = divide(10, 0);  // سيثير استثناء
        cout << "لن يتم طباعة هذا النص" << endl;
    } catch (const DivideByZeroException& e) {
        cout << "خطأ: " << e.what() << endl;
    } catch (...) {
        cout << "حدث خطأ غير معروف" << endl;
    }
    
    return 0;
}
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=ZPzHLn0V3ZU",
        unitId: cppUnits[3].id,
        order: 2
      },
      // الوحدة الرابعة: البرمجة المتقدمة - الفصل 3
      {
        title: "البرمجة المتزامنة",
        description: "تعلم أساسيات البرمجة متعددة المسارات",
        content: `
# البرمجة المتزامنة في ++C

## الخيوط (Threads)
الخيوط هي وحدات تنفيذ متزامنة داخل نفس العملية.

\`\`\`cpp
#include <iostream>
#include <thread>
#include <mutex>

std::mutex mtx;  // لمنع التضارب في الوصول للموارد

void printNumbers(int start, int end, const std::string& threadName) {
    for (int i = start; i <= end; i++) {
        std::lock_guard<std::mutex> lock(mtx);  // اكتساب القفل
        std::cout << threadName << ": " << i << std::endl;
    }
}

int main() {
    std::thread t1(printNumbers, 1, 5, "الخيط 1");
    std::thread t2(printNumbers, 6, 10, "الخيط 2");
    
    t1.join();  // انتظار الخيط الأول حتى ينتهي
    t2.join();  // انتظار الخيط الثاني حتى ينتهي
    
    return 0;
}
\`\`\`

## متغيرات الشرط (Condition Variables)
\`\`\`cpp
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>

std::mutex mtx;
std::condition_variable cv;
bool ready = false;

void printNumbers() {
    std::unique_lock<std::mutex> lock(mtx);
    
    // انتظار الإشارة
    cv.wait(lock, [] { return ready; });
    
    std::cout << "تم استلام الإشارة!" << std::endl;
}

int main() {
    std::thread t(printNumbers);
    
    std::this_thread::sleep_for(std::chrono::seconds(2));
    
    {
        std::lock_guard<std::mutex> lock(mtx);
        ready = true;
    }
    
    cv.notify_one();  // إرسال الإشارة
    t.join();
    
    return 0;
}
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=TPVH_coGAQs",
        unitId: cppUnits[3].id,
        order: 3
      },
      // الوحدة الرابعة: البرمجة المتقدمة - الفصل 4
      {
        title: "البرمجة الوظيفية",
        description: "تعلم أساليب البرمجة الوظيفية في ++C",
        content: `
# البرمجة الوظيفية في ++C

## الدوال المجهولة (Lambda)
\`\`\`cpp
// تعريف دالة مجهولة
auto add = [](int a, int b) { return a + b; };

// استدعاء الدالة المجهولة
int result = add(3, 4);  // 7
\`\`\`

## العمليات على المجموعات
\`\`\`cpp
#include <algorithm>
#include <vector>
#include <iostream>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    
    // تحويل كل عنصر
    std::transform(numbers.begin(), numbers.end(), numbers.begin(),
                   [](int n) { return n * 2; });
    
    // طباعة النتائج
    for (int n : numbers) {
        std::cout << n << " ";  // 2 4 6 8 10
    }
    
    // تصفية العناصر
    std::vector<int> filtered;
    std::copy_if(numbers.begin(), numbers.end(), std::back_inserter(filtered),
                [](int n) { return n > 4; });
    
    // طباعة النتائج المصفاة
    for (int n : filtered) {
        std::cout << n << " ";  // 6 8 10
    }
    
    return 0;
}
\`\`\`

## دوال الترتيب العالي
\`\`\`cpp
// دالة تأخذ دالة كمعامل
template <typename Func>
void executeAndPrint(Func f, int value) {
    int result = f(value);
    std::cout << "النتيجة: " << result << std::endl;
}

int main() {
    // استدعاء الدالة باستخدام lambda
    executeAndPrint([](int x) { return x * x; }, 5);  // النتيجة: 25
    executeAndPrint([](int x) { return x + 10; }, 5);  // النتيجة: 15
    
    return 0;
}
\`\`\`
        `,
        videoYoutube: "https://www.youtube.com/watch?v=an3BgJDR5C0",
        unitId: cppUnits[3].id,
        order: 4
      }
    ]).returning();

    // C++ Lessons with key concepts
    const cppLessons = await db.insert(lessons).values([
      // الوحدة الأولى - الفصل الأول: المتغيرات وأنواع البيانات
      {
        title: "أنواع البيانات الأساسية",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[0].id,
        order: 1
      },
      {
        title: "تعريف المتغيرات",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[0].id,
        order: 2
      },
      {
        title: "الثوابت",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[0].id,
        order: 3
      },
      {
        title: "تحويل أنواع البيانات",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[0].id,
        order: 4
      },

      // الوحدة الأولى - الفصل الثاني: العمليات الحسابية والمنطقية
      {
        title: "العمليات الحسابية",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[1].id,
        order: 1
      },
      {
        title: "العمليات المنطقية",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[1].id,
        order: 2
      },
      {
        title: "العمليات الثنائية",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[1].id,
        order: 3
      },
      {
        title: "أولويات العمليات",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[1].id,
        order: 4
      },

      // الوحدة الأولى - الفصل الثالث: هياكل التحكم
      {
        title: "جملة if-else",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[2].id,
        order: 1
      },
      {
        title: "جملة switch",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[2].id,
        order: 2
      },
      {
        title: "حلقة for",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[2].id,
        order: 3
      },
      {
        title: "حلقات while و do-while",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[2].id,
        order: 4
      },
      
      // الوحدة الأولى - الفصل الرابع: الدوال
      {
        title: "تعريف واستدعاء الدوال",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[3].id,
        order: 1
      },
      {
        title: "تمرير المعاملات",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[3].id,
        order: 2
      },
      {
        title: "القيم الافتراضية",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[3].id,
        order: 3
      },
      {
        title: "تحميل الدوال",
        unitId: cppUnits[0].id,
        chapterId: cppChapters[3].id,
        order: 4
      },
      
      // الوحدة الثانية - الفصل الأول: الفئات والكائنات
      {
        title: "مفهوم الفئات",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[4].id,
        order: 1
      },
      {
        title: "البناة والهوادم",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[4].id,
        order: 2
      },
      {
        title: "الخصائص والسلوكيات",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[4].id,
        order: 3
      },
      {
        title: "أنواع الوصول",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[4].id,
        order: 4
      },
      
      // الوحدة الثانية - الفصل الثاني: الوراثة
      {
        title: "أساسيات الوراثة",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[5].id,
        order: 1
      },
      {
        title: "الوراثة المتعددة",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[5].id,
        order: 2
      },
      {
        title: "الوراثة متعددة المستويات",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[5].id,
        order: 3
      },
      {
        title: "الوراثة الهجينة",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[5].id,
        order: 4
      },
      
      // الوحدة الثانية - الفصل الثالث: تعدد الأشكال
      {
        title: "الدوال الافتراضية",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[6].id,
        order: 1
      },
      {
        title: "الدوال الافتراضية البحتة",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[6].id,
        order: 2
      },
      {
        title: "تجاوز الدوال",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[6].id,
        order: 3
      },
      {
        title: "الواجهات",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[6].id,
        order: 4
      },
      
      // الوحدة الثانية - الفصل الرابع: التغليف والتجريد
      {
        title: "مفهوم التغليف",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[7].id,
        order: 1
      },
      {
        title: "تطبيق التغليف",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[7].id,
        order: 2
      },
      {
        title: "مفهوم التجريد",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[7].id,
        order: 3
      },
      {
        title: "تطبيق التجريد",
        unitId: cppUnits[1].id,
        chapterId: cppChapters[7].id,
        order: 4
      },
      
      // الوحدة الثالثة - الفصل الأول: المصفوفات
      {
        title: "المصفوفات أحادية البعد",
        unitId: cppUnits[2].id,
        chapterId: cppChapters[8].id,
        order: 1
      },
      {
        title: "المصفوفات متعددة الأبعاد",
        unitId: cppUnits[2].id,
        chapterId: cppChapters[8].id,
        order: 2
      },
      {
        title: "تمرير المصفوفات للدوال",
        unitId: cppUnits[2].id,
        chapterId: cppChapters[8].id,
        order: 3
      },
      {
        title: "المصفوفات الديناميكية",
        unitId: cppUnits[2].id,
        chapterId: cppChapters[8].id,
        order: 4
      }
    ]).returning();

    // C++ Challenges with real programming questions
    const cppChallenges = await db.insert(challenges).values([
      // تحديات الوحدة الأولى - الفصل الأول: المتغيرات وأنواع البيانات
      {
        lessonId: cppLessons[0].id,
        type: "SELECT",
        question: "ما هو نوع البيانات المناسب لتخزين عمر شخص؟",
        order: 1
      },
      {
        lessonId: cppLessons[1].id,
        type: "SELECT",
        question: "كيف يتم تعريف متغير من نوع float في ++C؟",
        order: 1
      },
      {
        lessonId: cppLessons[2].id,
        type: "SELECT",
        question: "أي من التالي يمثل تعريفاً صحيحاً لثابت في ++C؟",
        order: 1
      },
      {
        lessonId: cppLessons[3].id,
        type: "SELECT",
        question: "ما هي نتيجة تحويل الرقم 5.7 إلى int؟",
        order: 1
      },
      
      // تحديات الوحدة الأولى - الفصل الثاني: العمليات الحسابية والمنطقية
      {
        lessonId: cppLessons[4].id,
        type: "SELECT",
        question: "ما هي نتيجة العملية: 15 % 4؟",
        order: 1
      },
      {
        lessonId: cppLessons[5].id,
        type: "SELECT",
        question: "ما هي نتيجة العملية المنطقية: true && false || true؟",
        order: 1
      },
      {
        lessonId: cppLessons[6].id,
        type: "SELECT",
        question: "ما هو ناتج العملية الثنائية: 5 & 3؟",
        order: 1
      },
      {
        lessonId: cppLessons[7].id,
        type: "SELECT",
        question: "أي من العمليات التالية لها أولوية أعلى؟",
        order: 1
      }
    ]).returning();

    // C++ Challenge Options with correct answers
    await db.insert(challengeOptions).values([
      // خيارات تحدي نوع البيانات المناسب للعمر
      {
        challengeId: cppChallenges[0].id,
        text: "int",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[0].id,
        text: "float",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      // خيارات تحدي تعريف float
      {
        challengeId: cppChallenges[1].id,
        text: "float x = 3.14;",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[1].id,
        text: "int x = 3.14;",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      // خيارات تحدي تعريف الثوابت
      {
        challengeId: cppChallenges[2].id,
        text: "const int MAX = 100;",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[2].id,
        text: "constant int MAX = 100;",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      // خيارات تحدي تحويل 5.7 إلى int
      {
        challengeId: cppChallenges[3].id,
        text: "5",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[3].id,
        text: "6",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      // خيارات تحدي باقي القسمة
      {
        challengeId: cppChallenges[4].id,
        text: "3",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[4].id,
        text: "4",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      // خيارات تحدي العمليات المنطقية
      {
        challengeId: cppChallenges[5].id,
        text: "true",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[5].id,
        text: "false",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      // خيارات تحدي العمليات الثنائية
      {
        challengeId: cppChallenges[6].id,
        text: "1",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[6].id,
        text: "8",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      // خيارات تحدي أولويات العمليات
      {
        challengeId: cppChallenges[7].id,
        text: "العمليات الحسابية (*، /) على العمليات المنطقية (&&، ||)",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: cppChallenges[7].id,
        text: "العمليات المنطقية (&&، ||) على العمليات الحسابية (*، /)",
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
      }
    ]).returning();

    // Python Chapters
    const pythonChapters = await db.insert(chapters).values([
      {
        title: "مقدمة في Python",
        description: "تعلم أساسيات لغة Python",
        content: `
# مقدمة في Python

Python هي لغة برمجة عالية المستوى، سهلة التعلم وقوية. تتميز بما يلي:

## المميزات الرئيسية
- بناء جملة واضح وبسيط
- مكتبة قياسية غنية
- تدعم البرمجة كائنية التوجه
- ديناميكية الأنواع

## المتغيرات والأنواع الأساسية
\`\`\`python
# الأعداد
x = 5       # integer
y = 3.14    # float

# النصوص
name = "Ahmed"

# القوائم
numbers = [1, 2, 3, 4, 5]

# القواميس
person = {
    "name": "Omar",
    "age": 25
}
\`\`\`
    `,
        videoYoutube: "https://www.youtube.com/watch?v=Y8Tko2YC5hA",
        unitId: pythonUnits[0].id,
        order: 1
      }
    ]).returning();

    // Python Lessons
    const pythonLessons = await db.insert(lessons).values([
      {
        title: "تثبيت Python وبيئة التطوير",
        unitId: pythonUnits[0].id,
        chapterId: pythonChapters[0].id,
        order: 1
      }
    ]).returning();

    // Python Challenges
    const pythonChallenges = await db.insert(challenges).values([
      {
        lessonId: pythonLessons[0].id,
        type: "SELECT",
        question: "أي من التالي يمثل تعريف قائمة (list) صحيح في Python؟",
        order: 1
      }
    ]).returning();

    // Python Challenge Options
    await db.insert(challengeOptions).values([
      {
        challengeId: pythonChallenges[0].id,
        text: "numbers = [1, 2, 3]",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: pythonChallenges[0].id,
        text: "numbers = {1, 2, 3}",
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
      }
    ]).returning();

    // Java Chapters
    const javaChapters = await db.insert(chapters).values([
      {
        title: "مقدمة في Java",
        description: "تعرف على لغة Java وبيئة التطوير",
        content: `
# مقدمة في لغة Java

Java هي لغة برمجة قوية وشائعة الاستخدام:
- تدعم البرمجة الشيئية بشكل كامل
- تعمل على جميع المنصات
- آمنة وموثوقة
- مناسبة لتطوير التطبيقات المؤسسية

## تثبيت JDK
1. تحميل Java Development Kit
2. تثبيت وإعداد متغيرات البيئة
3. التحقق من التثبيت
        `,
        videoYoutube: "https://www.youtube.com/watch?v=eIrMbAQSU34",
        unitId: javaUnits[0].id,
        order: 1
      },
      {
        title: "البرمجة كائنية التوجه في Java",
        description: "تعلم مفاهيم البرمجة كائنية التوجه في Java",
        content: `
# البرمجة كائنية التوجه في Java

## الفئات والكائنات
الفئة (Class) هي القالب الذي يحدد خصائص وسلوكيات الكائن.

\`\`\`java
public class Car {
    // الخصائص
    private String brand;
    private int year;
    
    // Constructor المُنشئ
    public Car(String brand, int year) {
        this.brand = brand;
        this.year = year;
    }
    
    // Getter methods دوال الحصول
    public String getBrand() {
        return brand;
    }
    
    public int getYear() {
        return year;
    }
    
    // Method دالة
    public void startEngine() {
        System.out.println("The " + brand + " engine is starting...");
    }
}

// إنشاء كائن
Car myCar = new Car("Toyota", 2023);
myCar.startEngine();
\`\`\`

## الوراثة (Inheritance)
\`\`\`java
public class ElectricCar extends Car {
    private int batteryCapacity;
    
    public ElectricCar(String brand, int year, int batteryCapacity) {
        super(brand, year);
        this.batteryCapacity = batteryCapacity;
    }
}
\`\`\`
    `,
        videoYoutube: "https://www.youtube.com/watch?v=pTB0EiLXUC8",
        unitId: javaUnits[0].id,
        order: 2
      }
    ]).returning();

    // Java Lessons
    const javaLessons = await db.insert(lessons).values([
      {
        title: "تثبيت Java Development Kit",
        unitId: javaUnits[0].id,
        chapterId: javaChapters[0].id,
        order: 1
      },
      {
        title: "البرمجة كائنية التوجه في Java",
        unitId: javaUnits[0].id,
        chapterId: javaChapters[1].id,
        order: 2
      }
    ]).returning();

    // Java Challenges
    const javaChallenges = await db.insert(challenges).values([
      {
        lessonId: javaLessons[0].id,
        type: "SELECT",
        question: "ما هو الامتداد الصحيح لملفات الجافا المصدرية؟",
        order: 1
      },
      {
        lessonId: javaLessons[1].id,
        type: "SELECT",
        question: "ما هي الكلمة المفتاحية المستخدمة للوراثة في Java؟",
        order: 1
      }
    ]).returning();

    // Java Challenge Options
    await db.insert(challengeOptions).values([
      {
        challengeId: javaChallenges[0].id,
        text: ".java",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: javaChallenges[0].id,
        text: ".class",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: javaChallenges[1].id,
        text: "extends",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: javaChallenges[1].id,
        text: "implements",
        correct: false,
        imageSrc: null,
        audioSrc: null
      }
    ]);

    // JavaScript Course Units
    const jsUnits = await db.insert(units).values([
      {
        title: "أساسيات JavaScript",
        description: "تعلم أساسيات لغة JavaScript وبرمجة الويب",
        courseId: jsCourse.id,
        order: 1
      }
    ]).returning();

    // JavaScript Chapters
    const jsChapters = await db.insert(chapters).values([
      {
        title: "مقدمة في JavaScript",
        description: "تعرف على لغة JavaScript وأساسياتها",
        content: `
# مقدمة في لغة JavaScript

JavaScript هي لغة برمجة أساسية للويب:
- تعمل في جميع المتصفحات
- تدعم البرمجة الوظيفية والشيئية
- غنية بالمكتبات والأطر
- مناسبة لتطوير واجهات المستخدم

## بيئة التطوير
1. محرر النصوص (VS Code)
2. متصفح حديث
3. أدوات المطور
        `,
        videoYoutube: "https://www.youtube.com/watch?v=PkZNo7MFNFg",
        unitId: jsUnits[0].id,
        order: 1
      },
      {
        title: "التعامل مع المصفوفات في JavaScript",
        description: "تعلم طرق التعامل مع المصفوفات وأهم الدوال المتاحة",
        content: `
# التعامل مع المصفوفات في JavaScript

## إنشاء المصفوفات
\`\`\`javascript
// طرق إنشاء المصفوفات
const numbers = [1, 2, 3, 4, 5];
const fruits = new Array('apple', 'banana', 'orange');

// المصفوفات متعددة الأنواع
const mixed = [1, 'hello', true, { name: 'John' }];
\`\`\`

## دوال المصفوفات الأساسية
\`\`\`javascript
const arr = [1, 2, 3, 4, 5];

// إضافة عناصر
arr.push(6);         // [1, 2, 3, 4, 5, 6]
arr.unshift(0);      // [0, 1, 2, 3, 4, 5, 6]

// حذف عناصر
arr.pop();           // [0, 1, 2, 3, 4, 5]
arr.shift();         // [1, 2, 3, 4, 5]

// البحث والتصفية
const found = arr.find(x => x > 3);     // 4
const filtered = arr.filter(x => x > 3); // [4, 5]

// التحويل
const doubled = arr.map(x => x * 2);     // [2, 4, 6, 8, 10]
\`\`\`

## التكرار على المصفوفات
\`\`\`javascript
const numbers = [1, 2, 3];

// for...of loop
for (const num of numbers) {
    console.log(num);
}

// forEach method
numbers.forEach(num => console.log(num));
\`\`\`
    `,
        videoYoutube: "https://www.youtube.com/watch?v=rRgD1yVwIvE",
        unitId: jsUnits[0].id,
        order: 2
      }
    ]).returning();

    // JavaScript Lessons
    const jsLessons = await db.insert(lessons).values([
      {
        title: "مقدمة في JavaScript",
        unitId: jsUnits[0].id,
        chapterId: jsChapters[0].id,
        order: 1
      },
      {
        title: "التعامل مع المصفوفات في JavaScript",
        unitId: jsUnits[0].id,
        chapterId: jsChapters[1].id,
        order: 2
      }
    ]).returning();

    // JavaScript Challenges
    const jsChallenges = await db.insert(challenges).values([
      {
        lessonId: jsLessons[0].id,
        type: "SELECT",
        question: "أي من التالي يستخدم لطباعة نص في وحدة تحكم المتصفح؟",
        order: 1
      },
      {
        lessonId: jsLessons[1].id,
        type: "SELECT",
        question: "أي من الدوال التالية تستخدم لإضافة عنصر في نهاية المصفوفة؟",
        order: 1
      }
    ]).returning();

    // JavaScript Challenge Options
    await db.insert(challengeOptions).values([
      {
        challengeId: jsChallenges[0].id,
        text: "console.log()",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: jsChallenges[0].id,
        text: "System.out.println()",
        correct: false,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: jsChallenges[1].id,
        text: "push()",
        correct: true,
        imageSrc: null,
        audioSrc: null
      },
      {
        challengeId: jsChallenges[1].id,
        text: "unshift()",
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


