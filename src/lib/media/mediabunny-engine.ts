import type { OutputTuple } from "./jobs";

type MediabunnyDeps = {
  registerMp3Encoder: () => void;
};

export function createMediabunnyEngine(deps: MediabunnyDeps) {
  let mp3Registered = false;

  return {
    async prepareForOutput(output: OutputTuple) {
      if (output.audioCodec === "mp3" && !mp3Registered) {
        deps.registerMp3Encoder();
        mp3Registered = true;
      }
    }
  };
}

export async function createDefaultMediabunnyEngine() {
  const [{ registerMp3Encoder }] = await Promise.all([
    import("@mediabunny/mp3-encoder")
  ]);
  return createMediabunnyEngine({ registerMp3Encoder });
}
