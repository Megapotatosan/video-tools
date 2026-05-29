import type { EnginePlan } from "@/lib/media/engine-planner";

const engineLabel: Record<EnginePlan["engine"], string> = {
  mediabunny: "MediaBunny",
  ffmpeg:     "FFmpeg",
  none:       "Not supported"
};

const reasonLabel: Record<EnginePlan["reason"], string> = {
  "native-supported":    "native WebCodecs",
  "extension-supported": "mp3 extension",
  "ffmpeg-fallback":     "FFmpeg fallback",
  "unsupported":         "unsupported"
};

const riskColor: Record<EnginePlan["memoryRisk"], string> = {
  low:    "#059669",
  medium: "#d97706",
  high:   "#dc2626"
};

export function EnginePlanPanel({ plan }: { plan?: EnginePlan }) {
  return (
    <section className="engine-plan-panel" aria-label="Engine plan">
      <h2>Engine plan</h2>
      {plan ? (
        plan.engine === "none" ? (
          <p className="plan-error">{plan.error?.message ?? "This combination is not supported."}</p>
        ) : (
          <ul className="plan-list">
            <li><span className="plan-key">Engine</span><span className="plan-val">{engineLabel[plan.engine]} ({reasonLabel[plan.reason]})</span></li>
            <li>
              <span className="plan-key">Memory risk</span>
              <span className="plan-val" style={{ color: riskColor[plan.memoryRisk] }}>{plan.memoryRisk}</span>
            </li>
            {plan.requiresExtension && (
              <li><span className="plan-key">Extension</span><span className="plan-val">{plan.requiresExtension}</span></li>
            )}
          </ul>
        )
      ) : (
        <p>Drop a file to calculate the local processing path.</p>
      )}
    </section>
  );
}
