/* moyosoresaibu.com — homepage 3D (v9.0.0)
 *
 * One scroll-driven WebGL2 scene, hand-written, no library (see
 * docs/design-system.md: "no framework, no animation library").
 * The scene is the site's method, drawn as a sales territory:
 *   stuck → diagnose (scan finds leaking outlets) → prioritise (the few that
 *   matter rise) → execute (a route is drawn and walked) → measure (what moved).
 * Everything is progressive enhancement: the text story reads top-to-bottom
 * with JS/WebGL off, and a static poster stands in for the canvas.
 */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => a + (b - a) * t;
const mixV = (a, b, t) => a.map((x, i) => mix(x, b[i], t));
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

/* ---------- palette (LinkedIn-derived, mirrors :root in site.css) ---------- */
const C = {
  bg: hex('#f4f2ee'),
  outlet: hex('#d7dce3'),
  leak: hex('#e8a33d'),
  blue: hex('#0a66c2'),
  sky: hex('#70b5f9'),
  ink: hex('#1d2226'),
};

/* ---------- tiny mat4 ---------- */
function perspective(fovy, aspect, near, far, shiftX, shiftY) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, shiftX, shiftY, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}
function lookAt(e, c, u) {
  let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2];
  let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
  let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx;
  l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  return [xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
    -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1];
}
function mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  }
  return o;
}

/* ---------- deterministic territory ---------- */
function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
function buildTerritory() {
  const r = rng(20261029);
  const outlets = [];
  const step = 1.05;
  for (let gx = -7; gx <= 7; gx++) for (let gz = -7; gz <= 7; gz++) {
    const x = gx * step + (r() - .5) * .55, z = gz * step + (r() - .5) * .55;
    const a = Math.atan2(z, x), d = Math.hypot(x, z);
    const edge = 5.6 + Math.sin(a * 3 + 1.2) * .9 + Math.sin(a * 5 - .4) * .45;
    if (d > edge || r() < .42) continue;
    outlets.push({ x, z, d, w: .36 + r() * .12, h: .22 + r() * .26, seed: r() });
  }
  // leaks: roughly a third of outlets
  outlets.forEach(o => { o.leak = o.seed < .36; });
  // priority: the 8 leaks with the most "impact" (deterministic score), spread out
  const leaks = outlets.filter(o => o.leak).map(o => ({ o, s: o.seed * 3 + (1 - o.d / 6) }));
  leaks.sort((a, b) => b.s - a.s);
  const prio = [];
  for (const { o } of leaks) {
    if (prio.every(p => Math.hypot(p.x - o.x, p.z - o.z) > 1.9)) prio.push(o);
    if (prio.length === 8) break;
  }
  prio.forEach((o, i) => { o.prio = true; o.lift = 1.2 + ((i * 7) % 5) * .32; });
  // depot (distributor) at the territory edge, then nearest-neighbour route
  const depot = { x: -4.6, z: 4.4 };
  const route = [depot];
  const left = prio.slice();
  let cur = depot;
  while (left.length) {
    left.sort((a, b) => Math.hypot(a.x - cur.x, a.z - cur.z) - Math.hypot(b.x - cur.x, b.z - cur.z));
    cur = left.shift(); route.push(cur);
  }
  route.push(depot);
  return { outlets, prio, depot, route };
}

/* Catmull-Rom smoothed path with cumulative distance */
function samplePath(pts, perSeg = 18) {
  const out = [];
  const P = i => pts[Math.max(0, Math.min(pts.length - 1, i))];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let s = 0; s < perSeg; s++) {
      const t = s / perSeg, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0.x, p1.x, p2.x, p3.x), f(p0.z, p1.z, p2.z, p3.z)]);
    }
  }
  out.push([pts[pts.length - 1].x, pts[pts.length - 1].z]);
  let L = 0; const dist = [0];
  for (let i = 1; i < out.length; i++) { L += Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]); dist.push(L); }
  return { pts: out, dist: dist.map(d => d / L), length: L };
}
function pointAt(path, u) {
  const { pts, dist } = path;
  let i = 1; while (i < dist.length - 1 && dist[i] < u) i++;
  const k = (u - dist[i - 1]) / Math.max(1e-6, dist[i] - dist[i - 1]);
  return [mix(pts[i - 1][0], pts[i][0], k), mix(pts[i - 1][1], pts[i][1], k)];
}

