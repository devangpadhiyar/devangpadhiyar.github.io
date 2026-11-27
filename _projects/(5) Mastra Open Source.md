---
name: Upstream Contributions
title: "Upstream Contributions"
order: 3
role: Open-source contributor
years: 2026
repo: https://github.com/mastra-ai/mastra
language: TypeScript
license: Apache-2.0
tools: [TypeScript, Mastra, Inngest, OpenTelemetry]
description: Fixes sent upstream to Mastra, the TypeScript agent framework — remote-worker resume, cross-process tool resolution, tool-call concurrency, and trace/span nesting. Notes on why durable execution is the part that breaks.
---


## Why durable execution is the hard part

[Mastra](https://mastra.ai) bills itself as a framework for agents that "run for days." That promise lives or dies on what happens when a run outlives the process that started it.

When an agentic loop suspends on worker A and resumes on worker B, everything implicit becomes a bug: metadata held in memory, tools resolved from a local registry, spans parented to a context that no longer exists.

## Fixes I sent upstream

**Remote-worker resume** — [#19713](https://github.com/mastra-ai/mastra/pull/19713) persists durable suspend metadata, so a loop running on a remote worker can actually be resumed rather than silently losing its place.

**Cross-process tool resolution** — [#19331](https://github.com/mastra-ai/mastra/pull/19331) resolves workspace and skill tools across process boundaries, so the resuming worker can find the tools the original one had.

**Tool-call concurrency** — [#19329](https://github.com/mastra-ai/mastra/pull/19329) honours `toolCallConcurrency`. Parallel tool calls were serializing despite the config saying otherwise; a flag that silently does nothing is worse than no flag.

**Trace and span nesting** — [#19313](https://github.com/mastra-ai/mastra/pull/19313) propagates `tracingContext` so durable output-step processor spans nest under `AGENT_RUN` instead of floating parentless in a second trace.

**Thread titles for durable agents** — [#19315](https://github.com/mastra-ai/mastra/pull/19315).

**Storage visibility** — [#19003](https://github.com/mastra-ai/mastra/pull/19003) passes `--implicit-dirs` to gcsfuse so externally-written objects are actually visible.

<details>
<summary>Still open</summary>

[#19859](https://github.com/mastra-ai/mastra/pull/19859) and [#19860](https://github.com/mastra-ai/mastra/pull/19860) — keeping each durable run inside a single trace, and giving durable tool execution its own tracing context. Both are about the same underlying issue: observability that quietly degrades the moment execution goes distributed.
</details>

## The through-line

All of it is the same lesson. Durable execution is a **persistence** problem wearing a control-flow costume — and the failures only surface once the run stops staying on one machine.

None of this is remarkable on its own: you hit a bug in something you depend on, you read the source, you send a patch. That's just how using open source works. It's here because the *bugs* are interesting — they're a decent map of where long-running agents actually break.
