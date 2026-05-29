import Link from "next/link";
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
    <main className="page-shell tool-page">
      <Link href="/" className="back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        All Tools
      </Link>
      <ToolRunner tool={tool} />
    </main>
  );
}
