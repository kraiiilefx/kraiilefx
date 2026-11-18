/* KRAIIILEFX scenepacks: Folder > Subfolder > Subfolder2 > Pack
   Data fields used: folder, subfolder, subfolder2, folderCover, subfolderCover, subfolder2Cover, locked, links, mega, key */
(function () {
  'use strict';
  console.log('KX folder v6 (estetik indirme paneli)');

  var DATA_URL = 'data/scenepacks.json'; // GitHub'daki data klasoru

  var LEVELS = ['folder', 'subfolder', 'subfolder2'];
  var COVERS = ['folderCover', 'subfolderCover', 'subfolder2Cover'];
  var TITLES = ['folderTitle', 'subfolderTitle', 'subfolder2Title']; // yazi yerine logo gorseli
  var MW4_NAME = 'Call of Duty Modern Warfare 4';
  var MW4_LOGO = 'assets/codmw4-logo.png';
  var RES = ['1080P', '2k', '4K'];
  var RES_SUB = { '1080p': 'Full HD', '2k': 'QHD', '4k': 'Ultra HD' };
  var DIVIDER = '<i style="display:inline-block;width:1px;height:12px;background:rgba(255,255,255,.4)"></i>';
  var grid = document.getElementById('grid');
  var search = document.getElementById('search');
  var crumbs = document.getElementById('crumbs');
  var modal = document.getElementById('packModal');
  var modalBody = document.getElementById('packBody');
  var packs = [];

  var ICON_LOCK = '<span class="kx-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></svg></span>';
  var ICON_FOLDER = '<span class="kx-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg></span>';
  var ICON_DL = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></svg>';

  /* ---------- indirme paneli stilleri (folders.css'e bagli degil) ---------- */
  var css = document.createElement('style');
  css.textContent =
    'button.kx-btn{font:inherit;font-size:14px;font-weight:600;cursor:pointer;background:transparent}' +
    'button.kx-btn.kx-main{background:#f5f3ee}button.kx-btn.kx-main:hover{background:#fff}' +
    '.kx-btn.kx-main .kx-arr{display:inline-block;width:7px;height:7px;margin-left:10px;vertical-align:2px;' +
      'border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);' +
      'transition:transform .45s cubic-bezier(.22,1,.36,1)}' +
    '.kx-btn.kx-main.is-open .kx-arr{transform:rotate(-135deg) translate(-2px,-2px)}' +

    '.kx-dp{display:grid;grid-template-rows:0fr;margin-top:0;transition:grid-template-rows .55s cubic-bezier(.22,1,.36,1),margin-top .55s cubic-bezier(.22,1,.36,1)}' +
    '.kx-dp.open{grid-template-rows:1fr;margin-top:16px}' +
    '.kx-dp-in{overflow:hidden;min-height:0;display:flex;flex-direction:column;gap:8px}' +

    '.kx-dr{position:relative;display:flex;align-items:center;justify-content:space-between;gap:14px;' +
      'padding:12px 14px 12px 16px;border-radius:14px;color:#fff;text-decoration:none;' +
      'border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.035);' +
      'opacity:0;transform:translateY(10px);' +
      'transition:opacity .45s ease,transform .5s cubic-bezier(.22,1,.36,1),background .35s ease,border-color .35s ease,color .35s ease}' +
    '.kx-dp.open .kx-dr{opacity:1;transform:none}' +
    '.kx-dp.open .kx-dr:nth-child(1){transition-delay:.05s,.05s,0s,0s,0s}' +
    '.kx-dp.open .kx-dr:nth-child(2){transition-delay:.12s,.12s,0s,0s,0s}' +
    '.kx-dp.open .kx-dr:nth-child(3){transition-delay:.19s,.19s,0s,0s,0s}' +

    '.kx-dr-l{display:flex;flex-direction:column;gap:2px;min-width:0}' +
    '.kx-dr-r{font-family:Unbounded,sans-serif;font-size:14px;font-weight:500;letter-spacing:-.01em}' +
    '.kx-dr-s{font-size:11.5px;color:#8f8f94;transition:color .35s ease}' +
    '.kx-dr-a{display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:99px;font-size:13px;font-weight:600;' +
      'border:1px solid rgba(255,255,255,.2);background:rgba(255,255,255,.06);white-space:nowrap;' +
      'transition:background .35s ease,border-color .35s ease,color .35s ease}' +
    '.kx-dr-a svg{transition:transform .45s cubic-bezier(.22,1,.36,1)}' +

    'a.kx-dr:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.34);transform:translateY(-2px)}' +
    'a.kx-dr:hover .kx-dr-a{background:#f5f3ee;color:#0a0a0a;border-color:#f5f3ee}' +
    'a.kx-dr:hover .kx-dr-a svg{transform:translateY(2px)}' +
    'a.kx-dr:hover .kx-dr-s{color:#cfcfcf}' +
    'a.kx-dr:focus-visible{outline:2px solid #efe9da;outline-offset:2px}' +

    '.kx-dr.is-off{cursor:not-allowed;background:rgba(255,255,255,.015);border-style:dashed;border-color:rgba(255,255,255,.1)}' +
    '.kx-dr.is-off .kx-dr-r{color:#6f6f74}.kx-dr.is-off .kx-dr-s{color:#55555a}' +
    '.kx-dr.is-off .kx-dr-a{background:transparent;border-color:rgba(255,255,255,.08);color:#6f6f74}' +

    '@media (prefers-reduced-motion:reduce){.kx-dp,.kx-dr,.kx-dr-a svg,.kx-arr{transition-duration:.01s!important;transition-delay:0s!important}}';
  document.head.appendChild(css);

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function enc(s) { return encodeURIComponent(s); }
  function newest(a, b) { return (b.date || '').localeCompare(a.date || ''); }

  /* ---------- indirme linkleri ----------
     Yeni yontem: "links": { "1080p": "...", "2k": "...", "4k": "..." }
     Eski yontem (tek link): "mega" (+ "key") -> paketin "resolution" degerine denk gelen satira baglanir */
  function hasLinks(p) {
    var L = p.links || {};
    return !!(L['1080p'] || L['2k'] || L['4k'] || p.mega);
  }
  function linkFor(p, r) {
    var L = p.links || {};
    if (L[r]) return L[r];
    var hasNew = !!(L['1080p'] || L['2k'] || L['4k']);
    if (!hasNew && p.mega && String(p.resolution || '').toLowerCase().indexOf(r) === 0) {
      return p.mega + (p.key ? '#' + p.key : '');
    }
    return '';
  }

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
    var lock = p.locked || !hasLinks(p);
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
  function dlPanel(p) {
    var h = '<div class="kx-dp" id="kxDl"><div class="kx-dp-in">';
    RES.forEach(function (r) {
      var url = linkFor(p, r);
      var left = '<span class="kx-dr-l"><span class="kx-dr-r">' + r + '</span><span class="kx-dr-s">' + RES_SUB[r] + '</span></span>';
      if (url) {
        h += '<a class="kx-dr" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + left +
          '<span class="kx-dr-a">' + ICON_DL + 'Download</span></a>';
      } else {
        h += '<div class="kx-dr is-off" aria-disabled="true">' + left + '<span class="kx-dr-a">Soon</span></div>';
      }
    });
    return h + '</div></div>';
  }

  function openPack(id) {
    var p = packs.filter(function (x) { return x.id === id; })[0];
    if (!p || p.locked || !hasLinks(p)) return;

    modalBody.innerHTML =
      '<div class="kx-m-art">' + art(p.cover, p.coverPos) + '</div>' +
      '<div class="kx-m-txt"><h3>' + esc(p.name) + '</h3>' +
      '<p class="kx-m-sub">' + esc(p.character) + '</p>' +
      '<div class="kx-chips"><span style="display:inline-flex;align-items:center;gap:10px">' + RES.join(DIVIDER) + '</span><span>' + esc(p.fps) + '</span></div>' +
      '<p class="kx-m-note">' + esc(p.instructions) + '</p>' +
      '<div class="kx-btns">' +
      '<a class="kx-btn" href="' + esc(p.instagram) + '" target="_blank" rel="noopener noreferrer">Instagram</a>' +
      '<button type="button" class="kx-btn kx-main" data-dl aria-expanded="false" aria-controls="kxDl">Download<span class="kx-arr"></span></button>' +
      '</div>' + dlPanel(p) + '</div>';
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
    var dl = e.target.closest('[data-dl]');
    if (dl) {
      var panel = document.getElementById('kxDl');
      if (panel) {
        var open = panel.classList.toggle('open');
        dl.setAttribute('aria-expanded', open ? 'true' : 'false');
        dl.classList.toggle('is-open', open);
      }
      return;
    }
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
