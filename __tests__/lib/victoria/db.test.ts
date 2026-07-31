/**
 * @jest-environment node
 *
 * lib/victoria/db.ts is server-only: importing it pulls in `pg`, which needs
 * TextEncoder at module scope and is not available under the default jsdom
 * environment. The node environment is also the one this code actually runs in.
 */
import { VictoriaDbTimeoutError, withDbTimeout } from "@/lib/victoria/db";

/**
 * withDbTimeout is the guard against the one unbounded failure mode in the
 * Victoria data layer: postgres.js has no timeout covering a query that never
 * gets dispatched, so without this a request can hang forever with nothing
 * logged. These tests pin the behaviour that matters.
 */
describe("withDbTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("passes through a resolved value", async () => {
    await expect(withDbTimeout(Promise.resolve(["row"]), "test")).resolves.toEqual(["row"]);
  });

  it("passes through a rejection unchanged", async () => {
    const failure = new Error("syntax error at or near");
    await expect(withDbTimeout(Promise.reject(failure), "test")).rejects.toBe(failure);
  });

  it("rejects with VictoriaDbTimeoutError when the query never settles", async () => {
    const assertion = expect(withDbTimeout(new Promise(() => {}), "stuckQuery", 5000)).rejects.toThrow(
      VictoriaDbTimeoutError,
    );
    await jest.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it("names the query and the limit so the log identifies the caller", async () => {
    const assertion = expect(withDbTimeout(new Promise(() => {}), "getVictoriaPageData", 5000)).rejects.toThrow(
      'Victoria database query "getVictoriaPageData" exceeded 5000ms',
    );
    await jest.advanceTimersByTimeAsync(5000);
    await assertion;
  });

  it("does not time out a query that settles just inside the limit", async () => {
    const query = new Promise((resolve) => setTimeout(() => resolve("done"), 4_999));
    const assertion = expect(withDbTimeout(query, "test", 5000)).resolves.toBe("done");
    await jest.advanceTimersByTimeAsync(4_999);
    await assertion;
  });

  it("clears its timer so a resolved query leaves nothing pending", async () => {
    await withDbTimeout(Promise.resolve("row"), "test", 5000);
    // A leaked timer would keep the Node process (or a serverless invocation)
    // alive past the response.
    expect(jest.getTimerCount()).toBe(0);
  });
});
