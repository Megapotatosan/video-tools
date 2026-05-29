import { notFound } from "next/navigation";
import { ToolRunner } from "@/components/tool-runner";
import { getToolBySlug, toolCatalog } from "@/lib/tools/catalog";
import type { ToolSlug } from "@/lib/media/jobs";

export function generateStaticParams() {
  return toolCatalog.map((tool) => ({ slug: tool.slug }));
}

export default async function ToolPage({ params }: { params: Promise<{ slug: ToolSlug }> }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();
  return (
    <main className="page-shell">
      <ToolRunner tool={tool} />
    </main>
  );
}
