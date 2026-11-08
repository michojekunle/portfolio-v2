import { getBBContent, getBBBooks } from "@/lib/bookbreaks/queries";
import { ContentHub } from "@/components/bookbreaks/ContentHub";

export default async function ContentHubPage(): Promise<React.ReactElement> {
  const [content, books] = await Promise.all([getBBContent(), getBBBooks()]);
  return <ContentHub content={content} books={books} />;
}
