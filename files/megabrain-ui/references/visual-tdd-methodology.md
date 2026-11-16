# Visual TDD Methodology Specification

Governs headless visual test-driven development and layout verification in the local harness; Atlas only stores uploaded bytes (`https://mcp.atlascommand.dev/mcp`).

## Headless Visual TDD Lifecycle

Enforces deterministic RED-GREEN cycles before and during UI implementation:
- **RED Gate**: Author visual assertions against target DOM nodes, layout geometries, and accessibility tree before HTML/CSS changes.
- **Visual Capture (local Playwright)**: Renders DOM in headless browser, producing pixel-accurate snapshots, bounding boxes, and computed styles.
- **Deterministic Assertion (local visual assertions)**: Mechanically validates 100% pass criteria across contrast, typography, spacing, and DOM hierarchy.
- **GREEN Verification**: Code passes only when violations reach zero (`violations_count == 0`, `status == "pass"`).

## Structural & Layout Assertions

- **DOM Hierarchy**: Validates heading sequences (`h1` -> `h2` -> `h3`) and accessible names (`aria-label`, visible text).
- **Inline Style Isolation**: Forbids uncoordinated inline colors (`style="color:..."`) to avoid background fallback false-positives.
- **Layout Invariance**: Enforces responsive container boundaries and viewport scaling determinism.

```bash
# 1. Captura local via loopback: http://127.0.0.1:8000/fixture.html (viewport 1280x800).
# local playwright http://127.0.0.1:8000/fixture.html --viewport=1280x800

# 2. Confira os magic bytes 89 50 4E 47 e envie o PNG em base64; o Atlas não busca URL.
megabrain call atlas.complete_upload '{"project_id":"proj_alpha","session_id":"up_1","data_base64":"<base64_png>"}'

# 3. Assertions de layout seguem no harness, sobre html_content.
# local html_content assertions '{"html_content":"<main><h1>Ok</h1></main>"}'
```

Captura usa URL local válida e PNG; summarize_visual_tdd usa html_content. Sem URL remota. Sem SSRF. html/css path não é o contrato.
