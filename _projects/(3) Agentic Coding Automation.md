---
name: Agentic Coding Automation
title: "Agentic Coding Automation"
order: 4
role: Senior Software Engineer · Simplified
years: 2023 → now
tools: [Claude Code, Cursor, MCP, GitHub Actions, Python, TypeScript]
description: Automating the coding pipeline itself — code generation, PR review, test authoring and CI/CD wiring, with MCP servers exposing internal tooling to the agents that use it.
---

## The problem

Most "AI in the dev loop" stops at autocomplete. The larger win is further down: the review, the tests, the release wiring — the work that is necessary, repetitive, and easy to do inconsistently.

## The approach

**MCP servers as the interface.** Internal tooling is exposed through the Model Context Protocol, so Claude Code and Cursor can call it directly rather than having capability re-implemented per assistant. One tool surface, many clients.

**Guardrails, not autonomy.** Agents open PRs; humans merge them. Generated tests must fail before they pass — a test that never failed proves nothing.

**The boring parts first.** Changelogs, migrations, release notes, dependency bumps. Low risk, high frequency, and exactly where consistency beats brilliance.

## What it changed

The measurable effect isn't "code written faster" — it's that the unglamorous work stops being skipped, because skipping it no longer saves anyone time.
