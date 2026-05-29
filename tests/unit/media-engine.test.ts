import { describe, expect, it } from "vitest";
import { createAbortError, isAbortError } from "@/lib/media/media-engine";

describe("media engine contract", () => {
  it("maps cancellation to Aborted", () => {
    const error = createAbortError();
    expect(isAbortError(error)).toBe(true);
    expect(error.code).toBe("Aborted");
  });
});
