/* KRAIIILEFX scenepacks: Folder > Subfolder > Pack
   Data fields used: folder, subfolder, folderCover, subfolderCover, locked, mega, key */
(function () {
  'use strict';

  var DATA_URL = 'data/scenepacks.json'; // GitHub'daki data klasoru

  var grid = document.getElementById('grid');
  var search = document.getElementById('search');
  var crumbs = document.getElementById('crumbs');
  var pageTitle = document.getElementById('pageTitle');
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

  /* ---------- routing: #/Call%20of%20Duty/Ghost ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    var p = h ? h.split('/').map(decodeURIComponent) : [];
    return { folder: p[0] || '', sub: p[1] || '' };
  }

  /* ---------- cards ---------- */
  function art(src, pos) {
    if (!src) return '<div class="kx-art"></div>';
    return '<div class="kx-art"><img src="' + esc(src) + '" alt=""' +
      (pos ? ' style="object-position:' + esc(pos) + '"' : '') + '></div>';
  }

  function packCard(p, i) {
    var lock = p.locked || !p.mega;
    return '<a class="kx-card' + (lock ? ' is-locked' : '') + '" href="#" data-pack="' + esc(p.id) +
      '" style="--i:' + i + '">' + art(p.cover, p.coverPos) + (lock ? ICON_LOCK : '') +
      '<div class="kx-info"><div class="kx-t">' + esc(p.name) + '</div><div class="kx-c">' +
      esc(lock ? 'Coming Soon' : p.character) + '</div></div></a>';
  }

  function folderCard(name, group, key, href, i) {
    var coverKey = key === 'folder' ? 'folderCover' : 'subfolderCover';
    var withCover = group.filter(function (g) { return g[coverKey]; })[0] || group[0];
    var cover = withCover[coverKey] || withCover.cover;
    var n = group.length;
    return '<a class="kx-card kx-folder" href="' + href + '" style="--i:' + i + '">' + art(cover, withCover.coverPos) +
      ICON_FOLDER + '<div class="kx-info"><div class="kx-t">' + esc(name) + ' Scenepacks</div><div class="kx-c">' +
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
  function setCrumbs(r) {
    /* Baslik: Scenepacks / Call of Duty Scenepacks / Ghost Scenepacks */
    var name = r.sub || r.folder;
    var text = name ? name + ' Scenepacks' : 'Scenepacks';
    if (pageTitle) pageTitle.textContent = text;
    document.title = text + ' | KRAIIILEFX';

    var h = '<a href="#/">Scenepacks</a>';
    if (r.folder) {
      h += '<span>/</span>' + (r.sub ? '<a href="#/' + enc(r.folder) + '">' + esc(r.folder) + '</a>' : '<b>' + esc(r.folder) + '</b>');
    }
    if (r.sub) h += '<span>/</span><b>' + esc(r.sub) + '</b>';
    crumbs.innerHTML = h;
    crumbs.style.display = r.folder ? '' : 'none';
  }

  function render() {
    var r = route();
    var q = search.value.trim().toLowerCase();
    var html = '', list;

    if (q) {
      setCrumbs({ folder: '', sub: '' });
      list = packs.filter(function (p) {
        return [p.name, p.production, p.character, p.folder, p.subfolder].join(' ').toLowerCase().indexOf(q) > -1;
      }).sort(newest);
      html = list.map(packCard).join('');
    } else {
      setCrumbs(r);
      var items, key, base;
      if (!r.folder) {
        items = level(packs, 'folder'); key = 'folder'; base = '#/';
      } else if (!r.sub) {
        list = packs.filter(function (p) { return p.folder === r.folder; });
        items = level(list, 'subfolder'); key = 'subfolder'; base = '#/' + enc(r.folder) + '/';
      } else {
        list = packs.filter(function (p) { return p.folder === r.folder && p.subfolder === r.sub; }).sort(newest);
        items = list.map(function (p) { return { p: p }; });
      }
      html = items.map(function (o, i) {
        return o.g ? folderCard(o.k, o.g, key, base + enc(o.k), i) : packCard(o.p, i);
      }).join('');
    }

    grid.innerHTML = html || '<p class="kx-empty">Nothing here yet.</p>';
  }

  /* ---------- pack modal ---------- */
  function openPack(id) {
    var p = packs.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    var off = p.locked || !p.mega;
    var link = p.mega + (p.key ? '#' + p.key : '');
    var dl = off
      ? '<span class="kx-btn kx-main is-off">Coming Soon</span>'
      : '<a class="kx-btn kx-main" href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">Download</a>';
    modalBody.innerHTML =
      '<div class="kx-m-art">' + art(p.cover, p.coverPos) + '</div>' +
      '<div class="kx-m-txt"><h3>' + esc(p.name) + '</h3>' +
      '<p class="kx-m-sub">' + esc(p.character) + '</p>' +
      '<div class="kx-chips"><span>' + esc(p.resolution) + '</span><span>' + esc(p.fps) + '</span></div>' +
      '<p class="kx-m-note">' + esc(p.instructions) + '</p>' +
      '<div class="kx-btns">' +
      '<a class="kx-btn" href="' + esc(p.instagram) + '" target="_blank" rel="noopener noreferrer">Instagram</a>' +
      dl +
      '</div></div>';
    modal.classList.add('open');
  }
  function closePack() { modal.classList.remove('open'); }

  /* ---------- gif bulunamazsa baska klasorlerde ara ---------- */
  var GIF_DIRS = ['assets/covers/', 'assets/', 'assets/js/', 'assets/img/', 'assets/images/'];
  function imgFallback(e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || !img.closest('.kx-art')) return;
    var file = (img.getAttribute('src') || '').split('/').pop();
    var n = (parseInt(img.getAttribute('data-try'), 10) || 0) + 1;
    if (n < GIF_DIRS.length) {
      img.setAttribute('data-try', n);
      img.src = GIF_DIRS[n] + file;
    } else {
      img.style.visibility = 'hidden';
      console.warn('Gif bulunamadi:', file);
    }
  }
  grid.addEventListener('error', imgFallback, true);
  modal.addEventListener('error', imgFallback, true);

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
