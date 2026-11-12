# OpenAPI 3.1 Contract Synthesis Specification

OpenAPI drafts are local files. Atlas hashes whatever you upload.

## Strict OpenAPI 3.1 Synthesis

- **Mechanical Contract Synthesis**: Generate OpenAPI 3.1 in the harness.
- **Strict Schema Constraints**: Enforces `additionalProperties: false`.
- **Deterministic Fixtures**: Reproducible mocks.
- **Explicit Route Mapping**: HTTP methods, path parameters, status codes.

Write the file, then:

```bash
megabrain call atlas.complete_upload '{"project_id":"proj_alpha","session_id":"up_1","data_text":"{\"openapi\":\"3.1.0\"}"}'
```

Nomes qualificados e JSON objeto. Flags `--operation_id` não são suportadas pelo CLI. `synthesize_backend_contract` was removed.
