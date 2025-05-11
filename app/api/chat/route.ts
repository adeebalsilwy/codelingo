import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

// Initialize OpenAI only if API key is available
const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

interface Message {
  role: 'user' | 'assistant' | 'system' | 'function' | 'tool' | 'developer';
  content: string | { type: string; text: string }[];
  name?: string;
}

interface ChatRequest {
  messages: Message[];
  model: string;
}

const providers = {
  'gpt-4o': {
    execute: async (messages: any[]) => {
      if (!openai) {
        throw new Error('OpenAI API key not configured');
      }

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages,
          temperature: 0.7,
          max_tokens: 1500,
          store: true,
        });

        return completion.choices[0]?.message?.content || '';
      } catch (error: any) {
        if (error?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (error?.status === 401) {
          throw new Error('Invalid OpenAI API key');
        }
        console.error('OpenAI error details:', error);
        throw new Error(error?.message || 'OpenAI API error');
      }
    }
  },
  'gpt-4': {
    execute: async (messages: any[]) => {
      if (!openai) {
        throw new Error('OpenAI API key not configured');
      }

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          store: true,
        });

        return completion.choices[0]?.message?.content || '';
      } catch (error: any) {
        if (error?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (error?.status === 401) {
          throw new Error('Invalid OpenAI API key');
        }
        console.error('OpenAI error details:', error);
        throw new Error(error?.message || 'OpenAI API error');
      }
    }
  },
  'gpt-3.5': {
    execute: async (messages: any[]) => {
      if (!openai) {
        throw new Error('OpenAI API key not configured');
      }

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          store: true,
        });

        return completion.choices[0]?.message?.content || '';
      } catch (error: any) {
        if (error?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (error?.status === 401) {
          throw new Error('Invalid OpenAI API key');
        }
        console.error('OpenAI error details:', error);
        throw new Error(error?.message || 'OpenAI API error');
      }
    }
  },
  'falcon': {
    execute: async (messages: Message[]) => {
      if (!HUGGINGFACE_API_KEY) {
        throw new Error('HuggingFace API key not configured');
      }

      try {
        const response = await fetch(
          'https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct',
          {
            headers: {
              'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
              inputs: messages.map(m => m.content).join('\n'),
              parameters: {
                max_new_tokens: 1000,
                temperature: 0.7,
                return_full_text: false,
              }
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get response from Falcon model');
        }

        const result = await response.json();
        return result[0]?.generated_text || '';
      } catch (error: any) {
        throw new Error(error?.message || 'Falcon API error');
      }
    }
  },
  'bloom': {
    execute: async (messages: Message[]) => {
      if (!HUGGINGFACE_API_KEY) {
        throw new Error('HuggingFace API key not configured');
      }

      try {
        const response = await fetch(
          'https://api-inference.huggingface.co/models/bigscience/bloom',
          {
            headers: {
              'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
              inputs: messages.map(m => m.content).join('\n'),
              parameters: {
                max_new_tokens: 1000,
                temperature: 0.7,
                return_full_text: false,
              }
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get response from BLOOM model');
        }

        const result = await response.json();
        return result[0]?.generated_text || '';
      } catch (error: any) {
        throw new Error(error?.message || 'BLOOM API error');
      }
    }
  },
  'flan': {
    execute: async (messages: Message[]) => {
      if (!HUGGINGFACE_API_KEY) {
        throw new Error('HuggingFace API key not configured');
      }

      try {
        const response = await fetch(
          'https://api-inference.huggingface.co/models/google/flan-t5-xxl',
          {
            headers: {
              'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
              inputs: messages.map(m => m.content).join('\n'),
              parameters: {
                max_new_tokens: 1000,
                temperature: 0.7,
                return_full_text: false,
              }
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to get response from Flan-T5 model');
        }

        const result = await response.json();
        return result[0]?.generated_text || '';
      } catch (error: any) {
        throw new Error(error?.message || 'Flan-T5 API error');
      }
    }
  },
  'deepseek': {
    execute: async (messages: Message[]) => {
      if (!DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API key not configured');
      }

      try {
        // Convert messages to the format DeepSeek API expects
        const formattedMessages = messages.map(msg => {
          if (typeof msg.content === 'string') {
            return {
              role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
              content: msg.content
            };
          }
          // Handle the case where content is not a string (like OpenAI's format with objects)
          return {
            role: msg.role === 'system' ? 'system' : msg.role === 'user' ? 'user' : 'assistant',
            content: JSON.stringify(msg.content)
          };
        });
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-coder',
            messages: formattedMessages,
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('DeepSeek API error response:', errorText);
          
          try {
            const error = JSON.parse(errorText);
            throw new Error(error.error?.message || error.error || `Failed to get response from DeepSeek model: ${response.status}`);
          } catch (parseError) {
            throw new Error(`DeepSeek API error (${response.status}): ${errorText.slice(0, 100)}`);
          }
        }

        const result = await response.json();
        if (!result.choices || result.choices.length === 0) {
          console.warn('DeepSeek returned empty response:', result);
          return 'I apologize, but I was not able to generate a proper response. Please try again.';
        }
        
        // Extract the message content from DeepSeek's response format
        return result.choices[0].message.content || 'No response content';
      } catch (error: any) {
        console.error('DeepSeek API error details:', error);
        throw new Error(error?.message || 'DeepSeek API error');
      }
    }
  }
};

export async function POST(req: Request) {
  try {
    // Properly await auth to prevent headers() iteration warning
    const session = await auth();
    const { userId } = session || {};
    
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { messages, model } = await req.json() as ChatRequest;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400 }
      );
    }

    if (!model || !providers[model as keyof typeof providers]) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid model specified' }),
        { status: 400 }
      );
    }

    // Check if OpenAI is required but not configured
    if (['gpt-4o', 'gpt-4', 'gpt-3.5'].includes(model) && !OPENAI_API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: 'OpenAI API key not configured. Please try a different model.' }),
        { status: 503 }
      );
    }

    const systemMessage: Message = { 
      role: 'system', 
      content: 'You are a helpful educational assistant for Edu PRO, an educational platform focused on programming and coding. Provide clear, concise, and accurate responses. Your goal is to help users learn programming concepts and solve coding problems effectively.' 
    };

    const messagesWithSystem = [systemMessage, ...messages];
    const provider = providers[model as keyof typeof providers];
    const content = await provider.execute(messagesWithSystem);

    if (!content) {
      throw new Error('No response generated from the model');
    }

    return new NextResponse(
      JSON.stringify({ content }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Return a more descriptive error message
    const errorMessage = error.message || 'Internal server error';
    const statusCode = error.status || 500;
    
    return new NextResponse(
      JSON.stringify({ 
        error: errorMessage,
        errorDetail: error.stack?.split('\n')[0] || ''
      }),
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}