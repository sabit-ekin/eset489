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
    { wk: 'Week 1', name: 'Foundations: the AI toolbox', dur: 13,
      steps: [[0, 'Python is the language of modern AI: almost every tool here is used from Python.'],
              [2.4, 'PyTorch and TensorFlow are the frameworks for building and training neural networks.'],
              [4.8, 'Hugging Face is the open hub: download pretrained models and datasets instead of starting from zero.'],
              [7.2, 'Gradio turns a model into a web demo in a few lines; LangChain connects LLMs to your data and tools.'],
              [9.6, 'GitHub keeps and shares your code; AI coding assistants such as Claude Code and Codex help you write, explain, and debug it.']],
      init: function () { return { tools: ['Python', 'PyTorch', 'TensorFlow', 'Hugging Face', 'Gradio', 'LangChain', 'GitHub', 'Claude Code', 'Codex'] }; },
      draw: function (ctx, s, t, W, H, C) {
        var cx = W / 2, cy = H * 0.56, rx = W * 0.37, ry = H * 0.35, n = s.tools.length, col = [C.maroon, C.gold, C.teal];
        var hi = [[0], [1, 2], [3], [4, 5], [6, 7, 8]][s._step] || [], fs = Math.max(10, Math.min(13, W / 40));
        s.tools.forEach(function (name, i) {
          var f = ease((t - 0.3 - i * 0.15) / 0.5); if (!f) return;
          var a = -Math.PI / 2 + i * 2 * Math.PI / n, rf = (i % 2 ? 0.66 : 1) * f, x = cx + Math.cos(a) * rx * rf, y = cy + Math.sin(a) * ry * rf, on = hi.indexOf(i) >= 0;
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

    { wk: 'Week 5', name: 'Machine learning pipelines', dur: 16,
      steps: [[0, 'Data: collect raw measurements, here a motor’s vibration sensor. Real data is messy: missing stretches and outlier spikes.'],
              [2.6, 'Clean: fill the gaps (dashed) and remove the outliers, so errors in the data don’t become errors in the model.'],
              [5.2, 'Features: cut the signal into windows and summarize each one with numbers a model can learn from (mean, RMS, peak).'],
              [7.8, 'Train: split the data (80% to train, 20% held back to test) and fit the model; the training loss drops.'],
              [10.4, 'Evaluate: test on the held-back data it has never seen. The confusion matrix shows right and wrong calls. Not good enough? Retrain.'],
              [13, 'Deploy: the model watches the live sensor stream and raises an alert when it detects a fault; keep monitoring it.']],
      init: function () {
        var R = rng(41), n = 120, raw = [], clean = [], gap = function (i) { return (i >= 30 && i <= 38) || (i >= 80 && i <= 86); };
        for (var i = 0; i < n; i++) { var v = 0.5 * Math.sin(i / 20 * 2 * Math.PI) + 0.25 * Math.sin(i / 7 * 2 * Math.PI); clean.push(v); raw.push(gap(i) ? null : v + gauss(R) * 0.12); }
        raw[55] = 1.65; raw[101] = -1.55;
        var feats = []; for (var w = 0; w < 4; w++) { var sum = 0, sq = 0, pk = 0; for (i = w * 30; i < w * 30 + 30; i++) { sum += clean[i]; sq += clean[i] * clean[i]; pk = Math.max(pk, Math.abs(clean[i])); } feats.push([sum / 30, Math.sqrt(sq / 30), pk]); }
        return { n: n, raw: raw, clean: clean, gap: gap, feats: feats, st: ['Data', 'Clean', 'Features', 'Train', 'Evaluate', 'Deploy'] };
      },
      draw: function (ctx, s, t, W, H, C) {
        var k = s._step, u = t - [0, 2.6, 5.2, 7.8, 10.4, 13][k], n = s.st.length, fs = Math.max(10, Math.min(12, W / 44));
        // the pipeline: numbered stages along the top
        var y0 = H * 0.12, x0 = W * 0.08, x1 = W * 0.92, dx = (x1 - x0) / (n - 1);
        alpha(ctx, 1); ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
        ctx.strokeStyle = C.maroon; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + dx * Math.min(k + ease(u / 0.6), n - 1), y0); ctx.stroke();
        s.st.forEach(function (name, i) {
          var x = x0 + i * dx, on = i === k, past = i < k;
          alpha(ctx, 1); ctx.fillStyle = on ? C.maroon : past ? C.chip : C.bg; ctx.strokeStyle = i <= k ? C.maroon : C.line; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(x, y0, on ? 11 : 9, 0, 7); ctx.fill(); ctx.stroke();
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; font(ctx, on ? 11 : 10); ctx.fillStyle = on ? C.bg : C.text; ctx.fillText(i + 1, x, y0 + 1); ctx.textBaseline = 'alphabetic';
          label(ctx, name, x, y0 + 26, C, fs, on ? C.maroon : C.muted, on ? 1 : 0.85); ctx.textAlign = 'left';
        });
        // the detail panel for the current stage
        var px = W * 0.06, py = H * 0.32, pw = W * 0.88, ph = H * 0.62;
        alpha(ctx, 1); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(px, py, pw, ph);
        function SX(i) { return px + 10 + (pw - 20) * i / (s.n - 1); }
        function SY(v, top, h) { return top + h / 2 - v * h * 0.32; }
        function signal(vals, top, h, col, a, w, dash) {
          alpha(ctx, a); ctx.strokeStyle = col; ctx.lineWidth = w || 1.6; if (dash) ctx.setLineDash(dash); ctx.beginPath(); var pen = false;
          vals.forEach(function (v, i) { if (v == null) { pen = false; return; } var X = SX(i), Y = SY(v, top, h); pen ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); pen = true; });
          ctx.stroke(); ctx.setLineDash([]);
        }
        var g = ease(u / 0.8);
        if (k === 0) {
          var shownRaw = s.raw.map(function (v, i) { return i / s.n <= ease(u / 1.4) ? v : null; });
          [[30, 38], [80, 86]].forEach(function (r) { alpha(ctx, 0.5 * g); ctx.fillStyle = C.chip; ctx.fillRect(SX(r[0]), py + 6, SX(r[1]) - SX(r[0]), ph - 12); centered(ctx, 'missing', (SX(r[0]) + SX(r[1])) / 2, py + ph - 10, C, 10, C.muted, g); });
          signal(shownRaw, py, ph, C.teal, 0.9);
          if (u > 1.2) [[55, 1.65], [101, -1.55]].forEach(function (o) { var X = SX(o[0]), Y = SY(o[1], py, ph); alpha(ctx, 1); ctx.strokeStyle = C.maroon; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X, Y, 7, 0, 7); ctx.stroke(); label(ctx, 'outlier', X + 10, Y + 4, C, 10, C.maroon); });
        } else if (k === 1) {
          signal(s.raw, py, ph, C.muted, 0.3 * (1 - g));
          var mix = s.raw.map(function (v, i) { return v == null || i === 55 || i === 101 ? null : v + (s.clean[i] - v) * g; });
          signal(mix, py, ph, C.teal, 0.95, 2);
          [[29, 39], [79, 87]].forEach(function (r) { signal(s.clean.map(function (v, i) { return i >= r[0] && i <= r[0] + (r[1] - r[0]) * g ? v : null; }), py, ph, C.gold, 1, 2.4, [4, 3]); centered(ctx, 'filled', (SX(r[0]) + SX(r[1])) / 2, py + ph - 10, C, 10, C.gold, g); });
          [[55, 1.65], [101, -1.55]].forEach(function (o) { var X = SX(o[0]); alpha(ctx, 1 - g); ctx.fillStyle = C.maroon; ctx.beginPath(); ctx.arc(X, SY(o[1] * (1 - g), py, ph), 4, 0, 7); ctx.fill(); centered(ctx, 'removed', X, py + 14, C, 10, C.maroon, g); });
        } else if (k === 2) {
          var top = py, h = ph * 0.45;
          signal(s.clean, top, h, C.teal, 0.9, 1.6);
          for (var w = 0; w < 4; w++) { var wa = ease((u - w * 0.35) / 0.4); alpha(ctx, 0.9 * wa); ctx.strokeStyle = C.maroon; ctx.lineWidth = 1.4; ctx.strokeRect(SX(w * 30) + 2, top + 4, SX(29) - SX(0) - 4, h - 8); centered(ctx, 'w' + (w + 1), (SX(w * 30) + SX(w * 30 + 29)) / 2, top + h + 2, C, 10, C.maroon, wa); }
          var cols = ['window', 'mean', 'RMS', 'peak'], cw = (pw - 20) / 4, ty = py + h + 18, rh = Math.min(16, (ph - h - 26) / 5);
          cols.forEach(function (c, j) { label(ctx, c, px + 10 + j * cw, ty, C, 10, C.muted, g); });
          s.feats.forEach(function (f, r) { var ra = ease((u - 0.3 - r * 0.35) / 0.4); if (!ra) return; label(ctx, 'w' + (r + 1), px + 10, ty + (r + 1) * rh, C, 10, C.text, ra); f.forEach(function (v, j) { label(ctx, v.toFixed(2), px + 10 + (j + 1) * cw, ty + (r + 1) * rh, C, 10, C.text, ra); }); });
        } else if (k === 3) {
          var bw = pw - 20, bx = px + 10, by = py + 12, sp = ease(u / 0.6);
          alpha(ctx, 1); ctx.fillStyle = C.teal; ctx.fillRect(bx, by, bw * 0.8 * sp + bw * (1 - sp) * 0.8, 14); ctx.fillStyle = C.gold; ctx.fillRect(bx + bw * 0.8 + 3 * sp, by, bw * 0.2 - 3 * sp, 14);
          label(ctx, 'train 80%', bx + 6, by + 11, C, 10, C.bg); label(ctx, 'test 20%', bx + bw * 0.8 + 7, by + 11, C, 10, C.bg, sp);
          var lx = bx + 24, ly = by + 30, lw = bw - 34, lh = ph - 62;
          alpha(ctx, 1); ctx.strokeStyle = C.line; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + lh); ctx.lineTo(lx + lw, ly + lh); ctx.stroke();
          label(ctx, 'loss', bx, ly + 10, C, 10); label(ctx, 'epochs →', lx + lw - 50, ly + lh + 13, C, 10);
          var E = clamp((u - 0.5) / 1.9, 0, 1); alpha(ctx, 1); ctx.strokeStyle = C.maroon; ctx.lineWidth = 2.2; ctx.beginPath();
          for (var e = 0; e <= E; e += 0.01) { var L = 0.08 + 0.85 * Math.exp(-e * 4.5) + 0.03 * Math.sin(e * 40) * Math.exp(-e * 3); var X = lx + e * lw, Y = ly + (1 - L) * lh; e ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
          ctx.stroke();
        } else if (k === 4) {
          var cs = Math.min(ph * 0.3, pw * 0.16), mx = px + Math.max(56, pw * 0.2), my = py + 30, vals = [[46, 2], [1, 11]], names = ['normal', 'fault'];
          centered(ctx, 'predicted', mx + cs, my - 14, C, 10); 
          names.forEach(function (nm, j) { centered(ctx, nm, mx + cs * j + cs / 2, my - 2, C, 10); ctx.textAlign = 'right'; label(ctx, nm, mx - 6, my + cs * j + cs / 2 + 4, C, 10); ctx.textAlign = 'left'; });
          ctx.save(); ctx.translate(mx - 46, my + cs); ctx.rotate(-Math.PI / 2); centered(ctx, 'actual', 0, -4, C, 10); ctx.restore();
          vals.forEach(function (row, r) { row.forEach(function (v, c) { var a = ease((u - (r * 2 + c) * 0.3) / 0.4); alpha(ctx, a); ctx.fillStyle = r === c ? C.teal : C.maroon; ctx.globalAlpha = a * (r === c ? 0.85 : 0.5); ctx.fillRect(mx + c * cs + 1, my + r * cs + 1, cs - 2, cs - 2); centered(ctx, String(v), mx + c * cs + cs / 2, my + r * cs + cs / 2 + 5, C, 14, C.bg, a); }); });
          var ax = mx + cs * 2 + 18, aa = ease((u - 1.4) / 0.5);
          if (ax + 90 < px + pw) { label(ctx, 'test accuracy', ax, my + 14, C, 11, C.muted, aa); label(ctx, '57 / 60 = 95%', ax, my + 34, C, 13, C.text, aa); label(ctx, '3 wrong calls', ax, my + 54, C, 11, C.maroon, aa); }
          else label(ctx, 'accuracy 57/60 = 95%', mx - 40, my + cs * 2 + 18, C, 11, C.text, aa);
        } else {
          var mx2 = px + 30, my2 = py + ph * 0.45, rot = t * 6, mdx = px + pw * 0.62, alertOn = (u % 2.6) > 1.6;
          alpha(ctx, 1); ctx.strokeStyle = C.maroon; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(mx2, my2, 16, 0, 7); ctx.stroke();
          for (var b = 0; b < 3; b++) { var aa2 = rot + b * 2.09; ctx.beginPath(); ctx.moveTo(mx2, my2); ctx.lineTo(mx2 + Math.cos(aa2) * 12, my2 + Math.sin(aa2) * 12); ctx.stroke(); }
          centered(ctx, 'motor', mx2, my2 + 32, C, 10);
          var sx0 = mx2 + 24, sx1 = mdx - 34;   // live stream
          alpha(ctx, 0.9); ctx.strokeStyle = C.teal; ctx.lineWidth = 1.6; ctx.beginPath();
          for (var xx = sx0; xx <= sx1; xx += 2) { var ph2 = (xx - t * 60) / 9, amp = alertOn && xx > sx1 - 40 ? 13 : 6; var yy = my2 + Math.sin(ph2) * amp + Math.sin(ph2 * 2.7) * 2; xx === sx0 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy); }
          ctx.stroke();
          var bw2 = 60, bh2 = 30; alpha(ctx, 1); ctx.fillStyle = C.bg; ctx.strokeStyle = C.maroon; ctx.lineWidth = 2; ctx.fillRect(mdx - 30, my2 - bh2 / 2, bw2, bh2); ctx.strokeRect(mdx - 30, my2 - bh2 / 2, bw2, bh2);
          centered(ctx, 'model', mdx, my2 + 4, C, 11, C.maroon);
          var lx2 = Math.min(px + pw - 40, mdx + 52); arrow(ctx, [mdx + 32, my2], [lx2 - 12, my2], C.muted, 1.6);
          alpha(ctx, 1); ctx.fillStyle = alertOn ? C.maroon : C.teal; ctx.beginPath(); ctx.arc(lx2, my2, 9, 0, 7); ctx.fill();
          centered(ctx, alertOn ? 'fault!' : 'OK', lx2, my2 + 26, C, 11, alertOn ? C.maroon : C.teal);
          label(ctx, 'monitoring live data', px + 10, py + ph - 10, C, 10);
        }
        label(ctx, 'stage ' + (k + 1) + ' of 6', W * 0.05, H * 0.035 + 10, C, 11);
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

    { wk: 'Weeks 10–11', name: 'Neural networks: recognizing a handwritten digit', dur: 13,
      steps: [[0, 'Input layer: a 28×28 image of a handwritten digit is flattened into 784 numbers, one per pixel.'],
              [2.4, 'Forward pass: each neuron in the hidden layers (128, then 64) adds up its weighted inputs and applies an activation.'],
              [5, 'The output layer gives one score per digit, 0 to 9. Untrained, the network is unsure: “6” gets only 0.48.'],
              [7.2, 'Backpropagation compares the scores with the right answer (6) and sends the error back (gold) to adjust every weight.'],
              [9.6, 'Run it again: now “6” gets 0.91. Training repeats this over thousands of images.']],
      init: function () {
        var R = rng(5), L = [12, 9, 7, 10], w = [], n = 14, oc = document.createElement('canvas'); oc.width = n; oc.height = n;
        var g = oc.getContext('2d'); g.fillStyle = '#000'; g.font = 'bold 15px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('6', n / 2, n / 2 + 1);
        var d = g.getImageData(0, 0, n, n).data, px = [], dark = [];
        for (var i = 0; i < n * n; i++) { px.push(d[i * 4 + 3] / 255); if (d[i * 4 + 3] > 140) dark.push(i); }
        for (i = 0; i < L.length - 1; i++) { w.push([]); for (var a = 0; a < L[i]; a++) { w[i].push([]); for (var b = 0; b < L[i + 1]; b++) w[i][a].push(gauss(R)); } }
        var fly = []; for (i = 0; i < 12; i++) fly.push(dark[Math.floor(R() * dark.length)]);
        return { L: L, w: w, R: R, upd: false, n: n, px: px, fly: fly,
          p1: [0.12, 0.01, 0.02, 0.01, 0.03, 0.22, 0.48, 0.01, 0.09, 0.01], p2: [0.02, 0, 0.01, 0, 0.01, 0.03, 0.91, 0, 0.02, 0] };
      },
      draw: function (ctx, s, t, W, H, C) {
        var L = s.L, gaps = L.length - 1, cols = [W * 0.32, W * 0.49, W * 0.64, W * 0.8], top = H * 0.2, bot = H * 0.86, pos = [];
        if (t >= 9.4 && !s.upd) { s.upd = true; s.w.forEach(function (l) { l.forEach(function (r) { r.forEach(function (v, j) { r[j] = v * 0.85 + gauss(s.R) * 0.3; }); }); }); }
        L.forEach(function (k, i) { pos.push([]); var span = (bot - top) * (i === 3 ? 1 : i === 0 ? 0.92 : k / 11); for (var j = 0; j < k; j++) pos[i].push([cols[i], (top + bot) / 2 + (j - (k - 1) / 2) * span / (k - 1)]); });
        var r = Math.max(4.5, Math.min(9, (bot - top) / 10 / 2 - 1.5));
        // the image and the flatten arrow
        var cell = Math.min(W * 0.17 / s.n, H * 0.3 / s.n), ix = W * 0.03, iy = (top + bot) / 2 - cell * s.n / 2;
        for (var p = 0; p < s.n * s.n; p++) { alpha(ctx, 0.06 + 0.9 * s.px[p]); ctx.fillStyle = C.text; ctx.fillRect(ix + (p % s.n) * cell, iy + Math.floor(p / s.n) * cell, cell - 0.5, cell - 0.5); }
        alpha(ctx, 1); ctx.strokeStyle = C.line; ctx.lineWidth = 1; ctx.strokeRect(ix - 1, iy - 1, cell * s.n + 2, cell * s.n + 2);
        centered(ctx, '28×28 image', ix + cell * s.n / 2, iy + cell * s.n + 14, C, 10);
        var ax0 = ix + cell * s.n + 4, ax1 = cols[0] - r - 6; alpha(ctx, 0.9); arrow(ctx, [ax0, (top + bot) / 2], [ax1, (top + bot) / 2], C.muted, 1.4);
        centered(ctx, 'flatten', (ax0 + ax1) / 2, (top + bot) / 2 - 7, C, 10);
        // group boxes and labels
        function box(x0, x1, txtTop, txtBot) { alpha(ctx, 0.9); ctx.strokeStyle = C.line; ctx.lineWidth = 1.2; ctx.strokeRect(x0, top - r - 6, x1 - x0, bot - top + 2 * r + 12); centered(ctx, txtTop, (x0 + x1) / 2, top - r - 11, C, 10, C.maroon); centered(ctx, txtBot, (x0 + x1) / 2, bot + r + 18, C, 10); }
        box(cols[0] - r - 5, cols[0] + r + 5, '784 inputs', 'input');
        box(cols[1] - r - 8, cols[2] + r + 8, '128 · 64 neurons', 'hidden layers');
        box(cols[3] - r - 5, W * 0.97, '10 digits', 'output');
        var fwd = t < 2.4 ? 0 : t < 9.6 ? clamp((t - 2.4) / 2.4, 0, 1) : clamp((t - 9.6) / 1.8, 0, 1), back = t >= 7.2 && t < 9.6 ? clamp((t - 7.2) / 2.1, 0, 1) : 0;
        for (var i = 0; i < gaps; i++) for (var a = 0; a < L[i]; a++) for (var b = 0; b < L[i + 1]; b++) {
          var P = pos[i][a], Q = pos[i + 1][b], wv = s.w[i][a][b];
          alpha(ctx, 0.08 + Math.min(0.32, Math.abs(wv) * 0.18)); ctx.strokeStyle = wv > 0 ? C.maroon : C.muted; ctx.lineWidth = 0.5 + Math.min(1.8, Math.abs(wv) * 0.8);
          ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.lineTo(Q[0], Q[1]); ctx.stroke();
          var u = fwd * gaps - i;
          if (u > 0 && u < 1 && Math.abs(wv) > 0.9) { alpha(ctx, 0.95); ctx.fillStyle = C.maroon; ctx.beginPath(); ctx.arc(P[0] + (Q[0] - P[0]) * u, P[1] + (Q[1] - P[1]) * u, 2.3, 0, 7); ctx.fill(); }
          var v = back * gaps - (gaps - 1 - i);
          if (v > 0 && v < 1 && Math.abs(wv) > 0.9) { alpha(ctx, 0.95); ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(Q[0] + (P[0] - Q[0]) * v, Q[1] + (P[1] - Q[1]) * v, 2.5, 0, 7); ctx.fill(); }
        }
        // pixels flying into the input layer
        var fl = clamp((t - 0.4) / 1.8, 0, 1);
        s.fly.forEach(function (pi, j) {
          var f = ease(fl * 1.6 - j * 0.05); if (f <= 0 || f >= 1) return;
          var sx = ix + (pi % s.n + 0.5) * cell, sy = iy + (Math.floor(pi / s.n) + 0.5) * cell, d = pos[0][j];
          alpha(ctx, 0.9); ctx.fillStyle = C.text; ctx.beginPath(); ctx.arc(sx + (d[0] - sx) * f, sy + (d[1] - sy) * f - Math.sin(f * Math.PI) * 18, 2.6, 0, 7); ctx.fill();
        });
        var pr = t >= 9.6 && fwd > 0.99 ? s.p2 : s.p1, outOn = (t >= 4.8 && t < 9.6) || (t >= 9.6 && fwd > 0.99);
        pos.forEach(function (layer, i) {
          var reached = i === 0 ? clamp((t - 0.6) / 1.6, 0, 1) : clamp((fwd * gaps - i + 0.25) * 4, 0, 1);
          layer.forEach(function (P, j) {
            var on = i === 0 ? 0.3 + 0.7 * s.px[s.fly[j]] : i === 3 ? (outOn ? pr[j] : 0) : 0.3 + 0.7 * Math.abs(Math.sin(j * 1.7 + i * 2.3 + (t >= 9.6 ? 1 : 0)));
            alpha(ctx, 1); ctx.fillStyle = C.bg; ctx.strokeStyle = i === 3 ? C.text : C.maroon; ctx.lineWidth = 1.6;
            ctx.beginPath(); ctx.arc(P[0], P[1], r, 0, 7); ctx.fill(); ctx.stroke();
            alpha(ctx, reached * on); ctx.fillStyle = i === 3 ? C.gold : C.maroon; ctx.beginPath(); ctx.arc(P[0], P[1], r - 1.5, 0, 7); ctx.fill();
            if (i === 3) {
              ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; font(ctx, Math.max(9, r * 1.2)); alpha(ctx, 1); ctx.fillStyle = C.text; ctx.fillText(j, P[0], P[1] + 1); ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
              if (outOn) { var bx = P[0] + r + 4, bw = (W * 0.965 - bx) * pr[j]; alpha(ctx, 0.9); ctx.fillStyle = j === 6 ? C.gold : C.line; ctx.fillRect(bx, P[1] - 3, Math.max(1, bw), 6); }
              if (j === 6 && t >= 7.2) { alpha(ctx, 1); ctx.strokeStyle = C.teal; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(P[0], P[1], r + 3.5, 0, 7); ctx.stroke(); }
            }
          });
        });
        if (outOn) { var P6 = pos[3][6]; label(ctx, pr[6].toFixed(2), P6[0] + r + 6, P6[1] - 7, C, 10, C.text); }
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
