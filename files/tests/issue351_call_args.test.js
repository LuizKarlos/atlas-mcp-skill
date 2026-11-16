import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { validateToolName } from "../src/commands/call.js";

const BIN = fileURLToPath(new URL("../bin/megabrain.js", import.meta.url));

function runCli(args) {
  return spawnSync(process.execPath, [BIN, ...args], { encoding: "utf8" });
}

function assertRejected(result, message) {
  assert.notStrictEqual(result.status, 0, `expected non-zero exit, got ${result.status}`);
  assert.match(result.stderr, message);
  assert.doesNotMatch(result.stderr, /HTTP \d{3}/, "must fail before reaching the network");
}

test("CALL_REJECT_BARE: bare tool name without megabrain. prefix is rejected", () => {
  assertRejected(runCli(["call", "health", "{}"]), /Tool name must be atlas\.<tool>/);
});

test("CALL_REJECT_ARRAY: array arguments are rejected before the network call", () => {
  assertRejected(runCli(["call", "atlas.health", "[]"]), /Arguments must be a JSON object/);
});

test("CALL_REJECT_NULL: null arguments are rejected before the network call", () => {
  assertRejected(runCli(["call", "atlas.health", "null"]), /Arguments must be a JSON object/);
});

test("CALL_VALIDATE_TOOL_NAME: matrix of accepted and rejected tool names", () => {
  for (const ok of ["atlas.health", "atlas_health", "atlas.get_mission"]) {
    assert.doesNotThrow(() => validateToolName(ok));
  }
  for (const bad of ["atlas.", "atlas..health", "atlas.health.", "health", "megabrain.health", ""]) {
    assert.throws(() => validateToolName(bad), /Tool name must be atlas\.<tool>/);
  }
});

test("CALL_REJECT_EMPTY_STRING: explicit empty string arguments are rejected before the network call", () => {
  assertRejected(runCli(["call", "atlas.health", ""]), /Invalid JSON arguments/);
});
