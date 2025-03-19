import { NextRequest, NextResponse } from 'next/server';

// Language mappings for Piston API
const LANGUAGE_MAPPINGS = {
  python: 'python',
  cpp: 'cpp',
  javascript: 'javascript',
};

// Version mappings for each language
const VERSION_MAPPINGS = {
  cpp: '10.2.0',
  python: '3.10.0',
  javascript: '18.15.0'
};

// Function to handle HTML/CSS code
function handleWebCode(code: string, language: string) {
  if (language === 'html') {
    return {
      output: code,
      type: 'html',
    };
  }
  if (language === 'css') {
    return {
      output: code,
      type: 'css',
    };
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { code, language } = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: 'Code and language are required' },
        { status: 400 }
      );
    }

    // Handle HTML and CSS directly
    const webResult = handleWebCode(code, language);
    if (webResult) {
      return NextResponse.json(webResult);
    }

    // For other languages, use Piston API
    const pistonLanguage = LANGUAGE_MAPPINGS[language as keyof typeof LANGUAGE_MAPPINGS];
    if (!pistonLanguage) {
      return NextResponse.json(
        { error: `Language '${language}' is not supported` },
        { status: 400 }
      );
    }

    // Execute code using Piston API
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: pistonLanguage,
        version: VERSION_MAPPINGS[language as keyof typeof VERSION_MAPPINGS],
        files: [{
          name: language === 'cpp' ? 'main.cpp' : 'main',
          content: code
        }],
        stdin: '',
        compile_timeout: 10000,
        run_timeout: 5000,
        compile_memory_limit: -1,
        run_memory_limit: -1,
      }),
    });

    const result = await response.json();

    // Handle compilation errors for C++
    if (language === 'cpp' && result.compile_error) {
      return NextResponse.json({
        output: `Compilation Error:\n${result.compile_error}`,
        status: 'error',
        language,
      });
    }

    // Combine stdout and stderr for complete output
    const output = [
      result.run?.stdout,
      result.run?.stderr,
      result.compile_error,
    ].filter(Boolean).join('\n');

    return NextResponse.json({
      output: output || 'No output',
      status: (result.run?.code === 0 && !result.compile_error) ? 'success' : 'error',
      language,
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}