/* ---------- GL helpers ---------- */
function shader(gl, type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function program(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const info = gl.getActiveUniform(p, i); u[info.name.replace('[0]', '')] = gl.getUniformLocation(p, info.name); }
  return { p, u };
}
function buffer(gl, data, usage = gl.STATIC_DRAW) {
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, usage); return b;
}
function attr(gl, loc, buf, size, stride = 0, offset = 0, divisor = 0) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, offset);
  gl.vertexAttribDivisor(loc, divisor);
}

/* rounded-ish box: unit cube x,z in [-.5,.5], y in [0,1], with bevel normals baked */
function boxGeometry() {
  const F = [
    [[0, 0, 1], [[-.5, 0, .5], [.5, 0, .5], [.5, 1, .5], [-.5, 1, .5]]],
    [[0, 0, -1], [[.5, 0, -.5], [-.5, 0, -.5], [-.5, 1, -.5], [.5, 1, -.5]]],
    [[1, 0, 0], [[.5, 0, .5], [.5, 0, -.5], [.5, 1, -.5], [.5, 1, .5]]],
    [[-1, 0, 0], [[-.5, 0, -.5], [-.5, 0, .5], [-.5, 1, .5], [-.5, 1, -.5]]],
    [[0, 1, 0], [[-.5, 1, .5], [.5, 1, .5], [.5, 1, -.5], [-.5, 1, -.5]]],
  ];
  const v = [];
  for (const [n, q] of F) for (const i of [0, 1, 2, 0, 2, 3]) v.push(...q[i], ...n);
  return new Float32Array(v);
}

