"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import type { AnyExtension } from "@tiptap/core";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  placeholder = "Start writing …",
}) => {
  const editor = useEditor(
    {
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: true,
        }),
        Image.configure({
          HTMLAttributes: {
            class: "max-w-full h-auto",
          },
        }),
        Placeholder.configure({
          placeholder,
        }),
      ] as AnyExtension[], // ✅ THIS IS THE KEY FIX

      content,

      editorProps: {
        attributes: {
          class:
            "prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none min-h-[200px] p-2",
        },
      },

      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },

      immediatelyRender: false, // ✅ correct for Next.js
    },
    []
  );

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded p-2">
      <div className="flex gap-2 mb-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};
