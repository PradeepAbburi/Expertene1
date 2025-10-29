import { useEffect, useRef, useState } from 'react';
import hljs from 'highlight.js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodePreviewProps {
  code: string;
  language?: string | null;
  collapseLines?: number; // number of lines to show before collapsing
  showLineNumbers?: boolean;
  tabSize?: number;
  label?: string | null;
}

export default function CodePreview({ code, language, collapseLines = 15, showLineNumbers = true, tabSize = 2, label }: CodePreviewProps) {
  const { toast } = useToast();
  const codeRef = useRef<HTMLElement | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [needsCollapse, setNeedsCollapse] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!codeRef.current) return;
    // Put raw code into textContent so highlight.js treats it as code and we avoid HTML injection
    codeRef.current.textContent = code;
    try {
      hljs.highlightElement(codeRef.current);
    } catch (e) {
      // fallback: try auto-detect
      try {
        hljs.highlightAuto(code);
      } catch {}
    }

  // Calculate lines and set collapsed height if needed
  const lines = code.split('\n').length;
    if (lines > collapseLines) {
      setNeedsCollapse(true);
      // measure line height
      const preEl = preRef.current;
      if (preEl) {
        const cs = getComputedStyle(preEl);
        const lineHeight = parseFloat(cs.lineHeight || '1.5') || 20;
        // If lineHeight is unitless (like 1.5), multiply by font-size
        let lineHeightPx = lineHeight;
        if (cs.lineHeight && cs.lineHeight.indexOf('px') === -1) {
          const fontSize = parseFloat(cs.fontSize || '16') || 16;
          lineHeightPx = lineHeight * fontSize;
        }
        setCollapsedHeight(Math.ceil(lineHeightPx * collapseLines));
      }
    } else {
      setNeedsCollapse(false);
      setCollapsedHeight(undefined);
    }
  }, [code, language, collapseLines]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast({ title: 'Copied', description: 'Code copied to clipboard.' });
    } catch (e) {
      toast({ title: 'Copy failed', description: 'Unable to copy code.', variant: 'destructive' });
    }
  };

  // prepare lines for gutter
  const lineArray = code.split('\n');

  return (
    <div className="mb-6">
      <div className="relative rounded-lg border border-border bg-muted">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{label ?? language ?? 'plaintext'}</Badge>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copy} title="Copy code">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
        </div>

        <div className="relative">
          {/* scroll container: holds both gutter and code so they scroll together */}
          <div
            className="w-full overflow-auto"
            style={needsCollapse && !expanded && collapsedHeight ? { maxHeight: `${collapsedHeight}px` } : {}}
          >
            <div className="flex w-full">
              {showLineNumbers && (
                <pre
                  aria-hidden
                  className="m-0 p-4 pr-2 select-none text-right text-xs text-muted-foreground font-mono"
                  style={{ lineHeight: '1.6', userSelect: 'none', width: 56 }}
                >
                  {lineArray.map((_, i) => (
                    // keep numbers starting at 1
                    <div key={i} className="h-[1.6em] leading-[1.6em]">{i + 1}</div>
                  ))}
                </pre>
              )}

              <pre
                ref={preRef}
                className="m-0 p-4 overflow-x-auto font-mono text-sm whitespace-pre w-full"
                style={{ tabSize: tabSize } as any}
                aria-label={`Code snippet: ${language || 'plaintext'}`}
              >
                <code
                  ref={codeRef as any}
                  className={`language-${language || 'plaintext'}`}
                />
              </pre>
            </div>
          </div>

          {/* bottom-centered gradient + arrow overlay (shows when collapsed) */}
          {needsCollapse && !expanded && (
            <div className="absolute left-0 right-0 bottom-0 flex items-end justify-center z-20" style={{ height: 80, pointerEvents: 'none' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-muted/90 to-transparent" />
              <div style={{ pointerEvents: 'auto' }} className="mb-3">
                <Button variant="ghost" size="sm" onClick={() => setExpanded(true)} title="Show full code">
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* when expanded, show a small collapse button at bottom-center */}
          {needsCollapse && expanded && (
            <div className="absolute left-0 right-0 bottom-0 flex items-end justify-center z-20" style={{ height: 64 }}>
              <div style={{ pointerEvents: 'auto' }} className="mb-3">
                <Button variant="ghost" size="sm" onClick={() => setExpanded(false)} title="Collapse code">
                  <ChevronUp className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
