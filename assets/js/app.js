(function(){
"use strict";
var DATA_URL="data/scenepacks.json";
var DEFAULT_IG="https://www.instagram.com/kraiiilefx/";
var DETAIL_PAGE="kraiiilefxscenepack.html";
var LOCK_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/><circle cx="12" cy="16" r="1" fill="currentColor" stroke="none"/></svg>';

/* kilit stilleri JS içinde: custom.css önbellekte kalsa bile çalışır */
(function(){
  var st=document.createElement("style");
  st.textContent=
    '.card.is-locked-pack img.cover{filter:grayscale(1) brightness(.75);transition:filter .5s ease,transform 1.2s cubic-bezier(.2,.7,.2,1)}'+
    '.card.is-locked-pack:hover img.cover{filter:grayscale(0) brightness(1)}'+
    '.card .lockbadge{position:absolute;z-index:5;top:50%;left:50%;width:40px;height:40px;margin:-20px 0 0 -20px;color:#fff;opacity:1;pointer-events:none;filter:drop-shadow(0 2px 6px rgba(0,0,0,.8))}'+
    '.card .lockbadge svg{width:100%;height:100%;display:block}'+
    '.btn.is-locked{position:relative;cursor:not-allowed}'+
    '.btn.is-locked::before{display:none!important;content:none!important}'+
    '.btn.is-locked .lbl{opacity:.3}'+
    '.btn.is-locked .btnlock{position:absolute;top:0;right:0;bottom:0;left:0;display:flex;align-items:center;justify-content:center;color:currentColor;opacity:1;pointer-events:none}'+
    '.btn.is-locked .btnlock svg{width:22px;height:22px;display:block}';
  document.head.appendChild(st);
})();

function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function pick(o,keys){for(var i=0;i<keys.length;i++){var v=o[keys[i]];if(v!=null&&String(v).trim()!=="")return String(v).trim()}return""}
function safeUrl(u){try{var x=new URL(u,location.href);return(x.protocol==="https:"||x.protocol==="http:")?x.href:""}catch(e){return""}}
function absUrlMega(u){var s=String(u||"").trim();return/^https?:\/\//i.test(s)?safeUrl(s):""}
function lockIcon(cls){var s=el("span",cls);s.setAttribute("aria-hidden","true");s.innerHTML=LOCK_SVG;return s}

function normalize(raw){
  var list=Array.isArray(raw)?raw:(raw&&(raw.scenepacks||raw.packs||raw.items||raw.data))||[];
  if(!Array.isArray(list)&&raw&&typeof raw==="object"){list=Object.keys(raw).map(function(k){var o=raw[k];if(o&&typeof o==="object"&&!o.id)o.id=k;return o})}
  var out=[];
  list.forEach(function(o,i){
    if(!o||typeof o!=="object")return;
    var id=pick(o,["id","ID","slug"]);
    if(!id)return;
    out.push({
      id:id,
      title:pick(o,["production","film","movie","yapim","title","name","isim"])||id,
      character:pick(o,["character","karakter","char"]),
      resolution:pick(o,["resolution","cozunurluk","çözünürlük","quality"]),
      fps:pick(o,["fps","FPS","framerate"]),
      cover:pick(o,["cover","image","kapak","thumbnail","thumb"]),
      coverPos:pick(o,["coverPos","coverPosition"]),
      folder:pick(o,["folder","klasor","klasör","actor","oyuncu"]),
      folderCover:pick(o,["folderCover","folder_cover","klasorKapak"]),
      instagram:safeUrl(pick(o,["instagram","ig","instagramUrl"]))||DEFAULT_IG,
      mega:absUrlMega(pick(o,["mega","download","downloadUrl","link","url"])),
      locked:o.locked===true||String(o.locked).toLowerCase()==="true",
      date:pick(o,["date","tarih","added"]),
      order:i
    });
  });
  return out;
}

function load(){
  return fetch(DATA_URL+"?v="+Date.now(),{cache:"no-store"}).then(function(r){
    if(!r.ok)throw new Error("HTTP "+r.status);
    return r.text();
  }).then(function(t){
    var j;try{j=JSON.parse(t)}catch(e){throw new Error("JSON okunamadı")}
    return normalize(j);
  });
}

function detailHref(p){
  return DETAIL_PAGE+"?id="+encodeURIComponent(p.id);
}

function placeholder(p){
  var ph=el("div","ph",(p.title||p.id).trim().charAt(0).toUpperCase());
  ph.setAttribute("aria-hidden","true");
  return ph;
}
function coverNode(p,alt){
  var wrap=document.createDocumentFragment();
  var src=p.cover&&safeUrl(p.cover);
  if(!src){wrap.appendChild(placeholder(p));return wrap}
  var img=el("img","cover");img.alt=alt||"";img.loading="lazy";img.decoding="async";
  if(p.coverPos)img.style.objectPosition=p.coverPos;
  img.addEventListener("error",function(){if(img.parentNode)img.parentNode.replaceChild(placeholder(p),img)});
  img.src=src;
  wrap.appendChild(img);return wrap;
}

function card(p){
  var a=el("a","card");a.href=detailHref(p);a.setAttribute("aria-label",p.title+(p.character?" - "+p.character:""));
  if(p.locked)a.classList.add("is-locked-pack");
  a.appendChild(coverNode(p,""));
  if(p.locked)a.appendChild(lockIcon("lockbadge"));
  var info=el("div","info");
  info.appendChild(el("div","t",p.title));
  if(p.character)info.appendChild(el("div","c",p.character));
  a.appendChild(info);return a;
}

/* ---- klasörler ---- */
function fslug(s){
  return String(s).toLowerCase().replace(/ı/g,"i").replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ö/g,"o").replace(/ç/g,"c")
    .replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}
function norm(s){return fslug(s).replace(/-/g,"")}
function folderOf(p){return p.folder||"Other"}
function groupFolders(list){
  var map={},out=[];
  list.forEach(function(p){
    var n=folderOf(p),k=fslug(n)||"other";
    if(!map[k]){map[k]={name:n,slug:k,packs:[],cover:""};out.push(map[k])}
    var f=map[k];f.packs.push(p);
    if(!f.cover&&p.folderCover)f.cover=p.folderCover;
  });
  out.forEach(function(f){
    if(f.cover)return;
    for(var i=0;i<f.packs.length;i++){if(f.packs[i].cover){f.cover=f.packs[i].cover;break}}
  });
  return out;
}
function folderCard(f){
  var a=el("a","card");a.href="scenepacks.html?f="+encodeURIComponent(f.slug);
  a.setAttribute("aria-label",f.name+" scenepacks");
  a.appendChild(coverNode({title:f.name,id:f.name,cover:f.cover},""));
  var info=el("div","info");
  info.appendChild(el("div","t",f.name+" Scenepacks"));
  info.appendChild(el("div","c",f.packs.length+(f.packs.length===1?" scenepack":" scenepacks")));
  a.appendChild(info);return a;
}

function state(msg,retry){
  var s=el("div","state");s.setAttribute("role","alert");
  s.appendChild(el("p",null,msg));
  if(retry){var b=el("button","btn ghost","TRY AGAIN");b.type="button";b.addEventListener("click",retry);s.appendChild(b)}
  return s;
}
function skeleton(host,n){host.textContent="";for(var i=0;i<n;i++)host.appendChild(el("div","skel"))}
function sortLatest(list){
  return list.slice().sort(function(a,b){
    var da=Date.parse(a.date),db=Date.parse(b.date);
    if(!isNaN(da)&&!isNaN(db)&&da!==db)return db-da;
    if(!isNaN(da)!==!isNaN(db))return isNaN(da)?1:-1;
    return b.order-a.order;
  });
}

function stagger(host){
  Array.prototype.forEach.call(host.children,function(c,i){c.style.setProperty("--i",Math.min(i,12))});
}

function spotlight(host){
  if(host._spot)return;
  host._spot=1;
  host.addEventListener("pointermove",function(e){
    var c=e.target.closest?e.target.closest(".card"):null;
    if(!c)return;
    var r=c.getBoundingClientRect();
    c.style.setProperty("--mx",(e.clientX-r.left)+"px");
    c.style.setProperty("--my",(e.clientY-r.top)+"px");
  });
}

function renderGrid(host,limit){
  skeleton(host,limit||8);
  load().then(function(all){
    host.textContent="";
    var list=limit?sortLatest(all).slice(0,limit):all;
    if(!list.length){host.appendChild(state("No scenepacks yet."));host.classList.remove("grid");return}
    var q=document.getElementById("search");
    var hasFolders=!limit&&list.some(function(p){return p.folder});
    var fkey=new URLSearchParams(location.search).get("f")||"";

    if(hasFolders&&fkey){
      var cur=null;
      groupFolders(list).forEach(function(f){if(f.slug===fkey)cur=f});
      if(cur){
        var h2=document.querySelector(".sec-head h2");
        if(h2)h2.textContent=cur.name+" Scenepacks";
        document.title=cur.name+" Scenepacks | KRAIIILEFX";
      }
      var back=el("a","btn ghost","ALL SCENEPACKS");back.href="scenepacks.html";back.style.marginBottom="24px";
      var sb=document.querySelector(".searchbox")||host;
      sb.parentNode.insertBefore(back,sb);
    }

    function draw(){
      var term=q?q.value.trim().toLowerCase():"";
      var nt=norm(term);
      var groups=hasFolders?groupFolders(list):[];
      var nodes=[];

      if(nt){
        if(hasFolders&&!fkey){
          groups.forEach(function(f){
            if(norm(f.name).indexOf(nt)!==-1)nodes.push(folderCard(f));
          });
        }
        list.forEach(function(p){
          if(fkey&&fslug(folderOf(p))!==fkey)return;
          if(norm(p.title+" "+p.character+" "+p.id).indexOf(nt)!==-1)nodes.push(card(p));
        });
      }else if(hasFolders&&!fkey){
        groups.forEach(function(f){nodes.push(folderCard(f))});
      }else{
        var src=list;
        if(hasFolders&&fkey){
          src=null;
          groups.forEach(function(f){if(f.slug===fkey)src=f.packs});
          if(!src){nodes.push(el("p","empty","This folder does not exist."));src=[]}
        }
        src.forEach(function(p){nodes.push(card(p))});
      }

      host.textContent="";
      if(nt&&!nodes.length)nodes.push(el("p","empty","No scenepacks found."));
      nodes.forEach(function(n){host.appendChild(n)});
      stagger(host);
    }

    spotlight(host);
    if(q)q.oninput=draw;
    draw();
  }).catch(function(){
    host.classList.remove("grid");host.textContent="";
    host.appendChild(state("Scenepacks could not be loaded. Check your connection and try again.",function(){host.classList.add("grid");renderGrid(host,limit)}));
  });
}

function lockedBtn(btn,label){
  btn.classList.add("is-locked");
  btn.setAttribute("aria-disabled","true");
  btn.removeAttribute("href");
  btn.removeAttribute("target");
  btn.textContent="";
  btn.appendChild(el("span","lbl",label));
  btn.appendChild(lockIcon("btnlock"));
}

function renderDetail(host){
  var id=new URLSearchParams(location.search).get("id")||"";
  host.textContent="";host.appendChild(el("p","kicker","Loading..."));
  load().then(function(all){
    var p=all.filter(function(x){return x.id===id})[0]||all.filter(function(x){return x.id.toLowerCase()===id.toLowerCase()})[0];
    host.textContent="";
    if(!p){
      host.appendChild(state(id?"This scenepack does not exist.":"No scenepack selected."));
      var back=el("a","btn","ALL SCENEPACKS");back.href="scenepacks.html";host.appendChild(back);return;
    }
    document.title=p.title+(p.character?" - "+p.character:"")+" | KRAIIILEFX";
    var box=el("div","detail");
    var art=el("div","art");art.appendChild(coverNode(p,p.title));box.appendChild(art);
    var side=el("div");
    side.appendChild(el("p","kicker","Scenepack"));
    side.appendChild(el("h1",null,p.title));
    var facts=el("dl","facts");
    [["Movie / Series",p.title],["Character",p.character],["Resolution",p.resolution],["Frame rate",p.fps]].forEach(function(f){
      if(!f[1])return;
      var row=el("div");
      row.appendChild(el("dt",null,f[0]));
      row.appendChild(el("dd",null,f[1]));
      facts.appendChild(row);
    });
    side.appendChild(facts);
    var note=el("div","note");
    note.appendChild(el("strong",null,"Before downloading"));
    note.appendChild(el("p",null,"To get the download password, follow @kraiiilefx on Instagram and message the password request there."));
    side.appendChild(note);
    var act=el("div","actions");
    var dlBtn=el("a","btn","DOWNLOAD SCENEPACK");
    var igBtn=el("a","btn ghost","GET PASSWORD ON INSTAGRAM");
    if(p.locked){
      lockedBtn(dlBtn,"DOWNLOAD SCENEPACK");
      lockedBtn(igBtn,"GET PASSWORD ON INSTAGRAM");
    }else{
      if(p.mega){dlBtn.href=p.mega;dlBtn.target="_blank";dlBtn.rel="noopener noreferrer"}else{dlBtn.setAttribute("aria-disabled","true")}
      igBtn.href=p.instagram;igBtn.target="_blank";igBtn.rel="noopener noreferrer";
    }
    act.appendChild(dlBtn);act.appendChild(igBtn);side.appendChild(act);
    box.appendChild(side);host.appendChild(box);
  }).catch(function(){
    host.textContent="";
    host.appendChild(state("This scenepack could not be loaded. Check your connection and try again.",function(){renderDetail(host)}));
  });
}

window.addEventListener("error",function(){
  var m=document.querySelector("main");
  if(m&&!m.children.length&&!m.textContent.trim())m.appendChild(state("Something went wrong. Reload the page."));
});

document.addEventListener("DOMContentLoaded",function(){
  var grid=document.getElementById("grid");if(grid)renderGrid(grid,0);
  var latest=document.getElementById("latest");if(latest)renderGrid(latest,4);
  var detail=document.getElementById("detail");if(detail)renderDetail(detail);
  var yr=document.getElementById("year");if(yr)yr.textContent=new Date().getFullYear();
});
})();
