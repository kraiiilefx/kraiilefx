/* KRAIIILEFX scenepacks: Folder > Subfolder > Subfolder2 > Pack
   Data fields used: folder, subfolder, subfolder2, folderCover, subfolderCover, subfolder2Cover, locked, mega, key */
(function () {
  'use strict';
  console.log('KX folder v4 (logo sabit)');

  var DATA_URL = 'data/scenepacks.json'; // GitHub'daki data klasoru

  var LEVELS = ['folder', 'subfolder', 'subfolder2'];
  var COVERS = ['folderCover', 'subfolderCover', 'subfolder2Cover'];
  var TITLES = ['folderTitle', 'subfolderTitle', 'subfolder2Title']; // yazi yerine logo gorseli
  var MW4_NAME = 'Call of Duty Modern Warfare 4';
  var MW4_LOGO = 'assets/codmw4-logo.png';
  var grid = document.getElementById('grid');
  var search = document.getElementById('search');
  var crumbs = document.getElementById('crumbs');
  var modal = document.getElementById('packModal');
  var modalBody = document.getElementById('packBody');
  var packs = [];

  var ICON_LOCK = '<span class="kx-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></svg></span>';
  var ICON_FOLDER = '<span class="kx-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></span>';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function enc(s) { return encodeURIComponent(s); }
  function newest(a, b) { return (b.date || '').localeCompare(a.date || ''); }

  /* ---------- routing: #/Call%20of%20Duty/Call%20of%20Duty%20Modern%20Warfare%204/Ghost ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    var p = h ? h.split('/').map(decodeURIComponent) : [];
    return p.slice(0, LEVELS.length);
  }

  /* ---------- cards ---------- */
  function art(src, pos) {
    if (!src) return '<div class="kx-art"></div>';
    return '<div class="kx-art"><img src="' + esc(src) + '" alt="" loading="lazy"' +
      (pos ? ' style="object-position:' + esc(pos) + '"' : '') + '></div>';
  }

  function packCard(p, i) {
    var lock = p.locked || !p.mega;
    var logo = p.titleImage || (p.subfolder === MW4_NAME ? MW4_LOGO : '');
    return '<a class="kx-card' + (lock ? ' is-locked' : '') + '" href="#" data-pack="' + esc(p.id) +
      '" style="--i:' + i + '">' + art(p.cover, p.coverPos) + (lock ? ICON_LOCK : '') +
      '<div class="kx-info">' +
      (logo
        ? '<img src="' + esc(logo) + '" alt="' + esc(p.production) + '" style="display:block;max-width:100%;max-height:64px;object-fit:contain;object-position:left center">' +
          '<div class="kx-c">' + esc(p.character) + '</div>' + (lock ? '<div class="kx-c">Coming Soon</div>' : '')
        : '<div class="kx-t">' + esc(p.name) + '</div><div class="kx-c">' + esc(lock ? 'Coming Soon' : p.character) + '</div>') +
      '</div></a>';
  }

  function folderCard(name, group, depth, href, i) {
    var coverKey = COVERS[depth];
    var withCover = group.filter(function (g) { return g[coverKey]; })[0] || group[0];
    var cover = withCover[coverKey] || withCover.cover;
    var n = group.length;
    var titleSrc = (group.filter(function (g) { return g[TITLES[depth]]; })[0] || {})[TITLES[depth]] ||
      (name === MW4_NAME ? MW4_LOGO : '');
    var title = titleSrc
      ? '<img src="' + esc(titleSrc) + '" alt="' + esc(name) + '" style="display:block;max-width:100%;max-height:64px;object-fit:contain;object-position:left center">'
      : '<div class="kx-t">' + esc(name) + '</div>';
    return '<a class="kx-card kx-folder" href="' + href + '" style="--i:' + i + '">' + art(cover, withCover.coverPos) +
      ICON_FOLDER + '<div class="kx-info">' + title + '<div class="kx-c">' +
      n + ' scenepack' + (n === 1 ? '' : 's') + '</div></div></a>';
  }

  /* bir seviyedeki ogeleri (klasor + tekil pack) tarihe gore sirala */
  function level(list, key) {
    var groups = {}, out = [];
    list.forEach(function (p) {
      var k = p[key];
      if (k) { (groups[k] = groups[k] || []).push(p); }
      else { out.push({ d: p.date || '', p: p }); }
    });
    Object.keys(groups).forEach(function (k) {
      var g = groups[k].sort(newest);
      out.push({ d: g[0].date || '', g: g, k: k });
    });
    return out.sort(function (a, b) { return b.d.localeCompare(a.d); });
  }

  /* ---------- render ---------- */
  function setCrumbs(path) {
    var h = '<a href="#/">Scenepacks</a>';
    path.forEach(function (name, i) {
      var last = i === path.length - 1;
      h += '<span>/</span>';
      if (last) {
        h += '<b>' + esc(name) + '</b>';
      } else {
        h += '<a href="#/' + path.slice(0, i + 1).map(enc).join('/') + '">' + esc(name) + '</a>';
      }
    });
    crumbs.innerHTML = h;
    crumbs.style.display = path.length ? '' : 'none';
  }

  function render() {
    var path = route();
    var q = search.value.trim().toLowerCase();
    var html = '', list;

    if (q) {
      setCrumbs([]);
      list = packs.filter(function (p) {
        return [p.name, p.production, p.character, p.folder, p.subfolder, p.subfolder2].join(' ').toLowerCase().indexOf(q) > -1;
      }).sort(newest);
      html = list.map(packCard).join('');
    } else {
      setCrumbs(path);
      var depth = path.length;
      list = packs.filter(function (p) {
        for (var i = 0; i < depth; i++) { if (p[LEVELS[i]] !== path[i]) return false; }
        return true;
      });
      var items, base = '#/' + path.map(enc).concat('').join('/');
      if (depth < LEVELS.length) {
        items = level(list, LEVELS[depth]);
      } else {
        items = list.sort(newest).map(function (p) { return { p: p }; });
      }
      html = items.map(function (o, i) {
        return o.g ? folderCard(o.k, o.g, depth, base + enc(o.k), i) : packCard(o.p, i);
      }).join('');
    }

    grid.innerHTML = html || '<p class="kx-empty">Nothing here yet.</p>';
  }

  /* ---------- pack modal ---------- */
  function openPack(id) {
    var p = packs.filter(function (x) { return x.id === id; })[0];
    if (!p || p.locked || !p.mega) return;
    var link = p.mega + (p.key ? '#' + p.key : '');
    modalBody.innerHTML =
      '<div class="kx-m-art">' + art(p.cover, p.coverPos) + '</div>' +
      '<div class="kx-m-txt"><h3>' + esc(p.name) + '</h3>' +
      '<p class="kx-m-sub">' + esc(p.character) + '</p>' +
      '<div class="kx-chips"><span>' + esc(p.resolution) + '</span><span>' + esc(p.fps) + '</span></div>' +
      '<p class="kx-m-note">' + esc(p.instructions) + '</p>' +
      '<div class="kx-btns">' +
      '<a class="kx-btn" href="' + esc(p.instagram) + '" target="_blank" rel="noopener noreferrer">Instagram</a>' +
      '<a class="kx-btn kx-main" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">Download</a>' +
      '</div></div>';
    modal.classList.add('open');
  }
  function closePack() { modal.classList.remove('open'); }

  /* ---------- events ---------- */
  grid.addEventListener('click', function (e) {
    var a = e.target.closest('[data-pack]');
    if (!a) return;
    e.preventDefault();
    openPack(a.getAttribute('data-pack'));
  });
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('.kx-close')) closePack();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePack(); });
  window.addEventListener('hashchange', function () { search.value = ''; render(); window.scrollTo(0, 0); });
  search.addEventListener('input', render);

  /* ---------- load ---------- */
  fetch(DATA_URL + '?v=' + Date.now())
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) { packs = data; render(); })
    .catch(function () { grid.innerHTML = '<p class="kx-empty">Could not load scenepacks.</p>'; });
})();
