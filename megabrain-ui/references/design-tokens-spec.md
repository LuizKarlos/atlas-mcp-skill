# Design Tokens Specification & CSS Validation

Governs semantic design token architecture and CSS conformance validation in the local harness via `@megabrain/cli`; the Atlas MCP server (`https://mcp.atlascommand.dev/mcp`) only stores the uploaded bytes or records the review via `atlas.*`.

## Canonical Token Architecture (local token lint)

Centralizes interface variables into semantic, theme-agnostic tokens:
- **Palette**: Surface (`--bg`, `--surface`, `--surface-2`), text (`--text`, `--text-muted`), accent (`--primary`, `--accent`), status (`--danger`, `--success`).
- **Typography**: Fluid scale scales (`--font-sans`, `--font-mono`, `--text-sm`, `--text-base`, `--text-lg`, `--line-height-normal`).
- **Spacing & Elevation**: Consistent intervals (`--space-1` through `--space-8`), radii (`--radius-sm`, `--radius-md`), shadows (`--shadow-sm`, `--shadow-lg`).
- **Strict Prohibition**: Hardcoded hex/rgb values outside root token declarations are strictly forbidden.

## CSS Conformance & Linting (local CSS lint)

- **Syntax & Nesting Integrity**: Verifies balanced braces, valid media queries, and correct pseudo-selector syntax.
- **Token Drift Auditing**: Mechanically scans CSS stylesheets for undeclared color literals and broken CSS variable references.
- **Fail-Closed Validation**: Rejects stylesheets containing unclosed blocks or unmapped design tokens.

```bash
# 1. Validação local no harness: design_tokens lê action e css_content; nada sobe para o Atlas.
# local { "action": "validate", "css_content": ":root { --primary: #111827; }" }
# local { "css_content": ".btn { color: var(--primary); }" }

# 2. Upload do CSS já validado: Atlas calcula o hash das bytes.
megabrain call atlas.complete_upload '{"project_id":"proj_alpha","session_id":"up_1","data_text":":root { --primary: #111827; }"}'
```

`design_tokens` usa `action` e `css_content`. Flags `--validate` e path de CSS não são o contrato.
