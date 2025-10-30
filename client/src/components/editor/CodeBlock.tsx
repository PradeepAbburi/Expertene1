import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Code as CodeIcon, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CodePreview from '@/components/CodePreview';
import { useState } from 'react';

interface CodeContent {
  code: string | null | undefined;
  language: string | null | undefined;
  label?: string | null | undefined;
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
  const [showPreview, setShowPreview] = useState(true);
  const { toast } = useToast();

  const handleCodeChange = (code: string) => {
    onChange({ ...content, code });
  };

  const handleLanguageChange = (language: string) => {
    onChange({ ...content, language });
  };

  const handleLabelChange = (label: string) => {
    onChange({ ...content, label });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content.code ?? '');
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowPreview((s) => !s)}>
            {showPreview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="code-label">Label</Label>
          <input
            id="code-label"
            value={content.label ?? ''}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Optional name (e.g. Example, Output)"
            className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm"
          />
        </div>
        <div>
          <Label htmlFor="language">Language</Label>
          <Select value={content.language ?? undefined} onValueChange={handleLanguageChange}>
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
          value={content.code ?? ''}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="Enter your code here..."
          rows={8}
          className="font-mono text-sm"
        />
      </div>

      {content.code && showPreview && (
        <div>
          {/* Use the shared CodePreview so the write page matches the article preview exactly */}
          <CodePreview code={content.code ?? ''} language={content.language ?? undefined} label={content.label ?? undefined} />
        </div>
      )}
    </div>
  );
}