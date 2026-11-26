/* Devang Padhiyar — hand-written, zero dependencies. */
(function () {
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = function () { return RM.matches; };
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- theme ---- */
  function initTheme() {
    var btn = $('#theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var swap = function () {
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
      };
      if (document.startViewTransition && !reduced()) document.startViewTransition(swap);
      else swap();
    });
  }

  /* ---- sticky nav ---- */
  function initStickyNav() {
    var sentinel = $('#nav-sentinel'), header = $('#site-header');
    if (!sentinel || !header || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (e) {
      header.classList.toggle('is-stuck', !e[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---- mobile nav ---- */
  function initMobileNav() {
    var btn = $('#nav-toggle'), nav = $('#site-nav');
    if (!btn || !nav) return;
    var set = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    btn.addEventListener('click', function () {
      set(btn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') set(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
  }

  /* ---- stagger indices for CSS-driven choreography ---- */
  function initStagger() {
    var groups = [
      ['.proof__row', '.proof__item'],
      ['.chips', '.chip'],
      ['.work__grid', '.wp'],
      ['.cmp tbody', 'tr'],
      ['.dg__svg', '.dg__node'],
      ['.dg__edges', '.flow'],
      ['.prs', '.pr'],
      ['.giving__list', '.giving__item'],
      ['.tier__grid', '.tier__item'],
      ['.nle__tracks', '.nle__track']
    ];
    groups.forEach(function (g) {
      $$(g[0]).forEach(function (parent) {
        $$(g[1], parent).forEach(function (el, i) { el.style.setProperty('--i', i); });
      });
    });
    // timeline items reveal individually
    $$('.tl__item').forEach(function (el) { el.setAttribute('data-reveal',''); });
  }

  /* ---- reveals (selective) ---- */
  function initReveals() {
    var els = $$('[data-reveal]');
    // section headings + diagrams opt in implicitly
    // .hreel__head, not the reel: the reel is several screens tall and never reaches the 14% threshold
    $$('.home-sec, .work, .hreel__head, .nle, .proof, .giving, .cmp-wrap, .tl__item').forEach(function (el) {
      if (els.indexOf(el) === -1) els.push(el);
    });
    if (!els.length) return;
    if (reduced() || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- diagram nodes focusable (hover-explain must be keyboard reachable) ---- */
  function initDiagramNodes() {
    $$('.dg__svg .dg__node').forEach(function (n) {
      if (!n.hasAttribute('tabindex')) n.setAttribute('tabindex', '0');
      var t = n.querySelector('text');
      if (t && !n.hasAttribute('aria-label')) n.setAttribute('aria-label', t.textContent);
    });
  }

  /* ---- hero code write-on ---- */
  function initCodeReveal() {
    var src = $('#hero-src');
    if (!src) return;
    $$('.l', src).forEach(function (l, i) { l.style.setProperty('--l', i); });
    if (reduced()) { src.classList.add('is-in'); return; }
    requestAnimationFrame(function () { src.classList.add('is-in'); });
  }

  /* ---- counters ---- */
  function initCounters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    var run = function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (isNaN(target)) return;
      var comma = el.getAttribute('data-format') === 'comma';
      var fmt = function (n) {
        n = Math.round(n);
        return comma ? n.toLocaleString('en-US') : String(n);
      };
      if (reduced()) { el.textContent = fmt(target); return; }
      var t0 = null, dur = 1300;
      var step = function (ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        el.textContent = fmt(target * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target); io.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- magnetic buttons ---- */
  function initMagnetic() {
    if (reduced() || !fine.matches) return;
    $$('.btn--magnetic').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var mx = Math.max(-14, Math.min(14, (e.clientX - (r.left + r.width / 2)) * 0.28));
        var my = Math.max(-14, Math.min(14, (e.clientY - (r.top + r.height / 2)) * 0.28));
        el.style.setProperty('--mx', mx + 'px');
        el.style.setProperty('--my', my + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---- card tilt + spotlight ---- */
  function initTilt() {
    if (reduced() || !fine.matches) return;
    $$('.pcard').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--px', (px * 100) + '%');
        el.style.setProperty('--py', (py * 100) + '%');
        el.style.setProperty('--ry', ((px - 0.5) * 5) + 'deg');
        el.style.setProperty('--rx', ((0.5 - py) * 5) + 'deg');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---- hero canvas ---- */
  function initHeroCanvas() {
    var cv = $('#hero-canvas');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d'), w = 0, h = 0, dpr = 1, dots = [], raf = null, vis = true;
    var ptr = { x: -1e4, y: -1e4 }, sm = { x: -1e4, y: -1e4 }, t = 0;
    var gold = [230, 180, 80];

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = cv.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var gap = w < 620 ? 30 : 24;
      dots = [];
      for (var x = gap / 2; x < w; x += gap)
        for (var y = gap / 2; y < h; y += gap) dots.push({ x: x, y: y, a: 0 });
    }

    function paint(anim) {
      ctx.clearRect(0, 0, w, h);
      // drifting ambient blobs
      var bx = w * (0.5 + Math.cos(t * 0.00022) * 0.22);
      var by = h * (0.42 + Math.sin(t * 0.00028) * 0.2);
      var g = ctx.createRadialGradient(bx, by, 0, bx, by, Math.max(w, h) * 0.42);
      g.addColorStop(0, 'rgba(230,180,80,0.16)');
      g.addColorStop(1, 'rgba(230,180,80,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      sm.x += (ptr.x - sm.x) * 0.09;
      sm.y += (ptr.y - sm.y) * 0.09;
      var R = 148;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        var dx = d.x - sm.x, dy = d.y - sm.y;
        var target = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / R);
        d.a += (target - d.a) * (anim ? 0.12 : 1);
        var a = 0.22 + d.a * 0.72;
        ctx.fillStyle = 'rgba(' + gold[0] + ',' + gold[1] + ',' + gold[2] + ',' + a.toFixed(3) + ')';
        var rad = 0.9 + d.a * 1.5;
        ctx.beginPath(); ctx.arc(d.x, d.y, rad, 0, 6.283); ctx.fill();
      }
    }

    function loop(ts) { t = ts; paint(true); raf = requestAnimationFrame(loop); }
    function start() { if (raf === null && vis && !reduced()) raf = requestAnimationFrame(loop); }
    function stop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

    build();
    if (reduced()) { paint(false); return; }

    window.addEventListener('resize', function () { build(); if (raf === null) paint(false); });
    window.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      vis = !document.hidden; vis ? start() : stop();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        e[0].isIntersecting ? start() : stop();
      }, { threshold: 0.01 }).observe(cv);
    } else start();
  }


  /* ---- miniature NLE: a real transport, not a loop animation ---- */
  function initNLE() {
    var root = $('.nle__app'); if (!root) return;
    var tl = $('#nle-timeline'), head = $('#nle-playhead'), tc = $('#nle-tc'),
        btn = $('#nle-play'), cap = $('.nle__layer--cap span'),
        title = $('.nle__layer--title'), sub = $('.nle__layer--sub'),
        clips = $$('.nle__clip', tl);
    var bounds = clips.map(function (c) {
      var st = parseFloat(c.style.getPropertyValue('--s')) / 100;
      var d  = parseFloat(c.style.getPropertyValue('--d')) / 100;
      return { el: c, st: st * 8.0, en: (st + d) * 8.0, live: null };
    });

    var DUR = 8.0;                  // seconds of "footage"
    var t = 0, playing = true, last = null, raf = null, visible = true;
    var lastTin = null, lastSin = null, lastTc = '';

    // caption track: [start, end, text] — drives the preview like real subs
    var CAPS = [
      [0.6, 2.2, 'characters stay consistent'],
      [2.4, 4.0, 'across every episode'],
      [4.6, 6.2, 'rendered frame by frame'],
      [6.4, 7.8, 'then encoded with ffmpeg']
    ];

    function fmt(sec) {
      var m = Math.floor(sec / 60), s2 = Math.floor(sec % 60),
          f = Math.floor((sec % 1) * 30);
      return String(m).padStart(2,'0')+':'+String(s2).padStart(2,'0')+':'+String(f).padStart(2,'0');
    }

    function syncHead() {
      var tracks = $('.nle__tracks', tl);
      if (!tracks) return;
      var a = tracks.getBoundingClientRect(), b = tl.getBoundingClientRect();
      head.style.setProperty('--ph-top', (a.top - b.top - 6) + 'px');
      head.style.setProperty('--ph-h', (a.height + 12) + 'px');
    }

    function render() {
      var p = t / DUR;
      head.style.setProperty('--p', p);
      var tcs = fmt(t); if (tcs !== lastTc) { lastTc = tcs; tc.textContent = tcs; }

      // clips light up while the playhead is over them (bounds precomputed, writes only on change)
      for (var ci = 0; ci < bounds.length; ci++) {
        var b = bounds[ci], live = t >= b.st && t <= b.en;
        if (b.live !== live) { b.live = live; b.el.classList.toggle('is-live', live); }
      }

      // captions appear on their own cues
      var line = '';
      for (var i = 0; i < CAPS.length; i++)
        if (t >= CAPS[i][0] && t <= CAPS[i][1]) { line = CAPS[i][2]; break; }
      if (cap.textContent !== line) cap.textContent = line;
      cap.parentNode.style.opacity = line ? 1 : 0;

      // title layer has its own enter/exit window — like a real layer
      var tin = t > 0.2 && t < 3.4, sin = t > 0.5 && t < 3.4;
      if (tin !== lastTin) {
        lastTin = tin;
        title.style.opacity = tin ? 1 : 0;
        title.style.transform = 'translateY(' + (tin ? 0 : 6) + 'px)';
      }
      if (sin !== lastSin) { lastSin = sin; sub.style.opacity = sin ? 1 : 0; }
    }

    function tick(ts) {
      if (last === null) last = ts;
      var dt = Math.min((ts - last) / 1000, 0.1);
      last = ts;
      if (playing) { t += dt; if (t > DUR) t = 0; render(); }
      raf = requestAnimationFrame(tick);
    }

    function start() { if (raf === null && visible) { last = null; raf = requestAnimationFrame(tick); } }
    function stop()  { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

    function setPlaying(v) {
      playing = v;
      btn.setAttribute('aria-label', v ? 'Pause' : 'Play');
      btn.innerHTML = v
        ? '<svg viewBox="0 0 12 14" width="11" height="13" aria-hidden="true"><rect x="1" y="1" width="3.2" height="12" rx="1"/><rect x="7.8" y="1" width="3.2" height="12" rx="1"/></svg>'
        : '<svg viewBox="0 0 12 14" width="11" height="13" aria-hidden="true"><path d="M2 1l9 6-9 6z"/></svg>';
    }
    btn.addEventListener('click', function () { setPlaying(!playing); });

    // scrubbing — pointer drag sets the playhead, like the real thing
    function scrubTo(clientX) {
      var r = tl.getBoundingClientRect();
      var x = (clientX - r.left - 38) / (r.width - 38);
      t = Math.max(0, Math.min(1, x)) * DUR;
      render();
    }
    tl.addEventListener('pointerdown', function (e) {
      tl.setPointerCapture(e.pointerId); setPlaying(false); scrubTo(e.clientX);
    });
    tl.addEventListener('pointermove', function (e) {
      if (tl.hasPointerCapture && tl.hasPointerCapture(e.pointerId)) scrubTo(e.clientX);
    });

    // audio waveform — drawn once from a deterministic pseudo-signal
    (function waveform() {
      var cv = $('#nle-wave'); if (!cv || !cv.getContext) return;
      var w = cv.offsetWidth || 300, h = cv.offsetHeight || 26, dpr = Math.min(devicePixelRatio||1,2);
      cv.width = w*dpr; cv.height = h*dpr;
      var ctx = cv.getContext('2d'); ctx.scale(dpr,dpr);
      ctx.fillStyle = 'rgba(112,191,86,.85)';
      var bars = Math.floor(w/3);
      for (var i=0;i<bars;i++){
        // deterministic: same shape every render, no Math.random
        var v = Math.abs(Math.sin(i*0.34)*0.55 + Math.sin(i*0.11)*0.32 + Math.sin(i*0.73)*0.13);
        var bh = Math.max(1.5, v*h*0.86);
        ctx.fillRect(i*3, (h-bh)/2, 1.6, bh);
      }
    })();

    if (reduced()) { t = DUR * 0.35; setPlaying(false); syncHead(); render(); return; }
    setPlaying(true); syncHead(); render();
    window.addEventListener('resize', syncHead, {passive:true});
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden; visible ? start() : stop();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        e[0].isIntersecting ? start() : stop();
      }, { threshold: 0.15 }).observe(root);
    }   // no eager start: if IO is unavailable the demo stays on its static first frame
  }

  /* ---- blog filter ---- */
  function initBlogFilter() {
    var input = $('#post-search'), list = $('#post-list'), empty = $('#post-empty');
    if (!input || !list) return;
    var cards = $$('.post-card', list);
    var apply = function (q) {
      q = (q || '').trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var hit = !q || (c.getAttribute('data-search') || '').indexOf(q) !== -1;
        c.hidden = !hit; if (hit) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    };
    input.addEventListener('input', function () { apply(input.value); });
    var m = /#tag=([\w-]+)/.exec(location.hash);
    if (m) { input.value = m[1]; apply(m[1]); }
  }

  /* ---- copy email ---- */
  function initCopy() {
    $$('[data-email]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mail = btn.getAttribute('data-email');
        var done = function () {
          var old = btn.textContent;
          btn.textContent = 'Copied ✓';
          setTimeout(function () { btn.textContent = old; }, 1600);
        };
        if (navigator.clipboard) navigator.clipboard.writeText(mail).then(done, function () {});
        else done();
      });
    });
  }

  /* ---- homepage film: one idea per screen. Pins scenes, cross-fades them, drives the horizontal work reel,
     and publishes window.devFilm.t (scene index + blend to the next) for the 3D slate. No WebGL needed. ---- */
  function initFilm() {
    var film = $('#film');
    if (!film || reduced()) return;
    var scenes = $$('[data-scene]'), pins = scenes.filter(function (s) { return s.classList.contains('scene--pin'); });
    var reel = $('.hreel', film), track = reel && $('.work__grid', reel);
    var cards = track ? $$('.wp', track) : [], links = reel ? $$('.hreel__index a', reel) : [];
    var counter = reel && $('.hreel__now', reel), shownCard = -1;
    var cue = $('.scrollcue', film), cueN = cue && $('.scrollcue__n', cue), cueShown = -1;
    // index: jump straight to a project (its hold point in the reel's scroll range)
    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var i = Number(a.getAttribute('data-i')), H = window.innerHeight;
        var y = reel.getBoundingClientRect().top + window.scrollY + (i / (cards.length - 1)) * (reel.offsetHeight - H);
        if (window.devLenis) window.devLenis.scrollTo(y); else window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
    var clamp = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    document.documentElement.classList.add('film-on');
    var state = window.devFilm = { t: 0, scenes: scenes };
    function measure() {
      var H = window.innerHeight, mid = H / 2, i = 0;
      for (var k = 0; k < scenes.length; k++) if (scenes[k].getBoundingClientRect().top <= mid) i = k;
      var next = scenes[i + 1], blend = 0;
      if (next) blend = clamp(1 - (next.getBoundingClientRect().top - mid) / (0.5 * H));
      state.t = i + blend;
      if (cue) {
        var cur = Math.round(state.t);
        if (cur !== cueShown) { cueShown = cur; cueN.textContent = (cur < 9 ? '0' : '') + (cur + 1) + ' / ' + (scenes.length < 10 ? '0' : '') + scenes.length; }
        // gone on the last screen
        cue.classList.toggle('is-done', window.scrollY + H > document.documentElement.scrollHeight - H * 0.9);
      }
      pins.forEach(function (s) {
        var r = s.getBoundingClientRect();
        var vin = clamp(1 - r.top / (0.45 * H)), vout = clamp((r.bottom - H) / (0.22 * H));
        s.style.setProperty('--vis', Math.min(vin, vout).toFixed(3));
      });
      if (track && cards.length > 1) {
        // cover flow: hold each project front and centre, glide between them, the rest fan back in depth
        var rr = reel.getBoundingClientRect(), p = clamp(-rr.top / Math.max(1, rr.height - H));
        var n = cards.length, u = p * (n - 1), k = Math.min(Math.floor(u), n - 2), f = clamp((u - k - 0.3) / 0.4);
        var pos = k + f * f * (3 - 2 * f), front = Math.round(pos);
        cards.forEach(function (c, j) {
          var d = j - pos, ad = Math.min(Math.abs(d), 3);
          c.style.setProperty('--d', d.toFixed(3)); c.style.setProperty('--ad', ad.toFixed(3));
          c.style.zIndex = String(100 - Math.round(ad * 10));
          c.classList.toggle('is-front', j === front);
          c.style.visibility = ad > 2.6 ? 'hidden' : '';
        });
        if (front !== shownCard) {
          shownCard = front;
          if (counter) counter.textContent = (front < 9 ? '0' : '') + (front + 1);
          links.forEach(function (a, j) { a.classList.toggle('is-on', j === front); });
        }
      }
    }
    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return; queued = true;
      requestAnimationFrame(function () { queued = false; measure(); });
    }, { passive: true });
    window.addEventListener('resize', measure);
    measure();

    // experience: the role at the centre of the screen is in focus, the rest step back
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) {
        en.forEach(function (e) { e.target.classList.toggle('is-current', e.isIntersecting); });
      }, { rootMargin: '-42% 0px -42% 0px' });
      $$('.tl__item').forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- 3D slate: lazy WebGL, only when it can't hurt ---- */
  function initScene() {
    var cv = $('#story-canvas'), panels = $$('[data-scene]');
    if (!cv || !window.devFilm || reduced()) return;
    var c = navigator.connection;
    if (c && (c.saveData || String(c.effectiveType || '').indexOf('2g') !== -1)) return;
    try { if (!document.createElement('canvas').getContext('webgl2')) return; } catch (e) { return; }
    var go = function () {
      // ponytail: dynamic import from a classic script; any failure (CDN down, old browser) keeps the 2D fallback
      import(cv.getAttribute('data-src')).then(function (m) {
        var root = document.documentElement;
        root.classList.add('scene-on'); // first, so the canvas has a size when the scene measures it
        try { m.start(cv, panels); } catch (e) { root.classList.remove('scene-on'); }
      }).catch(function () {});
    };
    var idle = function () { (window.requestIdleCallback || setTimeout)(go, { timeout: 1500 }); };
    if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle);
  }

  /* ---- split headings into words / letters for staggered reveals (text stays one accessible label) ---- */
  function initSplit() {
    $$('.home-sec > h2, .nle__head > h2, .hreel__head h2').forEach(function (h) {
      if (!h.hasAttribute('data-split')) h.setAttribute('data-split', 'words');
    });
    $$('[data-split]').forEach(function (el) {
      var chars = el.getAttribute('data-split') === 'chars', n = 0;
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      var wrap = function (node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
          if (ch.nodeType === 1) { wrap(ch); return; }
          if (ch.nodeType !== 3 || !ch.textContent.trim()) return;
          var frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
            if (chars) part.split('').forEach(function (c) {
              var s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.style.setProperty('--c', n++); w.appendChild(s);
            });
            else { w.textContent = part; w.style.setProperty('--w', n++); }
            frag.appendChild(w);
          });
          node.replaceChild(frag, ch);
        });
      };
      wrap(el);
      el.style.setProperty('--n', n);
    });
  }

  /* ---- inertial smooth scrolling (Lenis), desktop pointers only, never with reduced motion ---- */
  function initSmooth() {
    if (reduced() || !fine.matches) return;
    var go = function () {
      import('https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.mjs').then(function (m) {
        var lenis = window.devLenis = new m.default({ lerp: 0.09, wheelMultiplier: 0.9 });
        var tick = function (t) { lenis.raf(t); requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
        // in-page anchors go through Lenis so they glide too
        document.addEventListener('click', function (e) {
          var a = e.target.closest && e.target.closest('a[href^="#"]');
          if (e.defaultPrevented || !a || a.getAttribute('href').length < 2) return;
          var t = document.querySelector(a.getAttribute('href'));
          if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -64 }); }
        });
      }).catch(function () {});
    };
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
  }

  function init() {
    initSplit();
    initStagger();
    initTheme(); initStickyNav(); initMobileNav();
    initReveals(); initCodeReveal(); initCounters();
    initMagnetic(); initTilt(); initHeroCanvas(); initDiagramNodes();
    initBlogFilter(); initCopy(); initNLE(); initFilm(); initScene(); initSmooth();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
