export type FfmpegWorkerRequest = {
  id: string;
  action: "load" | "run" | "cancel";
};

self.addEventListener("message", (event: MessageEvent<FfmpegWorkerRequest>) => {
  if (event.data.action === "cancel") {
    self.postMessage({ id: event.data.id, type: "cancelled" });
  }
});
