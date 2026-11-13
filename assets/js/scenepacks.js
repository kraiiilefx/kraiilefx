/* KRAIIILEFX scenepacks: Folder > Subfolder > Pack
   Data fields used: folder, subfolder, folderCover, subfolderCover, locked, mega, key */
(function () {
  'use strict';

  var DATA_URL = 'data/scenepacks.json'; // GitHub'daki data klasoru

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

  /* "Call of Duty: Modern Warfare 2" -> "codmw2" (bas harfler, kisaltma aramasi icin) */
  function initials(s) {
    return String(s || '').split(/[^A-Za-z0-9]+/).filter(Boolean).map(function (w) {
      return /^\d+$/.test(w) ? w : w.charAt(0);
    }).join('');
  }

  /* bir pack'in aranabilir metni: isimler + kisaltmalar */
  function haystack(p) {
    return [
      p.name, p.production, p.character, p.folder, p.subfolder,
      initials(p.folder), initials(p.production), initials(p.name)
    ].join(' ').toLowerCase();
  }

  function matches(p, q) { return haystack(p).indexOf(q) > -1; }

  /* ---------- routing: #/Call%20of%20Duty/Ghost ---------- */
  function route() {
    var h = location.hash.replace(/^#\/?/, '');
    var p = h ? h.split('/').map(decodeURIComponent) : [];
    return { folder: p[0] || '', sub: p[1] || '' };
  }

  /* ---------- cards ---------- */
  function art(src, pos) {
    if (!src) return '<div class="kx-art"></div>';
    return '<div class="kx-art"><img src="' + esc(src) + '" alt="" loading="lazy"' +
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
      ICON_FOLDER + '<div class="kx-info"><div class="kx-t">' + esc(name) + '</div><div class="kx-c">' +
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
    var h = '<a href="#/">Scenepacks</a>';
    if (r.folder) {
      h += '<span>/</span>' + (r.sub ? '<a href="#/' + enc(r.folder) + '">' + esc(r.folder) + '</a>' : '<b>' + esc(r.folder) + '</b>');
    }
    if (r.sub) h += '<span>/</span><b>' + esc(r.sub) + '</b>';
    crumbs.innerHTML = h;
    crumbs.style.display = r.folder ? '' : 'none';
  }

  function setPlaceholder(r) {
    var where = r.sub || r.folder;
    search.placeholder = where ? 'Search in ' + where : 'Search movie, series or character';
  }

  function inScope(p, r) {
    if (r.folder && p.folder !== r.folder) return false;
    if (r.sub && p.subfolder !== r.sub) return false;
    return true;
  }

  /* aranan sey baska klasordeyse: "Wrong folder! Go to the X folder." (tiklanabilir) */
  function wrongFolderMessage(q, r) {
    var targets = [], seen = {};
    packs.forEach(function (p) {
      if (inScope(p, r) || !matches(p, q)) return;
      var name, href;
      if (p.folder !== r.folder) {
        name = p.folder;
        href = '#/' + enc(p.folder);
      } else if (p.subfolder) {
        name = p.subfolder;
        href = '#/' + enc(p.folder) + '/' + enc(p.subfolder);
      } else {
        name = p.folder;
        href = '#/' + enc(p.folder);
      }
      if (!seen[href]) { seen[href] = 1; targets.push({ name: name, href: href }); }
    });
    if (!targets.length) return '';

    var links = targets.map(function (t) {
      return '<a href="' + t.href + '" style="color:#fff;border-bottom:1px solid rgba(255,255,255,.4)">' + esc(t.name) + '</a>';
    }).join(' or ');
    return 'Wrong folder! Go to the ' + links + ' folder' + (targets.length > 1 ? 's' : '') + '.';
  }

  function render() {
    var r = route();
    var q = search.value.trim().toLowerCase();
    var html = '', list;

    setCrumbs(r);
    setPlaceholder(r);

    if (q) {
      /* arama sadece bulunulan klasorde / alt klasorde yapilir */
      list = packs.filter(function (p) { return inScope(p, r) && matches(p, q); }).sort(newest);

      if (list.length) {
        html = list.map(packCard).join('');
      } else {
        var msg = (r.folder || r.sub) ? wrongFolderMessage(q, r) : '';
        html = '<p class="kx-empty">' + (msg || 'No results.') + '</p>';
      }
    } else {
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
      if (!html) html = '<p class="kx-empty">Nothing here yet.</p>';
    }

    grid.innerHTML = html;
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
