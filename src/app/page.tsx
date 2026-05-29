import { FileDropzone } from "@/components/file-dropzone";
import { ToolCard } from "@/components/tool-card";
import { toolCatalog } from "@/lib/tools/catalog";

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="home-header">
        <h1>Video Tools</h1>
        <p>Open-source browser-local video tools powered by MediaBunny and FFmpeg.wasm.</p>
      </header>
      <section className="hybrid-grid">
        <div className="catalog-grid">
          {toolCatalog.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}
        </div>
        <aside className="quick-panel">
          <FileDropzone />
          <div className="trust-band">Files stay on your device. No upload server is used.</div>
          <div className="engine-status">MediaBunny first. FFmpeg fallback when needed.</div>
        </aside>
      </section>
    </main>
  );
}
