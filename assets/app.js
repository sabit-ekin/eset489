// ESET 489 course site: the hero "lab" animation (ten scenes that follow the 16 weeks), scroll-in effects,
// counters, the roadmap line and the grading donut. Everything stops under prefers-reduced-motion
// (the lab then shows one still frame of the chosen scene).
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // ---------- helpers ----------
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function gauss(R) { return Math.sqrt(-2 * Math.log(R() + 1e-9)) * Math.cos(2 * Math.PI * R()); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function ease(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function alpha(ctx, a) { ctx.globalAlpha = clamp(a, 0, 1); }
  function colors() {
    var cs = getComputedStyle(root), g = function (n) { return cs.getPropertyValue(n).trim(); };
    return { maroon: g('--maroon'), gold: g('--gold'), teal: g('--teal'), sage: g('--sage'), muted: g('--muted'),
      line: g('--line'), text: g('--text'), bg: g('--surface'), chip: g('--chip') };
  }
  function pill(ctx, x, y, w, h) { var r = h / 2; ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function arrow(ctx, a, b, col, w) { var ang = Math.atan2(b[1] - a[1], b[0] - a[0]), hl = 7 + w; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0] - Math.cos(ang) * hl * 0.6, b[1] - Math.sin(ang) * hl * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(b[0] - Math.cos(ang - 0.4) * hl, b[1] - Math.sin(ang - 0.4) * hl); ctx.lineTo(b[0] - Math.cos(ang + 0.4) * hl, b[1] - Math.sin(ang + 0.4) * hl); ctx.closePath(); ctx.fill(); }
  function label(ctx, txt, x, y, C, size) { ctx.font = '600 ' + (size || 12) + 'px Inter, system-ui, sans-serif'; ctx.fillStyle = C.muted; alpha(ctx, 0.9); ctx.fillText(txt, x, y); }

  // ---------- scenes ----------
  var SCENES = [
    { wk: 'Week 1', name: 'Foundations: the open AI toolbox you will use all semester', dur: 7,
      init: function () { return { tools: ['Python', 'PyTorch', 'TensorFlow', 'Hugging Face', 'Gradio', 'LangChain'] }; },
      draw: function (ctx, s, t, W, H, C) {
        var cx = W / 2, cy = H * 0.54, rx = W * 0.33, ry = H * 0.32, n = s.tools.length, col = [C.maroon, C.gold, C.teal];
        var fs = Math.max(11, Math.min(14, W / 36)); ctx.font = '600 ' + fs + 'px Inter, system-ui, sans-serif';
        s.tools.forEach(function (name, i) {
          var f = ease((t - 0.4 - i * 0.4) / 0.6); if (!f) return;
          var a = -Math.PI / 2 + i * 2 * Math.PI / n + t * 0.06, x = cx + Math.cos(a) * rx * f, y = cy + Math.sin(a) * ry * f;
          alpha(ctx, 0.35 * f); ctx.strokeStyle = col[i % 3]; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
          var u = (t * 0.55 + i / n) % 1; if (i % 2) u = 1 - u;   // data moving both ways
          alpha(ctx, f); ctx.fillStyle = col[i % 3]; ctx.beginPath(); ctx.arc(cx + (x - cx) * u, cy + (y - cy) * u, 3, 0, 7); ctx.fill();
          var w = ctx.measureText(name).width + fs * 1.4, h = fs * 2.1;
          alpha(ctx, f); ctx.fillStyle = C.bg; pill(ctx, x - w / 2, y - h / 2, w, h); ctx.fill(); ctx.strokeStyle = col[i % 3]; ctx.lineWidth = 1.6; ctx.stroke();
          ctx.fillStyle = C.text; ctx.textBaseline = 'middle'; ctx.fillText(name, x - w / 2 + fs * 0.7, y + 1); ctx.textBaseline = 'alphabetic';
        });
        var pulse = 1 + 0.06 * Math.sin(t * 3);
        alpha(ctx, 1); ctx.fillStyle = C.maroon; ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.09 * pulse, 0, 7); ctx.fill();
        ctx.fillStyle = C.bg; ctx.font = '600 ' + Math.round(Math.min(W, H) * 0.075) + 'px "EB Garamond", Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('AI', cx, cy + 1); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        label(ctx, 'open tools, open models', W * 0.06, H * 0.1, C, 12);
      } },

    { wk: 'Weeks 2–3', name: 'Linear algebra: a matrix transforms every data vector at once', dur: 7,
      init: function () { return {}; },
      draw: function (ctx, s, t, W, H, C) {
        var cx = W * 0.5, cy = H * 0.56, u = Math.min(W, H) * 0.12, A = [[1.25, 0.55], [-0.35, 1.05]];
        var f = ease((t - 1) / 2.2) - ease((t - 5.2) / 1.2) * 0;   // morph, then hold
        var M = [[1 + (A[0][0] - 1) * f, A[0][1] * f], [A[1][0] * f, 1 + (A[1][1] - 1) * f]];
        function P(x, y) { return [cx + (M[0][0] * x + M[0][1] * y) * u, cy - (M[1][0] * x + M[1][1] * y) * u]; }
        ctx.lineWidth = 1; ctx.strokeStyle = C.line;
        for (var i = -6; i <= 6; i++) {
          alpha(ctx, i ? 1 : 0); var a = P(i, -6), b = P(i, 6); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          a = P(-6, i); b = P(6, i); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
        alpha(ctx, 0.8); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.4;
        var a0 = P(-6, 0), b0 = P(6, 0), a1 = P(0, -6), b1 = P(0, 6);
        ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(b0[0], b0[1]); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(b1[0], b1[1]); ctx.stroke();
        var o = P(0, 0); alpha(ctx, 1);
        arrow(ctx, o, P(1, 0), C.maroon, 3); arrow(ctx, o, P(0, 1), C.teal, 3); arrow(ctx, o, P(1.6, 1.2), C.gold, 3.5);
        var q = P(1.6, 1.2); label(ctx, f > 0.5 ? 'A·x' : 'x', q[0] + 8, q[1] - 6, C, 13);
        ctx.font = '600 12px Inter, system-ui, sans-serif'; ctx.fillStyle = C.muted; alpha(ctx, 0.95);
        ctx.fillText('A = [ ' + M[0][0].toFixed(2) + '  ' + M[0][1].toFixed(2) + ' ]', W * 0.06, H * 0.1);
        ctx.fillText('      [ ' + M[1][0].toFixed(2) + '  ' + M[1][1].toFixed(2) + ' ]', W * 0.06, H * 0.1 + 17);
      } },

    { wk: 'Week 3', name: 'Calculus for optimization: gradient descent walks downhill to the minimum', dur: 7,
      init: function () { var p = [[3, 0.95]]; for (var k = 0; k < 9; k++) { var q = p[p.length - 1]; p.push([q[0] * 0.62, q[1] * -0.55]); } return { p: p }; },
      draw: function (ctx, s, t, W, H, C) {
        var cx = W * 0.5, cy = H * 0.56, u = Math.min(W * 0.13, H * 0.19), th = -0.35, c = Math.cos(th), sn = Math.sin(th);
        function P(x, y) { return [cx + (x * c - y * sn) * u, cy - (x * sn + y * c) * u]; }
        [0.4, 1.2, 2.6, 4.6, 7.2, 10.4].forEach(function (L, k) {   // contours of L = x² + 4y²
          alpha(ctx, 0.25 + 0.1 * (5 - k) / 5); ctx.strokeStyle = k < 2 ? C.teal : C.muted; ctx.lineWidth = 1.3; ctx.beginPath();
          for (var a = 0; a <= 6.3; a += 0.08) { var q = P(Math.sqrt(L) * Math.cos(a), Math.sqrt(L) / 2 * Math.sin(a)); a ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
          ctx.stroke();
        });
        var step = clamp((t - 0.8) / 0.6, 0, s.p.length - 1), i0 = Math.floor(step), f = ease(step - i0), i1 = Math.min(i0 + 1, s.p.length - 1);
        var cur = [s.p[i0][0] + (s.p[i1][0] - s.p[i0][0]) * f, s.p[i0][1] + (s.p[i1][1] - s.p[i0][1]) * f];
        alpha(ctx, 0.9); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.2; ctx.beginPath();
        for (var k = 0; k <= i0; k++) { var q = P(s.p[k][0], s.p[k][1]); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
        var cp = P(cur[0], cur[1]); ctx.lineTo(cp[0], cp[1]); ctx.stroke();
        for (k = 0; k <= i0; k++) { q = P(s.p[k][0], s.p[k][1]); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, 7); ctx.fill(); }
        var m = P(0, 0); alpha(ctx, 0.9); ctx.strokeStyle = C.teal; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m[0] - 5, m[1] - 5); ctx.lineTo(m[0] + 5, m[1] + 5); ctx.moveTo(m[0] + 5, m[1] - 5); ctx.lineTo(m[0] - 5, m[1] + 5); ctx.stroke();
        if (step < s.p.length - 1.5) { var g = [-2 * cur[0] * 0.25, -8 * cur[1] * 0.25]; alpha(ctx, 0.9); arrow(ctx, cp, P(cur[0] + g[0], cur[1] + g[1]), C.maroon, 2); }
        alpha(ctx, 1); ctx.fillStyle = C.maroon; ctx.beginPath(); ctx.arc(cp[0], cp[1], 7, 0, 7); ctx.fill();
        label(ctx, 'step ' + Math.round(step) + ':  w ← w − η ∇L(w)', W * 0.06, H * 0.1, C, 12);
      } },

    { wk: 'Week 4', name: 'Probability and statistics: random samples build up a bell curve', dur: 8,
      init: function () { var R = rng(21), x = []; for (var i = 0; i < 150; i++) x.push(clamp(gauss(R), -3.2, 3.19)); return { x: x, R: R }; },
      draw: function (ctx, s, t, W, H, C) {
        var nb = 15, x0 = W * 0.1, x1 = W * 0.9, bw = (x1 - x0) / nb, base = H * 0.88, hu = H * 0.62 / 28, cnt = [], done = 0;
        for (var b = 0; b < nb; b++) cnt.push(0);
        ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; alpha(ctx, 1); ctx.beginPath(); ctx.moveTo(x0 - 6, base + 1); ctx.lineTo(x1 + 6, base + 1); ctx.stroke();
        s.x.forEach(function (v, k) {
          var bin = Math.floor((v + 3.2) / 6.4 * nb), tk = 0.3 + k * 0.038, f = (t - tk) / 0.45; if (f <= 0) return;
          if (f >= 1) { cnt[bin]++; done++; return; }
          var x = x0 + (bin + 0.5) * bw, y = H * 0.14 + (base - cnt[bin] * hu - H * 0.14) * f * f;
          alpha(ctx, 0.9); ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fill();
        });
        cnt.forEach(function (n, b) { if (!n) return; alpha(ctx, 0.85); ctx.fillStyle = Math.abs(b - 7) <= 1 ? C.maroon : C.gold; ctx.fillRect(x0 + b * bw + 1.5, base - n * hu, bw - 3, n * hu); });
        var g = clamp((done - 60) / 60, 0, 1);
        if (g) { alpha(ctx, 0.9 * g); ctx.strokeStyle = C.maroon; ctx.lineWidth = 2.5; ctx.beginPath();
          for (var x = -3.2; x <= 3.2; x += 0.05) { var y = done * (6.4 / nb) * Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); var px = x0 + (x + 3.2) / 6.4 * (x1 - x0), py = base - y * hu; x > -3.2 ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
          ctx.stroke(); }
        label(ctx, 'n = ' + done + ' samples' + (g > 0.5 ? '  ·  normal distribution' : ''), W * 0.06, H * 0.1, C, 12);
      } },

    { wk: 'Week 5', name: 'Machine learning pipelines: data is cleaned, turned into features, trained on, evaluated, and deployed', dur: 8,
      init: function () { var R = rng(17), d = []; for (var i = 0; i < 16; i++) d.push({ o: i / 16, j: (R() - 0.5) * 14, c: Math.floor(R() * 4) }); return { st: ['Data', 'Clean', 'Features', 'Train', 'Evaluate', 'Deploy'], d: d }; },
      draw: function (ctx, s, t, W, H, C) {
        var n = s.st.length, cols = W >= 520 ? n : 3, rows = Math.ceil(n / cols), fs = Math.max(11, Math.min(14, W / 38));
        var bw = Math.min(118, (W * 0.88 - (cols - 1) * 14) / cols), bh = fs * 2.6, gx = (W * 0.88 - cols * bw) / Math.max(1, cols - 1);
        var rowH = rows > 1 ? H * 0.3 : 0, top = H * 0.5 - rowH / 2, pts = [];
        s.st.forEach(function (name, i) { var r = Math.floor(i / cols), k = i % cols; if (r % 2) k = cols - 1 - k; pts.push([W * 0.06 + k * (bw + gx) + bw / 2, top + r * rowH]); });
        var seg = [0]; for (var i = 1; i < n; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); var Ltot = seg[n - 1];
        function at(d) { for (var i = 1; i < n; i++) if (d <= seg[i]) { var f = (d - seg[i - 1]) / (seg[i] - seg[i - 1]); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f, i - 1 + f]; } return [pts[n - 1][0], pts[n - 1][1], n - 1]; }
        alpha(ctx, 1); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.beginPath(); pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
        var raw = [C.muted, C.maroon, C.gold, C.teal], show = clamp(t / 0.6, 0, 1);
        s.d.forEach(function (p) {
          var q = at(((t * 0.11 + p.o) % 1) * Ltot), k = q[2], messy = k < 1;
          var jy = messy ? p.j * (1 - k) : 0;
          alpha(ctx, show * (k > n - 1.3 ? (n - 1 - k) / 0.3 : 1)); ctx.fillStyle = messy ? raw[p.c] : k < 3 ? C.teal : C.gold;
          if (k >= 2 && k < 3) { ctx.fillRect(q[0] - 4.5, q[1] - 4.5 + jy, 9, 9); } else { ctx.beginPath(); ctx.arc(q[0], q[1] + jy, k >= 3 ? 5 : 4, 0, 7); ctx.fill(); }
        });
        ctx.font = '600 ' + fs + 'px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        s.st.forEach(function (name, i) {
          var p = pts[i], f = ease((t - i * 0.2) / 0.5); if (!f) return;
          alpha(ctx, f); ctx.fillStyle = C.bg; pill(ctx, p[0] - bw / 2, p[1] - bh / 2, bw, bh); ctx.fill();
          ctx.strokeStyle = i === n - 1 ? C.gold : C.maroon; ctx.lineWidth = 1.8; ctx.stroke();
          ctx.fillStyle = C.text; ctx.fillText(name + (i === 4 && Math.sin(t * 4) > 0 ? ' ✓' : ''), p[0], p[1] + 1);
        });
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        label(ctx, 'raw data → trained model → product', W * 0.06, H * 0.1, C, 12);
      } },

    { wk: 'Weeks 6–7', name: 'Supervised learning: a line learns to fit the data', dur: 8,
      init: function () {
        var R = rng(7), pts = [], sx = 0, sy = 0, sxx = 0, sxy = 0, n = 22;
        for (var i = 0; i < n; i++) { var x = 0.06 + 0.88 * (i + R() * 0.8) / n, y = 0.2 + 0.55 * x + gauss(R) * 0.06; pts.push([x, y]); sx += x; sy += y; sxx += x * x; sxy += x * y; }
        var a = (n * sxy - sx * sy) / (n * sxx - sx * sx), b = (sy - a * sx) / n;
        return { pts: pts, a: a, b: b };
      },
      draw: function (ctx, s, t, W, H, C) {
        var m = { l: W * 0.1, r: W * 0.05, t: H * 0.12, b: H * 0.12 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
        function X(x) { return m.l + x * pw; } function Y(y) { return m.t + (1 - y) * ph; }
        ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; alpha(ctx, 1);
        ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, m.t + ph); ctx.lineTo(m.l + pw, m.t + ph); ctx.stroke();
        var k = Math.exp(-Math.max(0, t - 0.9) / 1.4), osc = Math.cos(Math.max(0, t - 0.9) * 2.2);
        var a = s.a + (-0.35 - s.a) * k * osc, b = s.b + (0.78 - s.b) * k;
        s.pts.forEach(function (p, i) {   // residuals
          var f = clamp((t - i * 0.03) / 0.4, 0, 1); if (!f) return;
          var yh = a * p[0] + b; alpha(ctx, 0.35 * f); ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
          ctx.beginPath(); ctx.moveTo(X(p[0]), Y(p[1])); ctx.lineTo(X(p[0]), Y(yh)); ctx.stroke(); ctx.setLineDash([]);
        });
        s.pts.forEach(function (p, i) {
          var f = clamp((t - i * 0.03) / 0.4, 0, 1); if (!f) return;
          alpha(ctx, f); ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 4.5 * ease(f), 0, 7); ctx.fill();
        });
        alpha(ctx, clamp((t - 0.6) / 0.5, 0, 1)); ctx.strokeStyle = C.maroon; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(X(0), Y(b)); ctx.lineTo(X(1), Y(a + b)); ctx.stroke();
        // loss curve, top left
        var lx = m.l + 14, ly = m.t + 6, lw = Math.min(140, pw * 0.36), lh = 46, T = clamp(t - 0.9, 0, 6.5);
        alpha(ctx, 0.9); ctx.fillStyle = C.bg; ctx.fillRect(lx - 6, ly - 4, lw + 12, lh + 26);
        ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(lx - 6, ly - 4, lw + 12, lh + 26);
        label(ctx, 'loss', lx, ly + 10, C, 11);
        ctx.strokeStyle = C.gold; ctx.lineWidth = 2; alpha(ctx, 1); ctx.beginPath();
        for (var u = 0; u <= T; u += 0.05) { var L = Math.exp(-u / 0.9) * (0.75 + 0.25 * Math.cos(u * 2.2)) ; var px = lx + (u / 6.5) * lw, py = ly + 16 + (1 - clamp(L, 0, 1)) * lh; u ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
        ctx.stroke();
      } },

    { wk: 'Weeks 8–9', name: 'Unsupervised learning: k-means finds the groups on its own', dur: 8,
      init: function () {
        var R = rng(11), c = [[0.24, 0.68], [0.74, 0.72], [0.55, 0.24]], pts = [];
        c.forEach(function (cc) { for (var i = 0; i < 17; i++) pts.push([cc[0] + gauss(R) * 0.075, cc[1] + gauss(R) * 0.075]); });
        var cent = [[0.45, 0.5], [0.52, 0.56], [0.4, 0.42]], hist = [cent];
        for (var it = 0; it < 6; it++) {
          var sum = cent.map(function () { return [0, 0, 0]; });
          pts.forEach(function (p) { var k = near(cent, p); sum[k][0] += p[0]; sum[k][1] += p[1]; sum[k][2]++; });
          cent = sum.map(function (sm, k) { return sm[2] ? [sm[0] / sm[2], sm[1] / sm[2]] : cent[k]; }); hist.push(cent);
        }
        return { pts: pts, hist: hist };
        function near(cs, p) { var bi = 0, bd = 9; cs.forEach(function (q, k) { var d = (q[0] - p[0]) * (q[0] - p[0]) + (q[1] - p[1]) * (q[1] - p[1]); if (d < bd) { bd = d; bi = k; } }); return bi; }
      },
      draw: function (ctx, s, t, W, H, C) {
        var m = W * 0.08, pw = W - 2 * m, ph = H - 2 * m, col = [C.maroon, C.gold, C.teal];
        function X(x) { return m + x * pw; } function Y(y) { return m + (1 - y) * ph; }
        var step = clamp((t - 1.2) / 1.0, 0, s.hist.length - 1), i0 = Math.floor(step), i1 = Math.min(i0 + 1, s.hist.length - 1), f = ease(step - i0);
        var cent = s.hist[i0].map(function (c, k) { return [c[0] + (s.hist[i1][k][0] - c[0]) * f, c[1] + (s.hist[i1][k][1] - c[1]) * f]; });
        var show = clamp((t - 1.0) / 0.5, 0, 1);
        s.pts.forEach(function (p, i) {
          var a = clamp((t - i * 0.012) / 0.4, 0, 1); if (!a) return;
          var bi = 0, bd = 9; cent.forEach(function (q, k) { var d = (q[0] - p[0]) * (q[0] - p[0]) + (q[1] - p[1]) * (q[1] - p[1]); if (d < bd) { bd = d; bi = k; } });
          alpha(ctx, a); ctx.fillStyle = show ? col[bi] : C.muted; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 4.5, 0, 7); ctx.fill();
        });
        if (!show) return;
        cent.forEach(function (c, k) {   // paths so far, then the centroid
          alpha(ctx, 0.5 * show); ctx.strokeStyle = col[k]; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]); ctx.beginPath();
          for (var j = 0; j <= i0; j++) { var q = s.hist[j][k]; j ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1])); }
          ctx.lineTo(X(c[0]), Y(c[1])); ctx.stroke(); ctx.setLineDash([]);
          var x = X(c[0]), y = Y(c[1]); alpha(ctx, show);
          ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill();
          ctx.strokeStyle = col[k]; ctx.lineWidth = 3; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke();
        });
        label(ctx, 'iteration ' + Math.min(Math.round(step), s.hist.length - 1), m, m - 6, C, 12);
      } },

    { wk: 'Weeks 10–12', name: 'Deep learning: signals flow forward, errors flow back, weights learn', dur: 8,
      init: function () {
        var R = rng(5), L = [4, 6, 6, 3], w = [];
        for (var i = 0; i < L.length - 1; i++) { w.push([]); for (var a = 0; a < L[i]; a++) { w[i].push([]); for (var b = 0; b < L[i + 1]; b++) w[i][a].push(gauss(R)); } }
        return { L: L, w: w, R: R, last: -1 };
      },
      draw: function (ctx, s, t, W, H, C) {
        var L = s.L, pos = [], cyc = 4, ph = (t % cyc) / cyc, n = Math.floor(t / cyc);
        if (n !== s.last) { s.last = n; if (n > 0) s.w.forEach(function (l) { l.forEach(function (r) { r.forEach(function (v, j) { r[j] = v * 0.9 + gauss(s.R) * 0.35; }); }); }); }
        L.forEach(function (k, i) { pos.push([]); for (var j = 0; j < k; j++) pos[i].push([W * (0.14 + 0.72 * i / (L.length - 1)), H * (0.5 + (j - (k - 1) / 2) * Math.min(0.14, 0.8 / k))]); });
        var gaps = L.length - 1, fwd = clamp(ph / 0.55, 0, 1), back = clamp((ph - 0.6) / 0.35, 0, 1);
        for (var i = 0; i < gaps; i++) for (var a = 0; a < L[i]; a++) for (var b = 0; b < L[i + 1]; b++) {
          var p = pos[i][a], q = pos[i + 1][b], wv = s.w[i][a][b];
          alpha(ctx, 0.15 + Math.min(0.45, Math.abs(wv) * 0.25)); ctx.strokeStyle = wv > 0 ? C.maroon : C.muted; ctx.lineWidth = 0.6 + Math.min(2.4, Math.abs(wv) * 1.1);
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
          var u = fwd * gaps - i;   // forward pulse on this gap
          if (u > 0 && u < 1 && Math.abs(wv) > 0.5) { alpha(ctx, 0.95); ctx.fillStyle = C.maroon; ctx.beginPath(); ctx.arc(p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, 2.6, 0, 7); ctx.fill(); }
          var v = back * gaps - (gaps - 1 - i);   // backward pulse
          if (v > 0 && v < 1 && Math.abs(wv) > 0.7) { alpha(ctx, 0.95); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(q[0] + (p[0] - q[0]) * v, q[1] + (p[1] - q[1]) * v, 2.6, 0, 7); ctx.fill(); }
        }
        pos.forEach(function (layer, i) {
          var lit = clamp(fwd * gaps - i + 1, 0, 1), glow = i === 0 ? clamp(fwd * 8, 0, 1) : clamp(fwd * gaps - (i - 1) - 0.85, 0, 1) * 6;
          layer.forEach(function (p, j) {
            var on = i === 0 ? 1 : clamp(glow, 0, 1) * (0.4 + 0.6 * Math.abs(Math.sin(j * 1.7 + i + s.last)));
            alpha(ctx, 1); ctx.fillStyle = C.bg; ctx.strokeStyle = i === L.length - 1 ? C.gold : C.maroon; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 7); ctx.fill(); ctx.stroke();
            alpha(ctx, on * lit); ctx.fillStyle = i === L.length - 1 ? C.gold : C.maroon; ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 7); ctx.fill();
          });
        });
        label(ctx, back > 0 && back < 1 ? 'backpropagation' : 'forward pass', W * 0.06, H * 0.1, C, 12);
        label(ctx, 'input', pos[0][0][0] - 14, H * 0.93, C, 11);
        label(ctx, 'output', pos[L.length - 1][0][0] - 18, H * 0.93, C, 11);
      } },

    { wk: 'Weeks 13–14', name: 'Transformers: attention picks the words that matter, then the next word', dur: 9,
      init: function () {
        return { base: ['Motor', '3', 'vibration', 'is', 'rising', 'above', 'normal', ','],
          gen: [{ w: 'schedule', att: [0.5, 0.2, 0.9, 0.1, 0.8, 0.3, 0.6, 0.1] }, { w: 'maintenance', att: [0.6, 0.3, 0.7, 0.05, 0.4, 0.2, 0.5, 0.1, 0.9] }, { w: 'today', att: [0.2, 0.1, 0.4, 0.1, 0.9, 0.2, 0.3, 0.1, 0.5, 0.8] }] };
      },
      draw: function (ctx, s, t, W, H, C) {
        var fs = Math.max(11, Math.min(15, W / 34)), ph = fs * 2, gap = fs * 0.55, toks = s.base.slice();
        var per = 2.6, k = clamp(Math.floor((t - 0.8) / per), -1, s.gen.length - 1), u = (t - 0.8 - Math.max(k, 0) * per) / per;
        for (var i = 0; i <= k && i < s.gen.length; i++) if (i < k || u > 0.62) toks.push(s.gen[i].w);
        var pending = k >= 0 && u <= 0.62 ? s.gen[k] : (k + 1 < s.gen.length && t > 0.8 + (k + 1) * per ? null : null);
        ctx.font = '600 ' + fs + 'px Inter, system-ui, sans-serif';
        var all = toks.slice(); if (pending) all.push('?');
        var boxes = [], x = W * 0.06, y = H * 0.56, maxX = W * 0.94;
        all.forEach(function (w) { var bw = ctx.measureText(w).width + fs * 1.3; if (x + bw > maxX) { x = W * 0.06; y += ph + gap * 1.6; } boxes.push([x, y, bw]); x += bw + gap; });
        if (pending) {   // attention arcs from the new position to every earlier token
          var q = boxes[boxes.length - 1], qx = q[0] + q[2] / 2, qy = q[1], grow = ease(u / 0.5);
          pending.att.forEach(function (a, j) {
            if (j >= boxes.length - 1) return;
            var bx = boxes[j][0] + boxes[j][2] / 2, by = boxes[j][1], top = Math.min(qy, by) - (20 + Math.abs(qx - bx) * 0.28) * grow;
            alpha(ctx, (0.15 + 0.75 * a) * grow); ctx.strokeStyle = a > 0.55 ? C.gold : C.maroon; ctx.lineWidth = 1 + a * 4.5;
            ctx.beginPath(); ctx.moveTo(qx, qy); ctx.quadraticCurveTo((qx + bx) / 2, top, bx, by); ctx.stroke();
          });
        }
        boxes.forEach(function (b, j) {
          var isNew = j >= s.base.length, isQ = pending && j === boxes.length - 1;
          var hot = pending && !isQ && pending.att[j] > 0.55;
          alpha(ctx, 1); ctx.fillStyle = isQ ? C.chip : hot ? C.gold : isNew ? C.maroon : C.bg;
          pill(ctx, b[0], b[1], b[2], ph); ctx.fill(); ctx.strokeStyle = isNew || hot ? 'transparent' : C.line; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.fillStyle = isNew || hot ? C.bg : C.text; if (isQ) ctx.fillStyle = C.muted;
          ctx.textBaseline = 'middle'; ctx.fillText(all[j], b[0] + fs * 0.65, b[1] + ph / 2 + 1); ctx.textBaseline = 'alphabetic';
        });
        label(ctx, pending ? 'attention → next word' : 'large language model', W * 0.06, H * 0.12, C, 12);
      } },

    { wk: 'Week 14', name: 'Generative AI: a diffusion model turns noise into a picture, step by step', dur: 8,
      init: function () {
        var cw = 40, ch = 30, oc = document.createElement('canvas'); oc.width = cw; oc.height = ch;
        var g = oc.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch);
        g.fillStyle = '#f00'; g.beginPath();   // a gear (maroon) with a gold hub and a wave (teal) below
        var cx = 20, cy = 13, r1 = 9.5, r2 = 7, teeth = 10;
        for (var i = 0; i <= teeth * 2; i++) { var a = i / (teeth * 2) * Math.PI * 2, r = i % 2 ? r2 : r1; for (var d = -0.12; d <= 0.12; d += 0.12) g.lineTo(cx + Math.cos(a + d) * r, cy + Math.sin(a + d) * r); }
        g.fill(); g.fillStyle = '#ff0'; g.beginPath(); g.arc(cx, cy, 3.4, 0, 7); g.fill();
        g.strokeStyle = '#0f0'; g.lineWidth = 2; g.beginPath(); for (var x = 3; x <= 37; x++) { var y = 26 + Math.sin(x / 2.4) * 2; x === 3 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
        var d = g.getImageData(0, 0, cw, ch).data, tgt = [], R = rng(3), thr = [];
        for (var j = 0; j < cw * ch; j++) { var rr = d[j * 4], gg = d[j * 4 + 1], bb = d[j * 4 + 2]; tgt.push(rr > 128 && gg > 128 ? 2 : rr > 128 ? 1 : gg > 128 ? 3 : 0); thr.push(R()); }
        return { cw: cw, ch: ch, tgt: tgt, thr: thr, R: rng(9), noise: [], tick: -1 };
      },
      draw: function (ctx, s, t, W, H, C) {
        var sig = 1 - ease((t - 0.6) / 5.6), col = [C.bg, C.maroon, C.gold, C.teal], pal = [C.maroon, C.gold, C.teal, C.muted, C.line];
        var tick = Math.floor(t / 0.12); if (tick !== s.tick || !s.noise.length) { s.tick = tick; s.noise = s.tgt.map(function () { return Math.floor(s.R() * 5); }); }
        var cell = Math.min((W * 0.86) / s.cw, (H * 0.76) / s.ch), ox = (W - cell * s.cw) / 2, oy = (H - cell * s.ch) / 2 + H * 0.04;
        for (var j = 0; j < s.cw * s.ch; j++) {
          var x = ox + (j % s.cw) * cell, y = oy + Math.floor(j / s.cw) * cell, clean = s.thr[j] > sig;
          if (clean) { if (!s.tgt[j]) continue; alpha(ctx, 0.95); ctx.fillStyle = col[s.tgt[j]]; }
          else { alpha(ctx, 0.25 + 0.5 * sig); ctx.fillStyle = pal[s.noise[j]]; }
          ctx.fillRect(x + 0.6, y + 0.6, cell - 1.2, cell - 1.2);
        }
        label(ctx, 'denoising step ' + Math.round(sig * 1000) + ' → 0', W * 0.06, H * 0.1, C, 12);
      } }
  ];

  // ---------- the lab ----------
  var cv = document.getElementById('lab');
  if (cv) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, C = colors(), cur = 0, t0 = performance.now(), state = SCENES[0].init(),
      running = true, raf = 0, frames = 0, fadeOut = 0.5;
    var btns = Array.prototype.slice.call(document.querySelectorAll('.lab-dots button'));
    var wk = document.getElementById('lab-wk'), nm = document.getElementById('lab-name');
    function size() {
      var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce || !running) frame(performance.now());
    }
    function pick(i) {
      cur = (i + SCENES.length) % SCENES.length; state = SCENES[cur].init(); t0 = performance.now();
      wk.textContent = SCENES[cur].wk; nm.textContent = SCENES[cur].name;
      btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === cur ? 'true' : 'false'); });
      if (reduce || !running) frame(performance.now());
    }
    function frame(now) {
      if (!W || !H) return;
      if (++frames % 30 === 0) C = colors();
      var sc = SCENES[cur], t = reduce ? sc.dur * 0.9 : (now - t0) / 1000;
      if (!reduce && t > sc.dur) { pick(cur + 1); t = 0; sc = SCENES[cur]; }
      ctx.clearRect(0, 0, W, H); ctx.save();
      ctx.globalAlpha = 1;
      sc.draw(ctx, state, t, W, H, C);
      ctx.restore();
      if (!reduce) {   // fade in and out at the ends of a scene
        var e = Math.min(t / 0.4, (sc.dur - t) / fadeOut, 1);
        if (e < 1) { ctx.globalAlpha = 1 - clamp(e, 0, 1); ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      }
    }
    function loop(now) { frame(now); raf = running ? requestAnimationFrame(loop) : 0; }
    btns.forEach(function (b) { b.addEventListener('click', function () { pick(+b.dataset.s); }); });
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(cv); else window.addEventListener('resize', size);
    // theme changes: re-read the colors
    new MutationObserver(function () { C = colors(); if (reduce || !running) frame(performance.now()); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    if (window.matchMedia) { var mq = matchMedia('(prefers-color-scheme: dark)'); var onmq = function () { C = colors(); if (reduce) frame(performance.now()); }; mq.addEventListener ? mq.addEventListener('change', onmq) : mq.addListener(onmq); }
    size();
    if (!reduce) {
      var visible = true, shown = !document.hidden;
      var set = function () { var on = visible && shown; if (on && !running) { running = true; t0 = performance.now() - pausedAt; raf = requestAnimationFrame(loop); } else if (!on && running) { running = false; pausedAt = performance.now() - t0; } }, pausedAt = 0;
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; set(); }).observe(cv);
      document.addEventListener('visibilitychange', function () { shown = !document.hidden; set(); });
      raf = requestAnimationFrame(loop);
    } else { running = false; frame(performance.now()); }
  }

  // ---------- scroll-in, counters, roadmap ----------
  var rv = Array.prototype.slice.call(document.querySelectorAll('.rv'));
  var counts = Array.prototype.slice.call(document.querySelectorAll('.count'));
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('in'); });
  } else {
    rv.forEach(function (el) {   // stagger siblings
      var i = Array.prototype.indexOf.call(el.parentNode.children, el); el.style.transitionDelay = Math.min(i, 6) * 70 + 'ms';
    });
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; co.unobserve(e.target);
        var el = e.target, end = +el.textContent, s0 = performance.now();
        (function step(now) { var f = clamp((now - s0) / 1100, 0, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - f, 3))); if (f < 1) requestAnimationFrame(step); })(s0);
      });
    }, { threshold: 0.6 });
    counts.forEach(function (el) { co.observe(el); });
  }
  var road = document.querySelector('.road'), mods = Array.prototype.slice.call(document.querySelectorAll('.mod'));
  if (road) {
    var upd = function () {
      var r = road.getBoundingClientRect(), mark = innerHeight * 0.6;
      road.style.setProperty('--p', reduce ? 1 : clamp((mark - r.top) / r.height, 0, 1));
      mods.forEach(function (m) { m.classList.toggle('on', reduce || m.getBoundingClientRect().top + 22 < mark); });
    };
    window.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
  }
})();
