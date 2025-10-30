import { useRef, useMemo, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface TextBlockProps {
  content: string | null | undefined;
  onChange: (content: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function TextBlock({ content, onChange, onFocus, onBlur }: TextBlockProps) {
  const quillRef = useRef<ReactQuill>(null);
  const [suggestions, setSuggestions] = useState<Array<{ username: string; display_name?: string | null }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionPos, setSuggestionPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link'],
        ['clean']
      ],
      handlers: {
        link: function(this: any) {
          // Custom handler to allow inserting a link with custom display text when nothing is selected
          const quill = quillRef.current?.getEditor();
          if (!quill) return;
          const range = quill.getSelection();
          const url = window.prompt('Enter URL (include https://)');
          if (!url) return;
          if (!range || range.length === 0) {
            const text = window.prompt('Enter the text to display for the link');
            if (!text) return;
            const index = (range && typeof range.index === 'number') ? range.index : quill.getLength();
            // Insert text then apply link attribute to that range - use correct insertText signature
            quill.insertText(index, text, {}, 'user');
            quill.formatText(index, text.length, 'link', url, 'user');
            quill.setSelection(index + text.length, 0);
          } else {
            // apply link to the selected range
            quill.format('link', url);
          }
        }
      }
    }
  }), []);

  const formats = useMemo(() => [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet',
    'indent',
    'align',
    'blockquote', 'code-block',
    'link'
  ], []);

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    let active = true;

    const checkForMention = async () => {
      const range = quill.getSelection();
      if (!range) {
        setShowSuggestions(false);
        return;
      }
      const index = range.index;
      const textBefore = quill.getText(0, index);
      const match = textBefore.match(/@([a-zA-Z0-9_]*)$/);
      if (!match) {
        setShowSuggestions(false);
        return;
      }
      const query = match[1];
      try {
        const bounds = quill.getBounds(index) as { left: number; top: number; height: number } | null;
        // approximate positioning relative to editor container
        const container = (quillRef.current as any)?.root?.parentElement;
        if (bounds) {
          if (container && container.getBoundingClientRect) {
            const rect = container.getBoundingClientRect();
            setSuggestionPos({ left: rect.left + bounds.left, top: rect.top + bounds.top + bounds.height });
          } else {
            setSuggestionPos({ left: bounds.left, top: bounds.top + bounds.height });
          }
        } else if (container && container.getBoundingClientRect) {
          // fallback to container bottom-left
          const rect = container.getBoundingClientRect();
          setSuggestionPos({ left: rect.left + 8, top: rect.top + 24 });
        }
      } catch (e) {
        // ignore positioning errors
      }

      if (query.length === 0) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username,display_name')
          .ilike('username', `${query}%`)
          .limit(6);
        if (error) throw error;
        if (!active) return;
        setSuggestions((data as any) || []);
        setShowSuggestions(((data as any) || []).length > 0);
      } catch (e) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const onChangeHandler = () => {
      checkForMention();
    };

    const onSelectionHandler = () => {
      checkForMention();
    };

    quill.on('text-change', onChangeHandler);
    quill.on('selection-change', onSelectionHandler);

    return () => {
      active = false;
      quill.off('text-change', onChangeHandler);
      quill.off('selection-change', onSelectionHandler);
    };
  }, []);

  const insertMention = (username: string) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;
    const range = quill.getSelection();
    const index = range ? range.index : quill.getLength();
    const textBefore = quill.getText(0, index);
    const match = textBefore.match(/@([a-zA-Z0-9_]*)$/);
    if (!match) return;
    const start = index - match[0].length;
    quill.deleteText(start, match[0].length);
    quill.insertText(start, `@${username} `, {}, 'user');
    quill.setSelection(start + username.length + 2, 0);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-[120px]">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content ?? ''}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        modules={modules}
        formats={formats}
        placeholder="Start writing..."
        className="border-none quill-editor"
        style={{
          minHeight: '100px',
        }}
      />

      {/* Simple suggestions popup — basic UI so state is used and clickable */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="fixed z-50 bg-popover border border-border rounded shadow-md overflow-hidden"
          style={{ left: suggestionPos.left, top: suggestionPos.top, minWidth: 200 }}
        >
          {suggestions.map((s) => (
            <button
              key={s.username}
              onMouseDown={(e) => {
                // prevent editor losing focus before we insert
                e.preventDefault();
                insertMention(s.username);
              }}
              className="w-full text-left px-3 py-2 hover:bg-muted"
            >
              {s.display_name ? `${s.display_name} (@${s.username})` : `@${s.username}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}