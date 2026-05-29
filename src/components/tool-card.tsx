import Link from "next/link";
import type { ToolDefinition } from "@/lib/tools/catalog";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link className="tool-card" href={`/tools/${tool.slug}`}>
      <span>{tool.name}</span>
      <p>{tool.summary}</p>
    </Link>
  );
}
