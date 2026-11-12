---
name: megabrain-ui
version: "4.0.0"
description: "Run visual TDD and WCAG checks in the harness; upload screenshots to Atlas as artifacts."
allowed-tools: ["mcp__atlas__*", "terminal"]
---

# Atlas UI

Visual TDD, CSS, DOM, and WCAG run in this harness. Atlas does not render pages. Upload PNG/HTML bytes after the local gate.

## When to Use

- Contrast, target size, or DOM hierarchy must pass before submit.
- A screenshot is an artifact of a leased task.
- Offline `scripts/wcag_check.js`.

## NOT for

- End-to-end claim/verify (`megabrain-orchestrate`).
- DAG create (`megabrain-pipeline`).
- Cryptographic evidence (`megabrain-audit`).
- Multi-reviewer consensus (`megabrain-review`).
- Calling `megabrain.playwright_capture`, `dom_audit`, `css_validator`, `design_tokens`, `summarize_visual_tdd`.

## Workflow

Execute via `megabrain call` with a JSON object. The parser rejects non-objects.

```bash
# 1. Captura headless with a local fixture and PNG. Sem URL remota/SSRF.
# O retorno traz screenshot em base64 PNG; decodifique e valide os magic bytes `89 50 4E 47` antes de usar; URL remota/SSRF é proibida.
# Playwright, if present, is local. Then upload:
megabrain call atlas.complete_upload '{"project_id":"proj_alpha","session_id":"up_1","data_base64":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'

# 2. Visual TDD usa html_content real, não path html/css — local harness.
# 3. DOM audit com html_content — local.
# 4. CSS validator com css_content. design_tokens usa action + css_content, não validate nem path de CSS — local.
# 5. wcag_check.js local aceita JSON/flags. Não é CSS headless. JSON inválido falha fechado.
node scripts/wcag_check.js --fg="#ffffff" --bg="#111827" --width=44 --height=44
```

Playwright capture, if you run it locally, uses a loopback URL such as `http://127.0.0.1:8000/fixture.html` with viewport width/height. Do not call a remote URL.

## Visual Gates & WCAG Compliance

- **Visual TDD Gate**: Require zero violations (`violations_count == 0`, `status == "pass"`) before green verification.
- **Contrast & Sizing Standards**: Enforce WCAG 2.1 AA contrast (>= 4.5:1 text, >= 3.0:1 large) and >= 44x44px targets.
- **Token Invariance**: Strictly forbid undeclared raw hex/rgb color literals outside canonical root design tokens.
- **Capture Invariants**: O retorno traz screenshot em base64 PNG; decodifique e valide os magic bytes `89 50 4E 47` antes de usar; URL remota/SSRF é proibida.

## References

- Visual TDD methodology: [references/visual-tdd-methodology.md](references/visual-tdd-methodology.md)
- WCAG target sizes & accessibility: [references/wcag-target-sizes.md](references/wcag-target-sizes.md)
- Design tokens specification: [references/design-tokens-spec.md](references/design-tokens-spec.md)
