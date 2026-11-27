---
name: Simplified — Video
title: "Simplified — Video"
order: 2
featured: true
role: Senior Software Engineer · led the AI video team
years: 2022 → now
url_live: https://simplified.com/video-editor
tools: [Fabric.js, Canvas, FFmpeg, Puppeteer, Python, TypeScript]
description: Led video at a content platform — a browser-based editor, AI generation, auto-captioning in 30+ languages, and a repurposing pipeline that turns long footage into publishable short-form.
---

<ul class="chips">
  <li class="chip">timeline editor</li>
  <li class="chip">AI generation</li>
  <li class="chip">captions · 30+ languages</li>
  <li class="chip">repurposing</li>
  <li class="chip">voice &amp; TTS</li>
  <li class="chip">render pipeline</li>
</ul>

## The surface

Video at Simplified isn't one feature. It's an editor, a generation layer that orchestrates a dozen third-party models, captioning in 30+ languages, voice and TTS, and a repurposing pipeline that cuts long footage into short-form — all sharing one document model and one render path.

I led that product and its team of up to five engineers — 577K+ videos created on it — before moving on to Simplified's production LLM agents. The sections below are the parts that were hardest to build.

## The editor

Desktop editors get to assume a filesystem, native codecs and a GPU you control. A browser editor gets a tab — one that can be backgrounded, throttled, or closed mid-project, on hardware you know nothing about.

Everything below follows from that constraint.

## Architecture

**The editor surface is Fabric.js over Canvas.** Every clip, text layer, image and shape is a canvas object with its own transform, timing and enter/exit motion. The timeline is the same document seen along its time axis instead of its z axis — artboards give the video its length, layers carry their own durations inside it.

**Rendering is headless Chrome, frame by frame.** The final video is produced by running *the same page* under Puppeteer, seeking to each frame, capturing it, and encoding the sequence with a custom FFmpeg pipeline. That choice is deliberate: the renderer and the preview are the same code, so what you see is what you get — by construction, not by convention.

**FFmpeg owns time at render.** Audio and video are aligned in the encode pipeline rather than in the browser, which keeps the authoritative timing in one place instead of two.

## What was hard

### Preview and export disagreeing

The recurring problem in any editor with two rendering paths — and it stays solved only as long as you keep solving it. A canvas preview is forgiving: a font can arrive a frame late, an image can pop in, a dropped frame is invisible. A frame-by-frame render is not. Every asset has to be *ready* before the frame is captured, or the export silently ships without it.

Most parity bugs are not rendering bugs. They are readiness bugs wearing a rendering costume.

### Frame-accurate seeking

Browsers do not expose frame rate, and `currentTime` is a float in seconds. Codecs only allow random access at keyframes, so asking for a frame gets you the nearest one the decoder is willing to give. Getting the render to land on *the* frame — repeatedly, deterministically, at 29.97 as well as 30 — is its own body of work.

### Captions, especially animated text

The part that looks easy and isn't. Canvas has no text wrapping, no kerning control, and no notion of a line box — you measure, wrap and lay out every line yourself. Per-character animation makes it worse: splitting a string to animate its letters destroys the shaping the platform did for you, and does it silently for anyone writing in a script that requires shaping. Then it all has to render identically in headless Chrome, with the right fonts present, or the export ships tofu.

Captions also export two ways — burned into the pixels, or as a sidecar SRT — which means the same timing model has to be correct in two very different output formats.

### Repurpose: long-form → short-form

The hardest thing I worked on. Take an hour of footage and return a set of short, vertical, ready-to-publish clips.

Every stage is a judgement call a human would make: **where** to cut, **which** moments carry, how to **reframe** 16:9 into 9:16 without decapitating the speaker, and how to caption the result so it reads with the sound off. Getting the pipeline to make those calls at a quality worth publishing — and to do it repeatably, not just in the demo — was months of work.

## Stack

Fabric.js and Canvas on the front end; Python and TypeScript around it; FFmpeg for media; Puppeteer for the render path.

<p class="callout">I led Simplified's AI video team (up to 5 engineers): text-to-video, AI voices, captions, repurposing and rendering, with 577K+ videos created.</p>
