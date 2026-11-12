import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const CANONICAL = [
  "atlas.health", "atlas.create_account", "atlas.issue_api_key", "atlas.rotate_api_key",
  "atlas.list_api_keys", "atlas.revoke_api_key", "atlas.create_project", "atlas.list_projects",
  "atlas.get_project", "atlas.archive_project", "atlas.register_check_manifest",
  "atlas.list_check_manifests", "atlas.create_mission", "atlas.list_missions",
  "atlas.get_mission", "atlas.archive_mission", "atlas.claim_task", "atlas.renew_task_lease",
  "atlas.submit_task_result", "atlas.submit_task_review", "atlas.begin_upload",
  "atlas.complete_upload", "atlas.request_verification", "atlas.get_verification",
  "atlas.export_evidence", "atlas.get_usage"
];

function extractCalls(markdown) {
  const pattern = /megabrain call ([\w.]+) '([^']+)'/g;
  const calls = {};
  for (const match of markdown.matchAll(pattern)) {
    calls[match[1]] = JSON.parse(match[2]);
  }
  return calls;
}

test("atlas surface catalog 26/26", () => {
  const fullDoc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.ok(pkg.files && pkg.files.includes("megabrain-surface"));
  assert.ok(!fullDoc.includes("megabrain call megabrain.recommend"));
  assert.ok(!fullDoc.includes("megabrain call megabrain.infer"));
  assert.ok(!fullDoc.includes("megabrain call megabrain.orchestrate"));
  const calls = extractCalls(fullDoc.split("## Aliases underscore")[0]);
  for (const tool of CANONICAL) {
    assert.ok(tool in calls, "missing call " + tool);
  }
  assert.deepEqual(Object.keys(calls["atlas.health"]), []);
  assert.deepEqual(Object.keys(calls["atlas.create_project"]), ["name"]);
  assert.ok(calls["atlas.create_mission"].project_id && calls["atlas.create_mission"].mission_id && Array.isArray(calls["atlas.create_mission"].tasks));
  assert.ok(calls["atlas.claim_task"].project_id);
  assert.ok(calls["atlas.request_verification"].snapshot_b64);
  assert.ok(calls["atlas.export_evidence"].project_id && calls["atlas.export_evidence"].mission_id);
  assert.ok(calls["atlas.get_usage"].project_id);
});

test("atlas surface aliases 26/26", () => {
  const fullDoc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const aliasSection = fullDoc.split("## Aliases underscore — 26/26")[1];
  assert.ok(aliasSection, "alias section exists");
  const pairs = [...aliasSection.matchAll(/(atlas\.([a-z0-9_]+))\s*->\s*(atlas_([a-z0-9_]+))/g)];
  assert.equal(pairs.length, 26, "must contain exactly 26 alias pairs");
  const canonicalSet = new Set(pairs.map((p) => p[1]));
  const aliasSet = new Set(pairs.map((p) => p[3]));
  assert.equal(canonicalSet.size, 26, "26 unique canonical tools");
  assert.equal(aliasSet.size, 26, "26 unique alias tools");
  for (const match of pairs) {
    const [, canonical, canonTool, alias] = match;
    assert.equal(alias, `atlas_${canonical.slice("atlas.".length)}`);
    assert.equal(alias, `atlas_${canonTool}`);
  }
  const exampleMatch = aliasSection.match(/megabrain call (atlas_health)\s*'([^']+)'/);
  assert.ok(exampleMatch, "example call exists");
  assert.deepEqual(JSON.parse(exampleMatch[2]), {});
  assert.ok(aliasSection.includes("atlas."), "mentions atlas. rejection");
  assert.ok(aliasSection.includes("atlas..health"), "mentions atlas..health rejection");
  assert.match(aliasSection, /string vazia/i, "mentions string vazia rejection");
});

test("atlas surface resources empty", () => {
  const fullDoc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const resourceSection = fullDoc.split("## Resources — parte 4")[1];
  assert.ok(resourceSection, "resource section exists");
  assert.match(resourceSection, /não publica resources/i);
  assert.match(resourceSection, /megabrain call[\s\S]*?NAO le[\s\S]*?resources/i);
  assert.match(resourceSection, /POST \/mcp.*Bearer/i);
});

test("atlas surface prompts empty", () => {
  const fullDoc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const section = fullDoc.split("## Prompts — parte 5")[1];
  assert.ok(section, "prompts section exists");
  assert.match(section, /não publica prompts/i);
  assert.match(section, /megabrain call[\s\S]*?NAO executa[\s\S]*?prompts/i);
  assert.match(section, /POST \/mcp.*Bearer/i);
});

