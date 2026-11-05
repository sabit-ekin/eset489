// ESET 489 course site: the hero "lab" animation (eleven scenes that follow the 16 weeks, each explained in
// numbered steps under the canvas), scroll-in effects, counters, the roadmap line and the grading donut.
// Everything stops under prefers-reduced-motion (the lab then shows one still frame and all its steps).
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
  function font(ctx, size, w) { ctx.font = (w || 600) + ' ' + size + 'px Inter, system-ui, sans-serif'; }
  function label(ctx, txt, x, y, C, size, col, a) { font(ctx, size || 12); ctx.fillStyle = col || C.muted; alpha(ctx, a == null ? 0.95 : a); ctx.fillText(txt, x, y); }
  function centered(ctx, txt, x, y, C, size, col, a) { ctx.textAlign = 'center'; label(ctx, txt, x, y, C, size, col, a); ctx.textAlign = 'left'; }
  function tag(ctx, txt, x, y, C, fill, ink, size) {   // a filled pill with text; (x, y) = its left middle
    font(ctx, size || 12); var w = ctx.measureText(txt).width + 16, h = (size || 12) * 1.9;
    alpha(ctx, 1); ctx.fillStyle = fill; pill(ctx, x, y - h / 2, w, h); ctx.fill();
    ctx.fillStyle = ink; ctx.textBaseline = 'middle'; ctx.fillText(txt, x + 8, y + 1); ctx.textBaseline = 'alphabetic'; return w;
  }

  // ---------- scenes (steps: [start time in s, explanation shown under the canvas]) ----------
  var SCENES = [
    { wk: 'Week 1', name: 'Foundations: the AI toolbox', dur: 11,
      steps: [[0, 'Python is the language of modern AI: almost every tool here is used from Python.'],
              [2.6, 'PyTorch and TensorFlow are the frameworks for building and training neural networks.'],
              [5.2, 'Hugging Face is the open hub: download pretrained models and datasets instead of starting from zero.'],
              [7.8, 'Gradio turns a model into a web demo in a few lines; LangChain connects LLMs to your data and tools.']],
      init: function () { return { tools: ['Python', 'PyTorch', 'TensorFlow', 'Hugging Face', 'Gradio', 'LangChain'] }; },
      draw: function (ctx, s, t, W, H, C) {
        var cx = W / 2, cy = H * 0.55, rx = W * 0.34, ry = H * 0.33, n = s.tools.length, col = [C.maroon, C.gold, C.teal];
        var hi = [[0], [1, 2], [3], [4, 5]][s._step] || [], fs = Math.max(11, Math.min(14, W / 36));
        s.tools.forEach(function (name, i) {
          var f = ease((t - 0.3 - i * 0.2) / 0.5); if (!f) return;
          var a = -Math.PI / 2 + i * 2 * Math.PI / n, x = cx + Math.cos(a) * rx * f, y = cy + Math.sin(a) * ry * f, on = hi.indexOf(i) >= 0;
          alpha(ctx, (on ? 0.8 : 0.25) * f); ctx.strokeStyle = col[i % 3]; ctx.lineWidth = on ? 2.5 : 1.5; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
          var u = (t * (on ? 0.9 : 0.4) + i / n) % 1; if (i % 2) u = 1 - u;   // data moving both ways
          alpha(ctx, f); ctx.fillStyle = col[i % 3]; ctx.beginPath(); ctx.arc(cx + (x - cx) * u, cy + (y - cy) * u, on ? 4 : 3, 0, 7); ctx.fill();
          var z = on ? 1.12 : 1; font(ctx, fs * z); var w = ctx.measureText(name).width + fs * 1.4 * z, h = fs * 2.1 * z;
          alpha(ctx, f); ctx.fillStyle = on ? col[i % 3] : C.bg; pill(ctx, x - w / 2, y - h / 2, w, h); ctx.fill(); ctx.strokeStyle = col[i % 3]; ctx.lineWidth = 1.6; ctx.stroke();
          ctx.fillStyle = on ? C.bg : C.text; ctx.textBaseline = 'middle'; ctx.fillText(name, x - w / 2 + fs * 0.7 * z, y + 1); ctx.textBaseline = 'alphabetic';
        });
        var pulse = 1 + 0.06 * Math.sin(t * 3);
        alpha(ctx, 1); ctx.fillStyle = C.maroon; ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.09 * pulse, 0, 7); ctx.fill();
        ctx.fillStyle = C.bg; ctx.font = '600 ' + Math.round(Math.min(W, H) * 0.075) + 'px "EB Garamond", Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('AI', cx, cy + 1); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        label(ctx, 'open tools, open models', W * 0.05, H * 0.09, C, 12);
      } },

    { wk: 'Weeks 2–3', name: 'Linear algebra: data as vectors, models as matrices', dur: 11,
      steps: [[0, 'Each data point is a vector x: a list of numbers, drawn as an arrow from the origin.'],
              [2.6, 'Multiplying by a matrix A moves every vector at once: x becomes A·x (faint marks show where they started).'],
              [6, 'Grid lines stay straight, parallel, and evenly spaced: the map is linear. The columns of A are where the two axes land.']],
      init: function () { var R = rng(13), p = []; for (var i = 0; i < 8; i++) p.push([-1.7 + gauss(R) * 0.35, 1.1 + gauss(R) * 0.3]); return { p: p }; },
      draw: function (ctx, s, t, W, H, C) {
        var cx = W * 0.52, cy = H * 0.58, u = Math.min(W, H) * 0.12, A = [[1.25, 0.55], [-0.35, 1.05]], f = ease((t - 2.6) / 2.4);
        var M = [[1 + (A[0][0] - 1) * f, A[0][1] * f], [A[1][0] * f, 1 + (A[1][1] - 1) * f]];
        function P(x, y) { return [cx + (M[0][0] * x + M[0][1] * y) * u, cy - (M[1][0] * x + M[1][1] * y) * u]; }
        function I(x, y) { return [cx + x * u, cy - y * u]; }
        ctx.lineWidth = 1; ctx.strokeStyle = C.line;
        for (var i = -7; i <= 7; i++) {
          alpha(ctx, i ? 1 : 0); var a = P(i, -7), b = P(i, 7); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
          a = P(-7, i); b = P(7, i); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        }
        alpha(ctx, 0.8); ctx.strokeStyle = C.muted; ctx.lineWidth = 1.4;
        var a0 = P(-7, 0), b0 = P(7, 0), a1 = P(0, -7), b1 = P(0, 7);
        ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(b0[0], b0[1]); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(b1[0], b1[1]); ctx.stroke();
        var o = P(0, 0), x0 = I(1.6, 1.2);
        if (f > 0) {   // where things started
          alpha(ctx, 0.35 * f); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(x0[0], x0[1]); ctx.stroke(); ctx.setLineDash([]);
          s.p.forEach(function (p) { var q = I(p[0], p[1]); alpha(ctx, 0.3 * f); ctx.strokeStyle = C.teal; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(q[0], q[1], 3.5, 0, 7); ctx.stroke(); });
        }
        s.p.forEach(function (p) { var q = P(p[0], p[1]); alpha(ctx, clamp(t / 0.6, 0, 1)); ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(q[0], q[1], 4, 0, 7); ctx.fill(); });
        alpha(ctx, 1); var e1 = P(1, 0), e2 = P(0, 1), xv = P(1.6, 1.2);
        arrow(ctx, o, e1, C.maroon, 3); arrow(ctx, o, e2, C.teal, 3); arrow(ctx, o, xv, C.gold, 3.5);
        var done = f > 0.5;
        label(ctx, done ? 'A·x' : 'x', xv[0] + 8, xv[1] - 6, C, 13, C.text);
        label(ctx, done ? 'A·e₁' : 'e₁', e1[0] + 6, e1[1] + 16, C, 12, C.maroon);
        label(ctx, done ? 'A·e₂' : 'e₂', e2[0] - 30, e2[1] - 4, C, 12, C.teal);
        font(ctx, 12); ctx.fillStyle = C.muted; alpha(ctx, 0.95);
        ctx.fillText('A = [ ' + M[0][0].toFixed(2) + '  ' + M[0][1].toFixed(2) + ' ]', W * 0.05, H * 0.09);
        ctx.fillText('      [ ' + M[1][0].toFixed(2) + '  ' + M[1][1].toFixed(2) + ' ]', W * 0.05, H * 0.09 + 17);
      } },

    { wk: 'Week 3', name: 'Calculus for optimization: gradient descent', dur: 11,
      steps: [[0, 'The loss L(w) is a bowl over the model’s weights w. Each ring joins weights with equal loss; the × marks the best model.'],
              [2.6, 'The gradient ∇L points uphill, so each step goes the opposite way (arrow), scaled by the learning rate η.'],
              [6.4, 'Near the bottom the slope is gentle, so the steps shrink and the weights settle at the minimum.']],
      init: function () { var p = [[3, 0.95]]; for (var k = 0; k < 9; k++) { var q = p[p.length - 1]; p.push([q[0] * 0.62, q[1] * -0.55]); } return { p: p }; },
      draw: function (ctx, s, t, W, H, C) {
        var cx = W * 0.5, cy = H * 0.57, u = Math.min(W * 0.13, H * 0.19), th = -0.35, c = Math.cos(th), sn = Math.sin(th);
        function P(x, y) { return [cx + (x * c - y * sn) * u, cy - (x * sn + y * c) * u]; }
        [0.4, 1.2, 2.6, 4.6, 7.2, 10.4].forEach(function (L, k) {   // contours of L = x² + 4y²
          alpha(ctx, 0.25 + 0.1 * (5 - k) / 5); ctx.strokeStyle = k < 2 ? C.teal : C.muted; ctx.lineWidth = 1.3; ctx.beginPath();
          for (var a = 0; a <= 6.3; a += 0.08) { var q = P(Math.sqrt(L) * Math.cos(a), Math.sqrt(L) / 2 * Math.sin(a)); a ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
          ctx.stroke();
        });
        var step = clamp((t - 2.6) / 0.7, 0, s.p.length - 1), i0 = Math.floor(step), f = ease(step - i0), i1 = Math.min(i0 + 1, s.p.length - 1);
        var cur = [s.p[i0][0] + (s.p[i1][0] - s.p[i0][0]) * f, s.p[i0][1] + (s.p[i1][1] - s.p[i0][1]) * f];
        alpha(ctx, 0.9); ctx.strokeStyle = C.gold; ctx.lineWidth = 2.2; ctx.beginPath();
        for (var k = 0; k <= i0; k++) { var q = P(s.p[k][0], s.p[k][1]); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
        var cp = P(cur[0], cur[1]); ctx.lineTo(cp[0], cp[1]); ctx.stroke();
        for (k = 0; k <= i0; k++) { q = P(s.p[k][0], s.p[k][1]); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(q[0], q[1], 3, 0, 7); ctx.fill(); }
        var m = P(0, 0); alpha(ctx, 0.95); ctx.strokeStyle = C.teal; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(m[0] - 6, m[1] - 6); ctx.lineTo(m[0] + 6, m[1] + 6); ctx.moveTo(m[0] + 6, m[1] - 6); ctx.lineTo(m[0] - 6, m[1] + 6); ctx.stroke();
        label(ctx, 'minimum', m[0] - 26, m[1] + 22, C, 11, C.teal);
        var hl = P(-3.3, 0.9); label(ctx, 'high loss', hl[0] - 20, hl[1], C, 11);
        if (t > 2.6 && step < s.p.length - 1.5) { var g = [-2 * cur[0] * 0.25, -8 * cur[1] * 0.25], tip = P(cur[0] + g[0], cur[1] + g[1]); alpha(ctx, 0.95); arrow(ctx, cp, tip, C.maroon, 2); label(ctx, '−η∇L', tip[0] + 6, tip[1] - 6, C, 11, C.maroon); }
        alpha(ctx, 1); ctx.fillStyle = C.maroon; ctx.beginPath(); ctx.arc(cp[0], cp[1], 7, 0, 7); ctx.fill();
        if (t < 2.6) label(ctx, 'start', cp[0] + 10, cp[1] + 4, C, 11, C.maroon);
        label(ctx, 'step ' + Math.round(step) + ':  w ← w − η ∇L(w)', W * 0.05, H * 0.09, C, 12);
      } },

    { wk: 'Week 4', name: 'Probability and statistics', dur: 11,
      steps: [[0, 'Each measurement is random: you cannot predict exactly where the next sample (dot) will land.'],
              [3.2, 'But many samples make a pattern: the histogram counts how often each value appears.'],
              [6.6, 'The bell curve (normal distribution) summarizes it with two numbers: the mean μ and the spread σ.']],
      init: function () { var R = rng(21), x = []; for (var i = 0; i < 150; i++) x.push(clamp(gauss(R), -3.2, 3.19)); return { x: x }; },
      draw: function (ctx, s, t, W, H, C) {
        var nb = 15, x0 = W * 0.08, x1 = W * 0.92, bw = (x1 - x0) / nb, base = H * 0.84, hu = H * 0.58 / 28, cnt = [], done = 0;
        function X(v) { return x0 + (v + 3.2) / 6.4 * (x1 - x0); }
        for (var b = 0; b < nb; b++) cnt.push(0);
        ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; alpha(ctx, 1); ctx.beginPath(); ctx.moveTo(x0 - 6, base + 1); ctx.lineTo(x1 + 6, base + 1); ctx.stroke();
        label(ctx, 'measured value →', x1 - 100, base + 18, C, 11);
        s.x.forEach(function (v, k) {
          var bin = Math.floor((v + 3.2) / 6.4 * nb), tk = 0.3 + k * 0.04, f = (t - tk) / 0.45; if (f <= 0) return;
          if (f >= 1) { cnt[bin]++; done++; return; }
          var x = x0 + (bin + 0.5) * bw, y = H * 0.14 + (base - cnt[bin] * hu - H * 0.14) * f * f;
          alpha(ctx, 0.9); ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fill();
        });
        cnt.forEach(function (n, b) { if (!n) return; alpha(ctx, 0.85); ctx.fillStyle = Math.abs(b - 7) <= 1 ? C.maroon : C.gold; ctx.fillRect(x0 + b * bw + 1.5, base - n * hu, bw - 3, n * hu); });
        var g = ease((t - 6.6) / 1);
        if (g) {
          var pk = 150 * (6.4 / nb) / Math.sqrt(2 * Math.PI);
          alpha(ctx, 0.9 * g); ctx.strokeStyle = C.maroon; ctx.lineWidth = 2.5; ctx.beginPath();
          for (var x = -3.2; x <= 3.2; x += 0.05) { var y = pk * Math.exp(-x * x / 2); x > -3.2 ? ctx.lineTo(X(x), base - y * hu) : ctx.moveTo(X(x), base - y * hu); }
          ctx.stroke();
          var top = base - pk * hu, ys = base - pk * Math.exp(-0.5) * hu;
          alpha(ctx, g); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.text; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(X(0), base + 4); ctx.lineTo(X(0), top - 6); ctx.stroke(); ctx.setLineDash([]);
          centered(ctx, 'μ', X(0), base + 19, C, 15, C.text, g);
          alpha(ctx, g); arrow(ctx, [X(0) + 2, ys], [X(1), ys], C.text, 1.6); label(ctx, 'σ', X(1) + 6, ys + 5, C, 15, C.text, g);
        }
        label(ctx, 'n = ' + done + ' samples', W * 0.05, H * 0.09, C, 12);
      } },

    { wk: 'Week 5', name: 'Machine learning pipelines', dur: 12.5,
      steps: [[0, 'Data: collect raw measurements, such as sensor logs. Real data is messy: gaps, noise, outliers.'],
              [2, 'Clean: fill in missing values and remove noise and outliers.'],
              [4, 'Features: turn raw data into useful numbers a model can learn from (averages, frequencies, trends).'],
              [6, 'Train: fit the model’s parameters to the training data.'],
              [8, 'Evaluate: test the model on data it has never seen. Not good enough? Go back and improve it.'],
              [10.2, 'Deploy: put the model to work in a real system, and keep monitoring how it performs.']],
      init: function () { var R = rng(17), d = []; for (var i = 0; i < 16; i++) d.push({ o: i / 16, j: (R() - 0.5) * 14, c: Math.floor(R() * 4) }); return { st: ['Data', 'Clean', 'Features', 'Train', 'Evaluate', 'Deploy'], d: d }; },
      draw: function (ctx, s, t, W, H, C) {
        var n = s.st.length, cols = W >= 520 ? n : 3, rows = Math.ceil(n / cols), fs = Math.max(11, Math.min(14, W / 38));
        var bw = Math.min(118, (W * 0.88 - (cols - 1) * 14) / cols), bh = fs * 2.6, gx = (W * 0.88 - cols * bw) / Math.max(1, cols - 1);
        var rowH = rows > 1 ? H * 0.3 : 0, top = H * 0.46 - rowH / 2, pts = [];
        s.st.forEach(function (name, i) { var r = Math.floor(i / cols), k = i % cols; if (r % 2) k = cols - 1 - k; pts.push([W * 0.06 + k * (bw + gx) + bw / 2, top + r * rowH]); });
        var seg = [0]; for (var i = 1; i < n; i++) seg.push(seg[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); var Ltot = seg[n - 1];
        function at(d) { for (var i = 1; i < n; i++) if (d <= seg[i]) { var f = (d - seg[i - 1]) / (seg[i] - seg[i - 1]); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f, i - 1 + f]; } return [pts[n - 1][0], pts[n - 1][1], n - 1]; }
        alpha(ctx, 1); ctx.strokeStyle = C.line; ctx.lineWidth = 3; ctx.beginPath(); pts.forEach(function (p, i) { i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }); ctx.stroke();
        var raw = [C.muted, C.maroon, C.gold, C.teal], show = clamp(t / 0.6, 0, 1), cur = s._step;
        s.d.forEach(function (p) {
          var q = at(((t * 0.11 + p.o) % 1) * Ltot), k = q[2], messy = k < 1;
          var jy = messy ? p.j * (1 - k) : 0;
          alpha(ctx, show * (k > n - 1.3 ? (n - 1 - k) / 0.3 : 1)); ctx.fillStyle = messy ? raw[p.c] : k < 3 ? C.teal : C.gold;
          if (k >= 2 && k < 3) { ctx.fillRect(q[0] - 4.5, q[1] - 4.5 + jy, 9, 9); } else { ctx.beginPath(); ctx.arc(q[0], q[1] + jy, k >= 3 ? 5 : 4, 0, 7); ctx.fill(); }
        });
        if (cur >= 4) {   // the loop back from Evaluate to Train
          var a = pts[4], b = pts[3], dip = bh * 1.25, mx = (a[0] + b[0]) / 2, my = Math.max(a[1], b[1]) + dip;
          alpha(ctx, cur === 4 ? 0.95 : 0.4); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.maroon; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.moveTo(a[0], a[1] + bh / 2); ctx.quadraticCurveTo(mx, my + 10, b[0], b[1] + bh / 2 + 4); ctx.stroke(); ctx.setLineDash([]);
          arrow(ctx, [b[0] + 8, b[1] + bh / 2 + 14], [b[0] + 1, b[1] + bh / 2 + 3], C.maroon, 1.8);
          centered(ctx, 'retrain', mx, my + 22, C, 11, C.maroon, cur === 4 ? 0.95 : 0.4);
        }
        font(ctx, fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        s.st.forEach(function (name, i) {
          var p = pts[i], f = ease((t - i * 0.2) / 0.5), on = i === cur; if (!f) return;
          var z = on ? 1.08 : 1, w = bw * z, h = bh * z;
          alpha(ctx, f); ctx.fillStyle = on ? (i === n - 1 ? C.gold : C.maroon) : C.bg; pill(ctx, p[0] - w / 2, p[1] - h / 2, w, h); ctx.fill();
          ctx.strokeStyle = i === n - 1 ? C.gold : C.maroon; ctx.lineWidth = 1.8; ctx.stroke();
          ctx.fillStyle = on ? C.bg : C.text; ctx.fillText((i + 1) + '. ' + name, p[0], p[1] + 1);
        });
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        label(ctx, 'raw data → trained model → product', W * 0.05, H * 0.09, C, 12);
      } },

    { wk: 'Weeks 6–7', name: 'Supervised learning: regression', dur: 11,
      steps: [[0, 'Training data: each dot is an input x with its measured output y (the label we learn from).'],
              [2.2, 'The model is a line ŷ = a·x + b. The dashed lines are its errors (residuals) on each point.'],
              [4.8, 'Training adjusts a and b to shrink the loss (mean squared error): the error curve drops and the line fits the data.']],
      init: function () {
        var R = rng(7), pts = [], sx = 0, sy = 0, sxx = 0, sxy = 0, n = 22;
        for (var i = 0; i < n; i++) { var x = 0.06 + 0.88 * (i + R() * 0.8) / n, y = 0.2 + 0.55 * x + gauss(R) * 0.06; pts.push([x, y]); sx += x; sy += y; sxx += x * x; sxy += x * y; }
        var a = (n * sxy - sx * sy) / (n * sxx - sx * sx), b = (sy - a * sx) / n;
        return { pts: pts, a: a, b: b };
      },
      draw: function (ctx, s, t, W, H, C) {
        var m = { l: W * 0.1, r: W * 0.05, t: H * 0.13, b: H * 0.14 }, pw = W - m.l - m.r, ph = H - m.t - m.b;
        function X(x) { return m.l + x * pw; } function Y(y) { return m.t + (1 - y) * ph; }
        ctx.strokeStyle = C.line; ctx.lineWidth = 1.5; alpha(ctx, 1);
        ctx.beginPath(); ctx.moveTo(m.l, m.t); ctx.lineTo(m.l, m.t + ph); ctx.lineTo(m.l + pw, m.t + ph); ctx.stroke();
        label(ctx, 'x (input) →', m.l + pw - 72, m.t + ph + 16, C, 11); label(ctx, 'y', m.l - 14, m.t + 8, C, 12);
        var T = Math.max(0, t - 4.8), k = Math.exp(-T / 1.4), osc = Math.cos(T * 2.2);
        var a = s.a + (-0.35 - s.a) * k * osc, b = s.b + (0.78 - s.b) * k, lineA = clamp((t - 2.2) / 0.5, 0, 1);
        s.pts.forEach(function (p) {   // residuals
          if (!lineA) return; var yh = a * p[0] + b; alpha(ctx, 0.45 * lineA); ctx.strokeStyle = C.maroon; ctx.lineWidth = 1; ctx.setLineDash([2, 3]);
          ctx.beginPath(); ctx.moveTo(X(p[0]), Y(p[1])); ctx.lineTo(X(p[0]), Y(yh)); ctx.stroke(); ctx.setLineDash([]);
        });
        s.pts.forEach(function (p, i) {
          var f = clamp((t - i * 0.05) / 0.4, 0, 1); if (!f) return;
          alpha(ctx, f); ctx.fillStyle = C.teal; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 4.5 * ease(f), 0, 7); ctx.fill();
        });
        alpha(ctx, lineA); ctx.strokeStyle = C.maroon; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(X(0), Y(b)); ctx.lineTo(X(1), Y(a + b)); ctx.stroke();
        if (lineA) { var ex = X(0.97), ey = Y(a * 0.97 + b); font(ctx, 12); var txt = 'ŷ = ' + a.toFixed(2) + 'x + ' + b.toFixed(2), tw = ctx.measureText(txt).width;
          tag(ctx, txt, Math.min(ex - tw - 16, W - tw - 22), clamp(ey + (a > 0.2 ? 22 : -22), m.t + 10, m.t + ph - 10), C, C.chip, C.maroon, 12); }
        if (t > 4.8) {   // loss curve, top left
          var lx = m.l + 14, ly = m.t + 2, lw = Math.min(130, pw * 0.36), lh = 40, TT = clamp(T, 0, 6);
          alpha(ctx, 0.95); ctx.fillStyle = C.bg; ctx.fillRect(lx - 6, ly - 4, lw + 12, lh + 24); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(lx - 6, ly - 4, lw + 12, lh + 24);
          label(ctx, 'loss (MSE)', lx, ly + 10, C, 11);
          ctx.strokeStyle = C.gold; ctx.lineWidth = 2; alpha(ctx, 1); ctx.beginPath();
          for (var v = 0; v <= TT; v += 0.05) { var L = Math.exp(-v / 0.9) * (0.75 + 0.25 * Math.cos(v * 2.2)); var px = lx + (v / 6) * lw, py = ly + 14 + (1 - clamp(L, 0, 1)) * lh; v ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
          ctx.stroke();
        }
      } },

    { wk: 'Weeks 8–9', name: 'Unsupervised learning: k-means clustering', dur: 11.5,
      steps: [[0, 'Unlabeled data: nobody told the model which group each point belongs to.'],
              [2, 'Start: place k = 3 centroids (+) at random.'],
              [3.6, 'Assign each point to its nearest centroid (its color), then move each centroid to the middle of its points.'],
              [8, 'Repeat until nothing changes: k-means has found the three groups on its own.']],
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
        var step = clamp((t - 3.6) / 0.9, 0, s.hist.length - 1), i0 = Math.floor(step), i1 = Math.min(i0 + 1, s.hist.length - 1), f = ease(step - i0);
        var cent = s.hist[i0].map(function (c, k) { return [c[0] + (s.hist[i1][k][0] - c[0]) * f, c[1] + (s.hist[i1][k][1] - c[1]) * f]; });
        var show = clamp((t - 2) / 0.5, 0, 1), colored = clamp((t - 3.6) / 0.4, 0, 1);
        s.pts.forEach(function (p, i) {
          var a = clamp((t - i * 0.015) / 0.4, 0, 1); if (!a) return;
          var bi = 0, bd = 9; cent.forEach(function (q, k) { var d = (q[0] - p[0]) * (q[0] - p[0]) + (q[1] - p[1]) * (q[1] - p[1]); if (d < bd) { bd = d; bi = k; } });
          alpha(ctx, a); ctx.fillStyle = colored ? col[bi] : C.muted; ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 4.5, 0, 7); ctx.fill();
        });
        if (!show) { label(ctx, 'unlabeled points', m, m - 8, C, 12); return; }
        cent.forEach(function (c, k) {   // paths so far, then the centroid
          alpha(ctx, 0.55 * show); ctx.strokeStyle = col[k]; ctx.lineWidth = 1.5; ctx.setLineDash([3, 4]); ctx.beginPath();
          for (var j = 0; j <= i0; j++) { var q = s.hist[j][k]; j ? ctx.lineTo(X(q[0]), Y(q[1])) : ctx.moveTo(X(q[0]), Y(q[1])); }
          ctx.lineTo(X(c[0]), Y(c[1])); ctx.stroke(); ctx.setLineDash([]);
          var x = X(c[0]), y = Y(c[1]); alpha(ctx, show);
          ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(x, y, 11, 0, 7); ctx.fill();
          ctx.strokeStyle = col[k]; ctx.lineWidth = 3; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y); ctx.moveTo(x, y - 5); ctx.lineTo(x, y + 5); ctx.stroke();
        });
        label(ctx, t < 3.6 ? 'random start' : 'iteration ' + Math.min(Math.round(step), s.hist.length - 1) + (step >= s.hist.length - 1 ? ' · converged' : ''), m, m - 8, C, 12);
      } },

    { wk: 'Weeks 10–11', name: 'Neural networks: forward pass and backpropagation', dur: 12,
      steps: [[0, 'Inputs (features, such as temperature, vibration, and current) enter on the left.'],
              [2, 'Forward pass: each neuron adds up its weighted inputs and applies an activation; line thickness shows the weight.'],
              [4.6, 'The output is compared with the right answer (target); the difference is the loss.'],
              [6.6, 'Backpropagation sends the error back (gold) and nudges every weight to reduce the loss.'],
              [9, 'Run it again: the prediction is closer and the loss is lower. Training repeats this thousands of times.']],
      init: function () {
        var R = rng(5), L = [4, 6, 6, 3], w = [];
        for (var i = 0; i < L.length - 1; i++) { w.push([]); for (var a = 0; a < L[i]; a++) { w[i].push([]); for (var b = 0; b < L[i + 1]; b++) w[i][a].push(gauss(R)); } }
        return { L: L, w: w, R: R, upd: false };
      },
      draw: function (ctx, s, t, W, H, C) {
        var L = s.L, pos = [], gaps = L.length - 1;
        if (t >= 8.6 && !s.upd) { s.upd = true; s.w.forEach(function (l) { l.forEach(function (r) { r.forEach(function (v, j) { r[j] = v * 0.85 + gauss(s.R) * 0.3; }); }); }); }
        L.forEach(function (k, i) { pos.push([]); for (var j = 0; j < k; j++) pos[i].push([W * (0.1 + 0.58 * i / gaps), H * (0.52 + (j - (k - 1) / 2) * Math.min(0.13, 0.75 / k))]); });
        var fwd = t < 2 ? 0 : t < 9 ? clamp((t - 2) / 2.4, 0, 1) : clamp((t - 9) / 1.6, 0, 1), back = t >= 6.6 && t < 9 ? clamp((t - 6.6) / 1.9, 0, 1) : 0;
        for (var i = 0; i < gaps; i++) for (var a = 0; a < L[i]; a++) for (var b = 0; b < L[i + 1]; b++) {
          var p = pos[i][a], q = pos[i + 1][b], wv = s.w[i][a][b];
          alpha(ctx, 0.15 + Math.min(0.45, Math.abs(wv) * 0.25)); ctx.strokeStyle = wv > 0 ? C.maroon : C.muted; ctx.lineWidth = 0.6 + Math.min(2.4, Math.abs(wv) * 1.1);
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
          var u = fwd * gaps - i;
          if (u > 0 && u < 1 && Math.abs(wv) > 0.5) { alpha(ctx, 0.95); ctx.fillStyle = C.maroon; ctx.beginPath(); ctx.arc(p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, 2.6, 0, 7); ctx.fill(); }
          var v = back * gaps - (gaps - 1 - i);
          if (v > 0 && v < 1 && Math.abs(wv) > 0.6) { alpha(ctx, 0.95); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(q[0] + (p[0] - q[0]) * v, q[1] + (p[1] - q[1]) * v, 2.8, 0, 7); ctx.fill(); }
        }
        var second = t >= 9, pred = second ? [0.08, 0.86, 0.06] : [0.25, 0.55, 0.2], target = [0, 1, 0];
        pos.forEach(function (layer, i) {
          var reached = i === 0 ? clamp(t / 0.6, 0, 1) : clamp((fwd * gaps - i + 0.2) * 4, 0, 1);
          layer.forEach(function (p, j) {
            var on = i === gaps ? pred[j] : 0.35 + 0.65 * Math.abs(Math.sin(j * 1.7 + i * 2.3 + (second ? 1 : 0)));
            alpha(ctx, 1); ctx.fillStyle = C.bg; ctx.strokeStyle = i === gaps ? C.gold : C.maroon; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 7); ctx.fill(); ctx.stroke();
            alpha(ctx, reached * (0.15 + 0.85 * on)); ctx.fillStyle = i === gaps ? C.gold : C.maroon; ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, 7); ctx.fill();
          });
        });
        var outReached = fwd >= 0.99 || t >= 4.4;
        if (outReached) {   // prediction vs target, and the loss
          var ox = pos[gaps][0][0] + 18, fs = Math.max(10, Math.min(12, W / 40));
          label(ctx, 'pred', ox, pos[gaps][0][1] - 20, C, fs); if (t >= 4.6) label(ctx, 'target', ox + fs * 3.4, pos[gaps][0][1] - 20, C, fs);
          pos[gaps].forEach(function (p, j) {
            label(ctx, pred[j].toFixed(2), ox, p[1] + 4, C, fs, C.text);
            if (t >= 4.6) label(ctx, target[j].toFixed(0), ox + fs * 3.4 + 8, p[1] + 4, C, fs, C.text);
          });
          if (t >= 4.6) tag(ctx, 'loss ' + (second && fwd > 0.99 ? '0.01' : '0.10'), ox - 4, pos[gaps][2][1] + 32, C, second && fwd > 0.99 ? C.teal : C.maroon, C.bg, fs);
        }
        var phase = t < 2 ? 'inputs' : back > 0 && back < 1 ? 'backpropagation' : t >= 4.6 && t < 6.6 ? 'compare with target' : 'forward pass';
        label(ctx, phase, W * 0.05, H * 0.09, C, 12);
        centered(ctx, 'inputs', pos[0][0][0], H * 0.95, C, 11); centered(ctx, 'hidden layers', (pos[1][0][0] + pos[2][0][0]) / 2, H * 0.95, C, 11); centered(ctx, 'outputs', pos[gaps][0][0], H * 0.95, C, 11);
      } },

    { wk: 'Week 12', name: 'Deep learning architectures: convolutional neural networks (CNNs)', dur: 12.5,
      steps: [[0, 'Input: an image is a grid of pixel values; here, a surface photo with a crack.'],
              [2, 'A small 3×3 filter slides across the image. At each stop it multiplies the pixels under it by its weights and adds them up.'],
              [6.8, 'The results form a feature map that lights up wherever the filter’s pattern (a diagonal edge) appears.'],
              [9, 'Pooling shrinks the map, and dense layers turn it into a prediction: “crack”. The network learns the filters itself.']],
      init: function () {
        var R = rng(31), n = 12, img = [], K = [[2, -1, -1], [-1, 2, -1], [-1, -1, 2]], fm = [], mx = 0, pool = [];
        for (var r = 0; r < n; r++) { img.push([]); for (var c = 0; c < n; c++) img[r].push(Math.abs(c - (r * 0.85 + 1.2)) < 0.9 ? 0.85 + R() * 0.15 : R() * 0.2); }
        for (r = 0; r < n - 2; r++) { fm.push([]); for (c = 0; c < n - 2; c++) { var v = 0; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) v += K[i][j] * img[r + i][c + j]; v = Math.max(0, v); fm[r].push(v); mx = Math.max(mx, v); } }
        fm = fm.map(function (row) { return row.map(function (v) { return v / mx; }); });
        for (r = 0; r < 5; r++) { pool.push([]); for (c = 0; c < 5; c++) pool[r].push(Math.max(fm[2 * r][2 * c], fm[2 * r + 1][2 * c], fm[2 * r][2 * c + 1], fm[2 * r + 1][2 * c + 1])); }
        return { img: img, K: K, fm: fm, pool: pool };
      },
      draw: function (ctx, s, t, W, H, C) {
        var cell = Math.min((W * 0.88) / 26, (H * 0.6) / 12), ix = (W - cell * 26) / 2, iy = H * 0.2, fx = ix + cell * 16, fy = iy + cell;
        var p = t < 2 ? -1 : Math.min(99, Math.floor((t - 2) / 4.6 * 100)), pf = ease((t - 9) / 0.8);
        for (var r = 0; r < 12; r++) for (var c = 0; c < 12; c++) {   // input image
          alpha(ctx, 0.08 + 0.85 * s.img[r][c]); ctx.fillStyle = C.text; ctx.fillRect(ix + c * cell + 0.5, iy + r * cell + 0.5, cell - 1, cell - 1);
        }
        alpha(ctx, 0.9); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(ix, iy, cell * 12, cell * 12); ctx.strokeRect(fx, fy, cell * 10, cell * 10);
        // the filter, between the grids
        var kx = ix + cell * 12.6, ky = iy + cell * 4, kc = cell * 0.9;
        for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) { var w = s.K[i][j]; alpha(ctx, 0.9); ctx.fillStyle = w > 0 ? C.gold : C.chip; ctx.fillRect(kx + j * kc, ky + i * kc, kc - 1, kc - 1); }
        centered(ctx, 'filter', kx + kc * 1.5, ky + kc * 3 + 13, C, 11);
        for (r = 0; r < 10; r++) for (c = 0; c < 10; c++) {   // feature map, as far as the filter has gone
          if (r * 10 + c > p) continue; var v = s.fm[r][c];
          alpha(ctx, (0.06 + 0.9 * v) * (1 - pf)); ctx.fillStyle = C.maroon; ctx.fillRect(fx + c * cell + 0.5, fy + r * cell + 0.5, cell - 1, cell - 1);
        }
        if (pf) for (r = 0; r < 5; r++) for (c = 0; c < 5; c++) { alpha(ctx, (0.06 + 0.9 * s.pool[r][c]) * pf); ctx.fillStyle = C.maroon; ctx.fillRect(fx + c * cell * 2 + 1, fy + r * cell * 2 + 1, cell * 2 - 2, cell * 2 - 2); }
        if (p >= 0 && t < 6.8) {   // the sliding window and where its result goes
          var wr = Math.floor(p / 10), wc = p % 10, wx = ix + wc * cell, wy = iy + wr * cell, ox = fx + wc * cell, oy = fy + wr * cell;
          alpha(ctx, 0.45); ctx.strokeStyle = C.gold; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(wx + cell * 3, wy); ctx.lineTo(ox, oy); ctx.moveTo(wx + cell * 3, wy + cell * 3); ctx.lineTo(ox, oy + cell); ctx.stroke();
          alpha(ctx, 1); ctx.lineWidth = 2.5; ctx.strokeRect(wx, wy, cell * 3, cell * 3); ctx.strokeRect(ox, oy, cell, cell);
        }
        centered(ctx, 'input image', ix + cell * 6, iy + cell * 12 + 16, C, 11);
        centered(ctx, pf > 0.5 ? 'pooled feature map' : 'feature map', fx + cell * 5, iy + cell * 12 + 16, C, 11);
        label(ctx, 'convolution', W * 0.05, H * 0.09, C, 12);
        if (t >= 9.8) { font(ctx, 12); var txt = 'prediction: crack', tw = ctx.measureText(txt).width + 16; alpha(ctx, ease((t - 9.8) / 0.4)); tag(ctx, txt, W * 0.95 - tw, H * 0.09 - 4, C, C.maroon, C.bg, 12); }
      } },

    { wk: 'Weeks 13–14', name: 'Transformers and large language models', dur: 12.5,
      steps: [[0, 'Text is split into tokens (words or pieces of words) that the model reads all at once.'],
              [1.8, 'To predict the next word, attention compares it with every earlier token. Thicker gold arcs mean more attention.'],
              [3.6, 'The model scores every possible next word (top right) and picks a likely one.'],
              [5.4, 'The new word is added and the process repeats, one token at a time: that is how an LLM writes.']],
      init: function () {
        return { base: ['Motor', '3', 'vibration', 'is', 'rising', 'above', 'normal', ','],
          gen: [{ w: 'schedule', att: [0.5, 0.2, 0.9, 0.1, 0.8, 0.3, 0.6, 0.1], cand: [['schedule', 0.58], ['inspect', 0.27], ['check', 0.08]] },
                { w: 'maintenance', att: [0.6, 0.3, 0.7, 0.05, 0.4, 0.2, 0.5, 0.1, 0.9], cand: [['maintenance', 0.71], ['an', 0.12], ['repairs', 0.09]] },
                { w: 'today', att: [0.2, 0.1, 0.4, 0.1, 0.9, 0.2, 0.3, 0.1, 0.5, 0.8], cand: [['today', 0.49], ['soon', 0.33], ['now', 0.11]] }] };
      },
      draw: function (ctx, s, t, W, H, C) {
        var fs = Math.max(11, Math.min(15, W / 34)), ph = fs * 2, gap = fs * 0.55, toks = s.base.slice();
        var per = 3.4, k = clamp(Math.floor((t - 1.8) / per), -1, s.gen.length - 1), u = (t - 1.8 - Math.max(k, 0) * per) / per;
        for (var i = 0; i <= k && i < s.gen.length; i++) if (i < k || u > 0.7) toks.push(s.gen[i].w);
        var pending = k >= 0 && u <= 0.7 ? s.gen[k] : null;
        font(ctx, fs);
        var all = toks.slice(); if (pending) all.push('?');
        var boxes = [], x = W * 0.05, y = H * 0.6, maxX = W * 0.95;
        all.forEach(function (w) { var bw = ctx.measureText(w).width + fs * 1.3; if (x + bw > maxX) { x = W * 0.05; y += ph + gap * 1.6; } boxes.push([x, y, bw]); x += bw + gap; });
        if (pending) {   // attention arcs from the new position to every earlier token
          var q = boxes[boxes.length - 1], qx = q[0] + q[2] / 2, qy = q[1], grow = ease(u / 0.35);
          pending.att.forEach(function (a, j) {
            if (j >= boxes.length - 1) return;
            var bx = boxes[j][0] + boxes[j][2] / 2, by = boxes[j][1], top = Math.min(qy, by) - Math.min(H * 0.22, 16 + Math.abs(qx - bx) * 0.22) * grow;
            alpha(ctx, (0.15 + 0.75 * a) * grow); ctx.strokeStyle = a > 0.55 ? C.gold : C.maroon; ctx.lineWidth = 1 + a * 4.5;
            ctx.beginPath(); ctx.moveTo(qx, qy); ctx.quadraticCurveTo((qx + bx) / 2, top, bx, by); ctx.stroke();
          });
          var cb = ease((u - 0.35) / 0.15);   // next-word scores
          if (cb) {
            var bw2 = Math.min(180, W * 0.46), bx2 = W * 0.95 - bw2, by2 = H * 0.05, rh = 15;
            alpha(ctx, 0.97 * cb); ctx.fillStyle = C.bg; ctx.fillRect(bx2, by2, bw2, rh * 3 + 26); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(bx2, by2, bw2, rh * 3 + 26);
            label(ctx, 'next word?', bx2 + 8, by2 + 15, C, 11, C.muted, cb);
            pending.cand.forEach(function (cd, j) {
              var yy = by2 + 22 + j * rh, lw = bw2 * 0.42; label(ctx, cd[0], bx2 + 8, yy + 10, C, 11, C.text, cb);
              alpha(ctx, cb); ctx.fillStyle = j ? C.line : C.gold; ctx.fillRect(bx2 + 8 + lw, yy + 2, (bw2 - lw - 46) * cd[1], 9);
              label(ctx, Math.round(cd[1] * 100) + '%', bx2 + bw2 - 34, yy + 10, C, 10, C.muted, cb);
            });
          }
        }
        boxes.forEach(function (b, j) {
          var isNew = j >= s.base.length, isQ = pending && j === boxes.length - 1, hot = pending && !isQ && pending.att[j] > 0.55;
          var a = j < s.base.length ? clamp((t - j * 0.15) / 0.3, 0, 1) : 1; if (!a) return;
          alpha(ctx, a); ctx.fillStyle = isQ ? C.chip : hot ? C.gold : isNew ? C.maroon : C.bg;
          pill(ctx, b[0], b[1], b[2], ph); ctx.fill(); ctx.strokeStyle = isNew || hot ? 'transparent' : C.line; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.fillStyle = isNew || hot ? C.bg : C.text; if (isQ) ctx.fillStyle = C.muted;
          ctx.textBaseline = 'middle'; ctx.fillText(all[j], b[0] + fs * 0.65, b[1] + ph / 2 + 1); ctx.textBaseline = 'alphabetic';
        });
        label(ctx, t < 1.8 ? 'tokens' : 'attention', W * 0.05, H * 0.09, C, 12);
      } },

    { wk: 'Week 14', name: 'Generative AI: diffusion models', dur: 11,
      steps: [[0, 'A diffusion model starts from pure random noise.'],
              [2, 'At each step, a trained network predicts the noise in the picture and removes a little of it.'],
              [6.8, 'After many small steps, a brand-new image appears (here, a gear and a wave). VAEs and GANs are other ways to generate.']],
      init: function () {
        var cw = 40, ch = 30, oc = document.createElement('canvas'); oc.width = cw; oc.height = ch;
        var g = oc.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, cw, ch);
        g.fillStyle = '#f00'; g.beginPath();   // a gear (maroon) with a gold hub and a wave (teal) below
        var cx = 20, cy = 13, r1 = 9.5, r2 = 7, teeth = 10;
        for (var i = 0; i <= teeth * 2; i++) { var a = i / (teeth * 2) * Math.PI * 2, r = i % 2 ? r2 : r1; for (var d = -0.12; d <= 0.12; d += 0.12) g.lineTo(cx + Math.cos(a + d) * r, cy + Math.sin(a + d) * r); }
        g.fill(); g.fillStyle = '#ff0'; g.beginPath(); g.arc(cx, cy, 3.4, 0, 7); g.fill();
        g.strokeStyle = '#0f0'; g.lineWidth = 2; g.beginPath(); for (var x = 3; x <= 37; x++) { var y = 26 + Math.sin(x / 2.4) * 2; x === 3 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
        var dd = g.getImageData(0, 0, cw, ch).data, tgt = [], R = rng(3), thr = [];
        for (var j = 0; j < cw * ch; j++) { var rr = dd[j * 4], gg = dd[j * 4 + 1]; tgt.push(rr > 128 && gg > 128 ? 2 : rr > 128 ? 1 : gg > 128 ? 3 : 0); thr.push(R()); }
        return { cw: cw, ch: ch, tgt: tgt, thr: thr, R: rng(9), noise: [], tick: -1 };
      },
      draw: function (ctx, s, t, W, H, C) {
        var sig = 1 - ease((t - 2) / 4.8), col = [C.bg, C.maroon, C.gold, C.teal], pal = [C.maroon, C.gold, C.teal, C.muted, C.line];
        var tick = Math.floor(t / 0.12); if (tick !== s.tick || !s.noise.length) { s.tick = tick; s.noise = s.tgt.map(function () { return Math.floor(s.R() * 5); }); }
        var cell = Math.min((W * 0.86) / s.cw, (H * 0.7) / s.ch), ox = (W - cell * s.cw) / 2, oy = H * 0.17;
        for (var j = 0; j < s.cw * s.ch; j++) {
          var x = ox + (j % s.cw) * cell, y = oy + Math.floor(j / s.cw) * cell, clean = s.thr[j] > sig;
          if (clean) { if (!s.tgt[j]) continue; alpha(ctx, 0.95); ctx.fillStyle = col[s.tgt[j]]; }
          else { alpha(ctx, 0.25 + 0.5 * sig); ctx.fillStyle = pal[s.noise[j]]; }
          ctx.fillRect(x + 0.6, y + 0.6, cell - 1.2, cell - 1.2);
        }
        var by = oy + cell * s.ch + 10, bw = cell * s.cw;   // progress: noise → image
        alpha(ctx, 1); ctx.fillStyle = C.line; ctx.fillRect(ox, by, bw, 4); ctx.fillStyle = C.gold; ctx.fillRect(ox, by, bw * (1 - sig), 4);
        label(ctx, 'noise', ox, by + 17, C, 11); ctx.textAlign = 'right'; label(ctx, 'image', ox + bw, by + 17, C, 11); ctx.textAlign = 'left';
        label(ctx, 'denoising step ' + Math.round(sig * 1000) + ' → 0', W * 0.05, H * 0.09, C, 12);
      } }
  ];

  // ---------- the lab ----------
  var cv = document.getElementById('lab');
  if (cv) {
    var ctx = cv.getContext('2d'), W = 0, H = 0, C = colors(), cur = 0, t0 = performance.now(), state = SCENES[0].init(),
      running = true, raf = 0, frames = 0, fadeOut = 0.5, shown = [-1, -1], paused = false, pausedAt = 0;
    var btns = Array.prototype.slice.call(document.querySelectorAll('.lab-dots button[data-s]'));
    var pauseBtn = document.querySelector('.lab-pause');
    var wk = document.getElementById('lab-wk'), nm = document.getElementById('lab-name'), stepEl = document.getElementById('lab-step'), nEl = document.getElementById('lab-n');
    function size() {
      var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduce || !running) frame(performance.now());
    }
    function pick(i) {
      cur = (i + SCENES.length) % SCENES.length; state = SCENES[cur].init(); t0 = performance.now(); pausedAt = 0;
      wk.textContent = SCENES[cur].wk; nm.textContent = SCENES[cur].name;
      btns.forEach(function (b, j) { b.setAttribute('aria-pressed', j === cur ? 'true' : 'false'); });
      if (reduce || !running) frame(performance.now());
    }
    function frame(now) {
      if (!W || !H) return;
      if (++frames % 30 === 0) C = colors();
      var sc = SCENES[cur], t = reduce ? sc.dur * 0.95 : running ? (now - t0) / 1000 : pausedAt / 1000;
      if (!reduce && running && t > sc.dur) { pick(cur + 1); t = 0; sc = SCENES[cur]; }
      var st = sc.steps, idx = 0; for (var i = 0; i < st.length; i++) if (t >= st[i][0]) idx = i;
      state._step = idx;
      if (shown[0] !== cur || shown[1] !== idx) {
        shown = [cur, idx];
        if (reduce) { nEl.textContent = ''; stepEl.textContent = st.map(function (x) { return x[1]; }).join(' '); }
        else { nEl.textContent = (idx + 1) + '/' + st.length; stepEl.textContent = st[idx][1]; }
      }
      ctx.clearRect(0, 0, W, H); ctx.save(); ctx.globalAlpha = 1;
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
    new MutationObserver(function () { C = colors(); if (reduce || !running) frame(performance.now()); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    if (window.matchMedia) { var mq = matchMedia('(prefers-color-scheme: dark)'); var onmq = function () { C = colors(); if (reduce || !running) frame(performance.now()); }; mq.addEventListener ? mq.addEventListener('change', onmq) : mq.addListener(onmq); }
    size();
    if (!reduce) {
      var visible = true, tabOn = !document.hidden;
      var set = function () {
        var on = visible && tabOn && !paused;
        if (on && !running) { running = true; t0 = performance.now() - pausedAt; raf = requestAnimationFrame(loop); }
        else if (!on && running) { running = false; pausedAt = performance.now() - t0; }
      };
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; set(); }).observe(cv);
      document.addEventListener('visibilitychange', function () { tabOn = !document.hidden; set(); });
      if (pauseBtn) pauseBtn.addEventListener('click', function () {
        paused = !paused; pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
        pauseBtn.setAttribute('aria-label', paused ? 'Play the animation' : 'Pause the animation'); set();
      });
      raf = requestAnimationFrame(loop);
    } else { running = false; if (pauseBtn) pauseBtn.hidden = true; frame(performance.now()); }
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
