import { EnginePlanPanel } from "./engine-plan-panel";
import { FileDropzone } from "./file-dropzone";
import { ProgressPanel } from "./progress-panel";
import type { ToolDefinition } from "@/lib/tools/catalog";

export function ToolRunner({ tool }: { tool: ToolDefinition }) {
  return (
    <section className="tool-runner" data-testid="tool-runner">
      <h1>{tool.name}</h1>
      <p>{tool.summary}</p>
      <FileDropzone compact />
      <EnginePlanPanel />
      <ProgressPanel />
    </section>
  );
}
