(function () {
  "use strict";

  /* ---- Burayı kendine göre değiştir ---- */
  var IG = "https://www.instagram.com/kraiiilefx/";
  var TT = "https://www.tiktok.com/@kraiiilefx?lang=tr-TR";
  var SONG_SRC = "assets/music/song.mp3";   // şarkı dosyanın yolu
  var SONG_TITLE = "Şarkı adı";              // pencerede görünecek isim
  /* -------------------------------------- */

  var css =
    ".sx-overlay{position:fixed;inset:0;z-index:1000;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.72)}" +
    ".sx-overlay.open{display:flex}" +
    ".sx-box{width:min(420px,100%);background:#0b0b0b;border:1px solid rgba(255,255,255,.16);border-radius:16px;overflow:hidden;color:#fff}" +
    ".sx-head{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.16);font-weight:600}" +
    ".sx-x{background:none;border:0;color:inherit;font-size:24px;line-height:1;cursor:pointer;padding:0 4px}" +
    ".sx-icons{display:flex;justify-content:center;gap:36px;padding:36px 18px}" +
    ".sx-icon{width:76px;height:76px;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;transition:background .2s,color .2s}" +
    ".sx-icon:hover{background:#fff;color:#000}" +
    ".sx-icon svg{width:34px;height:34px}" +
    ".sx-player{display:flex;align-items:center;gap:12px;padding:14px 18px;border-top:1px solid rgba(255,255,255,.16)}" +
    ".sx-play{width:38px;height:38px;border-radius:50%;border:0;background:#fff;color:#000;cursor:pointer;display:flex;align-items:center;justify-content:center;flex:none}" +
    ".sx-play svg{width:16px;height:16px}" +
    ".sx-meta{flex:1;min-width:0}" +
    ".sx-title{font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".sx-bar{height:3px;background:rgba(255,255,255,.2);border-radius:2px;margin-top:8px;overflow:hidden}" +
    ".sx-fill{height:100%;width:0;background:#fff}" +
    ".sx-x:focus-visible,.sx-icon:focus-visible,.sx-play:focus-visible{outline:2px solid #fff;outline-offset:3px}";

  var ICON_IG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';
  var ICON_TT =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>';
  var PLAY = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3 1.5v13l11-6.5z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M3 1.5h3.5v13H3zM9.5 1.5H13v13H9.5z"/></svg>';

  function build() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var overlay = document.createElement("div");
    overlay.className = "sx-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "kraiiilefx socials");
    overlay.innerHTML =
      '<div class="sx-box">' +
        '<div class="sx-head"><span>kraiiilefx socials</span><button class="sx-x" type="button" aria-label="Kapat">&times;</button></div>' +
        '<div class="sx-icons">' +
          '<a class="sx-icon" href="' + IG + '" target="_blank" rel="noopener noreferrer" aria-label="Instagram">' + ICON_IG + '</a>' +
          '<a class="sx-icon" href="' + TT + '" target="_blank" rel="noopener noreferrer" aria-label="TikTok">' + ICON_TT + '</a>' +
        '</div>' +
        '<div class="sx-player">' +
          '<button class="sx-play" type="button" aria-label="Çal">' + PLAY + '</button>' +
          '<div class="sx-meta"><div class="sx-title"></div><div class="sx-bar"><div class="sx-fill"></div></div></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    var audio = new Audio();
    audio.preload = "none";
    audio.src = SONG_SRC;
    var playBtn = overlay.querySelector(".sx-play");
    var fill = overlay.querySelector(".sx-fill");
    var player = overlay.querySelector(".sx-player");
    overlay.querySelector(".sx-title").textContent = SONG_TITLE;

    function setIcon(playing) {
      playBtn.innerHTML = playing ? PAUSE : PLAY;
      playBtn.setAttribute("aria-label", playing ? "Duraklat" : "Çal");
    }
    playBtn.addEventListener("click", function () {
      if (audio.paused) { audio.play().catch(function () { player.style.display = "none"; }); }
      else { audio.pause(); }
    });
    audio.addEventListener("play", function () { setIcon(true); });
    audio.addEventListener("pause", function () { setIcon(false); });
    audio.addEventListener("ended", function () { fill.style.width = "0"; setIcon(false); });
    audio.addEventListener("timeupdate", function () {
      if (audio.duration) fill.style.width = (audio.currentTime / audio.duration * 100) + "%";
    });
    audio.addEventListener("error", function () { player.style.display = "none"; });

    function open() { overlay.classList.add("open"); overlay.querySelector(".sx-x").focus(); }
    function close() { overlay.classList.remove("open"); audio.pause(); }

    overlay.querySelector(".sx-x").addEventListener("click", close);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    // Menüdeki "Socials" linkine basınca pencereyi aç
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest('a[href$="#socials"]');
      if (!a) return;
      e.preventDefault();
      open();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
