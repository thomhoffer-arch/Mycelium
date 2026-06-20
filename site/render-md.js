// Fetches a Markdown file and renders it into the page, SANITIZED.
//
// Security: marked does not sanitize HTML, and this content (REGISTRY.md,
// CHECKLIST.md, connective-spine.md) can be edited via community PRs. We run
// the parsed output through DOMPurify before it ever touches innerHTML, so a
// malicious markdown row cannot inject script/event-handler HTML into the page.
//
// Driven by data-attributes on the target element so one file serves every
// page (no per-page inline script, which keeps the CSP strict: script-src 'self').
//   data-md-src       the markdown file to fetch (required)
//   data-md-label     human label used in the load-error message
//   data-md-fallback  GitHub URL shown if the fetch fails
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(async function () {
    var target = document.querySelector('[data-md-src]');
    if (!target) return;

    var src = target.getAttribute('data-md-src');
    var label = target.getAttribute('data-md-label') || 'document';
    var fallback = target.getAttribute('data-md-fallback') || '';

    try {
      var res = await fetch(src, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var md = await res.text();

      if (!window.marked || !window.DOMPurify) {
        throw new Error('renderer unavailable');
      }
      window.marked.setOptions({ gfm: true });
      target.innerHTML = window.DOMPurify.sanitize(window.marked.parse(md));
    } catch (e) {
      var link = fallback ? ' <a href="' + fallback + '">View it on GitHub</a>.' : '';
      target.innerHTML = '<p class="muted">Could not load the ' + label + '.' + link + '</p>';
    } finally {
      if (typeof window.buildToc === 'function') window.buildToc('#content', '#toc');
    }
  });
})();
