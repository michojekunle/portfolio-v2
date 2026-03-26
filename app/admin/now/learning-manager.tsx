"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

interface LearningItem {
  id: string;
  name: string;
  progress: number;
  description: string | null;
  sort_order: number;
}

interface ItemRowProps {
  item: LearningItem;
  onDelete: (id: string) => Promise<void>;
}

function ItemRow({ item, onDelete }: ItemRowProps): React.ReactElement {
  const [form, setForm] = useState({
    name: item.name,
    progress: item.progress,
    description: item.description ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const save = async (): Promise<void> => {
    setSaving(true);
    await supabase
      .from("learning_items")
      .update({ ...form, description: form.description || null, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    await onDelete(item.id);
    setDeleting(false);
  };

  return (
    <div className="content-card py-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Skill / topic name"
        />
        <Input
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Short description (optional)"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground w-16 shrink-0">Progress</label>
        <input
          type="range"
          min={0}
          max={100}
          value={form.progress}
          onChange={(e) => setForm((f) => ({ ...f, progress: Number(e.target.value) }))}
          className="flex-1"
        />
        <span className="text-xs text-muted-foreground w-10 text-right">{form.progress}%</span>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </Button>
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          Save
        </Button>
      </div>
    </div>
  );
}

interface LearningManagerProps {
  initialItems: LearningItem[];
}

export function LearningManager({ initialItems }: LearningManagerProps): React.ReactElement {
  const [items, setItems] = useState<LearningItem[]>(initialItems);
  const [adding, setAdding] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const addItem = async (): Promise<void> => {
    setAdding(true);
    const { data } = await supabase
      .from("learning_items")
      .insert([{ name: "New skill", progress: 0 }])
      .select()
      .single();
    if (data) setItems((prev) => [...prev, data as LearningItem]);
    setAdding(false);
    router.refresh();
  };

  const deleteItem = async (id: string): Promise<void> => {
    if (!confirm("Delete this item?")) return;
    await supabase.from("learning_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    router.refresh();
  };

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} onDelete={deleteItem} />
      ))}
      <Button variant="outline" size="sm" onClick={addItem} disabled={adding}>
        {adding ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}
        Add item
      </Button>
    </div>
  );
}
