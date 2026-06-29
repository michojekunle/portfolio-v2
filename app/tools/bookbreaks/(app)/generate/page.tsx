import { getBBBooks, getBBSettings } from "@/lib/bookbreaks/queries";
import { BBGenerator } from "@/components/bookbreaks/Generator";

export default async function GeneratePage(): Promise<React.ReactElement> {
  const [books, settings] = await Promise.all([getBBBooks(), getBBSettings()]);

  return (
    <div className="p-[48px] max-[720px]:p-[24px] max-[1024px]:pt-[80px] min-h-screen">
      <div className="mb-[40px]">
        <div
          className="font-mono text-[10px] tracking-[0.16em] uppercase mb-[8px]"
          style={{ color: "#8B6F47" }}
        >
          AI Generator
        </div>
        <h1
          className="font-display font-normal text-[36px] leading-[1.05] tracking-[-0.025em] fvs-text m-0"
          style={{ color: "#2C2C2C" }}
        >
          Generate Content
        </h1>
        <p
          className="text-[14px] mt-[6px] m-0"
          style={{ color: "#8B6F47" }}
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
