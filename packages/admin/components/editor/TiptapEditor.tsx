"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Undo,
  Redo,
  Code,
  Heading1,
  Heading2,
  Heading3,
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Write something...",
}: TiptapEditorProps) {
  const [showHTMLView, setShowHTMLView] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-brand-500 underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setHtmlContent(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3",
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      setHtmlContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleHTMLChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    setHtmlContent(newHtml);
    editor.commands.setContent(newHtml);
    onChange(newHtml);
  };

  const toggleHTMLView = () => {
    if (!showHTMLView) {
      setHtmlContent(editor.getHTML());
    }
    setShowHTMLView(!showHTMLView);
  };

  return (
    <div className="rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 p-2 dark:border-gray-700">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("heading", { level: 1 })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("heading", { level: 3 })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("bold")
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("italic")
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("underline")
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("bulletList")
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("orderedList")
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Alignment */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive({ textAlign: "left" })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive({ textAlign: "center" })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive({ textAlign: "right" })
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Link */}
        <button
          type="button"
          onClick={setLink}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            editor.isActive("link")
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-700" />

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="rounded p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="rounded p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>

        <div className="mx-2 h-6 w-px bg-gray-300 dark:bg-gray-700" />

        {/* HTML View Toggle */}
        <button
          type="button"
          onClick={toggleHTMLView}
          className={`rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
            showHTMLView
              ? "bg-gray-200 dark:bg-gray-700"
              : ""
          }`}
          title="HTML View"
        >
          <Code className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content or HTML View */}
      {showHTMLView ? (
        <textarea
          value={htmlContent}
          onChange={handleHTMLChange}
          className="w-full min-h-[200px] px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white/90 font-mono text-xs focus:outline-none"
          placeholder="Enter HTML code..."
        />
      ) : (
        <EditorContent editor={editor} className="dark:text-white/90" />
      )}
    </div>
  );
}
