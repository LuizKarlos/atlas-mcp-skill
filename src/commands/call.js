import { callTool } from "../client.js";

// ponytail: single tool caller; upgrade to multi-step agent pipeline when needed
export function validateToolName(name) {
  if (typeof name !== "string" || !name || name.includes("..") || name.endsWith(".")) {
    throw new Error("Tool name must be megabrain.<tool>");
  }
  if (!/^megabrain[._][a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$/.test(name)) {
    throw new Error("Tool name must be megabrain.<tool>");
  }
  return name;
}

const FAILS = new Set(["ERROR", "FAILED", "NOT_EXECUTED", "BLOCKED", "MALFORMED_RESULT", "INSUFFICIENT_EVIDENCE"]);
function hasErr(o) {
  if (!o || typeof o !== "object" || Array.isArray(o)) return false;
  const s = typeof o.status === "string" ? o.status.toUpperCase() : "";
  const err = typeof o.error_code === "string" && o.error_code.length > 0;
  return s === "SKIPPED" ? ((typeof o.exit_code === "number" && o.exit_code !== 0) || err) : (FAILS.has(s) || err);
}

export function isBusinessFailure(result) {
  try {
    if (!result || typeof result !== "object" || Array.isArray(result)) return false;
    if (result.isError === true || hasErr(result)) return true;
    if (hasErr(result.structuredContent)) return true;
    if (Array.isArray(result.content)) {
      for (const item of result.content) {
        if (item && item.type === "text" && typeof item.text === "string") {
          try {
            if (hasErr(JSON.parse(item.text))) return true;
          } catch {}
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

export async function run({ positionals = [], flags = {}, callToolFn = callTool }) {
  const pos = Array.isArray(positionals) ? positionals : [];
  const [name, rawArgs] = pos;
  if (!name) throw new Error("Tool name required. Usage: megabrain call <tool> [args-json]");
  validateToolName(name);
  if (pos.length > 2) throw new Error("Too many arguments. Usage: megabrain call <tool> [args-json]");
  let args = {};
  if (rawArgs !== undefined) {
    try {
      args = JSON.parse(rawArgs);
    } catch (e) {
      throw new Error(`Invalid JSON arguments: ${e.message}`);
    }
    if (args === null || Array.isArray(args) || typeof args !== "object") {
      throw new Error("Arguments must be a JSON object");
    }
  }
  const result = await callToolFn(name, args, { endpoint: flags.endpoint, token: flags.token });
  if (isBusinessFailure(result)) process.exitCode = 1;
  if (flags.json) {
    console.log(JSON.stringify(result));
  } else {
    const formatted = typeof result === "object" ? JSON.stringify(result, null, 2) : result;
    console.log(formatted);
  }
  return result;
}
