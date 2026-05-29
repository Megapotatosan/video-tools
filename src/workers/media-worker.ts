export type MediaWorkerRequest = {
  id: string;
  action: "probe" | "transcode" | "trim" | "extract-audio" | "cancel";
};

self.addEventListener("message", (event: MessageEvent<MediaWorkerRequest>) => {
  if (event.data.action === "cancel") {
    self.postMessage({ id: event.data.id, type: "cancelled" });
  }
});
