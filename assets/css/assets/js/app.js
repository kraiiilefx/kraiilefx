(function(){
"use strict";
var DATA_URL="data/scenepacks.json";
var DEFAULT_IG="https://www.instagram.com/kraiiilefx/";
var DETAIL_PAGE="kraiiilefxscenepack.html";

function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e}
function pick(o,keys){for(var i=0;i<keys.length;i++){var v=o[keys[i]];if(v!=null&&String(v).trim()!=="")return String(v).trim()}return""}
function safeUrl(u){try{var x=new URL(u,location.href);return(x.protocol==="https:"||x.protocol==="http:")?x.href:""}catch(e){return""}}
function absUrlMega(u){var s=String(u||"").trim();return/^https?:\/\//i.test(s)?safeUrl(s):""}

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
