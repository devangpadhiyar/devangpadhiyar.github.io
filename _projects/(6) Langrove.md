---
name: Langrove
title: "Langrove"
order: 1
featured: true
role: Author · open source
years: 2026 → now
repo: https://github.com/devangpadhiyar/langrove
language: Python
license: MIT
tools: [Python, FastAPI, PostgreSQL, Redis, LangGraph, Docker]
description: A self-hosted, drop-in alternative to LangGraph Cloud. Same API surface — assistants, threads, runs, streaming, store, crons — on your own infrastructure, with langgraph_sdk.get_client() working unmodified.
---


<ul class="chips">
  <li class="chip chip--key">MIT</li>
  <li class="chip chip--key">Python</li>
  <li class="chip">183 files · 80 modules</li>
  <li class="chip">FastAPI + Postgres + Redis</li>
</ul>

## Why

LangGraph Cloud is proprietary and requires LangSmith. If you want to run your agents on your own infrastructure — bare metal, Docker, Kubernetes — there was no drop-in path.

## Compatibility is the design constraint

This is the part that makes it interesting engineering rather than another framework. **The existing client is the spec.** You don't get to design the API to suit your implementation:

- `langgraph_sdk.get_client()` works **unmodified**
- SSE streaming matches the `useStream()` React hook wire format — messages, values, updates
- Works with LangChain's own Agent Chat UI
- Agent Protocol `/agents` endpoints for standard interop

Writing a compatibility target is a much harder bar than writing a greenfield library, because you cannot negotiate with the requirements.

## Architecture

A FastAPI server handles HTTP and SSE. A **separate worker** consumes background tasks from Redis Streams and executes the graph. Postgres holds threads, runs, assistants, the cross-thread store, crons and LangGraph's checkpoint tables. Redis also carries a pub/sub relay so live events reach the server that owns the client connection.

The server/worker split is the whole point: a run can start on one process and finish on another, because none of its state lives in memory.

## The hard parts

**At-least-once delivery** — Redis Streams with consumer groups, crash recovery, and a dead-letter queue for tasks that keep failing.

**Interrupt and resume at any node** — pause the graph, collect human input, resume. Again: a persistence problem, not a control-flow one.

**Four multitask strategies** — `reject`, `interrupt`, `rollback`, `enqueue`. Deciding what happens when a second run arrives for a thread that is already running is more subtle than it sounds; `rollback` is the awkward one.

**Pluggable auth** — JWT, API key, or any custom async handler.

<details>
<summary>Running it</summary>

```bash
uv sync
docker compose up postgres redis -d
uv run langrove migrate
uv run langrove init      # creates langgraph.json + agent.py
uv run langrove serve
uv run langrove worker    # separate terminal
```

The API is then at `http://localhost:8123` and any LangGraph SDK client can point at it.
</details>
