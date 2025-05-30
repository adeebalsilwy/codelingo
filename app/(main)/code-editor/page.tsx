'use client';

import { useState } from 'react';
import { useI18n } from '@/app/i18n/client';
import { CodeEditor } from '@/app/components/CodeEditor';
import { cn } from '@/lib/utils';

const codeExamples = {
  cpp: `#include <iostream>
using namespace std;

// Function to calculate factorial
int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    // Basic output
    cout << "Hello, World!" << endl;
    
    // Variables and arithmetic
    int a = 10, b = 5;
    cout << "Sum: " << a + b << endl;
    cout << "Product: " << a * b << endl;
    
    // Array example
    int arr[] = {1, 2, 3, 4, 5};
    cout << "Array elements doubled: ";
    for(int i = 0; i < 5; i++) {
        cout << arr[i] * 2 << " ";
    }
    cout << endl;
    
    // Function call example
    cout << "Factorial of 5: " << factorial(5) << endl;
    
    // String manipulation
    string name = "CodeLingo";
    cout << "Reverse string: ";
    for(int i = name.length() - 1; i >= 0; i--) {
        cout << name[i];
    }
    cout << endl;
    
    return 0;
}`,
  javascript: `// JavaScript Example
console.log("Hello, World!");

// Define a function
function factorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

// Calculate factorial of 5
console.log("Factorial of 5 is:", factorial(5));

// Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
console.log("Doubled numbers:", doubled);

// Object example
const person = {
  name: "John",
  age: 30,
  greet: function() {
    return "Hello, my name is " + this.name;
  }
};

console.log(person.greet());`,
  python: `# Python Example
print("Hello, World!")

# Define a function
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

# Calculate factorial of 5
print("Factorial of 5 is:", factorial(5))

# List operations
numbers = [1, 2, 3, 4, 5]
doubled = [num * 2 for num in numbers]
print("Doubled numbers:", doubled)

# Dictionary example
person = {
    "name": "John",
    "age": 30
}

print(f"Hello, my name is {person['name']}")`,
};

const CodeEditorPage = () => {
  const { t, dir } = useI18n();
  const isRtl = dir === 'rtl';
  const [selectedExample, setSelectedExample] = useState('cpp');

  return (
    <div className={cn(
      'container mx-auto py-8',
      isRtl ? 'text-right' : 'text-left'
    )}>
      <h1 className="text-3xl font-bold mb-6">{t('editor.title')}</h1>
      
      <p className="mb-8 text-muted-foreground">
        {isRtl 
          ? 'استخدم محرر الأكواد لكتابة وتشغيل أكواد بلغات برمجة مختلفة. يمكنك تجربة الأمثلة أدناه أو كتابة الكود الخاص بك.'
          : 'Use the code editor to write and run code in different programming languages. You can try the examples below or write your own code.'
        }
      </p>
      
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedExample('cpp')}
          className={cn(
            'px-4 py-2 rounded-md transition-colors',
            selectedExample === 'cpp' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          C++
        </button>
        <button
          onClick={() => setSelectedExample('javascript')}
          className={cn(
            'px-4 py-2 rounded-md transition-colors',
            selectedExample === 'javascript' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          JavaScript
        </button>
        <button
          onClick={() => setSelectedExample('python')}
          className={cn(
            'px-4 py-2 rounded-md transition-colors',
            selectedExample === 'python' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted hover:bg-muted/80'
          )}
        >
          Python
        </button>
      </div>
      
      <div className={cn(
        'relative',
        isRtl ? 'direction-ltr' : ''
      )}>
        <CodeEditor 
          initialCode={codeExamples[selectedExample as keyof typeof codeExamples]} 
          language={selectedExample as any}
          height="500px"
        />
      </div>
      
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">
          {isRtl ? 'كيفية استخدام محرر الأكواد' : 'How to Use the Code Editor'}
        </h2>
        
        <ul className={cn(
          'list-disc space-y-2',
          isRtl ? 'pr-5' : 'pl-5'
        )}>
          <li>{isRtl ? 'اكتب الكود في المحرر' : 'Write code in the editor'}</li>
          <li>{isRtl ? 'اختر لغة البرمجة من القائمة المنسدلة' : 'Select a programming language from the dropdown'}</li>
          <li>{isRtl ? 'انقر على زر "تشغيل الكود" لتنفيذ الكود' : 'Click the "Run Code" button to execute the code'}</li>
          <li>{isRtl ? 'شاهد النتيجة في قسم المخرجات' : 'View the output in the output section'}</li>
          <li>{isRtl ? 'يمكنك نسخ الكود أو مسحه باستخدام الأزرار المتاحة' : 'You can copy or clear the code using the available buttons'}</li>
        </ul>
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="font-medium">
            {isRtl 
              ? 'ملاحظة: يتم تنفيذ كود JavaScript في المتصفح، بينما يتم تنفيذ ++C وPython على الخادم.'
              : 'Note: JavaScript code is executed in the browser, while C++ and Python are executed on the server.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPage; 