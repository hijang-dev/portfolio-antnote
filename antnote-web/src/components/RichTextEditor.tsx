'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorToolbar } from './EditorToolbar';

interface RichTextEditorProps {
  content?: string;
  onChange: (html: string) => void;
}

/**
 * codeBlock/horizontalRule disabled to keep the schema small — the
 * backend's sanitizer allow-list (src/common/sanitize/sanitize-rich-text.ts
 * on the API side) mirrors exactly what's enabled here.
 */
export function RichTextEditor({
  content = '',
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false,
        horizontalRule: false,
      }),
    ],
    content,
    // Avoid SSR hydration mismatch — Tiptap renders client-side only.
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          'prose prose-sm dark:prose-invert max-w-none min-h-[120px] px-3 py-2 focus:outline-none',
      },
    },
  });

  return (
    <div className="rounded-md border border-black/15 dark:border-white/20">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
