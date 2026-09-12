/* ============================================================
   PROPER PAGES — dawn.js
   "scroll — and the lights come on"
   The background morphs continuously with scroll depth
   (indigo night -> lamplight cream). The text system does
   NOT fade — it snaps light->dark at the crossover in one
   beat, with hysteresis so the threshold never flickers.
   The crossover anchors itself to #ownership: the flip follows
   the content, not vice versa. The corner readout shows real
   Navigation Timing — this page's own load time, not a boast.
   Reduced-motion users keep the static cream theme (CSS default).
   ============================================================ */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var CROSS = 0.565;                                  // default; recomputed from #ownership below
  var LIGHT = { h: '#EDE9E2', text: '#EDE9E2', muted: '#B9BDB8', accent: '#C0C054', aink: '#101F33', rule: '#3A4B63', card: 'rgba(255,255,255,.04)' };
  var DARK  = { h: '#121512', text: '#121512', muted: '#4F5B47', accent: '#9A8616', aink: '#F5F3E6', rule: '#C9C6B2', card: 'rgba(255,255,255,.35)' };

  function rgb(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function mix(a, b, t) {
    var A = rgb(a), B = rgb(b);
    return 'rgb(' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); }).join(',') + ')';
  }
  function sample(stops, p) {
    for (var i = 1; i < stops.length; i++) {
      if (p <= stops[i][0]) {
        var p0 = stops[i - 1][0], c0 = stops[i - 1][1], p1 = stops[i][0], c1 = stops[i][1];
        return mix(c0, c1, (p - p0) / (p1 - p0));
      }
    }
    return stops[stops.length - 1][1];
  }

  /* stops rebuilt around the live crossover */
  function bgStops() {
    return [
      [0, '#101F33'], [CROSS * 0.566, '#183048'], [CROSS * 0.885, '#2C4A6B'],
      [CROSS, '#5F7492'],
      [CROSS + 0.172 * (1 - CROSS), '#9DA8B2'],
      [CROSS + 0.540 * (1 - CROSS), '#CFCFBE'],
      [CROSS + 0.770 * (1 - CROSS), '#E6E3CE'],
      [1, '#F1EFDC']
    ];
  }
  function inkStops()   { return [[CROSS, '#121512'], [CROSS + 0.540 * (1 - CROSS), '#203020'], [1, '#203020']]; }
  function mutedStops() { return [[CROSS, '#4F5B47'], [CROSS + 0.770 * (1 - CROSS), '#5A6349'], [1, '#5A6349']]; }

  /* the flip follows the content: #ownership is where the lights come on */
  function computeCross() {
    var el = document.querySelector('[data-dawn-anchor]') || document.getElementById('ownership');
    if (!el) return;
    var max = document.documentElement.scrollHeight - innerHeight;
    if (max <= 0) return;
    var target = el.offsetTop - innerHeight * 0.42;
    CROSS = Math.min(0.72, Math.max(0.42, target / max));
  }

  var side = 'light';
  var depthEl = document.createElement('div');
  depthEl.className = 'depth';

  var loadMs = null;
  function measure() {
    try {
      var n = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      if (n && n.duration) loadMs = Math.round(n.duration);
      else if (performance.timing && performance.timing.loadEventEnd) {
        loadMs = Math.max(0, performance.timing.loadEventEnd - performance.timing.navigationStart);
      }
    } catch (e) {}
  }

  function currentP() {
    var max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  }

  function apply(p) {
    // hysteresis: flip down at CROSS+.01, flip up at CROSS-.01
    if (side === 'light' && p >= CROSS + 0.01) side = 'dark';
    else if (side === 'dark' && p <= CROSS - 0.01) side = 'light';

    var r = document.documentElement.style;
    var S = side === 'light' ? LIGHT : DARK;
    r.setProperty('--bg', sample(bgStops(), p));
    r.setProperty('--h', side === 'light' ? S.h : sample(inkStops(), p));
    r.setProperty('--text', side === 'light' ? S.text : sample(inkStops(), p));
    r.setProperty('--muted', side === 'light' ? S.muted : sample(mutedStops(), p));
    r.setProperty('--accent', S.accent);
    r.setProperty('--accent-ink', S.aink);
    r.setProperty('--rule', S.rule);
    r.setProperty('--card', S.card);
    depthEl.textContent =
      (loadMs !== null ? 'loaded in ' + loadMs + ' ms · ' : '') +
      'depth ' + Math.round(p * 100) + '% · ' + (side === 'light' ? 'night' : 'day');
  }

  var tick = false;
  function onScroll() {
    if (tick) return;
    tick = true;
    requestAnimationFrame(function () {
      apply(currentP());
      tick = false;
    });
  }
  function onResize() { computeCross(); onScroll(); }

  // First paint: set the correct state synchronously, before the browser
  // paints — no transition on body, no light-on-cream flash at load.
  computeCross();
  measure();
  apply(currentP());
  function boot() {
    document.body.appendChild(depthEl);
    computeCross();
    apply(currentP());
  }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);

  addEventListener('load', function () {
    measure(); computeCross(); apply(currentP());
    // the navigation entry's duration finalises just after load — poll twice
    setTimeout(function () { measure(); apply(currentP()); }, 60);
    setTimeout(function () { measure(); apply(currentP()); }, 300);
  });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onResize);
})();
