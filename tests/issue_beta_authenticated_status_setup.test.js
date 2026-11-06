import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";

const BIN = path.resolve("bin/megabrain.js");

test("authenticated status and setup exit non-zero on 401 and 0 on valid token", async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "s11-"));
  const server = http.createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      return res.end(JSON.stringify({ status: "HEALTHY", ok: true }));
    }
    if (req.headers.authorization === "Bearer valid") {
      let b = "";
      req.on("data", (c) => (b += c));
      return req.on("end", () => {
        const id = JSON.parse(b || "{}").id ?? 1;
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ jsonrpc: "2.0", id, result: { tools: [] } }));
      });
    }
    res.writeHead(401, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: { message: "Unauthorized" } }));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const endpoint = `http://127.0.0.1:${server.address().port}/mcp`;
  const run = (cmd, token) =>
    new Promise((resolve) => {
      execFile(
        process.execPath,
        [BIN, cmd, "--endpoint", endpoint, ...(cmd === "setup" ? ["--dest", tmp] : []), "--json"],
        { env: { ...process.env, XDG_CONFIG_HOME: tmp, MEGABRAIN_TOKEN: token } },
        (err) => resolve(err ? (err.code ?? 1) : 0)
      );
    });

  try {
    assert.notEqual(await run("status", "bad"), 0);
    assert.notEqual(await run("setup", "bad"), 0);
    assert.equal(await run("status", "valid"), 0);
    assert.equal(await run("setup", "valid"), 0);
  } finally {
    server.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
