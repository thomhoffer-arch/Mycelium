// Typewriter reveal for the spine snippet on the landing page.
// Externalized from an inline <script> so the page can run a strict CSP
// (script-src 'self', no 'unsafe-inline').
(function () {
  function start() {
    var code = document.getElementById('spine-snippet');
    if (!code) return;
    var text = code.dataset.source || '';
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { code.textContent = text; return; }

    var i = 0;
    function tick() {
      if (i >= text.length) return;
      code.textContent += text[i++];
      var ch = text[i - 1];
      // faster after newlines/indent, a touch slower on punctuation
      var delay = ch === '\n' ? 20 : ch === ' ' ? 12 : /[{}\[\]:,]/.test(ch) ? 45 : 22;
      setTimeout(tick, delay);
    }
    function begin() { if (!code.textContent) tick(); }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        if (entries.some(function (e) { return e.isIntersecting; })) { obs.disconnect(); begin(); }
      }, { threshold: 0.3 }).observe(code);
    } else { begin(); }
  }

  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
})();
