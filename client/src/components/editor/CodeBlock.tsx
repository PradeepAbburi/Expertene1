import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Code as CodeIcon, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import hljs from 'highlight.js';
import { useEffect, useRef } from 'react';

interface CodeContent {
  code: string | null | undefined;
  language: string | null | undefined;
}

interface CodeBlockProps {
  content: CodeContent;
  onChange: (content: CodeContent) => void;
  onDelete: () => void;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'plaintext', label: 'Plain Text' },
];

export function CodeBlock({ content, onChange, onDelete }: CodeBlockProps) {
  const { toast } = useToast();
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && content.code) {
      hljs.highlightElement(codeRef.current);
    }
  }, [content.code, content.language]);

  const handleCodeChange = (code: string) => {
    onChange({ ...content, code });
  };

  const handleLanguageChange = (language: string) => {
    onChange({ ...content, language });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content.code);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <CodeIcon className="h-4 w-4" />
          Code Block
        </h4>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="language">Language</Label>
          <Select value={content.language} onValueChange={handleLanguageChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {content.code && (
          <div className="flex items-end">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="code">Code</Label>
        <Textarea
          id="code"
          value={content.code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="Enter your code here..."
          rows={8}
          className="font-mono text-sm"
        />
      </div>

      {content.code && (
        <div className="relative">
          <div className="absolute top-2 right-2 z-10">
            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code
              ref={codeRef}
              className={`language-${content.language}`}
            >
              {content.code}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}