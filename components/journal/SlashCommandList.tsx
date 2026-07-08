import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Heading1, Heading2, Heading3, List, ListOrdered, CheckSquare, Minus, Quote } from "lucide-react";

export const COMMAND_ITEMS = [
  { title: "Heading 1", icon: <Heading1 size={16} />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run() },
  { title: "Heading 2", icon: <Heading2 size={16} />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run() },
  { title: "Heading 3", icon: <Heading3 size={16} />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run() },
  { title: "To-do List", icon: <CheckSquare size={16} />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleTaskList().run() },
  { title: "Bullet List", icon: <List size={16} />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
  { title: "Numbered List", icon: <ListOrdered size={16} />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
  { title: "Quote", icon: <Quote size={16} />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
  { title: "Divider", icon: <Minus size={16} />, command: ({ editor, range }: any) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
];

export const SlashCommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  const downHandler = () => setSelectedIndex((selectedIndex + 1) % props.items.length);
  const enterHandler = () => selectItem(selectedIndex);

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === "ArrowUp") { upHandler(); return true; }
      if (event.key === "ArrowDown") { downHandler(); return true; }
      if (event.key === "Enter") { enterHandler(); return true; }
      return false;
    },
  }));

  if (!props.items.length) return null;

  return (
    <div className="bg-[var(--bg)] border border-[var(--rule)] rounded-[12px] shadow-lg p-[8px] min-w-[220px] flex flex-col gap-[2px]">
      {props.items.map((item: any, index: number) => (
        <button
          className={`flex items-center gap-[12px] px-[12px] py-[10px] rounded-[8px] border-none text-left cursor-pointer transition-colors ${
            index === selectedIndex ? "bg-[var(--bg-3)]" : "bg-transparent hover:bg-[var(--bg-2)]"
          }`}
          key={index}
          onClick={() => selectItem(index)}
        >
          <div className="text-[var(--ink-3)]">{item.icon}</div>
          <span className="font-mono text-[11px] uppercase tracking-[0.05em] font-medium" style={{ color: "var(--ink)" }}>{item.title}</span>
        </button>
      ))}
    </div>
  );
});

SlashCommandList.displayName = "SlashCommandList";
