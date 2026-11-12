# AST Context Virtualization Specification

Governs local outline extraction. Atlas v1 does not parse source.

## Context Virtualization Principles

Virtualizes source files into structural outlines to prevent token bloat during agent dispatch:
- **Surgical Token Reduction**: Compresses source footprints. Sem medir, não prometa <3k.
- **Structural Signature Extraction**: Preserves type definitions, interfaces, function signatures, and exported classes.
- **Implementation Body Discard**: Strips routine implementation blocks.
- **Polyglot Parsing Support**: Handles JavaScript, TypeScript, and Python signatures deterministically.

## Execution via local CLI (`scripts/ast_slice.js`)

- **Local AST Slicer (`scripts/ast_slice.js`)**: Fast outline generation without remote RPC latency.
- **MCP**: upload the outline with `atlas.complete_upload`. `megabrain.slice_ast_context` was removed.

```bash
node scripts/ast_slice.js src/service.ts
```

scripts/ast_slice.js é outline local limitado e preserva contratos de interface TypeScript. Sem flags `--json`. Sem prometer <3k tokens sem medir.
