import { useEffect, useState } from 'react';

interface MentionedHtmlProps {
  html: string | null | undefined;
}

export default function MentionedHtml({ html }: MentionedHtmlProps) {
  const [processed, setProcessed] = useState<string>('');

  useEffect(() => {
    if (!html) {
      setProcessed('');
      return;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const skipTag = (el: Element | null) => {
        if (!el) return false;
        const tag = el.tagName.toUpperCase();
        return ['A', 'CODE', 'PRE', 'SCRIPT', 'STYLE', 'TEXTAREA'].includes(tag);
      };

      const mentionRe = /\B@([a-zA-Z0-9_]{1,30})/g;

      const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const parent = node.parentElement;
          if (skipTag(parent)) return;
          const text = node.textContent || '';
          let match: RegExpExecArray | null;
          let lastIndex = 0;
          const frag = document.createDocumentFragment();
          let replaced = false;
          while ((match = mentionRe.exec(text)) !== null) {
            replaced = true;
            const before = text.slice(lastIndex, match.index);
            if (before) frag.appendChild(document.createTextNode(before));
            const a = document.createElement('a');
            const username = match[1];
            a.href = `/profile/${encodeURIComponent(username)}`;
            a.textContent = `@${username}`;
            a.className = 'text-primary hover:underline';
            frag.appendChild(a);
            lastIndex = match.index + match[0].length;
          }
          if (replaced) {
            const after = text.slice(lastIndex);
            if (after) frag.appendChild(document.createTextNode(after));
            node.parentNode?.replaceChild(frag, node);
          }
        } else {
          node.childNodes.forEach(walk);
        }
      };

      walk(doc.body);
      setProcessed(doc.body.innerHTML);
    } catch (e) {
      setProcessed(html || '');
    }
  }, [html]);

  return <div dangerouslySetInnerHTML={{ __html: processed }} />;
}
