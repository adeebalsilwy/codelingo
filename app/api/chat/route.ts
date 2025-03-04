import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

// API Keys and URLs for different models
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

interface AIProvider {
  name: string;
  apiKey: string | undefined;
  url: string;
  formatRequest: (messages: any[]) => any;
  formatResponse: (data: any) => string;
}

const providers: AIProvider[] = [
  {
    name: 'openai',
    apiKey: OPENAI_API_KEY,
    url: OPENAI_API_URL,
    formatRequest: (messages) => ({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
    formatResponse: (data) => data.choices[0].message.content,
  },
  {
    name: 'deepseek',
    apiKey: DEEPSEEK_API_KEY,
    url: DEEPSEEK_API_URL,
    formatRequest: (messages) => ({
      model: 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
    formatResponse: (data) => data.choices[0].message.content,
  },
  {
    name: 'anthropic',
    apiKey: ANTHROPIC_API_KEY,
    url: ANTHROPIC_API_URL,
    formatRequest: (messages) => ({
      model: 'claude-2',
      messages: messages.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      max_tokens: 1000,
    }),
    formatResponse: (data) => data.content,
  },
];

async function tryProvider(provider: AIProvider, messages: any[]) {
  if (!provider.apiKey) return null;

  try {
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify(provider.formatRequest(messages)),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`${provider.name} API error:`, error);
      return null;
    }

    const data = await response.json();
    return provider.formatResponse(data);
  } catch (error) {
    console.error(`${provider.name} API error:`, error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { messages } = await request.json();

    // Try each provider in sequence until one works
    for (const provider of providers) {
      const result = await tryProvider(provider, messages);
      if (result) {
        return NextResponse.json({ message: result });
      }
    }

    throw new Error('No AI providers available');

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 