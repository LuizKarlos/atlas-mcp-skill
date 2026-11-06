import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { test } from "node:test";
import { run } from "../src/commands/setup.js";

test("preserves existing .cursor rule and creates canonical when absent", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cursor-rule-"));
  const [prevCwd, prevFetch, prevLog, prevExit] = [process.cwd(), globalThis.fetch, console.log, process.exitCode];
  console.log = () => {};
  globalThis.fetch = async () => new Response(JSON.stringify({ status: "ok" }), { status: 200, headers: { "content-type": "application/json" } });
  try {
    for (const [scenario, preexisting] of [["existing", "custom-rule-bytes"], ["absent", null]]) {
      const dir = path.join(tmp, scenario);
      const rule = path.join(dir, ".cursor", "rules", "megabrain.mdc");
      fs.mkdirSync(path.join(dir, ".cursor"), { recursive: true });
      if (preexisting) {
        fs.mkdirSync(path.dirname(rule), { recursive: true });
        fs.writeFileSync(rule, preexisting);
      }
      process.chdir(dir);
      await run({ flags: { endpoint: "http://127.0.0.1:9000/mcp", json: true } });
      const actual = fs.readFileSync(rule, "utf8");
      assert.equal(actual, preexisting ?? "# MegaBrain Rules\nUse MegaBrain MCP tools.\n");
    }
  } finally {
    process.chdir(prevCwd);
    globalThis.fetch = prevFetch;
    console.log = prevLog;
    process.exitCode = prevExit;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
