"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

import { 
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, 
  Quote, List, ListOrdered, Undo, Redo, Link2, Image as ImageIcon,
  Underline as UnderlineIcon, Table as TableIcon, CheckSquare, 
  Minus, Code2, PlusSquare
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (html: string, text: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/20 border-b border-border">
      <div className="flex items-center gap-0.5 mr-1">
        <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} title="Bold">
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} title="Italic">
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="w-[1px] h-4 bg-border mx-1" />

      <div className="flex items-center gap-0.5 mr-1">
        <Toggle size="sm" pressed={editor.isActive("heading", { level: 1 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("heading", { level: 2 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("heading", { level: 3 })} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">
          <Heading3 className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="w-[1px] h-4 bg-border mx-1" />

      <div className="flex items-center gap-0.5 mr-1">
        <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("taskList")} onPressedChange={() => editor.chain().focus().toggleTaskList().run()} title="Task List">
          <CheckSquare className="h-4 w-4" />
        </Toggle>
      </div>

      <div className="w-[1px] h-4 bg-border mx-1" />

      <div className="flex items-center gap-0.5 mr-1">
        <Toggle size="sm" pressed={editor.isActive("blockquote")} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
          <Quote className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("code")} onPressedChange={() => editor.chain().focus().toggleCode().run()} title="Inline Code">
          <Code className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("codeBlock")} onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()} title="Code Block">
          <Code2 className="h-4 w-4" />
        </Toggle>
        <button 
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-border mx-1" />

      <div className="flex items-center gap-0.5">
        <button 
          type="button"
          onClick={() => {
            const url = prompt("Enter link URL:");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          className={`p-1.5 rounded-md transition-colors ${editor.isActive("link") ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={addTable}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1" />
      
      <div className="flex items-center gap-0.5">
        <button 
          type="button"
          onClick={() => editor.chain().focus().undo().run()} 
          disabled={!editor.can().undo()} 
          className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-md hover:bg-muted"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button 
          type="button"
          onClick={() => editor.chain().focus().redo().run()} 
          disabled={!editor.can().redo()} 
          className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 rounded-md hover:bg-muted"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your article…" }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none min-h-[500px] p-8 focus:outline-none prose-p:leading-relaxed blog-editor-instance",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
  });

  return (
    <div className="border border-border rounded-xl bg-background/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 shadow-md overflow-hidden transition-all relative">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      
      <style>{`
        .blog-editor-instance h1 { font-size: 2.5rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.1; color: hsl(var(--foreground)); }
        .blog-editor-instance h2 { font-size: 2rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.2; color: hsl(var(--foreground)); border-bottom: 1px solid hsl(var(--border)); padding-bottom: 0.5rem; }
        .blog-editor-instance h3 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.75rem; line-height: 1.3; color: hsl(var(--foreground)); }
        .blog-editor-instance p { margin: 1rem 0; font-size: 1.1rem; line-height: 1.7; }
        .blog-editor-instance ul { list-style-type: disc; padding-left: 1.5rem; margin: 1rem 0; }
        .blog-editor-instance ol { list-style-type: decimal; padding-left: 1.5rem; margin: 1rem 0; }
        .blog-editor-instance li { margin-bottom: 0.5rem; }
        .blog-editor-instance blockquote { border-left: 4px solid hsl(var(--primary)); padding: 0.75rem 1.5rem; font-style: italic; color: hsl(var(--muted-foreground)); background: hsl(var(--muted)/0.3); border-radius: 0 0.5rem 0.5rem 0; margin: 2rem 0; }
        .blog-editor-instance img { max-width: 100%; border-radius: 1rem; margin: 2.5rem auto; border: 1px solid hsl(var(--border)); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .blog-editor-instance a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 4px; font-weight: 500; }
        .blog-editor-instance hr { border: 0; border-top: 2px solid hsl(var(--border)); margin: 3rem 0; }
        
        /* Tables */
        .blog-editor-instance table { border-collapse: collapse; table-layout: fixed; width: 100%; margin: 2rem 0; overflow: hidden; border-radius: 0.5rem; border: 1px solid hsl(var(--border)); }
        .blog-editor-instance table td, .blog-editor-instance table th { border: 1px solid hsl(var(--border)); box-sizing: border-box; min-width: 1em; padding: 0.75rem 1rem; position: relative; vertical-align: top; }
        .blog-editor-instance table th { background-color: hsl(var(--muted)/0.5); font-weight: bold; text-align: left; }
        
        /* Task Lists */
        .blog-editor-instance ul[data-type="taskList"] { list-style: none; padding: 0; }
        .blog-editor-instance ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.5rem; }
        .blog-editor-instance ul[data-type="taskList"] input[type="checkbox"] { width: 1.2rem; height: 1.2rem; margin-top: 0.25rem; cursor: pointer; }
        
        /* Code Blocks */
        .blog-editor-instance pre { background: #0d1117; color: #c9d1d9; border-radius: 0.75rem; padding: 1.5rem; font-family: 'JetBrains Mono', monospace; font-size: 0.95rem; margin: 2rem 0; overflow-x: auto; }
        .blog-editor-instance pre code { background: none; color: inherit; padding: 0; }
        .hljs-comment, .hljs-quote { color: #8b949e; font-style: italic; }
        .hljs-keyword, .hljs-selector-tag { color: #ff7b72; }
        .hljs-string, .hljs-doctag, .hljs-regexp, .hljs-attr, .hljs-template-punctuation, .hljs-template-variable { color: #a5d6ff; }
        .hljs-title, .hljs-section, .hljs-type, .hljs-name { color: #ffa657; }
        .hljs-variable, .hljs-template-variable { color: #ffa657; }
      `}</style>
    </div>
  );
}
