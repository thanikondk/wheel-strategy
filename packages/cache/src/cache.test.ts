import { describe, expect, it } from "vitest";
import { InMemoryCacheStore } from "./index";

describe("cache", () => {
  it("stores and deletes values", async () => {
    const cache = new InMemoryCacheStore();
    await cache.set("quote:AAPL", { price: 100 }, 1);
    expect(await cache.get<{ price: number }>("quote:AAPL")).toEqual({ price: 100 });
    await cache.del("quote:AAPL");
    expect(await cache.get("quote:AAPL")).toBeUndefined();
  });
});
