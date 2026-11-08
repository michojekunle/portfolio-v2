import { getBBBooks, getBBSettings } from "@/lib/bookbreaks/queries";
import { BBGenerator } from "@/components/bookbreaks/Generator";

export default async function GeneratePage(): Promise<React.ReactElement> {
  const [books, settings] = await Promise.all([getBBBooks(), getBBSettings()]);

  return (
    <div className="px-12 py-12 max-[1024px]:pt-20 max-[720px]:px-6 max-[720px]:pb-6 max-[720px]:pt-20 min-h-screen">
      <div className="mb-10">
        <div
          className="font-mono text-[10px] tracking-[0.16em] uppercase mb-2 text-muted-foreground"
        >
          AI Generator
        </div>
        <h1
          className="font-display font-normal text-[36px] max-[720px]:text-[28px] leading-[1.05] tracking-tight fvs-text m-0 text-(--ink)"
        >
          Generate Content
        </h1>
        <p
          className="text-[14px] mt-1.5 m-0 text-muted-foreground"
        >
          Select a book, choose a content type, and let AI write it for you.
        </p>
      </div>

      <BBGenerator
        books={books}
        defaultTone={settings?.default_tone ?? "educational"}
        defaultWordCount={settings?.default_word_count ?? 1500}
      />
    </div>
  );
}
