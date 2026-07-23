"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TipImage from "@tiptap/extension-image";
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Link as LinkIcon, Image as ImageIcon, Quote, Minus,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Tiptap muharriri — maqola matni uchun.
 * value: HTML; onChange: HTML qaytaradi.
 */
export function RichEditor({
  value,
  onChange,
  onPickImage,
}: {
  value: string;
  onChange: (html: string) => void;
  onPickImage?: () => Promise<string | null>;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      TipImage,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[220px] rounded-b-md border border-t-0 bg-white px-4 py-3 text-sm focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // tashqi value o'zgarsa (til almashganda) sinxronlash
  useEffect(() => {
    if (editor && editor.getHTML() !== value) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return <div className="h-[260px] rounded-md border bg-neutral-50" />;

  const btn = (active: boolean) =>
    cn(
      "rounded p-1.5 hover:bg-neutral-100",
      active && "bg-neutral-200 text-[#C8102E]",
    );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border bg-neutral-50 px-2 py-1">
        <button type="button" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-3.5 w-3.5" />
        </button>
        <span className="mx-1 h-4 w-px bg-neutral-200" />
        <button type="button" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="h-3.5 w-3.5" />
        </button>
        <span className="mx-1 h-4 w-px bg-neutral-200" />
        <button type="button" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-3.5 w-3.5" />
        </button>
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="mx-1 h-4 w-px bg-neutral-200" />
        <button
          type="button"
          className={btn(editor.isActive("link"))}
          onClick={() => {
            const prev = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("Havola URL:", prev ?? "https://");
            if (url === null) return;
            if (url === "") editor.chain().focus().unsetLink().run();
            else editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </button>
        {onPickImage && (
          <button
            type="button"
            className={btn(false)}
            onClick={async () => {
              const url = await onPickImage();
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
