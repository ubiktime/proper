/* ============================================================
   PROPER PAGES — main.js
   1) Contact assembly: the raw HTML carries no mailto:, tel: or
      wa.me strings — hrefs are built here, so harvesters scraping
      static markup find nothing. (JSON-LD keeps the contact data
      deliberately: that trade is on the record.)
   2) Blueprint mode: "[ view the build ]" outlines the bones —
      labels via data-bp + CSS ::before, degrading to nothing at
      all in older browsers.
   ============================================================ */
(function () {
  var P = ['+34', '641', '314', '730'].join(' ');
  var digits = P.replace(/[^0-9]/g, '');
  var WA = 'https://wa.me/' + digits + '?text=' + encodeURIComponent('Hi Tomasz — found you via your site. I’d like to talk about my website.');
  var EM = 'mailto:' + ['tomaszgoe', 'protonmail.com'].join('@') + '?subject=' + encodeURIComponent('A proper website?');
  var TEL = 'tel:+' + digits;

  var links = document.querySelectorAll('[data-c]');
  for (var i = 0; i < links.length; i++) {
    var a = links[i], k = a.getAttribute('data-c');
    if (k === 'wa') { a.setAttribute('href', WA); a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
    else if (k === 'em') a.setAttribute('href', EM);
    else if (k === 'tel') a.setAttribute('href', TEL);
  }

  /* ---------- blueprint mode ---------- */
  var labelled = false;
  var bp = document.createElement('button');
  bp.type = 'button';
  bp.className = 'bp-toggle';
  bp.textContent = '[ view the build ]';
  bp.setAttribute('aria-pressed', 'false');

  function label() {
    labelled = true;
    var map = [
      ['header.site-head', 'header — wordmark + nav'],
      ['section.hero', 'section.hero — the pitch'],
      ['.hero h1', 'h1 — one per page, always'],
      ['.cta-row', 'the CTA trio — primary, secondary, tertiary'],
      ['.mono-note', 'the mono-note'],
      ['.stats', 'the receipts'],
      ['#problem', 'section — the problem (night side)'],
      ['.steps', 'ol.steps — four steps, no theatre'],
      ['#weight', 'section — 24 KB vs 5 MB'],
      ['#ownership', 'section — the crossover payload'],
      ['#proof', 'section — proof, not adjectives'],
      ['figure.shot', 'figure — real pixels, lazy-loaded'],
      ['#prices', 'section — prices in the open'],
      ['#about', 'section — the builder'],
      ['#contact', 'section — the ask'],
      ['.card', 'the perfect first message'],
      ['footer.site-foot', 'footer — legal, no cookies'],
      ['.depth', 'live readout — load time + depth']
    ];
    for (var m = 0; m < map.length; m++) {
      var els = document.querySelectorAll(map[m][0]);
      for (var j = 0; j < els.length; j++) els[j].setAttribute('data-bp', map[m][1]);
    }
    bp.setAttribute('data-bp', 'the toggle — you’re here');
  }

  bp.addEventListener('click', function () {
    var on = document.documentElement.classList.toggle('blueprint');
    if (on && !labelled) label();
    bp.textContent = on ? '[ view the site ]' : '[ view the build ]';
    bp.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  function boot() { document.body.appendChild(bp); }
  if (document.body) boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
