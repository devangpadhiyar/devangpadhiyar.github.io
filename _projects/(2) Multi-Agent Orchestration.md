---
name: Agent Orchestration
title: "Agent Orchestration"
order: 2
role: Senior Software Engineer · Simplified
years: 2022 → now
tools: [LangGraph, Mastra, CopilotKit, TypeScript, Python, MCP]
description: Stateful multi-agent workflows across media pipelines — LangGraph in Python, Mastra in TypeScript, with checkpointing, durable resume, human-in-the-loop approval gates, and eval harnesses that catch prompt regressions.
---


## The problem

An agent that runs for three seconds and an agent that runs for three hours are different engineering problems. The long one has to survive a deploy, a crashed worker, and a human who walks away mid-approval.

## The approach

**Graphs, not chains.** Every transition writes a checkpoint, so state lives in the database rather than the process. That makes interrupt and resume a persistence question — which is exactly what makes it reliable.

**Human-in-the-loop as a first-class node.** Approval gates suspend the run and wait. The run is not "paused in memory"; it is durably suspended and can be resumed by a different worker entirely.

**Copilots over chat boxes.** CopilotKit surfaces the agent inside the product where the work already happens, rather than bolting a chat window onto the side.

**Evals before vibes.** Production LLM features get a harness that replays known-good cases, so a prompt tweak that improves one output and quietly breaks four others gets caught before release.

## Two runtimes

LangGraph (Python) for the media pipelines; Mastra (TypeScript) where the agent lives closer to the front end. Working in both is also what led to [contributing upstream to Mastra's durable execution engine](/projects/5-mastra-open-source).
