# Voice Calibration & Cadence Engineering

Aligns generated documentation and code artifacts with canonical author style via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Stylistic Alignment (local voice calibrate)

Compares generated drafts against gold-standard author samples to preserve authentic developer voice:
- **Tone Matching**: Ensures declarative, confident, and direct delivery without passive softening.
- **Vocabulary Calibration**: Prioritizes concise domain terminology over generic marketing jargon.
- **Cadence Scoring**: Measures semantic similarity and density against canonical author baselines.

## Rhythm & Readability Metrics (local readability score)

Monitors syntactic and structural flow to avoid robotic monotony:
- **Sentence Length Variance ($\sigma^2$)**: Alternates short punchy assertions with explanatory compound clauses.
- **Structural Rhythm**: Balances prose paragraphs with structured markdown tables and bulleted constraints.
- **Assertive Vocabulary Index**: Penalizes weak hedges ("talvez", "possivelmente", "parece que") in favor of definitive statements.

Voice and readability are local in the harness. There is no MCP tool for them.

```text
{"text":"Output text","author_sample":"Canonical text sample"}
{"text":"Technical document content"}
```

JSON objeto, não flags `--text`. Mock/parser não é prova live.
