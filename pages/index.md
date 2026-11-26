---
layout: default
permalink: /
title: "Devang Padhiyar — Senior Software Engineer, Applied AI"
description: "Senior Software Engineer in applied AI: production LLM agents and generative video at Simplified, and Founding Engineer of Scenes AI."
---

<div class="film" id="film">
  <div class="scrollcue" aria-hidden="true"><span class="scrollcue__mouse"></span><span class="scrollcue__txt">Scroll</span><span class="scrollcue__n">01 / 11</span></div>
  <div class="film__stage" aria-hidden="true"><canvas id="story-canvas" class="film__canvas" data-src="{{ '/assets/js/scene.js' | relative_url }}"></canvas></div>
  {% include hero.html %}
  {% include sections/story.html offset=0 limit=4 %}
  {% include sections/nle.html %}
  {% include sections/story.html offset=4 limit=3 %}
  {% include sections/work.html %}

<section class="home-sec" aria-labelledby="exp-h">
  <h2 id="exp-h">Experience</h2>
  {% include timeline.html %}
</section>

{% include sections/marquee.html %}

<section class="home-sec" aria-labelledby="stack-h">
  <h2 id="stack-h">Stack</h2>
  {% include skills.html %}
</section>

{%- if site.posts.size > 0 %}
<section class="home-sec" aria-labelledby="writing-h">
  <h2 id="writing-h">Writing</h2>
  <ul class="post-list">
    {%- for post in site.posts limit: 3 -%}{% include post-card.html post=post %}{%- endfor -%}
  </ul>
  <p class="more"><a href="{{ '/blog/' | relative_url }}">All writing →</a></p>
</section>
{%- endif %}

<section class="home-sec contact scene" data-scene data-screen="wrap" data-no="07" data-take="1" data-slate="THAT'S A WRAP" data-pose="wrap" aria-labelledby="contact-h">
  <h2 id="contact-h">Contact</h2>
  <p class="contact__lede">{{ site.author.availability }} — {{ site.author.location }} · {{ site.author.timezone }}. Best reached by email.</p>
  <p class="contact__mail">
    <button class="btn btn--primary btn--magnetic" id="copy-email" data-email="{{ site.author.email }}" type="button">Copy email</button>
    <a class="btn btn--magnetic" href="mailto:{{ site.author.email }}">{{ site.author.email }}</a>
  </p>
  {% include social.html %}
</section>
</div>
