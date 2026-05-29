import type { MediaProgress } from "@/lib/media/media-engine";

const phaseLabel: Record<MediaProgress["phase"], string> = {
  loading:    "Loading",
  probing:    "Probing",
  processing: "Processing",
  finalizing: "Finalizing"
};

export function ProgressPanel({ progress }: { progress?: MediaProgress }) {
  return (
    <section className="progress-panel" aria-label="Progress">
      <h2>Progress</h2>
      {progress ? (
        <>
          <p>{phaseLabel[progress.phase]} — {progress.message}</p>
          {progress.percent !== undefined && (
            <div className="progress-bar" role="progressbar" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
              <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
            </div>
          )}
        </>
      ) : (
        <p>No job running.</p>
      )}
    </section>
  );
}
