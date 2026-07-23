import { ArticleForm } from "../article-form";

export const metadata = { title: "Yangi maqola" };

export default function NewArticlePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Yangi maqola</h1>
      <ArticleForm initial={null} />
    </div>
  );
}
