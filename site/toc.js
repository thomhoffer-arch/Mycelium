// Builds a Contents nav from the h2/h3 headings inside a root element.
// Assigns slug ids to the headings so the links jump correctly.
(function () {
  function slugify(s) {
    return String(s).toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  function stripNumbering(s) {
    return String(s).replace(/^\s*\d+(?:\.\d+)*\.?\s+/, '');
  }
  window.buildToc = function buildToc(rootSelector, tocSelector) {
    var root = document.querySelector(rootSelector);
    var toc = document.querySelector(tocSelector);
    if (!root || !toc) return;
    var items = [];
    root.querySelectorAll('h2').forEach(function (h) {
      var id = h.id || slugify(h.textContent);
      if (!id) return;
      h.id = id;
      items.push({ id: id, text: stripNumbering(h.textContent) });
    });
    if (!items.length) { toc.innerHTML = '<p class="muted">No sections.</p>'; return; }
    toc.innerHTML = '<ul>' + items.map(function (i) {
      return '<li><a href="#' + i.id + '">' + i.text + '</a></li>';
    }).join('') + '</ul>';
  };
})();