test("atlas identity USER/ADMIN not six roles", () => {
  const fullDoc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const section = fullDoc.split("## Identidade (substitui Roles)")[1].split("## Transportes e autenticação")[0];
  assert.ok(section, "identity section exists");
  assert.match(section, /`USER`/);
  assert.match(section, /`ADMIN`/);
  assert.match(section, /zero providers\/models/);
  assert.match(section, /n[ãa]o executa infer[êe]ncia/);
  assert.doesNotMatch(section, /^- `mission_compiler` —/m);
});

test("atlas surface transports and authentication", () => {
  const doc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const sec = doc.split("## Transportes e autenticação")[1];
  assert.ok(sec, "section Transportes e autenticação exists");
  assert.match(sec, /Streamable HTTP[\s\S]*?POST \/mcp/);
  assert.match(sec, /http:\/\/127\.0\.0\.1:20130\/mcp/);
  assert.match(sec, /https:\/\/mcp\.atlascommand\.dev\/mcp/);
  assert.match(sec, /sem `call_tool` in-process/);
  for (const h of ["Content-Type: application/json", "Accept: application/json, text/event-stream", "MCP-Protocol-Version: 2026-07-28", "Mcp-Method", "Mcp-Name"]) {
    assert.ok(sec.includes(h), `header ${h} missing`);
  }
  assert.match(sec, /Authorization: Bearer/);
  for (const m of ["io.modelcontextprotocol/protocolVersion", "clientCapabilities", "clientInfo"]) {
    assert.ok(sec.includes(m), `meta field ${m} missing`);
  }
  assert.ok(sec.includes("2026-07-28"), "must contain protocol version 2026-07-28");
  for (const q of ["?token=", "?key=", "?bearer="]) assert.ok(sec.includes(q), `query ${q} missing`);
  assert.match(sec, /rejeitados com HTTP 401/);
  assert.match(sec, /mb_user_session/);
  assert.match(sec, /mb_admin_session/);
  assert.match(sec, /n[ãa]o autenticam/);
  const match = sec.match(/-d '(\{[\s\S]*?\})'/);
  assert.ok(match, "curl payload found");
  const payload = JSON.parse(match[1]);
  assert.strictEqual(payload.method, "tools/list");
  assert.strictEqual(payload.params?._meta?.["io.modelcontextprotocol/protocolVersion"], "2026-07-28");
  assert.ok(payload.params?._meta?.["io.modelcontextprotocol/clientCapabilities"]);
  assert.ok(payload.params?._meta?.["io.modelcontextprotocol/clientInfo"]);
  const curlBlock = sec.match(/```bash\n([\s\S]*?)```/)?.[1] || "";
  assert.ok(curlBlock.includes("Bearer ${MEGABRAIN_TOKEN}"));
  assert.ok(!curlBlock.includes("MEG...KEN"));
  assert.ok(!curlBlock.includes("\\${"));
});

test("atlas surface observability", () => {
  const doc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const sec = doc.split("## Observabilidade")[1];
  assert.ok(sec, "observability section exists");
  const section = sec.split("### Notificações de progresso")[0];
  assert.match(section, /\/metrics/);
  assert.match(section, /sem auth/);
  assert.doesNotMatch(section, /auth obrigat[oó]ria/i);
  for (const m of [
    "megabrain_tool_calls_total", "megabrain_arm_calls_total", "megabrain_errors_total",
    "megabrain_tool_errors_total", "megabrain_tool_duration_seconds_bucket",
    "megabrain_tool_duration_seconds_sum", "megabrain_tool_duration_seconds_count",
    "megabrain_tool_duration_seconds_total"
  ]) {
    assert.ok(sec.includes(m), "missing metric " + m);
  }
  const jsonMatch = sec.match(/```json\n([\s\S]*?)\n```/);
  assert.ok(jsonMatch, "json progress notification exists");
  const notif = JSON.parse(jsonMatch[1]);
  assert.equal(notif.method, "notifications/progress");
  assert.equal(notif.id, undefined);
  assert.ok(notif.params?.progressToken && notif.params?.progress && notif.params?.total && notif.params?.message);
  assert.match(sec, /progresso antes do resultado/);
  for (const f of ["total_calls", "total_errors", "tool_distribution", "uptime_seconds"]) {
    assert.ok(sec.includes(f), "missing field " + f);
  }
  assert.match(sec, /Contadores vivos vs snapshot/);
  assert.match(sec, /sem SLA sem medi[çc][ãa]o/);
});

