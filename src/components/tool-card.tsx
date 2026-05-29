import Link from "next/link";
import {
  Info, ArrowLeftRight, Minimize2, Scissors,
  Music, VolumeX, RotateCw, Maximize2, Rewind, Crop
} from "lucide-react";
import type { ToolDefinition } from "@/lib/tools/catalog";
import type { ToolSlug } from "@/lib/media/jobs";

const ICONS: Record<ToolSlug, React.ComponentType<{ size?: number }>> = {
  "media-info":     Info,
  "convert-video":  ArrowLeftRight,
  "compress-video": Minimize2,
  "trim-video":     Scissors,
  "extract-audio":  Music,
  "mute-video":     VolumeX,
  "rotate-video":   RotateCw,
  "resize-video":   Maximize2,
  "reverse-video":  Rewind,
  "crop-video":     Crop,
};

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const Icon = ICONS[tool.slug];
  return (
    <Link className="tool-card" href={`/tools/${tool.slug}`}>
      <div className="tool-icon">
        <Icon size={18} />
      </div>
      <p className="tool-card-name">{tool.name}</p>
      <p className="tool-card-summary">{tool.summary}</p>
    </Link>
  );
}
