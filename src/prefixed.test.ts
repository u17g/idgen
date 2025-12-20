import { describe, it, expect } from "bun:test";
import { generate } from "./prefixed";

describe("prefixed", () => {
  it("should generate an id", () => {
    const id = generate("test");
    expect(id).toMatch(/^test_[a-zA-Z0-9]+$/);
  });

  it("should generate unique ids", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      ids.add(generate("test"));
    }
    expect(ids.size).toBe(1000);
  });

  it("should generate lexicographically sortable ids by creation order", async () => {
    // Helper to wait until timestamp changes
    const waitForNextTimestamp = async () => {
      const start = Date.now();
      while (Date.now() === start) {
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    };

    const ids: string[] = [];

    // Generate IDs ensuring different timestamps
    for (let i = 0; i < 5; i++) {
      ids.push(generate("test"));
      await waitForNextTimestamp();
    }

    // Create a sorted copy
    const sortedIds = [...ids].sort();

    // The sorted order should match the creation order
    expect(sortedIds).toEqual(ids);
  });

  it("should maintain sort order across different prefixes", async () => {
    const entries: { id: string; order: number }[] = [];

    // Helper to wait until timestamp changes
    const waitForNextTimestamp = async () => {
      const start = Date.now();
      while (Date.now() === start) {
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    };

    // Generate IDs with different prefixes, ensuring different timestamps
    for (let i = 0; i < 3; i++) {
      entries.push({ id: generate("aaa"), order: entries.length });
      await waitForNextTimestamp();
      entries.push({ id: generate("zzz"), order: entries.length });
      await waitForNextTimestamp();
    }

    // Sort by ID (excluding prefix to test timestamp part only)
    const sortedByTimestamp = [...entries].sort((a, b) => {
      const aTimestamp = a.id.split("_")[1]!;
      const bTimestamp = b.id.split("_")[1]!;
      return aTimestamp.localeCompare(bTimestamp);
    });

    // The timestamp sort order should match creation order
    expect(sortedByTimestamp.map((e) => e.order)).toEqual(entries.map((e) => e.order));
  });
});
