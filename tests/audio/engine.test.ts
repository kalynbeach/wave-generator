import { describe, it, expect } from "vitest";
import { AudioEngine } from "@/lib/audio/engine";

describe("AudioEngine", () => {
  it("should create an instance", () => {
    const engine = new AudioEngine();
    expect(engine).toBeDefined();
  });
});