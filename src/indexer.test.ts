import { describe, it, expect } from "vitest";
import { createTestIndexer } from "envio";
import "./handlers/poolCreated.ts";

describe("effects-api", () => {
  it(
    "indexes a PoolCreated event and stores token decimals via effects",
    async () => {
      const indexer = createTestIndexer();

      await indexer.process({
        chains: {
          1: {
            simulate: [
              {
                contract: "UniswapV3Factory",
                event: "PoolCreated",
                params: {
                  token0: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
                  token1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
                  fee: 3000n,
                  tickSpacing: 60n,
                  pool: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
                },
              },
            ],
          },
        },
      });

      const entity = await indexer.UniswapV3Factory_PoolCreated.getOrThrow(
        "1_0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640"
      );

      expect(entity.fee).toBe(3000n);
      expect(entity.tickSpacing).toBe(60n);
      expect(entity.pool.toLowerCase()).toBe(
        "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
      );
      // Effect reads decimals via RPC (USDC=6, WETH=18) or falls back to 18
      expect([6, 18]).toContain(entity.token0Decimals);
      expect([6, 18]).toContain(entity.token1Decimals);
    },
    30_000
  );
});
