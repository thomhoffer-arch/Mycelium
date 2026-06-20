// Builds the table of contents for pages with static (non-Markdown) content.
// Externalized from an inline <script> so the page can run a strict CSP.
(function () {
  function go() { if (typeof window.buildToc === 'function') window.buildToc('#content', '#toc'); }
  if (document.readyState !== 'loading') go();
  else document.addEventListener('DOMContentLoaded', go);
})();
