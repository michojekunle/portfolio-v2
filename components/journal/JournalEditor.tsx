import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import { SlashCommand, slashSuggestion } from "@/lib/journal/slash-extension";

interface JournalEditorProps {
  content: string | null;
  onChange: (html: string) => void;
}

export function JournalEditor({ content, onChange }: JournalEditorProps) {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false, // We disable codeBlock for Journal minimalism
      }),
      Placeholder.configure({
        placeholder: "Type '/' for commands, or just start writing your day...",
        emptyEditorClass: "is-editor-empty",
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      SlashCommand.configure({
        suggestion: slashSuggestion,
      }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none min-h-[400px] journal-editor-instance",
      },
    },
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="w-full text-[var(--ink)]">
      <EditorContent editor={editor} />
      
      <style>{`
        .journal-editor-instance p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--ink-4);
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        
        .journal-editor-instance p { font-size: 15px; line-height: 1.6; margin-top: 8px; margin-bottom: 8px; }
        .journal-editor-instance h1 { font-family: var(--font-display); font-size: 32px; font-weight: 500; margin-top: 24px; margin-bottom: 12px; letter-spacing: -0.02em; }
        .journal-editor-instance h2 { font-family: var(--font-display); font-size: 24px; font-weight: 500; margin-top: 20px; margin-bottom: 10px; letter-spacing: -0.01em; }
        .journal-editor-instance h3 { font-family: var(--font-display); font-size: 20px; font-weight: 500; margin-top: 16px; margin-bottom: 8px; }
        
        .journal-editor-instance ul, .journal-editor-instance ol { padding-left: 24px; margin-top: 8px; margin-bottom: 8px; }
        .journal-editor-instance li { margin-bottom: 4px; }
        .journal-editor-instance ul { list-style-type: disc; }
        .journal-editor-instance ol { list-style-type: decimal; }
        
        .journal-editor-instance blockquote { border-left: 3px solid var(--accent); padding-left: 16px; font-style: italic; color: var(--ink-3); margin-top: 16px; margin-bottom: 16px; }
        .journal-editor-instance hr { border: none; border-top: 1px solid var(--rule); margin-top: 32px; margin-bottom: 32px; }
        
        .journal-editor-instance ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .journal-editor-instance ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
        .journal-editor-instance ul[data-type="taskList"] input[type="checkbox"] { width: 16px; height: 16px; margin-top: 4px; cursor: pointer; accent-color: var(--accent); border-radius: 4px; border: 1px solid var(--rule); }
      `}</style>
    </div>
  );
}
