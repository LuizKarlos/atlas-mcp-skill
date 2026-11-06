import test from "node:test";
import assert from "node:assert/strict";
import { checkHealth } from "../src/client.js";

test("checkHealth endpoint safety and canary leak prevention", async () => {
  const canary = "canary-secret-token-xyz";
  const bads = [
    `http://127.0.0.1:8000/mcp?token=${canary}`,
    `http://user:${canary}@127.0.0.1:8000/mcp`,
    `not-a-url-${canary}`
  ];
  let fetchCalls = 0;
  const origFetch = globalThis.fetch;
  const logs = [];
  const origLog = console.log, origErr = console.error;
  console.log = (...a) => logs.push(a.join(" "));
  console.error = (...a) => logs.push(a.join(" "));
  globalThis.fetch = async () => { fetchCalls++; return { ok: true, json: async () => ({ status: "READY" }) }; };
  try {
    for (const endpoint of bads) {
      await assert.rejects(
        () => checkHealth({ endpoint }),
        (err) => {
          assert.match(err.message, /^Endpoint invalido:/);
          assert.equal(err.message.includes(canary), false);
          return true;
        }
      );
      assert.equal(fetchCalls, 0);
      assert.equal(logs.some((l) => l.includes(canary)), false);
    }
    const res = await checkHealth({ endpoint: "http://127.0.0.1:9000/mcp" });
    assert.equal(fetchCalls, 1);
    assert.deepEqual(res, { status: "READY" });
  } finally {
    globalThis.fetch = origFetch;
    console.log = origLog;
    console.error = origErr;
  }
});
