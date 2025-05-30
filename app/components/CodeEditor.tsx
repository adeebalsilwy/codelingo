'use client';

import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useI18n } from '@/app/i18n/client';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { 
  Play, 
  Trash2, 
  Copy, 
  Save, 
  Share2, 
  Maximize, 
  Minimize,
  Code,
  Check
} from 'lucide-react';

type ProgrammingLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'php' | 'ruby' | 'go' | 'rust' | 'html' | 'css';

type EditorTheme = 'vs' | 'vs-dark' | 'hc-black';

interface CodeEditorProps {
  initialCode?: string;
  language?: ProgrammingLanguage;
  readOnly?: boolean;
  height?: string;
  className?: string;
}

export const CodeEditor = ({
  initialCode = '',
  language = 'javascript',
  readOnly = false,
  height = '400px',
  className,
}: CodeEditorProps) => {
  const { t, dir } = useI18n();
  const isRtl = dir === 'rtl';
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<ProgrammingLanguage>(language);
  const [theme, setTheme] = useState<EditorTheme>('vs-dark');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Handle RTL text direction
  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.updateOptions({
        readOnly: readOnly,
        minimap: { enabled: false },
        wordWrap: 'on',
        lineNumbers: 'on',
        renderSideBySide: false,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible'
        },
        // Force LTR for code
        direction: 'ltr',
        // Additional settings for better RTL support
        renderWhitespace: 'all',
        renderControlCharacters: true,
        autoClosingBrackets: 'always',
        autoClosingQuotes: 'always'
      });
    }
  }, [isRtl, readOnly]);

  const languageOptions: { value: ProgrammingLanguage; label: string }[] = [
    { value: 'cpp', label: 'C++' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
  ];

  const themeOptions: { value: EditorTheme; label: string }[] = [
    { value: 'vs', label: 'Light' },
    { value: 'vs-dark', label: 'Dark' },
    { value: 'hc-black', label: 'High Contrast' },
  ];

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    // Set initial editor options
    editor.updateOptions({
      direction: 'ltr',
      readOnly: readOnly,
      minimap: { enabled: false },
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'all',
      renderControlCharacters: true,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always'
    });
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      // For JavaScript, we can use client-side execution
      if (selectedLanguage === 'javascript' && typeof window !== 'undefined') {
        // Create a sandbox for evaluation
        const originalConsoleLog = console.log;
        let output = '';
        
        // Override console.log to capture output
        console.log = (...args) => {
          output += args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' ') + '\n';
        };
        
        try {
          // Use Function constructor to avoid direct eval
          const runFunction = new Function(code);
          runFunction();
          setOutput(output || t('editor.success'));
        } catch (error: any) {
          setOutput(`${t('editor.error')}: ${error.message}`);
        } finally {
          // Restore original console.log
          console.log = originalConsoleLog;
        }
      } else {
        // For other languages (C++, Python, etc.), use server-side execution
        const response = await fetch('/api/code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            language: selectedLanguage,
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          if (data.status === 'error') {
            setOutput(`${t('editor.error')}: ${data.output}`);
          } else {
            setOutput(data.output);
          }
        } else {
          setOutput(`${t('editor.error')}: ${data.error}`);
        }
      }
    } catch (error: any) {
      setOutput(`${t('editor.error')}: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearCode = () => {
    setCode('');
    setOutput('');
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isFullscreen]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        'border rounded-lg overflow-hidden',
        isFullscreen ? 'fixed inset-0 z-50 bg-background' : '',
        className
      )}
    >
      <div className={cn(
        'flex items-center justify-between p-2 bg-muted',
        isRtl ? 'flex-row-reverse' : ''
      )}>
        <div className={cn(
          'flex items-center gap-2',
          isRtl ? 'flex-row-reverse' : ''
        )}>
          <Code className="h-5 w-5" />
          <h3 className="font-medium">{t('editor.title')}</h3>
        </div>
        <div className={cn(
          'flex items-center gap-2',
          isRtl ? 'flex-row-reverse' : ''
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm">
                {selectedLanguage}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? 'end' : 'start'}>
              {languageOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedLanguage(option.value)}
                  className={cn(
                    selectedLanguage === option.value ? 'font-bold' : '',
                    isRtl ? 'flex-row-reverse' : ''
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm">
                {t('editor.theme')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isRtl ? 'end' : 'start'}>
              {themeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={cn(
                    theme === option.value ? 'font-bold' : '',
                    isRtl ? 'flex-row-reverse' : ''
                  )}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="default"
            size="icon"
            onClick={toggleFullscreen}
            title={isFullscreen ? t('editor.exit_fullscreen') : t('editor.fullscreen')}
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="relative">
        <Editor
          height={isFullscreen ? 'calc(100vh - 200px)' : height}
          language={selectedLanguage}
          value={code}
          theme={theme}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            tabSize: 2,
            automaticLayout: true,
            wordWrap: 'on',
          }}
        />
      </div>
      
      <div className={cn(
        'flex items-center justify-between p-2 bg-muted',
        isRtl ? 'flex-row-reverse' : ''
      )}>
        <div className={cn(
          'flex items-center gap-2',
          isRtl ? 'flex-row-reverse' : ''
        )}>
          <Button
            variant="default"
            size="sm"
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            className={cn(
              isRtl ? 'flex-row-reverse' : ''
            )}
          >
            {isRunning ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <Play className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
            )}
            {isRunning ? t('editor.running') : t('editor.run')}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={clearCode}
            disabled={!code.trim()}
            className={cn(
              isRtl ? 'flex-row-reverse' : ''
            )}
          >
            <Trash2 className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
            {t('editor.clear')}
          </Button>
        </div>
        
        <div className={cn(
          'flex items-center gap-2',
          isRtl ? 'flex-row-reverse' : ''
        )}>
          <Button
            variant="default"
            size="sm"
            onClick={copyCode}
            disabled={!code.trim()}
            className={cn(
              isRtl ? 'flex-row-reverse' : ''
            )}
          >
            {isCopied ? (
              <Check className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
            ) : (
              <Copy className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
            )}
            {isCopied ? t('editor.success') : t('editor.copy')}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => {}}
            disabled={!code.trim()}
            className={cn(
              isRtl ? 'flex-row-reverse' : ''
            )}
          >
            <Save className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
            {t('editor.save')}
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => {}}
            disabled={!code.trim()}
            className={cn(
              isRtl ? 'flex-row-reverse' : ''
            )}
          >
            <Share2 className={cn("h-4 w-4", isRtl ? "ml-2" : "mr-2")} />
            {t('editor.share')}
          </Button>
        </div>
      </div>
      
      {output && (
        <div className={cn(
          'p-4 bg-black text-white font-mono text-sm overflow-auto',
          isRtl ? 'text-right' : 'text-left'
        )} style={{ maxHeight: '200px', direction: 'ltr' }}>
          <h4 className={cn(
            'text-xs uppercase mb-2 text-gray-400',
            isRtl ? 'text-right' : 'text-left'
          )}>{t('editor.output')}</h4>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      )}
    </div>
  );
};