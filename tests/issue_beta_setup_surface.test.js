import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { test } from "node:test";
import { run } from "../src/commands/setup.js";

const EXPECTED_SKILLS = [
  "megabrain-orchestrate", "megabrain-pipeline", "megabrain-review",
  "megabrain-audit", "megabrain-context", "megabrain-ui", "megabrain-surface"
];

test("setup installs megabrain-surface and 7 skills idempotently", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "setup-surface-"));
  const dest = path.join(tmp, "skills");
  const [prevLog, prevFetch] = [console.log, globalThis.fetch];
  console.log = () => {};
  globalThis.fetch = async () => new Response(JSON.stringify({ status: "ok" }), { status: 200, headers: { "content-type": "application/json" } });
  try {
    for (let i = 0; i < 2; i++) {
      const report = await run({ flags: { dest, endpoint: "http://127.0.0.1:9000/mcp", json: true } });
      for (const skill of EXPECTED_SKILLS) {
        assert.ok(fs.existsSync(path.join(dest, skill)), `missing skill in dest: ${skill}`);
        assert.ok(report.installation.installed.includes(skill), `missing in report: ${skill}`);
      }
      assert.ok(fs.existsSync(path.join(dest, "megabrain-surface", "SKILL.md")));
      assert.equal(report.installation.installed.length, 8);
    }
  } finally {
    console.log = prevLog;
    globalThis.fetch = prevFetch;
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
