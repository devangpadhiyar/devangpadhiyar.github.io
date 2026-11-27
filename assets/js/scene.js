/* Homepage 3D: an aluminium laptop whose screen plays the film, in a room of drifting golden dust.
   - reads window.devFilm.t (scene index + blend to the next, from site.js initFilm) every frame
   - each [data-scene] names a screen (data-screen): the display redraws that scene live, and wipes to the
     next one on change, with a burst of light particles streaming out of the screen
   - data-pose places the laptop: title / side / back (small, far: a big number owns the screen) / hide / wrap
   Generic laptop, no brand marks. Colours come from CSS tokens. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function start(canvas, scenes) {
  var root = document.documentElement, film = window.devFilm;
  var css = function (n, d) { return getComputedStyle(root).getPropertyValue(n).trim() || d; };
  var C = {};
  function readColours() {
    C.accent = css('--accent', '#e6b450'); C.blue = css('--blue', '#59c2ff'); C.green = css('--green', '#aad94c');
    C.mag = css('--mag', '#d2a6ff'); C.cyan = css('--cyan', '#95e6cb');
  }
  readColours();
  var small = window.innerWidth < 760;

  /* ---------- renderer / scene ---------- */
  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.AgXToneMapping;            // filmic, keeps metal from clipping to white
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  var scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.75;
  var cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  cam.position.set(0, 0.6, 14); cam.lookAt(0, 0, 0);
  var key = new THREE.DirectionalLight(0xfff1e0, 1.6); key.position.set(5, 8, 6); scene.add(key);
  var rim = new THREE.DirectionalLight(0xa9ccff, 2.6); rim.position.set(-7, 4, -6); scene.add(rim);   // edge highlights
  var fill = new THREE.HemisphereLight(0xdfe6ff, 0x16181d, 0.35); scene.add(fill);

  /* ---------- the laptop (generic 14" proportions, no brand marks) ---------- */
  var W = 4.2, D = 2.94, BT = 0.11, LH = 2.78, LT = 0.065;
  function canvasTexture(w, h, draw, srgb) {
    var cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
    var tx = new THREE.CanvasTexture(cv); if (srgb) tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return tx;
  }
  var brushed = canvasTexture(512, 512, function (x, w, h) {         // brushed-metal roughness variation
    x.fillStyle = 'rgb(118,118,118)'; x.fillRect(0, 0, w, h);
    var rr = mulberry(3);
    for (var i = 0; i < 1400; i++) { var v = 100 + rr() * 50 | 0; x.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',.55)'; x.fillRect(0, rr() * h, w, 1); }
  });
  var alu = new THREE.MeshPhysicalMaterial({ color: 0xc3c7cd, metalness: 1, roughness: 0.42, roughnessMap: brushed,
    anisotropy: 0.55, clearcoat: 0.08, transparent: true });
  var well = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.95, emissive: 0xffe2b0, emissiveIntensity: 0.012, transparent: true });
  var keyMat = new THREE.MeshPhysicalMaterial({ color: 0x040405, roughness: 0.86, metalness: 0, transparent: true });
  var padMat = new THREE.MeshPhysicalMaterial({ color: 0x9ea2a8, metalness: 0.6, roughness: 0.5, transparent: true });
  var glassBlack = new THREE.MeshPhysicalMaterial({ color: 0x040405, roughness: 0.14, metalness: 0, clearcoat: 1, transparent: true });
  var hingeMat = new THREE.MeshStandardMaterial({ color: 0x24262a, metalness: 0.85, roughness: 0.38, transparent: true });
  var grilleMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: canvasTexture(128, 512, function (x, w, h) {
    x.fillStyle = 'rgba(0,0,0,.85)';
    for (var yy = 6; yy < h; yy += 12) for (var xx = 6 + (yy / 12 % 2) * 6; xx < w; xx += 12) { x.beginPath(); x.arc(xx, yy, 2.2, 0, 6.283); x.fill(); }
  }) });
  var glass = new THREE.MeshStandardMaterial({ color: 0x000000, metalness: 1, roughness: 0.05, transparent: true, opacity: 0.16, depthWrite: false });
  var shadowMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, map: canvasTexture(256, 256, function (x, w, h) {
    var gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(0.55, 'rgba(0,0,0,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr; x.fillRect(0, 0, w, h);
  }) });
  var shell = [alu, well, keyMat, padMat, glassBlack, hingeMat, grilleMat, glass, shadowMat];

  var rig = new THREE.Group(); scene.add(rig);
  var laptop = new THREE.Group(); laptop.position.y = -0.9; rig.add(laptop);
  var contact = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.55, D * 1.7), shadowMat);
  contact.rotation.x = -Math.PI / 2; contact.position.y = -BT / 2 - 0.03; laptop.add(contact);
  laptop.add(new THREE.Mesh(new RoundedBoxGeometry(W, BT, D, 6, 0.04), alu));

  // keyboard: recessed well + a real layout (function row, wide modifiers, space bar, inverted-T arrows)
  var U = 0.218, GAP = 0.034, KZ0 = -1.3, deckY = BT / 2;
  var wellMesh = new THREE.Mesh(new THREE.PlaneGeometry(15 * U + 0.06, 5.5 * U + 0.06), well);
  wellMesh.rotation.x = -Math.PI / 2; wellMesh.position.set(0, deckY + 0.0015, KZ0 + 5.5 * U / 2); laptop.add(wellMesh);
  var ROWS = [
    { h: 0.5, k: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5] },
    { h: 1, k: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2] },
    { h: 1, k: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5] },
    { h: 1, k: [1.8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.2] },
    { h: 1, k: [2.35, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.65] },
    { h: 1, k: [1, 1, 1, 1.25, 5.5, 1.25, 1, 'arrows'] }
  ];
  var keySpecs = [], z = KZ0;
  ROWS.forEach(function (row) {
    var x = -7.5 * U, dz = row.h * U;
    row.k.forEach(function (w) {
      if (w === 'arrows') {                                     // left, up/down stacked, right
        keySpecs.push([x + 0.5 * U, z + 0.75 * U, U, 0.5 * U]); keySpecs.push([x + 1.5 * U, z + 0.25 * U, U, 0.5 * U]);
        keySpecs.push([x + 1.5 * U, z + 0.75 * U, U, 0.5 * U]); keySpecs.push([x + 2.5 * U, z + 0.75 * U, U, 0.5 * U]);
        x += 3 * U; return;
      }
      keySpecs.push([x + w * U / 2, z + dz / 2, w * U, dz]); x += w * U;
    });
    z += dz;
  });
  var keys = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.16), keyMat, keySpecs.length);
  var m4 = new THREE.Matrix4(), kq = new THREE.Quaternion(), kp = new THREE.Vector3(), ks = new THREE.Vector3();
  keySpecs.forEach(function (k, i) {
    kp.set(k[0], deckY + 0.012, k[1]); ks.set(k[2] - GAP, 0.022, k[3] - GAP);
    keys.setMatrixAt(i, m4.compose(kp, kq, ks));
  });
  laptop.add(keys); keys.renderOrder = 2; wellMesh.renderOrder = 1;
  [-1, 1].forEach(function (side) {                               // speaker grilles either side of the keys
    var gm = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 5.2 * U), grilleMat);
    gm.rotation.x = -Math.PI / 2; gm.position.set(side * (7.5 * U + 0.2), deckY + 0.002, KZ0 + 5.5 * U / 2); gm.renderOrder = 2; laptop.add(gm);
  });
  var pad = new THREE.Mesh(new RoundedBoxGeometry(1.95, 0.006, 1.12, 3, 0.003), padMat);
  pad.position.set(0, deckY + 0.0012, 0.78); pad.renderOrder = 1; laptop.add(pad);
  var hingeBar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, W - 0.9, 24), hingeMat);
  hingeBar.rotation.z = Math.PI / 2; hingeBar.position.set(0, deckY + 0.01, -D / 2 + 0.05); laptop.add(hingeBar);

  // lid hinges at the back edge; the screen faces +z when the lid is upright
  var hinge = new THREE.Group(); hinge.position.set(0, deckY + 0.02, -D / 2 + 0.05); laptop.add(hinge);
  var lid = new THREE.Group(); hinge.add(lid);
  // every part fades together (all transparent), so draw order is explicit: shells, then surface details, then screen
  var back = new THREE.Mesh(new RoundedBoxGeometry(W, LH, LT, 6, 0.03), alu); back.position.y = LH / 2; lid.add(back);
  var bezel = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.05, LH - 0.05), glassBlack); bezel.position.set(0, LH / 2, LT / 2 + 0.001); bezel.renderOrder = 1; lid.add(bezel);
  var camDot = new THREE.Mesh(new THREE.CircleGeometry(0.022, 20), new THREE.MeshBasicMaterial({ color: 0x1b2433, transparent: true }));
  camDot.position.set(0, LH - 0.075, LT / 2 + 0.003); camDot.renderOrder = 2; lid.add(camDot); shell.push(camDot.material);

  var SW = 1024, SH = 640, RES = 1.25, sc = document.createElement('canvas'); sc.width = SW * RES; sc.height = SH * RES;
  var g = sc.getContext('2d');
  var screenTex = new THREE.CanvasTexture(sc); screenTex.colorSpace = THREE.SRGBColorSpace; screenTex.anisotropy = 8;
  var screenMat = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false, transparent: true });
  var DW = W - 0.24, DH = DW * SH / SW;
  var display = new THREE.Mesh(new THREE.PlaneGeometry(DW, DH), screenMat);
  display.position.set(0, 0.17 + DH / 2, LT / 2 + 0.003); display.renderOrder = 2; lid.add(display);
  var sheen = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.06, LH - 0.06), glass); sheen.position.set(0, LH / 2, LT / 2 + 0.006); sheen.renderOrder = 3; lid.add(sheen);

  // screen light spilling onto the keyboard: a soft additive glow + a light tinted by the screen
  var spillTex = radial(256, 'rgba(255,255,255,1)', 'rgba(255,255,255,0)');
  var spill = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 2.0), new THREE.MeshBasicMaterial({ map: spillTex, transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false }));
  spill.rotation.x = -Math.PI / 2; spill.position.set(0, deckY + 0.02, -0.45); laptop.add(spill);
  var screenLight = new THREE.PointLight(0xffe2b8, 5, 5, 1.8); screenLight.position.set(0, 1.2, 0.5); lid.add(screenLight);
  // aura behind the laptop: soft core, segmented orbital rings with travelling lights, slow light rays,
  // iridescent tint from the accent into blue / violet. Fades to nothing at the edge (no visible disc).
  var auraU = { uTime: { value: 0 }, uA: { value: 0 }, uLight: { value: root.getAttribute('data-theme') === 'light' ? 1 : 0 }, uC1: { value: new THREE.Color(C.accent) },
                uC2: { value: new THREE.Color(C.blue) }, uC3: { value: new THREE.Color(C.mag) } };
  // a camera-facing backdrop (never tilts with the laptop, never cuts through it); rings are antialiased with
  // fwidth so they stay smooth while moving
  var halo = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShaderMaterial({
    uniforms: auraU, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, toneMapped: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'uniform float uTime, uA, uLight; uniform vec3 uC1, uC2, uC3; varying vec2 vUv;',
      'float ring(float r, float R, float w){ float aa = fwidth(r) * 1.5; float d = abs(r - R); return 1.0 - smoothstep(w, w + aa, d); }',
      'void main(){',
      '  vec2 p = vUv * 2.0 - 1.0; float r = length(p), a = atan(p.y, p.x), t = uTime;',
      '  vec3 tint = mix(uC1, mix(uC2, uC3, 0.5 + 0.5 * sin(a + t * 0.2)), 0.3 + 0.3 * sin(a * 2.0 - t * 0.15));',
      '  float core = exp(-r * r * 7.0) * 0.45 * (0.9 + 0.1 * sin(t * 1.2));',
      // soft-edged arc segments (no hard on/off steps)
      // continuous rings: only a slow, low-contrast brightness drift around them (no breaks, nothing flickers)
      '  float seg1 = 0.8 + 0.2 * sin(a * 2.0 + t * 0.25);',
      '  float seg2 = 0.7 + 0.3 * sin(a * 3.0 - t * 0.2);',
      '  float r1 = ring(r, 0.56, 0.0035) * seg1 * 0.7 + exp(-pow((r - 0.56) / 0.035, 2.0)) * 0.2 * seg1;',
      '  float r2 = ring(r, 0.76, 0.0025) * seg2 * 0.35 + exp(-pow((r - 0.76) / 0.03, 2.0)) * 0.08 * seg2;',
      '  float sats = 0.0;',                                         // soft lights travelling along the rings
      '  for (int k = 0; k < 3; k++) {',
      '    float fk = float(k); float ang = t * (0.28 + fk * 0.05) * (k == 2 ? -1.0 : 1.0) + fk * 2.1;',
      '    vec2 sp = (k == 2 ? 0.76 : 0.56) * vec2(cos(ang), sin(ang)); float d2 = dot(p - sp, p - sp);',
      '    sats += exp(-d2 * 900.0) * 0.9 + exp(-d2 * 90.0) * 0.12;',
      '  }',
      '  float glow = (core + r1 + r2 + sats) * smoothstep(1.0, 0.65, r);',
      '  gl_FragColor = uLight > 0.5 ? vec4(tint, min(1.0, glow * 0.55) * uA) : vec4(tint * glow, glow) * uA;',
      '}'].join('\n')
  }));
  halo.renderOrder = -1; scene.add(halo);
  var haloPos = new THREE.Vector3(), haloTarget = new THREE.Vector3();

  /* ---------- particles: drifting golden dust ---------- */
  var DUST = small ? 320 : 700, rnd = mulberry(9);
  var dp = new Float32Array(DUST * 3), ds = new Float32Array(DUST), dc = new Float32Array(DUST * 3);
  var palette = [C.accent, C.accent, C.accent, C.blue, C.mag].map(function (h) { return new THREE.Color(h); });
  for (var i = 0; i < DUST; i++) {
    dp[i * 3] = (rnd() - 0.5) * 22; dp[i * 3 + 1] = (rnd() - 0.5) * 13; dp[i * 3 + 2] = (rnd() - 0.5) * 12 - 1;
    ds[i] = rnd(); var col = palette[Math.floor(rnd() * palette.length)]; dc[i * 3] = col.r; dc[i * 3 + 1] = col.g; dc[i * 3 + 2] = col.b;
  }
  var dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
  dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(ds, 1));
  dustGeo.setAttribute('aColor', new THREE.BufferAttribute(dc, 3));
  var dustU = { uTime: { value: 0 }, uPx: { value: 1 }, uAlpha: { value: 1 }, uScroll: { value: 0 } };
  var dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({
    uniforms: dustU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute float aSeed; attribute vec3 aColor; uniform float uTime, uPx, uScroll; varying float vA; varying vec3 vC;',
      'void main(){',
      '  vec3 p = position;',
      '  p.y = mod(p.y + uTime * (0.08 + aSeed * 0.18) + uScroll * (0.4 + aSeed), 13.0) - 6.5;',  // rise + parallax on scroll
      '  p.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.35; p.z += cos(uTime * 0.25 + aSeed * 23.0) * 0.3;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  float dist = -mv.z;',
      '  gl_PointSize = min(uPx * 16.0, uPx * (2.0 + aSeed * 6.0) * (10.0 / dist) * (1.0 + smoothstep(6.0, 20.0, dist) * 2.2));', // far ones bloom like bokeh; near ones capped
      '  vA = (0.25 + 0.75 * pow(0.5 + 0.5 * sin(uTime * (0.8 + aSeed * 2.0) + aSeed * 60.0), 3.0)) * (1.0 - smoothstep(14.0, 24.0, dist));',
      '  vC = aColor; gl_Position = projectionMatrix * mv;',
      '}'].join('\n'),
    fragmentShader: [
      'uniform float uAlpha; varying float vA; varying vec3 vC;',
      'void main(){ float r = length(gl_PointCoord - 0.5); if (r > 0.5) discard;',
      '  gl_FragColor = vec4(vC, uAlpha * vA * pow(1.0 - r * 2.0, 1.6)); }'].join('\n')
  }));
  scene.add(dust);

  /* ---------- particles: a burst of light out of the screen on every scene change ---------- */
  var BURST = small ? 90 : 170, bp = new Float32Array(BURST * 3), bv = new Float32Array(BURST * 3), bs = new Float32Array(BURST);
  for (var j = 0; j < BURST; j++) {
    bp[j * 3] = (rnd() - 0.5) * 3.8; bp[j * 3 + 1] = (rnd() - 0.5) * 2.3 + LH / 2; bp[j * 3 + 2] = LT / 2 + 0.02;
    bv[j * 3] = (rnd() - 0.5) * 0.7; bv[j * 3 + 1] = 0.35 + rnd() * 0.75; bv[j * 3 + 2] = 0.35 + rnd() * 1.1; bs[j] = rnd();
  }
  var burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute('position', new THREE.BufferAttribute(bp, 3));
  burstGeo.setAttribute('aVel', new THREE.BufferAttribute(bv, 3));
  burstGeo.setAttribute('aSeed', new THREE.BufferAttribute(bs, 1));
  var burstU = { uT: { value: 9 }, uPx: { value: 1 }, uColor: { value: new THREE.Color(C.accent) } };
  var burst = new THREE.Points(burstGeo, new THREE.ShaderMaterial({
    uniforms: burstU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute vec3 aVel; attribute float aSeed; uniform float uT, uPx; varying float vA;',
      'void main(){',
      '  float t = max(0.0, uT - aSeed * 0.25);',
      '  vec3 p = position + aVel * t + vec3(sin(t * 2.0 + aSeed * 30.0) * 0.06, 0.0, 0.0);',  // calm upward drift with a slight shimmer
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  gl_PointSize = uPx * (2.0 + aSeed * 3.5) * (10.0 / -mv.z);',
      '  vA = (uT > aSeed * 0.25 ? 1.0 : 0.0) * smoothstep(0.0, 0.25, t) * (1.0 - smoothstep(0.9, 2.4, t)) * (0.5 + 0.5 * sin(t * 9.0 + aSeed * 50.0));',
      '  gl_Position = projectionMatrix * mv;',
      '}'].join('\n'),
    fragmentShader: [
      'uniform vec3 uColor; varying float vA;',
      'void main(){ float r = length(gl_PointCoord - 0.5); if (r > 0.5) discard;',
      '  gl_FragColor = vec4(mix(vec3(1.0), uColor, 0.55), vA * pow(1.0 - r * 2.0, 1.4)); }'].join('\n')
  }));
  lid.add(burst);

  /* ---------- screens: one live drawing per scene ---------- */
  var screens = scenes.map(function (s) {
    var fig = s.querySelector('.scene__fig'), lab = s.querySelector('.scene__label'), h = s.querySelector('h2, h1');
    return { key: s.getAttribute('data-screen') || 'title', pose: s.getAttribute('data-pose') || 'side',
      fig: fig ? fig.textContent.trim() : '', label: lab ? lab.textContent.trim() : '',
      title: h ? (h.getAttribute('aria-label') || h.textContent).trim() : '' };
  });
  var FONT = '"JetBrains Mono", ui-monospace, monospace';
  function font(px, w) { g.font = (w || 500) + ' ' + px + 'px ' + FONT; }
  function wallpaper(a) {
    var gr = g.createLinearGradient(0, 0, SW, SH);
    gr.addColorStop(0, '#0e1118'); gr.addColorStop(0.55, '#141a26'); gr.addColorStop(1, '#1d1626');
    g.fillStyle = gr; g.fillRect(0, 0, SW, SH);
    var rg = g.createRadialGradient(SW * 0.8, SH * 0.15, 10, SW * 0.8, SH * 0.15, SW * 0.7);
    rg.addColorStop(0, hexA(C.accent, 0.22 * a)); rg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = rg; g.fillRect(0, 0, SW, SH);
    g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(0, 0, SW, 26);              // menu bar
    font(14, 700); g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText('~ devang', 18, 18);
    font(14); g.fillText('Mon 9:41', SW - 96, 18);
  }
  function windowFrame(x, y, w, h, title) {
    wallpaper(1);
    g.fillStyle = 'rgba(10,12,17,.92)'; roundRect(x, y, w, h, 14); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2; g.stroke();
    ['#ff5f57', '#febc2e', '#28c840'].forEach(function (c, i) { g.fillStyle = c; g.beginPath(); g.arc(x + 22 + i * 20, y + 20, 6, 0, 6.283); g.fill(); });
    font(15); g.fillStyle = 'rgba(255,255,255,.55)'; g.textAlign = 'center'; g.fillText(title, x + w / 2, y + 25); g.textAlign = 'left';
  }
  var CODE = [['# devang.py', 'c'], ['from langgraph.graph import StateGraph', 'k'], ['', ''], ['class DevangPadhiyar:', 'cls'],
    ['    roles = {', ''], ['        "Simplified": "Senior SWE, LLM agents",', 's'], ['        "Scenes AI":  "Founding Engineer",', 's'],
    ['    }', ''], ['    years = 9', 'n'], ['', ''], ['    def __repr__(self): return "half my coworkers are LLMs"', 'fn']];
  var DRAW = {
    title: function (t) {
      windowFrame(70, 60, SW - 140, SH - 110, 'devang.py');
      var shown = Math.floor(t * 38);
      CODE.forEach(function (l, i) {
        var txt = l[0].slice(0, Math.max(0, shown - i * 4));
        font(22); g.fillStyle = 'rgba(255,255,255,.28)'; g.fillText(String(i + 1).padStart(2, ' '), 96, 140 + i * 38);
        g.fillStyle = l[1] === 'c' ? 'rgba(255,255,255,.4)' : l[1] === 'k' ? C.mag : l[1] === 'cls' ? C.accent : l[1] === 's' ? C.green : l[1] === 'n' ? '#ff8f40' : l[1] === 'fn' ? C.blue : '#e6e1cf';
        g.fillText(txt, 150, 140 + i * 38);
      });
      if (Math.floor(t * 2) % 2) { var last = CODE.length - 1; font(22); g.fillStyle = C.accent; g.fillRect(150 + g.measureText(CODE[last][0]).width + 6, 120 + last * 38, 12, 26); }
    },
    agents: function (t) {
      windowFrame(60, 50, SW - 120, SH - 90, 'VideoPilot · agent run');
      var nodes = [[.5, .5, 'planner'], [.22, .3, 'script'], [.78, .28, 'b-roll'], [.2, .74, 'voice'], [.8, .74, 'render'], [.5, .16, 'skills'], [.5, .84, 'eval']];
      var ed = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 5], [2, 5], [3, 6], [4, 6]];
      var X = function (v) { return 60 + v * (SW - 120); }, Y = function (v) { return 80 + v * (SH - 150); };
      g.lineWidth = 3; g.strokeStyle = hexA(C.accent, 0.35);
      ed.forEach(function (e, i) {
        var a = nodes[e[0]], b = nodes[e[1]]; g.beginPath(); g.moveTo(X(a[0]), Y(a[1])); g.lineTo(X(b[0]), Y(b[1])); g.stroke();
        var p = (t * 0.5 + i * 0.37) % 1; g.fillStyle = '#fff3d6';
        g.beginPath(); g.arc(X(a[0] + (b[0] - a[0]) * p), Y(a[1] + (b[1] - a[1]) * p), 6, 0, 6.283); g.fill();
      });
      nodes.forEach(function (nd, i) {
        var pulse = 1 + 0.12 * Math.sin(t * 3 + i);
        g.fillStyle = hexA(C.accent, 0.18); g.beginPath(); g.arc(X(nd[0]), Y(nd[1]), (i ? 30 : 44) * pulse, 0, 6.283); g.fill();
        g.fillStyle = C.accent; g.beginPath(); g.arc(X(nd[0]), Y(nd[1]), i ? 13 : 20, 0, 6.283); g.fill();
        font(18, 700); g.fillStyle = '#f3f0e8'; g.textAlign = 'center'; g.fillText(nd[2], X(nd[0]), Y(nd[1]) + (i ? 40 : 54)); g.textAlign = 'left';
      });
    },
    latency: function (t, s) {
      windowFrame(60, 50, SW - 120, SH - 90, 'p95 inter-event latency');
      var x0 = 120, x1 = SW - 120, y0 = SH - 90, y1 = 190, k = Math.min(1, t / 1.6);
      g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1;
      for (var i = 0; i < 5; i++) { var y = y1 + i * (y0 - y1) / 4; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
      g.strokeStyle = C.accent; g.lineWidth = 5; g.beginPath();
      for (var q = 0; q <= 60 * k; q++) {
        var u = q / 60, v = 295 - (295 - 69) * smooth(Math.min(1, Math.max(0, (u - 0.35) / 0.4)));
        var yy = y0 - (v / 320) * (y0 - y1) + Math.sin(q * 1.7) * 4;
        q ? g.lineTo(x0 + u * (x1 - x0), yy) : g.moveTo(x0, yy);
      }
      g.stroke();
      font(64, 800); g.fillStyle = C.accent; g.fillText(s.fig || '295 → 69 ms', x0, 160);
    },
    video: function (t) {
      windowFrame(50, 40, SW - 100, SH - 70, 'timeline');
      var rows = [[0.5, C.blue, 'V1'], [0.66, C.accent, 'T1'], [0.82, C.green, 'A1']];
      g.fillStyle = '#0b0d12'; g.fillRect(250, 85, SW - 500, 180);                // preview monitor
      var pg = g.createLinearGradient(250, 85, SW - 250, 265); pg.addColorStop(0, hexA(C.mag, .55)); pg.addColorStop(1, hexA(C.blue, .55));
      g.fillStyle = pg; g.fillRect(262, 97, (SW - 524) * (0.5 + 0.5 * Math.sin(t * 0.7)), 156);
      rows.forEach(function (r, ri) {
        var y = r[0] * SH; font(16, 700); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillText(r[2], 80, y + 6);
        for (var cc = -1; cc < 6; cc++) {
          var w = 110 + ((cc + ri * 3 + 9) % 4) * 40, x = ((cc * 190 - t * (60 + ri * 22)) % 1330 + 1330) % 1330 - 160;
          var x0 = Math.max(120, x), w0 = w - (x0 - x);
          if (w0 > 0) { g.fillStyle = hexA(r[1], 0.85); roundRect(x0, y - 18, w0, 36, 6); g.fill(); }
        }
      });
      g.fillStyle = '#fff'; g.fillRect(SW * 0.6, 0.44 * SH, 3, 0.44 * SH);
    },
    counter: function (t, s) {
      wallpaper(1);
      var target = parseFloat((s.fig || '0').replace(/[^0-9.]/g, '')) || 0, k = smooth(Math.min(1, t / 1.8));
      var unit = /K/.test(s.fig) ? 'K+' : /%/.test(s.fig) ? '%' : '';
      font(170, 800); g.fillStyle = C.accent; g.textAlign = 'center';
      g.fillText((target * k).toFixed(0) + unit, SW / 2, SH / 2 + 30);
      font(24); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillText(s.key === 'infra' ? 'less GKE compute' : 'videos created', SW / 2, SH / 2 + 95);
      g.textAlign = 'left';
      if (s.key === 'infra') {                                                 // pods powering down
        for (var i = 0; i < 20; i++) {
          var on = i >= Math.round(13 * k); g.fillStyle = on ? hexA(C.green, .85) : 'rgba(255,255,255,.08)';
          roundRect(112 + i * 41, SH - 100, 30, 30, 5); g.fill();
        }
      }
    },
    scenes: function (t) {
      windowFrame(50, 40, SW - 100, SH - 70, 'Scenes AI · storyboard');
      var cols = [C.mag, C.blue, C.accent, C.green, C.cyan, C.mag, C.accent, C.blue];
      for (var i = 0; i < 8; i++) {
        var x = 90 + (i % 4) * 215, y = 100 + Math.floor(i / 4) * 240, lift = Math.max(0, Math.sin(t * 1.2 - i * 0.5)) * 8;
        var gr = g.createLinearGradient(x, y, x + 190, y + 150); gr.addColorStop(0, hexA(cols[i], .75)); gr.addColorStop(1, 'rgba(20,20,30,.9)');
        g.fillStyle = gr; roundRect(x, y - lift, 190, 150, 10); g.fill();
        font(16, 700); g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText('SHOT ' + String(i + 1).padStart(2, '0'), x + 12, y + 178);
      }
    },
    oss: function (t) {
      windowFrame(60, 50, SW - 120, SH - 90, 'mastra-ai/mastra · pull requests');
      var prs = ['durable suspend on remote worker', 'cross-process durable tools', 'parallel tool calls', 'thread titles for durable agents', 'nested output-step spans', 'gcsfuse --implicit-dirs'];
      prs.forEach(function (p, i) {
        var y = 140 + i * 74, show = Math.min(1, Math.max(0, t * 3 - i * 0.6));
        g.globalAlpha = show;
        g.fillStyle = hexA(C.mag, .9); roundRect(100, y - 26, 96, 36, 18); g.fill();
        font(17, 700); g.fillStyle = '#1b1222'; g.fillText('merged', 116, y - 2);
        font(22); g.fillStyle = '#e6e1cf'; g.fillText(p, 222, y);
        g.globalAlpha = 1;
      });
    },
    wrap: function () {
      wallpaper(1.4);
      font(96, 800); g.fillStyle = '#f3f0e8'; g.textAlign = 'center'; g.fillText("LET'S TALK", SW / 2, SH / 2 + 10);
      font(26); g.fillStyle = C.accent; g.fillText('Open to remote roles or relocation', SW / 2, SH / 2 + 70);
      g.textAlign = 'left';
    },
    idle: function () { wallpaper(1); }
  };
  DRAW.videos = DRAW.counter; DRAW.infra = DRAW.counter; DRAW.demo = DRAW.video; DRAW.work = DRAW.scenes;

  var curScreen = -1, prevScreen = -1, since = 0, wipe = 1, power = 0;
  function paintScreen() {
    var cur = screens[curScreen] || screens[0];
    g.setTransform(RES, 0, 0, RES, 0, 0); g.globalCompositeOperation = 'source-over';
    g.save(); (DRAW[cur.key] || DRAW.idle)(since, cur); g.restore();
    if (wipe < 1 && prevScreen >= 0) {                        // old screen slides away under a bright seam
      var x = SW * smooth(wipe), old = screens[prevScreen];
      g.save(); g.beginPath(); g.rect(x, 0, SW - x, SH); g.clip();
      (DRAW[old.key] || DRAW.idle)(since + 2, old); g.restore();
      var seam = g.createLinearGradient(x - 40, 0, x + 6, 0); seam.addColorStop(0, 'rgba(255,255,255,0)'); seam.addColorStop(1, hexA(C.accent, .9));
      g.fillStyle = seam; g.fillRect(x - 40, 0, 46, SH);
    }
    if (power < 1) { g.fillStyle = 'rgba(0,0,0,' + (1 - power) + ')'; g.fillRect(0, 0, SW, SH); }
    // rounded display corners: the black glass shows through
    g.globalCompositeOperation = 'destination-in'; g.globalAlpha = 1; g.fillStyle = '#000'; roundRect(0, 0, SW, SH, 16); g.fill(); g.globalCompositeOperation = 'source-over';
    screenTex.needsUpdate = true;
  }

  /* ---------- poses ---------- */
  var POSE = {
    title: { x: 3.2, y: 0.7, z: -0.5, s: 0.95, rx: 0.3, ry: -0.5, a: 1 },
    side: { x: 2.7, y: 0.1, z: 0, s: 1, rx: 0.26, ry: -0.42, a: 1 },
    back: { x: 5.4, y: 1.5, z: -5, s: 0.75, rx: 0.3, ry: -0.62, a: 0.55, my: 2.6 },
    metric: { x: 3.3, y: 0.15, z: -1, s: 0.85, rx: 0.28, ry: -0.55, a: 1, my: 2.5 },
    hide: { x: 6.5, y: 2.6, z: -10, s: 0.6, rx: 0.4, ry: -0.9, a: 0 },
    wrap: { x: 2.8, y: 0.2, z: 0, s: 0.95, rx: 0.22, ry: -0.36, a: 1, my: -2.4 }
  };
  var poses = screens.map(function (s) { return POSE[s.pose] || POSE.side; });

  var ptr = { x: 0, y: 0 }, sm = { x: 0, y: 0 }, cur = film.t, open = 0, lastScroll = window.scrollY, vel = 0;
  window.addEventListener('pointermove', function (e) {
    ptr.x = e.clientX / window.innerWidth - 0.5; ptr.y = e.clientY / window.innerHeight - 0.5;
  }, { passive: true });

  function pose(t, time, dt) {
    var i = Math.min(Math.floor(t), poses.length - 1), f = smooth(t - i);
    var A = poses[i], B = poses[Math.min(i + 1, poses.length - 1)];
    var P = function (k) { return lerp(A[k], B[k], f); };
    var my = function (q) { return q.my !== undefined ? q.my : q.y * 0.4 + 2.1; };
    rig.position.set(small ? 0 : P('x'), (small ? lerp(my(A), my(B), f) : P('y')) + Math.sin(time * 0.55) * 0.035, P('z'));
    rig.scale.setScalar(P('s') * (small ? 0.6 : 1));
    rig.rotation.set(P('rx') + sm.y * 0.1, P('ry') + sm.x * 0.28 + Math.sin(time * 0.22) * 0.025, Math.sin(time * 0.17) * 0.008);
    var a = P('a');
    shell.forEach(function (m) { m.opacity = m === glass ? 0.16 * a : a; });
    screenMat.opacity = a; spill.material.opacity = 0.16 * a * power; auraU.uA.value = 0.9 * a * power; auraU.uTime.value = time;
    rig.visible = a > 0.01;
    // the lid opens once on arrival, then the screen powers on
    open = Math.min(1, open + dt / 1.5); var o = 1 - Math.pow(1 - smooth(open), 2);
    hinge.rotation.x = lerp(Math.PI / 2 - 0.02, -0.24, o);
    power = Math.max(0, Math.min(1, (open - 0.6) / 0.4));
    screenLight.intensity = 5 * power * a;
    // change of scene: wipe the screen and throw light out of it
    var nearest = Math.round(t);
    if (nearest !== curScreen) {
      prevScreen = curScreen; curScreen = nearest; since = 0; wipe = prevScreen < 0 ? 1 : 0;
      if (prevScreen >= 0 && a > 0.3) burstU.uT.value = 0;
    }
    since += dt; wipe = Math.min(1, wipe + dt / 0.55); burstU.uT.value += dt;
    // aura follows the laptop smoothly, always facing the camera, sitting behind it
    haloTarget.set(rig.position.x, rig.position.y + 0.35 * rig.scale.x, rig.position.z - 3);
    haloPos.lerp(haloTarget, Math.min(1, dt * 4)); if (haloPos.lengthSq() === 0) haloPos.copy(haloTarget);
    halo.position.copy(haloPos); halo.scale.setScalar(rig.scale.x); halo.quaternion.copy(cam.quaternion);
    if (rig.visible) paintScreen();
  }

  function size() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    small = w < 760;
    var px = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    renderer.setPixelRatio(px); renderer.setSize(w, h, false);
    dustU.uPx.value = burstU.uPx.value = px * (h / 900);
    cam.aspect = w / Math.max(h, 1); cam.fov = small ? 40 : 30; cam.updateProjectionMatrix();
  }
  new MutationObserver(function () {
    readColours(); burstU.uColor.value.set(C.accent); auraU.uC1.value.set(C.accent); auraU.uC2.value.set(C.blue); auraU.uC3.value.set(C.mag);
    var light = root.getAttribute('data-theme') === 'light';
    dust.material.blending = halo.material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending; auraU.uLight.value = light ? 1 : 0;
    dust.material.needsUpdate = halo.material.needsUpdate = true;
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  if (root.getAttribute('data-theme') === 'light') { halo.material.blending = THREE.NormalBlending; halo.material.needsUpdate = true; }

  var raf = null, last = 0, time = 0, vis = true;
  function frame(ts) {
    var dt = Math.min((ts - last) / 1000, 0.05); last = ts; time += dt;
    cur += (film.t - cur) * (1 - Math.exp(-dt * 4.5));
    var ease = 1 - Math.exp(-dt * 2.2); sm.x += (ptr.x - sm.x) * ease; sm.y += (ptr.y - sm.y) * ease;   // frame-rate independent
    var y = window.scrollY; vel += ((y - lastScroll) - vel) * 0.1; lastScroll = y;
    dustU.uTime.value = time; dustU.uScroll.value += vel * 0.0006;           // dust drifts faster while scrolling
    pose(cur, time, dt);
    renderer.render(scene, cam);
    raf = requestAnimationFrame(frame);
  }
  function run() { if (raf === null && vis) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }
  window.addEventListener('resize', size);
  document.addEventListener('visibilitychange', function () { vis = !document.hidden; vis ? run() : stop(); });
  // ponytail: the stage is sticky for the whole film, so only page visibility gates the loop
  size(); run();

  /* ---------- helpers ---------- */
  function roundRect(x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
  function radial(s, a, b) {
    var cv = document.createElement('canvas'); cv.width = cv.height = s; var x = cv.getContext('2d');
    var gr = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); gr.addColorStop(0, a); gr.addColorStop(1, b);
    x.fillStyle = gr; x.fillRect(0, 0, s, s); return new THREE.CanvasTexture(cv);
  }
}

function lerp(a, b, f) { return a + (b - a) * f; }
function smooth(f) { return f * f * (3 - 2 * f); }
function hexA(hex, a) {
  var h = String(hex).replace('#', ''); if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
  var n = parseInt(h, 16); if (isNaN(n)) return 'rgba(230,180,80,' + a + ')';
  return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
}
function mulberry(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    var t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
