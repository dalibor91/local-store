import { beforeEach,describe, expect, it } from "vitest";

import { IndexedDbStorage } from "../src/cache";

describe("IndexedDbStorage", () => {
  let cache: IndexedDbStorage;

  beforeEach(async () => {
    cache = new IndexedDbStorage({ prefix: `test-db-${Date.now()}` });
    await cache.load("_"); // ensure DB is open before tests
  });

  describe("load", () => {
    it("returns exists: false for missing key", async () => {
      const entry = await cache.load("missing");
      expect(entry).toEqual({ exists: false, expired: false, value: null });
    });

    it("returns exists: true and value for stored key without expiry", async () => {
      await cache.store("foo", { a: 1 });
      const entry = await cache.load("foo");
      expect(entry.exists).toBe(true);
      expect(entry.expired).toBe(false);
      expect(entry.value).toEqual({ a: 1 });
    });

    it("returns expired: true when record has passed expiresAt", async () => {
      await cache.store("foo", "val", 1);
      await new Promise((r) => setTimeout(r, 10));
      const entry = await cache.load("foo");
      expect(entry.exists).toBe(true);
      expect(entry.expired).toBe(true);
      expect(entry.value).toBeNull();
    });
  });

  describe("fetch", () => {
    it("returns null for missing key", async () => {
      expect(await cache.fetch("missing")).toBeNull();
    });

    it("returns value for existing key", async () => {
      await cache.store("k", 42);
      expect(await cache.fetch("k")).toBe(42);
    });

    it("returns null and removes entry when expired", async () => {
      await cache.store("k", "v", 1);
      await new Promise((r) => setTimeout(r, 10));
      expect(await cache.fetch("k")).toBeNull();
      const entry = await cache.load("k");
      expect(entry.exists).toBe(false);
    });
  });

  describe("store", () => {
    it("stores value and returns Entry", async () => {
      const entry = await cache.store("key", "value");
      expect(entry.exists).toBe(true);
      expect(entry.expired).toBe(false);
      expect(entry.value).toBe("value");
    });

    it("stores with expiration when expirationMs > 0", async () => {
      const entry = await cache.store("key", "value", 1000);
      expect(entry.exists).toBe(true);
      expect(entry.expired).toBe(false);
    });
  });

  describe("remove", () => {
    it("removes stored key", async () => {
      await cache.store("key", "value");
      await cache.remove("key");
      const entry = await cache.load("key");
      expect(entry.exists).toBe(false);
    });
  });
});