test("atlas surface error contract", async () => {
  const doc = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  const sec = doc.split("## Contrato de erro")[1];
  assert.ok(sec, "error contract section exists");
  const codes = [
    "INVALID_ARGUMENT", "INVALID_ENDPOINT", "NO_EXECUTABLE_ROUTE", "FALLBACK_NOT_SUPPORTED",
    "INSUFFICIENT_EVIDENCE", "NOT_EXECUTED", "NOT_DISPATCHED", "UNAUTHORIZED_RELEASE",
    "MISSION_NOT_FOUND", "EXECUTION_FAILURE", "DEPENDENCY_BLOCKED", "LOCK_ACQUISITION_FAILED", "TIMEOUT_EXCEEDED"
  ];
  for (const c of codes) assert.ok(sec.includes(c), "missing code: " + c);
  assert.ok(sec.includes("^[A-Z][A-Z0-9_]{0,63}$"));
  assert.ok(sec.includes("TOOL_ERROR"));
  const ok = JSON.parse(sec.match(/\{"status":"completed"\}/)[0]);
  const err = JSON.parse(sec.match(/\{"status":"error","error_code":"INVALID_ENDPOINT"\}/)[0]);
  assert.equal(ok.status, "completed");
  assert.equal(err.status, "error");
  assert.equal(err.error_code, "INVALID_ENDPOINT");
  const { isBusinessFailure } = await import("../src/commands/call.js");
  assert.equal(isBusinessFailure({ isError: true }), true);
  assert.equal(isBusinessFailure({ status: "error" }), true);
  assert.equal(isBusinessFailure({ structuredContent: { status: "error" } }), true);
  assert.equal(isBusinessFailure({ structuredContent: { error_code: "EXECUTION_FAILURE" } }), true);
  assert.equal(isBusinessFailure({ content: [{ type: "text", text: "{\"status\":\"error\"}" }] }), true);
  assert.equal(isBusinessFailure({ content: [{ type: "text", text: "{\"error_code\":\"TOOL_ERROR\"}" }] }), true);
  assert.equal(isBusinessFailure({ status: "completed" }), false);
  assert.equal(isBusinessFailure({ content: [{ type: "text", text: "Healthy plain text" }] }), false);
});

test("test_mcp_surface_coverage_closure", async () => {
  const { execSync } = await import("node:child_process");
  assert.equal(CANONICAL.length, 26, "26 tools no manifest canonical");
  const files = fs.readdirSync(".", { recursive: true }).filter((f) => f.endsWith(".md") && !f.includes("node_modules"));
  const regex = /megabrain call (atlas[._][a-z0-9_]+) '([^']+)'/g;
  const found = new Map();
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(regex)) {
      const tool = match[1].replace(/^atlas_/, "atlas.");
      const parsed = JSON.parse(match[2]);
      if (!found.has(tool)) found.set(tool, []);
      found.get(tool).push(parsed);
    }
  }
  for (const tool of CANONICAL) {
    assert.ok(found.has(tool), "tool ausente nos docs: " + tool);
  }
  assert.equal(found.size, 26, "26/26 presentes");
  const kPath = process.env.MEGABRAIN_KERNEL_SOURCE || "/srv/megabrain-dev/repository/runtime/atlas_mcp_server.py";
  if (fs.existsSync(kPath)) {
    const py = 'python3 - <<PY\nimport ast, json, re\ntree = ast.parse(open("' + kPath + '").read())\nsigs = {}\nfor n in ast.walk(tree):\n    if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef)) and n.name.startswith("atlas_"):\n        sigs[n.name] = [a.arg for a in n.args.args if a.arg not in ("self",)]\nprint(json.dumps(sigs))\nPY';
    const sigs = JSON.parse(execSync(py, { encoding: "utf8" }));
    for (const tool of CANONICAL) {
      const bare = "atlas_" + tool.replace(/^atlas\./, "");
      const allowed = sigs[bare];
      assert.ok(allowed, "assinatura ausente: " + tool);
      for (const ex of found.get(tool) || []) {
        if (typeof ex === "object" && ex !== null && !Array.isArray(ex)) {
          for (const key of Object.keys(ex)) {
            if (tool === "atlas.complete_upload" && ["data_text", "data_base64", "data_hex"].includes(key)) continue;
            assert.ok(allowed.includes(key) || ["data_text", "data_base64", "data_hex"].includes(key), `chave ${key} nao permitida para ${tool}`);
          }
        }
      }
    }
  }
  const surfaceSkill = fs.readFileSync("megabrain-surface/SKILL.md", "utf8");
  for (const topic of ["resources", "prompts", "transports", "metrics", "errors"]) {
    assert.ok(new RegExp(topic, "i").test(surfaceSkill), "SKILL deve cobrir " + topic);
  }
});