const VS_BOX = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor;
layout(location=2) in vec3 iOff; layout(location=3) in vec3 iScale;
layout(location=4) in vec4 iCol; layout(location=5) in vec4 iTop;
uniform mat4 uVP;
out vec3 vN; out vec3 vW; out vec4 vC; out vec4 vT; out vec3 vL;
void main(){
  vec3 p = aPos * iScale + iOff;
  vW = p; vN = aNor; vC = iCol; vT = iTop; vL = aPos;
  gl_Position = uVP * vec4(p, 1.0);
}`;
const FS_BOX = `#version 300 es
precision highp float;
in vec3 vN; in vec3 vW; in vec4 vC; in vec4 vT; in vec3 vL;
uniform vec3 uBg; uniform vec3 uCam;
out vec4 o;
void main(){
  vec3 base = mix(vC.rgb, vT.rgb, smoothstep(0.0, 1.0, vL.y) * vT.a);
  vec3 L = normalize(vec3(0.45, 1.0, 0.3));
  float dif = max(dot(vN, L), 0.0);
  float hemi = 0.62 + 0.38 * vN.y;
  vec3 col = base * (0.7 * hemi + 0.36 * dif);
  // bevel highlight on top edges
  vec2 e = abs(vL.xz) * 2.0;
  float rim = vN.y > 0.5 ? smoothstep(0.82, 1.0, max(e.x, e.y)) : smoothstep(0.92, 1.0, vL.y);
  col += rim * 0.08;
  col *= mix(0.86, 1.0, smoothstep(0.0, 0.18, vW.y));
  col = mix(col, uBg, vC.a);
  float fog = smoothstep(16.0, 34.0, distance(vW, uCam));
  o = vec4(mix(col, uBg, fog * 0.7), 1.0);
}`;

const VS_SHADOW = `#version 300 es
layout(location=0) in vec2 aQ;
layout(location=2) in vec3 iOff; layout(location=3) in vec3 iScale; layout(location=4) in vec4 iCol;
uniform mat4 uVP;
out vec2 vQ; out float vA;
void main(){
  vQ = aQ; vA = (1.0 - iCol.a) * clamp(iScale.y * 0.9 + 0.25, 0.0, 1.0);
  vec3 p = iOff + vec3(aQ.x * iScale.x * 1.35 + 0.12, 0.003, aQ.y * iScale.z * 1.35 + 0.08);
  p.y = 0.003;
  gl_Position = uVP * vec4(p, 1.0);
}`;
const FS_SHADOW = `#version 300 es
precision highp float;
in vec2 vQ; in float vA; out vec4 o;
void main(){
  vec2 q = abs(vQ) * 2.0;
  float d = length(max(q - 0.45, 0.0)) / 0.55;
  float a = (1.0 - smoothstep(0.0, 1.0, d)) * 0.16 * vA;
  o = vec4(0.11, 0.13, 0.16, a);
}`;

const VS_GROUND = `#version 300 es
layout(location=0) in vec2 aQ;
uniform mat4 uVP; out vec2 vW;
void main(){ vW = aQ * 40.0; gl_Position = uVP * vec4(vW.x, 0.0, vW.y, 1.0); }`;
const FS_GROUND = `#version 300 es
precision highp float;
in vec2 vW;
uniform vec3 uBg; uniform vec3 uBlue; uniform float uScanR; uniform float uScanA;
uniform float uTime; uniform float uPulse; uniform vec2 uP[8];
out vec4 o;
void main(){
  float r = length(vW);
  vec2 g = fract(vW / 0.525) - 0.5;
  float dotm = 1.0 - smoothstep(0.035, 0.07, length(g));
  float fade = 1.0 - smoothstep(4.0, 11.0, r);
  vec3 col = mix(uBg, uBg * 0.84, dotm * fade * 0.55);
  // territory disc, very faint
  col = mix(col, uBg * 0.975, (1.0 - smoothstep(6.0, 7.5, r)) * 0.6);
  // scan ring
  float ring = exp(-pow((r - uScanR) / 0.22, 2.0)) * uScanA;
  float wake = smoothstep(uScanR, uScanR - 2.2, r) * step(r, uScanR) * uScanA * 0.10;
  col = mix(col, uBlue, clamp(ring * 0.55 + wake, 0.0, 1.0));
  // measure pulses around priority outlets
  for (int i = 0; i < 8; i++) {
    float d = distance(vW, uP[i]);
    float ph = fract(uTime * 0.35 + float(i) * 0.137);
    float pr = exp(-pow((d - ph * 1.6) / 0.07, 2.0)) * (1.0 - ph) * uPulse;
    col = mix(col, uBlue, pr * 0.5);
  }
  o = vec4(col, 1.0);
}`;

const VS_ROUTE = `#version 300 es
layout(location=0) in vec3 aP; layout(location=1) in vec2 aD;
uniform mat4 uVP; out vec2 vD;
void main(){ vD = aD; gl_Position = uVP * vec4(aP, 1.0); }`;
const FS_ROUTE = `#version 300 es
precision highp float;
in vec2 vD; uniform float uProg; uniform vec3 uBlue; uniform vec3 uSky; uniform float uTime; uniform float uOn;
out vec4 o;
void main(){
  if (vD.x > uProg) discard;
  float edge = 1.0 - smoothstep(0.55, 1.0, abs(vD.y));
  float head = smoothstep(uProg - 0.06, uProg, vD.x);
  float flow = 0.5 + 0.5 * sin((vD.x * 90.0) - uTime * 4.0);
  vec3 col = mix(uBlue, uSky, head * 0.8 + flow * 0.12);
  o = vec4(col, edge * uOn * 0.95);
}`;

function buildRoute(path, width) {
  const v = [];
  const { pts, dist } = path;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const nx = -dz * width, nz = dx * width;
    v.push(pts[i][0] + nx, .012, pts[i][1] + nz, dist[i], -1, pts[i][0] - nx, .012, pts[i][1] - nz, dist[i], 1);
  }
  return new Float32Array(v);
}

/* ---------- scene ---------- */
function createScene(canvas) {
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return null;
  let software = false;
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const name = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : '';
    software = /swiftshader|llvmpipe|software|basic render/i.test(name);
  } catch (e) { /* ignore */ }
  const T = buildTerritory();
  const path = samplePath(T.route);
  const prioU = T.prio.map(o => {
    let best = 0, bd = 1e9;
    path.pts.forEach((p, i) => { const d = Math.hypot(p[0] - o.x, p[1] - o.z); if (d < bd) { bd = d; best = i; } });
    return path.dist[best];
  });
  T.prio.forEach((o, i) => { o.u = prioU[i]; });

  const N = T.outlets.length + 2; // + depot + rep
  const STRIDE = 14; // off3 scale3 col4 top4
  const inst = new Float32Array(N * STRIDE);

  const progBox = program(gl, VS_BOX, FS_BOX);
  const progSh = program(gl, VS_SHADOW, FS_SHADOW);
  const progG = program(gl, VS_GROUND, FS_GROUND);
  const progR = program(gl, VS_ROUTE, FS_ROUTE);

  const quad = buffer(gl, new Float32Array([-.5, -.5, .5, -.5, .5, .5, -.5, -.5, .5, .5, -.5, .5]));
  const ground = buffer(gl, new Float32Array([-1, -1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1]));
  const box = buffer(gl, boxGeometry());
  const instBuf = buffer(gl, inst, gl.DYNAMIC_DRAW);
  const routeData = buildRoute(path, .07);
  const routeBuf = buffer(gl, routeData);
  const routeCount = routeData.length / 5;

  const vaoBox = gl.createVertexArray(); gl.bindVertexArray(vaoBox);
  attr(gl, 0, box, 3, 24, 0); attr(gl, 1, box, 3, 24, 12);
  const B = STRIDE * 4;
  attr(gl, 2, instBuf, 3, B, 0, 1); attr(gl, 3, instBuf, 3, B, 12, 1); attr(gl, 4, instBuf, 4, B, 24, 1); attr(gl, 5, instBuf, 4, B, 40, 1);
  const vaoSh = gl.createVertexArray(); gl.bindVertexArray(vaoSh);
  attr(gl, 0, quad, 2); attr(gl, 2, instBuf, 3, B, 0, 1); attr(gl, 3, instBuf, 3, B, 12, 1); attr(gl, 4, instBuf, 4, B, 24, 1);
  const vaoG = gl.createVertexArray(); gl.bindVertexArray(vaoG); attr(gl, 0, ground, 2);
  const vaoR = gl.createVertexArray(); gl.bindVertexArray(vaoR); attr(gl, 0, routeBuf, 3, 20, 0); attr(gl, 1, routeBuf, 2, 20, 12);
  gl.bindVertexArray(null);

  const pUniform = new Float32Array(16);
  T.prio.forEach((o, i) => { pUniform[i * 2] = o.x; pUniform[i * 2 + 1] = o.z; });

  const cam = { yaw: 0, pitch: 0, dist: 0, init: false };
  const ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  let W = 1, H = 1;

  function resize() {
    const dpr = software ? 1 : Math.min(devicePixelRatio || 1, 1.75);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // camera keyframes for stages 0..4: [yaw, pitch, dist]
  const K = [[.72, .58, 21.5], [.95, .8, 19], [1.28, .72, 18], [1.6, 1.0, 18.6], [2.02, .5, 19.2]];

  function frame(t, time) {
    // ---- stage weights
    const st = i => smooth(i - .8, i - .12, t);
    const sDiag = st(1), sPrio = st(2), sExec = st(3), sMeas = st(4);
    const scanR = mix(-.5, 9.5, sDiag);
    const scanA = Math.sin(Math.PI * clamp(sDiag)) * (sPrio < .5 ? 1 : 0);
    let routeProg = sExec;
    let repU = routeProg;
    if (!reduceMotion && sExec > .98) repU = (time * .06) % 1;

    // ---- instances
    let k = 0;
    const put = (x, y, z, sx, sy, sz, col, fade, top, topA) => {
      inst.set([x, y, z, sx, sy, sz, col[0], col[1], col[2], fade, top[0], top[1], top[2], topA], k); k += STRIDE;
    };
    for (const o of T.outlets) {
      const reveal = o.leak ? smooth(o.d - .35, o.d + .35, scanR) : 0;
      let col = C.outlet, h = o.h, fade = 0, top = C.outlet, topA = 0;
      if (o.leak) { col = mixV(C.outlet, C.leak, reveal); h = mix(o.h, o.h * .72, reveal); }
      if (o.prio) {
        const visited = smooth(o.u - .03, o.u + .01, routeProg);
        col = mixV(col, mixV(C.sky, C.blue, .35 + visited * .65), sPrio);
        h = mix(h, .62, sPrio);
        h = mix(h, o.lift + (reduceMotion ? 0 : Math.sin(time * 1.3 + o.seed * 9) * .04), sMeas);
        top = C.sky; topA = sMeas * .9;
      } else {
        fade = sPrio * .62 * (1 - sMeas * .45);
        if (o.leak) col = mixV(col, C.outlet, sMeas * .7);
        h = mix(h, h * 1.25, sMeas);
      }
      put(o.x, 0, o.z, o.w, h, o.w, col, fade, top, topA);
    }
    // depot
    const dh = mix(.5, .9, sExec);
    put(T.depot.x, 0, T.depot.z, .78, dh, .78, mixV(C.outlet, C.ink, smooth(.0, 1, sPrio)), 0, C.ink, 0);
    // rep marker (hidden until execute)
    const rp = pointAt(path, clamp(repU));
    const rs = smooth(2.25, 2.4, t) * .2;
    put(rp[0], .06 + (reduceMotion ? 0 : Math.abs(Math.sin(time * 5)) * .05), rp[1], rs, rs * 1.3, rs, C.blue, 0, C.sky, .8);

    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, inst);

    // ---- camera
    const i0 = Math.floor(clamp(t, 0, 3.999)), f = smooth(0, 1, t - i0);
    const kf = mixV(K[i0], K[i0 + 1], f);
    if (!cam.init) { cam.yaw = kf[0]; cam.pitch = kf[1]; cam.dist = kf[2]; cam.init = true; }
    const ease = (reduceMotion || software) ? 1 : .08;
    cam.yaw += (kf[0] - cam.yaw) * ease; cam.pitch += (kf[1] - cam.pitch) * ease; cam.dist += (kf[2] - cam.dist) * ease;
    ptr.sx += (ptr.x - ptr.sx) * .05; ptr.sy += (ptr.y - ptr.sy) * .05;
    const yaw = cam.yaw + (reduceMotion ? 0 : time * .018 + ptr.sx * .12);
    const pitch = clamp(cam.pitch + (reduceMotion ? 0 : ptr.sy * .05), .25, 1.35);
    const aspect = W / H;
    const wide = aspect > 1.05;
    const dist = cam.dist * (wide ? 1 : 1.12);
    const eye = [Math.cos(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.sin(yaw) * Math.cos(pitch) * dist];
    // lens shift: scene sits right of the copy on desktop, above it on phones
    const shiftX = wide ? -.5 : 0, shiftY = wide ? .04 : -.42;
    const fov = wide ? .56 : .74;
    const proj = perspective(fov, aspect, .1, 120, shiftX, shiftY);
    const VP = mul(proj, lookAt(eye, [0, .25, 0], [0, 1, 0]));

    // ---- draw
    gl.clearColor(C.bg[0], C.bg[1], C.bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(progG.p);
    gl.uniformMatrix4fv(progG.u.uVP, false, VP);
    gl.uniform3fv(progG.u.uBg, C.bg); gl.uniform3fv(progG.u.uBlue, C.blue);
    gl.uniform1f(progG.u.uScanR, scanR); gl.uniform1f(progG.u.uScanA, scanA);
    gl.uniform1f(progG.u.uTime, time); gl.uniform1f(progG.u.uPulse, reduceMotion ? 0 : sMeas);
    gl.uniform2fv(progG.u.uP, pUniform);
    gl.bindVertexArray(vaoG); gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
    gl.useProgram(progSh.p); gl.uniformMatrix4fv(progSh.u.uVP, false, VP);
    gl.bindVertexArray(vaoSh); gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, N - 1);

    if (routeProg > .001) {
      gl.useProgram(progR.p); gl.uniformMatrix4fv(progR.u.uVP, false, VP);
      gl.uniform1f(progR.u.uProg, routeProg); gl.uniform1f(progR.u.uTime, reduceMotion ? 0 : time);
      gl.uniform1f(progR.u.uOn, 1 - sMeas * .35);
      gl.uniform3fv(progR.u.uBlue, C.blue); gl.uniform3fv(progR.u.uSky, C.sky);
      gl.bindVertexArray(vaoR); gl.drawArrays(gl.TRIANGLE_STRIP, 0, routeCount);
    }
    gl.depthMask(true); gl.disable(gl.BLEND);

    gl.useProgram(progBox.p);
    gl.uniformMatrix4fv(progBox.u.uVP, false, VP);
    gl.uniform3fv(progBox.u.uBg, C.bg); gl.uniform3fv(progBox.u.uCam, eye);
    gl.bindVertexArray(vaoBox); gl.drawArraysInstanced(gl.TRIANGLES, 0, 30, N);
    gl.bindVertexArray(null);
  }

  return { gl, resize, frame, ptr, software };
}

/* ---------- story wiring ---------- */
function initStory() {
  const story = document.querySelector('[data-story]');
  const canvas = story && story.querySelector('canvas');
  if (!story || !canvas) return;
  const panels = [...story.querySelectorAll('[data-stage]')];
  const rail = [...document.querySelectorAll('[data-rail] [data-rail-step]')];
  let t = 0, visible = true, raf = 0, scene = null;
  const t0 = performance.now();

  function progress() {
    const r = story.getBoundingClientRect();
    const range = r.height - innerHeight;
    return clamp(-r.top / Math.max(1, range)) * (panels.length - 1);
  }
  function syncText() {
    const active = Math.round(t);
    panels.forEach((p, i) => p.classList.toggle('is-active', i === active));
    rail.forEach(s => s.classList.toggle('is-active', Number(s.dataset.railStep) <= active && active > 0));
    story.style.setProperty('--story-t', t.toFixed(3));
  }
  function loop(now) {
    raf = 0;
    t = progress();
    syncText();
    if (scene) scene.frame(t, (now - t0) / 1000);
    // keep animating only while the camera is still settling or the scene is idle-animated
    if (visible && scene && !reduceMotion && !scene.software) raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { if (scene) scene.resize(); kick(); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }, { rootMargin: '100px' }).observe(story);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) kick(); });
  syncText();

  const start = () => {
    try { scene = createScene(canvas); } catch (err) { scene = null; }
    if (!scene) { story.classList.add('no-webgl'); return; }
    scene.resize();
    if (!reduceMotion) {
      addEventListener('pointermove', e => {
        scene.ptr.x = (e.clientX / innerWidth - .5) * 2; scene.ptr.y = (e.clientY / innerHeight - .5) * 2;
      }, { passive: true });
    }
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); story.classList.add('no-webgl'); scene = null; });
    kick();
    requestAnimationFrame(() => requestAnimationFrame(() => story.classList.add('gl-ready')));
  };
  // The poster is a render of this exact first frame, so WebGL can wait for
  // the visitor's first gesture: zero GPU/main-thread cost on load (and in lab
  // tools, which never scroll), invisible swap when it does start.
  let started = false;
  const go = () => {
    if (started) return; started = true;
    GESTURES.forEach(ev => removeEventListener(ev, go, opts));
    (window.requestIdleCallback || (cb => setTimeout(cb, 1)))(start, { timeout: 300 });
  };
  const GESTURES = ['scroll', 'wheel', 'pointermove', 'pointerdown', 'touchstart', 'keydown'];
  const opts = { passive: true };
  GESTURES.forEach(ev => addEventListener(ev, go, opts));
  if (scrollY > 10) go();
}

/* ---------- field ring (CSS 3D, scroll-linked) ---------- */
function initRing() {
  const sec = document.querySelector('[data-ring]');
  if (!sec || reduceMotion) return;
  const ring = sec.querySelector('.ring');
  [...ring.children].forEach(c => {
    const d = c.cloneNode(true);
    d.setAttribute('aria-hidden', 'true');
    d.querySelectorAll('img').forEach(i => { i.alt = ''; });
    ring.appendChild(d);
  });
  const cards = [...ring.children];
  const n = cards.length;
  sec.classList.add('ring-on');
  let raf = 0;
  function layout() {
    const w = cards[0].offsetWidth;
    const R = Math.round((w * 1.1 * n) / (2 * Math.PI));
    ring.style.setProperty('--r', R + 'px');
    cards.forEach((c, i) => c.style.setProperty('--a', (360 / n) * i + 'deg'));
  }
  function update() {
    raf = 0;
    const r = sec.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(1, r.height - innerHeight));
    const rot = -p * 202.5;
    ring.style.setProperty('--rot', rot.toFixed(2) + 'deg');
    const front = ((Math.round(-rot / (360 / n)) % n) + n) % n;
    cards.forEach((c, i) => c.classList.toggle('is-front', i === front));
  }
  layout(); update();
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', () => { layout(); update(); });
}

/* ---------- tilt on problem cards (pointer only) ---------- */
function initTilt() {
  if (reduceMotion || !matchMedia('(hover: hover)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
      el.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
      el.style.setProperty('--mx', ((x + .5) * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((y + .5) * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
}

/* ---------- reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
}

document.documentElement.classList.add('js-3d');
initStory(); initRing(); initTilt(); initReveal();
