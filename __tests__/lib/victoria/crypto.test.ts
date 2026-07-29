import { createRawToken, hashVictoriaToken } from "@/lib/victoria/crypto";

describe("victoria crypto", () => {
  const originalSecret = process.env.VICTORIA_TOKEN_HASH_SECRET;

  beforeEach(() => {
    process.env.VICTORIA_TOKEN_HASH_SECRET = "x".repeat(64);
  });

  afterEach(() => {
    process.env.VICTORIA_TOKEN_HASH_SECRET = originalSecret;
  });

  it("generates at least 256 bits of random token material", () => {
    const token = createRawToken();
    expect(token.length).toBeGreaterThanOrEqual(43);
  });

  it("hashes tokens by purpose", () => {
    const claimHash = hashVictoriaToken("same-token", "claim");
    const sessionHash = hashVictoriaToken("same-token", "session");
    expect(claimHash).not.toBe(sessionHash);
    expect(claimHash).toHaveLength(64);
  });
});
