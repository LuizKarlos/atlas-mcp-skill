# Design Tokens Specification & CSS Validation

Governs semantic design token architecture and CSS conformance validation via `@atlas/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

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
# local css_content; then atlas.complete_upload '{"action":"validate","css_content":":root { --primary: #111827; }"}'
# local css_content '{"css_content":".btn { color: var(--primary); }"}'
```

`design_tokens` usa `action` e `css_content`. Flags `--validate` e path de CSS não são o contrato.
