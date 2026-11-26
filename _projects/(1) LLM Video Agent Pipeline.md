---
name: Scenes AI
title: "Scenes AI"
order: 0
featured: true
role: Founding Engineer · side venture backed by Simplified
years: 2026 → now
url_live: https://usescenes.com
tools: [React, Django, Mastra, Inngest, GKE, Terraform]
description: Serialized AI video generation — mini-dramas, shorts and tutorials written, voiced, scored and rendered from a single prompt, with characters and locations that stay consistent across episodes.
---


<ul class="chips">
  <li class="chip">13 visual styles</li>
  <li class="chip">26 caption styles · word-level timing</li>
  <li class="chip">30 voices per engine</li>
  <li class="chip">up to 4K</li>
  <li class="chip">SRT / VTT</li>
  <li class="chip">pay-as-you-go credits</li>
</ul>

## The problem

Prompt-to-video is easy to demo and hard to ship. The demo generates one good clip; the product has to generate *episode four* and have the protagonist still look like herself, standing in the same kitchen, with the same voice.

Most generation is stateless — every clip is a fresh roll of the dice. Serialized storytelling needs the opposite: state that survives across renders, days and episodes.

## The approach

Consistency is solved **before** the expensive step, not after it:

- **Character sheets** — four views (front, side, back, face) generated once per character and reused as reference by every subsequent scene.
- **Location plates** — two-panel establishing shots with **named anchor points**, so "the kitchen" resolves to the same spatial layout every time.
- **A cast and location registry** carried across episodes, so a series has continuity rather than coincidence.

Only once the anchors are approved does anything costly run. A preview-approval gate sits in front of the render, because at roughly $0.09 per second of 720p output, a wasted render is real money — and retries are a design constraint, not an afterthought.

## The pipeline

Prompt → episode plan → per-scene generation (anchored) → voice → score → FFmpeg assembly → export.

Audio is mixed rather than merely stacked: AI-generated music **ducks automatically under narration**, and captions are timed at word level so they land on the beat instead of drifting a syllable behind.

## Results

In its first 8 months, as the only engineer: **1,400+ sign-ups and 159 paying customers** (11% conversion, 35% repeat buyers), 450+ productions and 2,300+ clips and images.

- **Evals before opinions.** The director has its own eval suite — 35 cases, LLM-as-judge scorers, 12 prompt checks and a regression baseline — that skips paid video generation, so an eval run costs only LLM tokens.
- **A 165-run controlled study** of planner designs found only 2 of 10 metrics differed significantly, which overturned a planned refactor, and surfaced a schema gap that left narration empty; fixing it took narration coverage from 0% to 83%.
- **A bug, not the model.** A ~50% plan-rejection rate traced to a capability-check bug; with no prompt change the planner switched to reference-guided clips and assets per plan fell from 17 to 12.

## Stack notes

A durable multi-agent director on Mastra and Inngest holds the multi-step state, with human-in-the-loop approval gates; it resumes in-flight vendor jobs after a crash instead of paying twice. Django persists the registry and run state, React drives the studio, and the whole thing ships multi-tenant on GKE with Terraform and self-hosted Inngest. Model routing, credit metering and spend guardrails sit in front of 50+ models from 5 providers.
