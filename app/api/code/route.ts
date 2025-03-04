import { NextRequest, NextResponse } from 'next/server';

// Language mappings for Piston API
const LANGUAGE_MAPPINGS = {
  python: 'python',
  cpp: 'cpp',
  javascript: 'javascript',
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
        source: code,
      }),
    });

    const result = await response.json();

    return NextResponse.json({
      output: result.output || result.stderr || 'No output',
      status: result.code === 0 ? 'success' : 'error',
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