const $=s=>document.querySelector(s);
const fold=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f\u0E48-\u0E4C]/g,'');
let db,links=[],cats=[],filter='All',editId=null;
const NONE='Uncategorized';
const req=r=>new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const st=(n,m='readonly')=>db.transaction(n,m).objectStore(n);
function open(){return new Promise((ok,no)=>{const r=indexedDB.open('nnn-reward',3);
 r.onupgradeneeded=()=>{const d=r.result;for(const[n,o]of[['links',{keyPath:'id',autoIncrement:true}],['cats',{keyPath:'name'}],['history',{keyPath:'id',autoIncrement:true}],['lists',{keyPath:'id',autoIncrement:true}]])if(!d.objectStoreNames.contains(n))d.createObjectStore(n,o)};
 r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function load(){{const all=await req(st('links').getAll()),lim=Date.now()-30*864e5;for(const x of all)if(x.del&&x.del<lim)await req(st('links','readwrite').delete(x.id));links=all.filter(l=>!l.del);trash=all.filter(l=>l.del&&l.del>=lim)}hist=await req(st('history').getAll());cats=(await req(st('cats').getAll())).map(c=>c.name).sort();render()}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(t,undo){const e=$('#toast');$('#tt').textContent=t;$('#undo').hidden=!undo;$('#undo').onclick=()=>{undo();e.classList.remove('show')};e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),undo?5000:1400)}
const ic=(d,f)=>`<svg viewBox="0 0 24 24" width="17" height="17" fill="${f?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const P={share:'<path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>',play:'<path d="M7 4l13 8-13 8z"/>',open:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',q:'<path d="M4 6h12M4 12h12M4 18h8M18 15v6M15 18h6"/>',lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',del:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'};
function host(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch{return u}}
function imgSrc(l){if(l.image)return l.image;if(/\.(png|apng|jpe?g|jfif|gif|webp|avif|bmp|ico|svg)(\?|#|$)/i.test(l.url))return l.url;return 'https://image.thum.io/get/width/600/crop/400/'+l.url}
const cc=n=>`hsl(${hue(n)} 85% 58%)`;
function hue(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))%360;return h}
const DAYS=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];let sig='';
const nowMs=()=>Date.now();
const dayName=()=>DAYS[new Date().getDay()];
let calM=new Date(new Date().getFullYear(),new Date().getMonth(),1);
function calRender(){const now=new Date(),y=calM.getFullYear(),m=calM.getMonth(),off=(new Date(y,m,1).getDay()+6)%7,dim=new Date(y,m+1,0).getDate();
 $('#calt').textContent=calM.toLocaleDateString(undefined,{month:'long',year:'numeric'});
 $('#cals').textContent=now.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
 let h=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<b>${d}</b>`).join('');
 for(let i=0;i<off;i++)h+='<i></i>';
 for(let d=1;d<=dim;d++){const t=y===now.getFullYear()&&m===now.getMonth()&&d===now.getDate(),rw=m===11&&d===1;h+=`<span class="${t?'today':''} ${rw?'rw':''}">${d}</span>`}
 $('#calg').innerHTML=h}
const isVid=u=>/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u||'');
function media(l){const v=l.video||(isVid(l.url)?l.url:'');
 if(v&&!l.image)return `<video src="${esc(v)}#t=0.1" muted playsinline draggable="false" preload="metadata" onerror="this.remove()"></video>`;
 return `<img src="${esc(imgSrc(l))}" alt="" draggable="false" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`}
function card(l,g){
 const c=g?((l.id in dupOf?'Duplicate':'Original')+(why[l.id]?' · '+why[l.id]:'')+(l.created?' · '+new Date(l.created).toLocaleDateString(undefined,{day:'numeric',month:'short'}):'')):(l.category||NONE),n=l.name||host(l.url);
 return `<article class="card ${l.watched?'wd':''} ${SEL.has(l.id)?'sel':''}" data-id="${l.id}">${selMode?'<span class="cb">✓</span>':''}
 <a class="thumb" href="${esc(l.url)}" target="_blank" rel="noopener" style="background:linear-gradient(135deg,hsl(${hue(host(l.url))} 55% 42%),hsl(${(hue(host(l.url))+50)%360} 60% 28%))" title="${esc(n)}">
  <span class="ph">${esc(n[0].toUpperCase())}</span>${media(l)}</a>
 <div class="tools"><button class="icon pin ${l.pinned?'on':''}" data-a="pin" aria-label="${l.pinned?'Unpin':'Pin'}">${ic(P.star,l.pinned)}</button>
 <button class="icon" data-a="edit" aria-label="Edit">${ic(P.edit)}</button>
 <button class="icon del" data-a="del" aria-label="Delete">${ic(P.del)}</button></div>
 <div class="info"><h3 title="${esc(n)}">${esc(n)}</h3><small>${esc(host(l.url))}${l.watched?' · Watched':''}${l.dead?' · <b class="deadt">Dead?</b>':''}</small>${l.notes?`<small class="nt">${esc(l.notes)}</small>`:''}
 <div class="meta"><span class="mb"><button class="btn" data-a="open">${ic(P.open)}<span>Open</span></button><button class="btn" data-a="copy">${ic(P.copy)}<span>Copy</span></button><button class="btn" data-a="share" aria-label="Share">${ic(P.share)}</button></span><div class="row2"><span class="cat ${g?(l.id in dupOf?'dupe':'orig'):''}" ${g?'':'data-a="cat" title="Change category"'} ${g||!l.category?'':`style="--cc:${cc(l.category)}"`}>${esc(c)}</span><div class="stars">${[1,2,3,4,5].map(i=>`<button class="st ${(l.rating||0)>=i?'on':''}" data-a="rate" data-star="${i}" aria-label="${i} star">★</button>`).join('')}</div></div></div></div></article>`}
let page=1,dupOf={},why={},hist=[],trash=[],selMode=false,VIS=[],GRP=[],cpIds=[],catManual=false;const PER=12,DUP='__dup';
const nkey=u=>{try{const x=new URL(u.trim()),h=x.hostname.replace(/^www\./,'').toLowerCase(),yt=u.match(/(?:[?&]v=|youtu\.be\/|shorts\/|embed\/|live\/)([\w-]{11})/);
 if(/youtube\.com|youtu\.be/.test(h)&&yt)return'yt:'+yt[1];
 const p=[...x.searchParams].filter(([k])=>!/^(utm_|fbclid|gclid|ref$|si$)/i.test(k)).sort();
 return h+x.pathname.replace(/\/+$/,'')+(p.length?'?'+new URLSearchParams(p):'')}catch{return u.trim().toLowerCase()}};
function analyze(){dupOf={};why={};const S=[...links].sort((a,b)=>a.id-b.id),par={},seen={},byId={};
 const f=x=>par[x]===x?x:(par[x]=f(par[x])),nk=l=>{const n=(l.name||'').trim().toLowerCase();return['u:'+nkey(l.url),...(n&&n!==host(l.url).toLowerCase()?['n:'+n]:[])]};
 S.forEach(l=>{par[l.id]=l.id;byId[l.id]=l});
 S.forEach(l=>nk(l).forEach(k=>{if(seen[k]==null)seen[k]=l.id;else{const a=f(l.id),b=f(seen[k]),r=Math.min(a,b);par[a]=r;par[b]=r}}));
 const cnt={};S.forEach(l=>nk(l).forEach(k=>{const c=f(l.id)+'|'+k;cnt[c]=(cnt[c]||0)+1}));
 S.forEach(l=>{const r=f(l.id);if(r===l.id)return;dupOf[l.id]=byId[r];const u=cnt[r+'|u:'+nkey(l.url)]>1,n=nk(l)[1]&&cnt[r+'|'+nk(l)[1]]>1;why[l.id]=u&&n?'same link and name':u?'same link':'same name'})}
function pager(p,t){if(t<2)return'';const s=new Set([1,t,p-1,p,p+1]);if(p<=3)[2,3,4].forEach(x=>s.add(x));if(p>=t-2)[t-1,t-2,t-3].forEach(x=>s.add(x));
 const n=[...s].filter(x=>x>=1&&x<=t).sort((a,b)=>a-b);let h=`<button data-p="${p-1}" ${p<2?'disabled':''} aria-label="Previous page">‹</button>`,last=0;
 for(const x of n){if(x-last>1)h+='<span>…</span>';h+=`<button data-p="${x}" class="${x===p?'on':''}">${x}</button>`;last=x}
 return h+`<button data-p="${p+1}" ${p>=t?'disabled':''} aria-label="Next page">›</button>`}
function renderCP(){const v=$('#fc').value.trim();$('#cp').innerHTML=cats.map(c=>`<button type="button" class="chip ${v===c?'on':''}" data-pick="${esc(c)}">${esc(c)}</button>`).join('')}
function render(){
 analyze();
 const q=fold($('#q').value.trim()),SORT={new:(a,b)=>b.id-a.id,old:(a,b)=>a.id-b.id,az:(a,b)=>(a.name||'').localeCompare(b.name||''),open:(a,b)=>(b.lastOpen||0)-(a.lastOpen||0),most:(a,b)=>(b.opens||0)-(a.opens||0),rate:(a,b)=>(b.rating||0)-(a.rating||0)},QF={all:()=>true,unw:l=>!l.watched,wat:l=>l.watched,nev:l=>!l.opens,pin:l=>l.pinned,r4:l=>(l.rating||0)>=4,wk:l=>l.created>Date.now()-7*864e5,dead:l=>l.dead};
 const isD=l=>l.id in dupOf,normal=links.filter(l=>!isD(l)),dups=links.filter(isD);
 if(filter===DUP&&!dups.length)filter='All';
 const match=l=>{if(!q)return true;const h=fold([l.name,l.url,l.category,l.notes].join(' '));return q.split(/\s+/).every(t=>h.includes(t))};
 const groups=Object.values(dups.reduce((m,l)=>{const o=dupOf[l.id];(m[o.id]=m[o.id]||[o]).push(l);return m},{})).map(g=>g.sort((a,b)=>a.id-b.id));
 const items=filter===DUP?groups.filter(g=>g.some(match)).sort((a,b)=>nkey(a[0].url).localeCompare(nkey(b[0].url))):normal.filter(l=>(filter==='All'||(l.category||NONE)===filter)&&match(l)&&QF[$('#qf').value](l)).sort(SORT[$('#sort').value]);
 const per=filter===DUP?4:PER,total=Math.max(1,Math.ceil(items.length/per));if(page>total)page=total;
 VIS=filter===DUP?[]:items;GRP=groups;const slice=items.slice((page-1)*per,page*per);
 const bar=filter===DUP?`<div class="dupbar"><span>${groups.length} link${groups.length>1?'s are':' is'} saved more than once (same link or same name). The first copy stays in your normal list.</span><span class="mb"><button class="btn gold" id="mgall">Merge all</button><button class="btn" id="rmdup">Move all to Trash</button></span></div>`:'';
 const grp=gs=>gs.map(g=>`<section class="dgroup"><div class="dhead"><h3>${esc(g[0].name||host(g[0].url))}</h3><small>${g.length} saved · ${g.some(l=>/link/.test(why[l.id]||''))&&g.some(l=>/name/.test(why[l.id]||''))?'same link and name':g.some(l=>/link/.test(why[l.id]||''))?'same link':'same name'}</small><button class="btn" data-mg="${g[0].id}">Merge</button></div><div class="dcards">${g.map(l=>card(l,1)).join('')}</div></section>`).join('');
 const content=filter===DUP?grp(slice):slice.map(l=>card(l)).join('');
 $('#grid').classList.toggle('dmode',filter===DUP);
 $('#grid').innerHTML=bar+(content||`<div class="empty"><b>${q?'Nothing matches your search':'No links here yet'}</b>${q?'Try another word.':'Press Add link to save your first one.'}</div>`);
 $('#pager').innerHTML=pager(page,total);
 const count=c=>normal.filter(l=>(l.category||NONE)===c).length;
 const all=[...cats];if(normal.some(l=>!l.category))all.push(NONE);
 $('#chips').innerHTML=[`<button class="chip ${filter==='All'?'on':''}" data-c="All">All (${normal.length})</button>`,
  ...all.map(c=>`<button class="chip ${filter===c?'on':''}" data-c="${esc(c)}" style="--cc:${cc(c)}">${esc(c)} (${count(c)})${cats.includes(c)?`<i data-r="${esc(c)}" title="Rename category">✎</i><i data-x="${esc(c)}" title="Delete category">×</i>`:''}</button>`),
  dups.length?`<button class="chip dupchip ${filter===DUP?'on':''}" data-c="${DUP}">Duplicated (${dups.length})</button>`:'',
  `<button class="chip" id="nc">+ Category</button>`].join('');
 fillScopes();$('#cl').innerHTML=cats.map(c=>`<option value="${esc(c)}">`).join('');
 const pins=normal.filter(l=>l.pinned);
 $('#pins').innerHTML=pins.map(l=>card(l)).join('')||'<div class="empty"><b>No pinned links</b>Tap the star on a link to keep it here.</div>';
 drawSg();renderCats();selUpd();renderBackup();trashHtml();
 $('#hlist').innerHTML=histHtml();
 $('#stats').innerHTML=`<div>Links<b>${normal.length}</b></div><div>Categories<b>${cats.length}</b></div><div>Pinned<b>${pins.length}</b></div><div>Duplicates<b>${dups.length}</b></div>`}
async function addCat(n){n=n.trim();if(n&&n!==NONE&&!cats.includes(n))await req(st('cats','readwrite').put({name:n}))}
let upImg='',pickedImg='',candList=[],detected={},nameAuto=true,pending=Promise.resolve(),dtm;
async function getMeta(url,cb){const out={},up=()=>{try{cb&&cb({...out})}catch{}},
 yt=url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/),
 direct=isVid(url),isImg=/\.(png|apng|jpe?g|jfif|gif|webp|avif|bmp|ico|svg|m3u8)(\?|#|$)/i.test(url);
 if(yt){out.image='https://img.youtube.com/vi/'+yt[1]+'/hqdefault.jpg';out.images=['maxresdefault','hqdefault','mqdefault','sddefault','1','2','3'].map(n=>'https://img.youtube.com/vi/'+yt[1]+'/'+n+'.jpg');up()}
 const J=async u=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),4500);try{return await(await fetch(u,{signal:c.signal})).json()}finally{clearTimeout(t)}};
 await Promise.all([
  J('https://noembed.com/embed?url='+encodeURIComponent(url)).then(d=>{if(d.title&&!out.title)out.title=d.title;if(!out.image&&d.thumbnail_url)out.image=d.thumbnail_url;up()}).catch(()=>{}),
  J('https://api.microlink.io/?url='+encodeURIComponent(url)).then(d=>{d=d.data||{};out.title=out.title||d.title;out.image=out.image||d.image?.url;up()}).catch(()=>{}),
  direct||isImg?0:scrape(url).then(x=>{out.title=out.title||x.title;out.image=out.image||x.image;out.video=x.video;out.images=[...(out.images||[]),...(x.images||[])];out.videos=x.videos;out.embeds=x.embeds;up()}).catch(()=>{})]);
 if(direct)out.video=url;if(out.image)out.image=out.image.replace(/^http:/,'https:');if(out.video)out.video=out.video.replace(/^http:/,'https:');
 if(!out.image&&out.video){const f=await grabFrame(out.video);if(f)out.image=f}
 out.images=[...new Set([out.image,...(out.images||[])].filter(u=>u&&!u.startsWith('data:')).map(u=>u.replace(/^http:/,'https:')))].slice(0,14);
 return out}
function parseHtml(txt,url){
  try{
   const d=new DOMParser().parseFromString(txt,'text/html'),m=n=>d.querySelector(`meta[property="${n}"],meta[name="${n}"]`)?.content;
   const rel=x=>{try{return x&&!x.startsWith('data:')?new URL(x,url).href:''}catch{return''}};
   const im=d.querySelector('video[poster]')||d.querySelector('article img,.entry-content img,main img,img');
   const first=im&&(im.getAttribute('poster')||im.getAttribute('data-poster')||im.getAttribute('data-src')||im.getAttribute('data-lazy-src')||im.getAttribute('src'));
   const AD=/(^|[\W_])(ads?|adsby\w*|ad[_-]?(?:slot|unit|box|frame|wrap|container|space)\w*|adv|advert\w*|banner\w*|sponsor\w*|promo\w*|affiliate|popunder|tracking|pixel|beacon|logo|icon|sprite|avatar|emoji|badge|button|flag|social|share|widget|sidebar|footer|header|nav|menu|loading|placeholder|blank)([\W_]|$)/i;
   const NET=/doubleclick|googlesyndication|adservice|taboola|outbrain|adsterra|exoclick|juicyads|popads|propeller|mgid|revcontent|clickadu|trafficjunky|adnxs|criteo|amazon-adsystem|a-ads|bidgear/i;
   const host0=(()=>{try{return new URL(url).hostname.replace(/^www\./,'')}catch{return''}})();
   const scoreImg=x=>{const u=x.getAttribute('data-src')||x.getAttribute('data-lazy-src')||x.getAttribute('data-original')||x.getAttribute('src')||'';if(!u||u.startsWith('data:'))return-1;
    const abs=rel(u);if(!abs||NET.test(abs))return-1;
    let el=x;const meta=[];for(let i=0;i<5&&el;i++,el=el.parentElement)meta.push((typeof el.className==='string'?el.className:'')+' '+(el.id||''));
    if(AD.test(abs.split('/').pop())||AD.test(meta.join(' '))||AD.test(x.getAttribute('alt')||''))return-1;
    const a=x.closest('a');if(a){try{const h=new URL(a.getAttribute('href'),url).hostname.replace(/^www\./,'');if(h&&h!==host0&&!x.closest('video,article,[class*=player]'))return-1}catch{}}
    const w=+x.getAttribute('width')||0,h=+x.getAttribute('height')||0;if((w&&w<160)||(h&&h<90))return-1;if(w&&h&&(w/h>3||w/h<.35))return-1;
    let sc=10+Math.min(w,800)/40;if(x.closest('article,main,.entry-content,.post,[class*=video],[class*=player]'))sc+=30;if(/\.gif(\?|#|$)/i.test(abs))sc-=40;return sc};
   const scored=[...d.querySelectorAll('img')].map(x=>[scoreImg(x),rel(x.getAttribute('data-src')||x.getAttribute('data-lazy-src')||x.getAttribute('data-original')||x.getAttribute('src'))]).filter(([sc,u])=>sc>=0&&u).sort((a,b)=>b[0]-a[0]).map(x=>x[1]);
   let ld='';d.querySelectorAll('script[type="application/ld+json"]').forEach(x=>{try{const j=JSON.parse(x.textContent);for(const o of Array.isArray(j)?j:[j,...(j['@graph']||[])]){const t=o&&(o.thumbnailUrl||o.image);if(t&&!ld){const v=Array.isArray(t)?(t[0].url||t[0]):(t.url||t);if(typeof v==='string')ld=v}}}catch{}});
   const image=rel(m('og:image:secure_url')||m('og:image')||m('twitter:image')||m('twitter:image:src')||ld||d.querySelector('link[rel=image_src]')?.getAttribute('href')||d.querySelector('meta[itemprop=image]')?.content||scored[0]||(d.querySelector('video[poster]')?first:''));
   const title=(m('og:title')||d.title||'').trim();
   const vr=m('og:video:secure_url')||m('og:video:url')||m('og:video')||d.querySelector('video[src]')?.getAttribute('src')||d.querySelector('video source[src]')?.getAttribute('src')||(txt.match(/https?:\/\/[^"'\s<>\\]+?\.(?:mp4|webm|mov|m4v)(?:\?[^"'\s<>\\]*)?/i)||[])[0];
   const video=isVid(rel(vr))?rel(vr):'';
   const imgs=[...d.querySelectorAll('meta[property="og:image"],meta[property="og:image:secure_url"],meta[name="twitter:image"],meta[name="twitter:image:src"],meta[itemprop=image]')].map(x=>x.content);
   if(ld)imgs.push(ld);d.querySelectorAll('video[poster],video[data-poster]').forEach(x=>imgs.push(x.getAttribute('poster')||x.getAttribute('data-poster')));
   scored.forEach(u=>imgs.push(u));
   const images=[...new Set(imgs.map(rel).filter(u=>u&&!NET.test(u)))].slice(0,14);
   const norm=txt.replace(/\\\//g,'/').replace(/\\u002F/gi,'/').replace(/&amp;/g,'&'),rp=(norm.match(/["'(](\/[^"'\s<>()\\]+?\.(?:mp4|webm|m4v|m3u8)(?:\?[^"'\s<>()\\]*)?)/gi)||[]).map(x=>rel(x.slice(1))).filter(isMedia);
   const embeds=[...d.querySelectorAll('iframe[src],iframe[data-src]')].map(x=>rel(x.getAttribute('src')||x.getAttribute('data-src'))).filter(u=>/^https?:/.test(u)&&!NET.test(u)&&!AD.test(u.split('/').pop().split('?')[0])).slice(0,3);
   const vl=[vr,...[...d.querySelectorAll('video[src],source[src]')].map(x=>x.getAttribute('src')),...(txt.replace(/\\\//g,'/').match(/https?:\/\/[^"'\s<>\\]+?\.(?:mp4|webm|mov|m4v|m3u8)(?:\?[^"'\s<>\\]*)?/gi)||[])].map(rel).filter(isMedia);
   const vt=[...d.querySelectorAll('video,video source')].flatMap(x=>['src','data-src','data-video','data-url','data-file'].map(a=>x.getAttribute(a))).map(rel).filter(u=>u&&!u.startsWith('blob:')),videos=[...new Set([...vt,...vl,...rp])].slice(0,10);
   if(image||title||video||images.length||videos.length||embeds.length)return{image,title,video,images,videos,embeds}}catch{}
 return{}}
const HC=new Map();
function fetchHtml(url){if(HC.has(url))return HC.get(url);
 const one=async p=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),6500);try{const r=await fetch(p+encodeURIComponent(url),{signal:c.signal});if(!r.ok)throw 0;const x=await r.text();if(x.length<200)throw 0;return x}finally{clearTimeout(t)}};
 const pr=Promise.any(['https://api.allorigins.win/raw?url=','https://corsproxy.io/?url=','https://api.codetabs.com/v1/proxy?quest='].map(one)).catch(()=>'');
 HC.set(url,pr);pr.then(x=>{if(!x)HC.delete(url)});return pr}
async function scrape(url){const t=await fetchHtml(url);return t?parseHtml(t,url):{}}

function setPv(src,msg,vid){const p=$('#pv');p.hidden=!src&&!msg&&!vid;p.innerHTML=!src&&vid?`<video src="${esc(vid)}#t=0.1" muted playsinline preload="metadata"></video>`:src?`<img src="${esc(src)}" alt="" referrerpolicy="no-referrer" onerror="this.parentNode.hidden=true">`:`<span>${msg||''}</span>`}
$('#fu').addEventListener('input',()=>{clearTimeout(dtm);const u=$('#fu').value.trim();detected={};pickedImg='';
 if(!/^https?:\/\/\S+\.\S+/.test(u)){setPv(upImg);return}
 setPv(upImg,upImg?'':'Detecting title and picture...');
 dtm=setTimeout(()=>{pending=getMeta(u,m=>{if($('#fu').value.trim()!==u)return;if(!(upImg||pickedImg)&&(m.image||m.video))setPv(m.image,'',m.video);if(m.title&&(nameAuto||!$('#fn').value))$('#fn').value=m.title.slice(0,350);if(m.images&&m.images.length>1){candList=m.images;showCands(candList,m.image)}}).then(m=>{if($('#fu').value.trim()!==u)return;detected=m;candList=m.images||[];showCands(candList,m.image);setPv(upImg||pickedImg||m.image,upImg||pickedImg||m.image||m.video?'':'No picture found. A page screenshot will be tried instead.',upImg?'':m.video);if(m.title&&(nameAuto||!$('#fn').value))$('#fn').value=m.title.slice(0,350);chk()})},500)});
$('#fn').addEventListener('input',()=>nameAuto=false);
async function backfill(){if(!navigator.onLine)return;let ch=0;
 for(const l of links){if(l.image||l.video||l.tried==='v3'||/\.(png|apng|jpe?g|jfif|gif|webp|avif|bmp|ico|svg)(\?|#|$)/i.test(l.url))continue;
  const m=await getMeta(l.url);await req(st('links','readwrite').put({...l,image:m.image||'',cands:m.images||[],videos:m.videos||[],embeds:m.embeds||[],video:m.image?'':(m.video||''),name:(!l.name||l.name===host(l.url))&&m.title?m.title:l.name,tried:'v3'}));ch++}
 if(ch)load()}
function openForm(l){editId=l?l.id:null;detected={};pickedImg='';candList=l?.cands||[];upImg=/^data:/.test(l?.image||'')?l.image:'';$('#upx').hidden=!upImg;nameAuto=!l;setPv(l?.image||'','',l?.video);$('#dt').textContent=l?'Edit link':'Add link';
 $('#fn').value=l?.name||'';$('#fu').value=l?.url||'';$('#fc').value=l?.category||(filter!=='All'&&filter!==NONE&&filter!==DUP?filter:'')||(l?'':localStorage.getItem('nnn-lastcat')||'');$('#fi').value=l?.image||'';
$('#fw').checked=!!l?.watched;$('#fno').value=l?.notes||'';$('#fnc').textContent=($('#fn').value.length)+'/350';catManual=false;$('#many').hidden=!!l;showCands(candList,l?.image);
renderCP();$('#dupnote').hidden=true;$('#dlg').showModal();if(!l)navigator.clipboard?.readText().then(t=>{if(/^https?:\/\//i.test(t.trim())&&!$('#fu').value)$('#fu').value=t.trim()}).catch(()=>{});$('#fu').focus()}
$('#f').addEventListener('submit',async e=>{await pending;
 const cat=$('#fc').value.trim()||autoCat();await addCat(cat);try{localStorage.setItem('nnn-lastcat',cat)}catch{}
 const old=links.find(x=>x.id===editId)||{};
 const U=$('#fu').value.trim(),ci=$('#fi').value.trim(),same=old.url===U,img=upImg||pickedImg||(isVid(ci)?'':(ci||detected.image||(same&&!/^data:/.test(old.image||'')?old.image:'')||'')),vid=img?'':(isVid(ci)?ci:(detected.video||(same?old.video:'')||''));
 const rec={...old,name:($('#fn').value.trim()||detected.title||host(U)).slice(0,350),url:U,category:cat,image:img,video:vid,cands:detected.images||old.cands||[],videos:detected.videos||old.videos||[],embeds:detected.embeds||old.embeds||[],watched:$('#fw').checked,notes:$('#fno').value.trim(),tried:'v3'};
 if(!editId){delete rec.id;rec.created=nowMs()}
 const dupNew=links.some(x=>x.id!==editId&&sameAs(x,rec));await req(st('links','readwrite').put(rec));await load();toast(dupNew?'Saved. Moved to Duplicated':'Saved')});
$('#cancel').onclick=()=>$('#dlg').close();
$('#add').onclick=()=>openForm();
$('#q').oninput=()=>{page=1;render()};
document.addEventListener('click',async e=>{
 if(selMode){const c=e.target.closest('#grid .card');if(c){e.preventDefault();const id=+c.dataset.id;SEL.has(id)?SEL.delete(id):SEL.add(id);render();return}}
 const th=e.target.closest('a.thumb[href]');if(th){const tl=links.find(x=>x.id==th.closest('.card').dataset.id);if(tl)logH(tl,'open')}
 const hb=e.target.closest('[data-ho],[data-hd]');if(hb){const h=hist.find(x=>x.id==(hb.dataset.ho||hb.dataset.hd));if(!h)return;if(hb.dataset.hd){await req(st('history','readwrite').delete(h.id));return load()}const l=byId(h.lid);if(l){openUrl(l.url);logH(l,'open')}return}
 const sg=e.target.closest('[data-sg],[data-sx]');if(sg){const x=SG[+(sg.dataset.sg??sg.dataset.sx)];if(!x)return;if(sg.dataset.sg!==undefined)return applySg(x);try{localStorage.setItem('nnn-sgd',JSON.stringify([...dismissed(),x.key]))}catch{}return drawSg()}
 
 const pg=e.target.closest('[data-p]');if(pg){if(!pg.disabled){page=+pg.dataset.p;render();$('#chips').scrollIntoView({behavior:'smooth'})}return}
 const pk=e.target.closest('[data-pick]');if(pk){$('#fc').value=$('#fc').value.trim()===pk.dataset.pick?'':pk.dataset.pick;catManual=true;renderCP();return}
 if(e.target.id==='rmdup'){if(!confirm('Move all duplicated links to Trash? The first copy of each stays.'))return;const ds=Object.keys(dupOf).map(id=>byId(+id)).filter(Boolean);filter='All';return trashLinks(ds,'Duplicates moved to Trash')}
 if(e.target.id==='mgall')return mergeGroups(GRP);
 const mg=e.target.closest('[data-mg]');if(mg){const g=GRP.find(x=>x[0].id===+mg.dataset.mg);return g&&mergeGroups([g])}
 if(e.target.id==='bkx')return $('#exp').click();
 if(e.target.id==='bkl'){try{localStorage.setItem('nnn-snooze',Date.now()+864e5)}catch{}return renderBackup()}
 if(e.target.id==='rsb')return $('#imp').click();
 if(e.target.id==='rsx'){try{localStorage.setItem('nnn-had','0')}catch{}return renderBackup()}
 const tb=e.target.closest('[data-tr],[data-tx]');if(tb){const l=trash.find(x=>x.id==(tb.dataset.tr||tb.dataset.tx));if(!l)return;if(tb.dataset.tx){await req(st('links','readwrite').delete(l.id))}else{const{del,...r}=l;await put(r)}return load()}
 const r=e.target.closest('[data-r]');
 if(r){e.stopPropagation();const o=r.dataset.r,n=(prompt('Rename category',o)||'').trim();if(!n||n===o)return;await addCat(n);await req(st('cats','readwrite').delete(o));for(const l of links.filter(l=>l.category===o))await req(st('links','readwrite').put({...l,category:n}));if(filter===o)filter=n;return load()}
 const x=e.target.closest('[data-x]');
 if(x){e.stopPropagation();const c=x.dataset.x;if(!confirm(`Delete category "${c}"? Its links stay, but become Uncategorized.`))return;
  await req(st('cats','readwrite').delete(c));
  for(const l of links.filter(l=>l.category===c))await req(st('links','readwrite').put({...l,category:''}));
  if(filter===c)filter='All';return load()}
 const ch=e.target.closest('.chip');
 if(ch){if(ch.id==='nc'){const n=prompt('New category name');if(n){await addCat(n);await load()}}else{filter=ch.dataset.c;page=1;render()}return}
 const b=e.target.closest('[data-a]');if(!b)return;
 const l=links.find(x=>x.id==b.closest('.card').dataset.id),a=b.dataset.a;
 if(a==='share')return shareSet([l]);
 if(a==='cat')return openCpk(l);
 if(a==='open'){openUrl(l.url);return logH(l,'open')}
 if(a==='copy'){try{await navigator.clipboard.writeText(l.url)}catch{const t=document.createElement('textarea');t.value=l.url;document.body.append(t);t.select();document.execCommand('copy');t.remove()}logH(l,'copy');toast('Link copied');b.querySelector('span').textContent='Copied';setTimeout(()=>b.querySelector('span').textContent='Copy',1200)}
 if(a==='edit')openForm(l);
 if(a==='del')return trashLinks([l]);
 if(a==='rate'){const r=+b.dataset.star;await put({...l,rating:l.rating===r?0:r});return load()}
 if(a==='pin'){await req(st('links','readwrite').put({...l,pinned:!l.pinned}));load()}});
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
 document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===t));
 document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!==t.dataset.v)});
$('#exp').onclick=()=>{try{localStorage.setItem('nnn-lastexp',Date.now())}catch{}const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([JSON.stringify({cats,links},null,1)],{type:'application/json'}));
 a.download='nnn-reward-backup.json';a.click()};
$('#imp').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());
 for(const c of d.cats||[])await addCat(c);
 for(const l of d.links||[]){delete l.id;await req(st('links','readwrite').add(l))}
 await load();await load();toast('Imported')}catch{toast('Invalid backup file')}e.target.value=''};
function tick(){
 const now=new Date();let t=new Date(now.getFullYear(),11,1);if(now>t&&!(now.getMonth()===11&&now.getDate()===1))t=new Date(now.getFullYear()+1,11,1);
 if(now.getMonth()===11&&now.getDate()===1){$('#cdLabel').textContent='It is 1 December. Time to claim your reward.';$('#cd').innerHTML='';$('#pf').style.strokeDashoffset=0;$('#pp').textContent='100%';return}
 const d=Math.max(0,t-now),p=[[Math.floor(d/864e5),'days'],[Math.floor(d/36e5)%24,'hours'],[Math.floor(d/6e4)%60,'minutes'],[Math.floor(d/1e3)%60,'seconds']];
 {const s=new Date(t.getFullYear(),10,1),p=Math.max(0,Math.min(100,(now-s)/(t-s)*100));$('#pf').style.strokeDashoffset=314.16*(1-p/100);$('#pp').textContent=Math.floor(p)+'%'}$('#cdLabel').textContent=`${dayName()} · Until 1 December ${t.getFullYear()}`;
 $('#cd').innerHTML=p.map(([v,l])=>`<div><b>${String(v).padStart(2,'0')}</b><span>${l}</span></div>`).join('')}
tick();setInterval(tick,1000);
open().then(d=>{db=d;load().then(()=>{shareIn();goIn();hashIn();return backfill()})});
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

$('#theme').onclick=openTheme;
$('#sort').onchange=$('#qf').onchange=()=>{page=1;render()};
$('#view').onclick=()=>{$('#grid').classList.toggle('list');$('#view').textContent=$('#grid').classList.contains('list')?'☰':'▦'};
$('#fab').onclick=()=>openForm();
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{$('#fab').hidden=t.dataset.v!=='links';scrollTo(0,0)}));
$('#fab').hidden=true;
addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!$('#dlg').open){e.preventDefault();document.querySelector('[data-v=links]').click();$('#q').focus()}});
$('#fc').addEventListener('input',()=>{catManual=true;renderCP()});
const sameAs=(l,r)=>nkey(l.url)===nkey(r.url)||(!!r.name&&r.name.toLowerCase()===(l.name||'').trim().toLowerCase()&&r.name.toLowerCase()!==host(r.url).toLowerCase());
function chk(){const u=$('#fu').value.trim(),r={url:u,name:$('#fn').value.trim()},n=$('#dupnote'),m=u&&links.find(l=>l.id!==editId&&sameAs(l,r));n.hidden=!m;if(m)n.textContent=`Already saved as "${m.name||host(m.url)}" (${nkey(m.url)===nkey(u)?'same link':'same name'}). This one will go to Duplicated.`}
$('#fu').addEventListener('input',chk);$('#fn').addEventListener('input',chk);

$('#redo').onclick=()=>$('#fu').dispatchEvent(new Event('input'));

$('#clr').onclick=async()=>{if(!links.length&&!cats.length)return toast('Nothing to clear');
 if(!confirm('Delete ALL links and categories on this device?\n\nTip: press Cancel and use Export backup first.'))return;
 if((prompt('Type DELETE to confirm')||'').trim()!=='DELETE')return toast('Cancelled');
 const L=[...links],C=[...cats];try{localStorage.setItem('nnn-had','0')}catch{}
 await req(st('links','readwrite').clear());await req(st('cats','readwrite').clear());
 filter='All';page=1;await load();
 toast('All data cleared',async()=>{for(const c of C)await req(st('cats','readwrite').put({name:c}));for(const l of L)await req(st('links','readwrite').put(l));load()})};

$('#upb').onclick=()=>$('#upf').click();
async function useFile(f){try{if(/gif|webp/.test(f.type)&&f.size<2.5e6){upImg=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)});setPv(upImg);$('#upx').hidden=false;toast('Image added');return}const b=await createImageBitmap(f),k=Math.min(1,900/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=Math.round(b.width*k);c.height=Math.round(b.height*k);c.getContext('2d').drawImage(b,0,0,c.width,c.height);
  upImg=c.toDataURL(f.type==='image/png'?'image/png':'image/jpeg',.85);setPv(upImg);$('#upx').hidden=false;toast('Image added')}catch{toast('Could not read that image')}}
$('#upf').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)useFile(f)};
addEventListener('paste',e=>{if(!$('#dlg').open)return;const f=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith('image/'))?.getAsFile();if(f){e.preventDefault();useFile(f)}});
$('#upp').onclick=async()=>{try{for(const it of await navigator.clipboard.read()){const t=it.types.find(x=>x.startsWith('image/'));if(t)return useFile(new File([await it.getType(t)],'pasted',{type:t}))}toast('No image in clipboard')}catch{toast('Clipboard blocked. Try Ctrl+V instead')}};
$('#upx').onclick=()=>{upImg='';$('#upx').hidden=true;setPv(detected.image||'','',detected.video)};

$('#calprev').onclick=()=>{calM=new Date(calM.getFullYear(),calM.getMonth()-1,1);calRender()};
$('#calnext').onclick=()=>{calM=new Date(calM.getFullYear(),calM.getMonth()+1,1);calRender()};
document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-a=locked]'))e.preventDefault()});
setInterval(calRender,60000);calRender();



function histHtml(){if(!hist.length)return'<div class="empty"><b>No history yet</b>Opened and copied links show up here.</div>';
 const fmt=t=>{const d=new Date(t);return DAYS[d.getDay()].slice(0,3)+' '+d.getDate()+' '+d.toLocaleString('en',{month:'short'})+' · '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
 return [...hist].sort((a,b)=>b.t-a.t).slice(0,200).map(h=>`<div class="hrow"><span>${fmt(h.t)}</span><b>${esc(h.name)}</b><i>${h.act==='open'?'Opened':'Copied'}</i><div class="mb"><button class="btn" data-ho="${h.id}" ${byId(h.lid)?'':'disabled'}>Open</button><button class="btn" data-hd="${h.id}">Delete</button></div></div>`).join('')}
async function logH(l,act){await req(st('history','readwrite').add({t:nowMs(),lid:l.id,name:l.name||host(l.url),act}));if(act==='open')await put({...l,watched:true,opens:(l.opens||0)+1,lastOpen:Date.now()});await load()}
let pickId=0,pickAll=false;
function pick(all){pickAll=all;const pool=links.filter(l=>!(l.id in dupOf)&&!l.watched&&(all||filter==='All'||filter===DUP||(l.category||NONE)===filter));
 if(!pool.length)return toast('Nothing unwatched here');
 const l=pool[Math.floor(Math.random()*pool.length)];pickId=l.id;$('#pkc').innerHTML=card(l);if(!$('#pk').open)$('#pk').showModal()}
function shareIn(){const p=new URLSearchParams(location.search),u=p.get('url')||(p.get('text')||'').match(/https?:\/\/\S+/)?.[0];if(!u)return;
 history.replaceState(null,'',location.pathname);document.querySelector('[data-v=links]').click();openForm();
 $('#fu').value=u;$('#fn').value=(p.get('title')||'').trim();$('#fu').dispatchEvent(new Event('input'))}
$('#pick').onclick=()=>pick(false);$('#pickh').onclick=()=>pick(true);
$('#pkr').onclick=()=>pick(pickAll);$('#pkx').onclick=()=>$('#pk').close();

$('#clh').onclick=async()=>{if(!confirm('Clear all history?'))return;await req(st('history','readwrite').clear());await load()};

const urls=()=>[...new Set(($('#bt').value.match(/https?:\/\/[^\s<>"']+/g)||[]).map(u=>u.replace(/[.,;)]+$/,'')))];
$('#many').onclick=()=>{$('#dlg').close();$('#bt').value='';$('#bc').value=$('#fc').value;$('#bn').textContent='';$('#bk').showModal();$('#bt').focus()};
$('#bt').oninput=()=>{const n=urls().length;$('#bn').textContent=n?n+' link'+(n>1?'s':'')+' found':''};
$('#bx').onclick=()=>$('#bk').close();
$('#bg').onclick=async()=>{const u=urls(),c=$('#bc').value.trim();if(!u.length)return toast('No links found');await addCat(c);let t=nowMs();
 for(const x of u)await req(st('links','readwrite').add({url:x,name:'',category:c,image:'',video:'',created:t++}));
 $('#bk').close();await load();backfill();toast(u.length+' links added')};
let cpLink=0;
function openCpk(x){cpIds=Array.isArray(x)?x:[x.id];const l=byId(cpIds[0])||{},one=cpIds.length===1;$('#cpn').value='';$('#cpkc').innerHTML=[`<button class="chip ${one&&!l.category?'on':''}" data-cp="">No category</button>`,...cats.map(c=>`<button class="chip ${one&&l.category===c?'on':''}" data-cp="${esc(c)}" style="--cc:${cc(c)}">${esc(c)}</button>`)].join('');$('#cpk').showModal()}
async function setCat(c){const ls=cpIds.map(byId).filter(Boolean);if(!ls.length)return;await addCat(c);for(const l of ls)await put({...l,category:c});$('#cpk').close();await load();toast((ls.length>1?ls.length+' links':'Link')+' moved to '+(c||'No category'))}
$('#cpkc').onclick=e=>{const b=e.target.closest('[data-cp]');if(b)setCat(b.dataset.cp)};
$('#cps').onclick=()=>{const n=$('#cpn').value.trim();if(n)setCat(n)};$('#cpx').onclick=()=>$('#cpk').close();
$('#fu').addEventListener('input',()=>{if(editId||catManual)return;const h=host($('#fu').value.trim()),m={};
 links.filter(l=>l.category&&host(l.url)===h).forEach(l=>m[l.category]=(m[l.category]||0)+1);
 const b=Object.entries(m).sort((x,y)=>y[1]-x[1])[0];if(b){$('#fc').value=b[0];renderCP()}});

function goIn(){const g=new URLSearchParams(location.search).get('go');if(!g)return;history.replaceState(null,'',location.pathname);
 if(g==='add'){document.querySelector('[data-v=links]').click();openForm()}
 else if(g==='pick')pick(true);else if(g==='cats')document.querySelector('[data-v=cats]').click()}
addEventListener('keydown',e=>{if(e.key==='n'&&!e.ctrlKey&&!e.metaKey&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();document.querySelector('[data-v=links]').click();openForm()}});

const TH=window.NNN_THEME;let cur=TH.get();
function fill(){$('#thz').value=cur.zoom||100;$('#thbl').value=BL.px;$('#thpk').checked=BL.peek;$('#tha').value=cur.accent;$('#thb').value=cur.bg;$('#ths').value=cur.surface;$('#tht').value=cur.text;$('#thr').value=cur.radius;$('#thw').value=cur.minw;$('#thf').value=cur.font;$('#thh').value=cur.ar}
function openTheme(){cur=TH.get();fill();
 $('#thp').innerHTML=Object.entries(TH.PRESETS).map(([k,p])=>`<button type="button" class="pre" data-p="${k}" style="background:${p.bg};color:${p.text};border-color:${p.accent}"><i style="background:${p.accent}"></i>${p.n}</button>`).join('');
 $('#thd').showModal()}
const upd=()=>{TH.apply(cur);TH.save(cur)};
[['tha','accent'],['thb','bg'],['ths','surface'],['tht','text']].forEach(([i,k])=>$('#'+i).oninput=e=>{cur[k]=e.target.value;upd()});
$('#thz').oninput=e=>{cur.zoom=+e.target.value;upd()};$('#thr').oninput=e=>{cur.radius=+e.target.value;upd()};$('#thw').oninput=e=>{cur.minw=+e.target.value;upd()};
$('#thf').onchange=e=>{cur.font=e.target.value;upd()};$('#thh').onchange=e=>{cur.ar=e.target.value;upd()};
$('#thp').onclick=e=>{const b=e.target.closest('[data-p]');if(!b)return;cur={...cur,...TH.PRESETS[b.dataset.p]};delete cur.n;fill();upd()};
$('#thx').onclick=()=>{cur={...TH.DEF};fill();upd()};$('#thc').onclick=()=>$('#thd').close();
function grabFrame(u){return new Promise(res=>{const v=document.createElement('video');v.crossOrigin='anonymous';v.muted=true;v.playsInline=true;v.preload='auto';
 const done=x=>{clearTimeout(t);v.removeAttribute('src');v.load();res(x)},t=setTimeout(()=>done(''),6000);
 v.onloadeddata=()=>{v.currentTime=Math.min(1,(v.duration||2)/4)};
 v.onseeked=()=>{try{if(!v.videoWidth)return done('');const c=document.createElement('canvas'),k=Math.min(1,640/v.videoWidth);c.width=Math.round(v.videoWidth*k);c.height=Math.round(v.videoHeight*k);c.getContext('2d').drawImage(v,0,0,c.width,c.height);done(c.toDataURL('image/jpeg',.8))}catch{done('')}};
 v.onerror=()=>done('');v.src=u})}

const isMedia=u=>isVid(u)||/\.m3u8(\?|#|$)/i.test(u||'');
function candLoad(i,k){if(k>1&&(i.naturalWidth<240||i.naturalHeight<135||i.naturalWidth/i.naturalHeight>3||i.naturalWidth/i.naturalHeight<.35))i.remove();$('#cands').hidden=$('#cands').children.length<2;$('#cgl').hidden=$('#cands').hidden}
function showCands(a,sel){const c=$('#cands');c.hidden=!a||a.length<2;$('#cgl').hidden=c.hidden;c.classList.toggle('nogif',$('#cng').checked);
 c.innerHTML=(a||[]).map((u,k)=>`<img src="${esc(u)}" referrerpolicy="no-referrer" title="Use this cover" class="${u===sel?'on':''}" ${/\.gif(\?|#|$)/i.test(u)?'data-gif':''} data-u="${esc(u)}" onload="candLoad(this,${k})" onerror="this.remove()">`).join('')}
$('#cng').checked=localStorage.getItem('nnn-nogif')!=='0';
$('#cng').onchange=e=>{try{localStorage.setItem('nnn-nogif',e.target.checked?'1':'0')}catch{}$('#cands').classList.toggle('nogif',e.target.checked)};
$('#cands').onclick=e=>{const i=e.target.closest('[data-u]');if(!i)return;pickedImg=i.dataset.u;upImg='';$('#upx').hidden=true;setPv(pickedImg);showCands(candList,pickedImg)};





const SHTPL="<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>nnn reward share</title>\n<style>\nbody{margin:0;background:__BG__;color:__TX__;font:16px/1.5 system-ui,sans-serif;padding:24px}\nmain{max-width:640px;margin:0 auto}\nh1{margin:0 0 4px;color:__ACC__}p{color:__MUT__;margin:4px 0 14px}\n.it{display:flex;gap:12px;align-items:center;background:__CARD__;border:1px solid __LINE__;border-radius:14px;padding:8px;margin-bottom:8px}\n.th{width:96px;aspect-ratio:16/10;border-radius:10px;overflow:hidden;background:__LINE__;flex:none}.th img{width:100%;height:100%;object-fit:cover;display:block}\nsmall{display:block;color:__MUT__}\nbutton:disabled{opacity:.4;cursor:default}button{font:inherit;border:0;border-radius:99px;padding:12px 22px;cursor:pointer;background:__ACC__;color:__ON__;font-weight:700}\n.alt{background:transparent;border:1px solid __LINE__;color:__TX__;font-weight:600}\n.row{display:flex;gap:10px;flex-wrap:wrap;margin:18px 0}#st{color:__ACC__}\n</style></head><body><main>\n<h1>nnn reward</h1><p id=\"sum\"></p>\n<p>This file only previews what you would receive. Nothing is saved until you press Accept here and confirm inside the app. Links stay hidden in the app until your lock opens.</p>\n<div id=\"list\"></div>\n<div class=\"row\"><button id=\"ok\">Accept</button><button class=\"alt\" id=\"dl\">Save as backup file</button></div><p id=\"st\"></p>\n<script type=\"application/json\" id=\"d\">__DATA__</script>\n<script>\nvar D=JSON.parse(document.getElementById('d').textContent),APP='__APP__',OR='__ORIGIN__',L=D.links||[],w=null;\nfunction E(s){return String(s).replace(/[&<>\"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]})}\nfunction st(t){document.getElementById('st').textContent=t}\ndocument.getElementById('sum').textContent=L.length+' link'+(L.length===1?'':'s')+' ready to receive'+(D.exp?' \u00b7 valid until '+new Date(D.exp).toLocaleString([],{dateStyle:'medium',timeStyle:'short'}):'');\nif(D.exp&&Date.now()>D.exp){document.getElementById('sum').textContent='This share has expired. Ask for a new one.';document.getElementById('list').innerHTML='';document.getElementById('ok').disabled=true;document.getElementById('dl').disabled=true;L=[]}\ndocument.getElementById('list').innerHTML=L.slice(0,60).map(function(l){return '<div class=\"it\"><div class=\"th\">'+(l.image?'<img referrerpolicy=\"no-referrer\" src=\"'+E(l.image)+'\" onerror=\"this.remove()\">':'')+'</div><div><b>'+E(l.name||'Untitled')+'</b><small>'+E(l.category||'No category')+'</small></div></div>'}).join('')+(L.length>60?'<p>+ '+(L.length-60)+' more</p>':'');\ndocument.getElementById('ok').onclick=function(){w=window.open(APP+'#receive','_blank');st(w?'Waiting for nnn reward to open...':'Your browser blocked the new window. Allow pop-ups and try again.')};\naddEventListener('message',function(e){if(e.source===w&&e.data&&e.data.type==='nnn-ready'){w.postMessage({type:'nnn-share',data:D},OR);st('Sent. Confirm in the nnn reward window.')}});\ndocument.getElementById('dl').onclick=function(){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(D)],{type:'application/json'}));a.download='nnn-reward-backup.json';a.click()};\n</script></main></body></html>\n";

const b64u=a=>{let s='';const b=new Uint8Array(a);for(let i=0;i<b.length;i+=8192)s+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const unb64u=t=>{t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';const s=atob(t),b=new Uint8Array(s.length);for(let i=0;i<s.length;i++)b[i]=s.charCodeAt(i);return b};
async function packLink(D){const j=new TextEncoder().encode(JSON.stringify(D));if(window.CompressionStream)return'z.'+b64u(await new Response(new Blob([j]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer());return'p.'+b64u(j)}
async function unpackLink(t){return v2(await unpackRaw(t))}
async function unpackRaw(t){const k=t.slice(0,2),b=unb64u(t.slice(2));if(k==='z.')return JSON.parse(await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text());return JSON.parse(new TextDecoder().decode(b))}
const v2=d=>d&&d.v===2?{exp:d.e?d.e*6e4:0,links:d.l.map(a=>({name:a[0]||'',url:/^https?:\/\//.test(a[1])?a[1]:'https://'+a[1],category:a[2]||''}))}:d;
function payload(list,withImg){const lk=list.map(l=>{const o={name:l.name||'',url:l.url,category:l.category||'',image:l.image&&(withImg||!l.image.startsWith('data:'))?l.image:'',watched:!!l.watched,notes:l.notes||'',rating:l.rating||0};if(l.video)o.video=l.video;if(l.pvu)o.pvu=l.pvu;if(l.videos&&l.videos.length)o.videos=l.videos.slice(0,6);return o});
 return{v:1,app:'nnn-reward',t:Date.now(),exp:shareMs()?Date.now()+shareMs():0,cats:[...new Set(lk.map(x=>x.category).filter(Boolean))],links:lk}}
function shareHtml(D){const cs=getComputedStyle(document.documentElement),v=n=>cs.getPropertyValue(n).trim(),
 map={__BG__:v('--bg'),__CARD__:v('--glass'),__TX__:v('--tx'),__MUT__:v('--mut'),__LINE__:v('--line'),__ACC__:v('--gold'),__ON__:v('--on'),__APP__:new URL('./',location.href).href,__ORIGIN__:location.origin==='null'?'*':location.origin};
 let h=SHTPL;for(const k in map)h=h.split(k).join(map[k]);return h.split('__DATA__').join(JSON.stringify(D).replace(/</g,'\\u003c'))}
let SH=[];
function shareSet(list){SH=list;$('#sht').textContent=list.length===1?'Share this link':'Share '+list.length+' links';$('#shn').textContent=list.length===1?(list[0].name||host(list[0].url)):'';$('#shm').textContent='';SHORT='';$('#shqr').innerHTML='';syncExp();$('#shd').showModal()}
$('#shf').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([shareHtml(payload(SH,$('#shi').checked))],{type:'text/html'}));a.download='nnn-reward-share.html';a.click();$('#shm').textContent='File saved. Send it to the other device and open it there in a browser. It works '+expText()+'.'};
$('#shl').onclick=async()=>{const u=new URL('./',location.href).href+'#share='+await packLink(compact(SH));
 if(u.length>12000){$('#shm').textContent='Too many links for a link ('+u.length+' characters). Use the share file instead.';return}
 if(navigator.share){try{await navigator.share({title:'nnn reward',url:u});return}catch{}}
 try{await navigator.clipboard.writeText(u);$('#shm').textContent='Link copied ('+u.length+' characters). Valid '+expText()+'. Press Short link to make it shorter.'}catch{$('#shm').textContent=u}};
$('#shx').onclick=()=>$('#shd').close();
function scopeLinks(v){const b=links.filter(l=>!(l.id in dupOf));
 if(v==='pinned')return b.filter(l=>l.pinned);if(v==='new')return b.filter(l=>!l.watched);
 if(v.startsWith('c:'))return b.filter(l=>l.category===v.slice(2));return b}
function fillScopes(){const sel=$('#shs'),p=sel.value;sel.innerHTML='<option value="all">Everything</option><option value="pinned">Pinned links</option><option value="new">Unwatched links</option>'+cats.map(c=>`<option value="c:${esc(c)}">Category: ${esc(c)}</option>`).join('');if([...sel.options].some(o=>o.value===p))sel.value=p}
$('#shg').onclick=()=>{const l=scopeLinks($('#shs').value);if(!l.length)return toast('Nothing to share in that selection');shareSet(l)};
let RC=null;
function clean(d){if(!d||!Array.isArray(d.links))return null;const okU=u=>typeof u==='string'&&/^https?:\/\//i.test(u),str=(x,n)=>typeof x==='string'?x.slice(0,n):'';
 const lk=d.links.slice(0,2000).filter(l=>l&&okU(l.url)).map(l=>({name:str(l.name,350),url:str(l.url,2000),category:str(l.category,60),image:typeof l.image==='string'&&(/^https?:\/\//i.test(l.image)||/^data:image\//i.test(l.image))?l.image.slice(0,3e6):'',video:okU(l.video)?l.video:'',pvu:okU(l.pvu)?l.pvu:'',videos:Array.isArray(l.videos)?l.videos.filter(okU).slice(0,6):[],watched:!!l.watched,notes:str(l.notes,2000),rating:Math.min(5,Math.max(0,+l.rating||0))}));
 return lk.length?{links:lk}:null}
function showReceive(d){if(d&&d.exp&&Date.now()>d.exp)return toast('This share has expired');const c=clean(d);if(!c)return toast('That share has no valid links');RC=c;RC.exp=d.exp||0;
 const have=new Set(links.map(l=>nkey(l.url))),seen=new Set(),dup=c.links.filter(l=>{const k=nkey(l.url),x=have.has(k)||seen.has(k);seen.add(k);return x}).length,cs=[...new Set(c.links.map(l=>l.category).filter(Boolean))];
 $('#rcs').textContent=`${c.links.length} link${c.links.length>1?'s':''}${cs.length?' in '+cs.length+' categories ('+cs.slice(0,4).join(', ')+(cs.length>4?'...':'')+')':''}. ${dup} already saved or repeated.${d.exp?' Valid for '+leftText(d.exp-Date.now())+' more.':''}`;
 $('#rcl').innerHTML=c.links.slice(0,40).map(l=>`<div class="ri"><div class="rth">${l.image?`<img referrerpolicy="no-referrer" src="${esc(l.image)}" onerror="this.remove()">`:''}</div><div><b>${esc(l.name||'Untitled')}</b><small>${esc(l.category||'No category')}</small></div></div>`).join('')+(c.links.length>40?`<p class="hint" style="display:block">+ ${c.links.length-40} more</p>`:'');
 if(!$('#rcv').open)$('#rcv').showModal()}
$('#rca').onclick=async()=>{if(!RC)return;if(RC.exp&&Date.now()>RC.exp){RC=null;$('#rcv').close();return toast('This share expired before you accepted')}const have=new Set(links.map(l=>nkey(l.url))),skip=$('#rcd').checked;let n=0;
 for(const l of RC.links){const k=nkey(l.url);if(skip&&have.has(k))continue;have.add(k);await addCat(l.category);await req(st('links','readwrite').add({...l,created:nowMs(),imp:true}));n++}
 RC=null;$('#rcv').close();await load();document.querySelector('[data-v=links]').click();toast(n+' link'+(n===1?'':'s')+' added');backfill()};
$('#rcx').onclick=()=>{RC=null;$('#rcv').close()};
$('#rfb').onclick=()=>$('#rff').click();
$('#rff').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;try{const t=await f.text(),m=t.match(/<script type="application\/json" id="d">([\s\S]*?)<\/script>/);showReceive(JSON.parse(m?m[1]:t))}catch{toast('Could not read that file')}};
$('#rlb').onclick=async()=>{const m=$('#rli').value.match(/#share=(\S+)/);if(!m)return toast('Paste a full share link');try{showReceive(await unpackLink(m[1]))}catch{toast('That link could not be read')}};
addEventListener('message',e=>{const d=e.data;if(d&&d.type==='nnn-share')showReceive(d.data)});
function hashIn(){const h=location.hash,clear=()=>history.replaceState(null,'',location.pathname+location.search);
 if(h==='#receive'){if(window.opener)window.opener.postMessage({type:'nnn-ready'},'*');return clear()}
 const m=h.match(/^#share=(\S+)/);if(m){clear();unpackLink(m[1]).then(showReceive).catch(()=>toast('That share link could not be read'))}}

if(matchMedia('(pointer:coarse)').matches)$('#q').placeholder='Search your links';


const BL={on:false,px:18,peek:false};try{Object.assign(BL,JSON.parse(localStorage.getItem('nnn-blur')))}catch{}
const saveBL=()=>{try{localStorage.setItem('nnn-blur',JSON.stringify(BL))}catch{}};
const EYE='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',EYE0='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.6 6.6A17 17 0 0 0 2 12s4 7 10 7a9.7 9.7 0 0 0 4.4-1"/><path d="M14.1 14.1a3 3 0 0 1-4.2-4.2"/><path d="M2 2l20 20"/></svg>';
function applyBlur(){const r=document.documentElement;r.classList.toggle('blurcov',BL.on);r.classList.toggle('blurpeek',BL.peek);r.style.setProperty('--blurpx',BL.px+'px');$('#blur').classList.toggle('on',BL.on);$('#blur').innerHTML=BL.on?EYE0:EYE;$('#blur').title=BL.on?'Covers hidden (B)':'Blur covers (B)';$('#blur').setAttribute('aria-pressed',BL.on)}
$('#blur').onclick=()=>{BL.on=!BL.on;saveBL();applyBlur();toast(BL.on?'Covers blurred':'Covers visible')};
addEventListener('keydown',e=>{if((e.key==='b'||e.key==='B')&&!e.ctrlKey&&!e.metaKey&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!document.querySelector('dialog[open]'))$('#blur').click()});
applyBlur();
let deferred=null;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e});
addEventListener('appinstalled',()=>{deferred=null;$('#inst').hidden=true;toast('App installed')});
if(standalone())$('#inst').hidden=true;
$('#inst').onclick=async()=>{if(deferred){const d=deferred;deferred=null;d.prompt();await d.userChoice.catch(()=>{});return}openInstall()};
async function openInstall(){
 const ua=navigator.userAgent,ios=/iphone|ipad|ipod/i.test(ua),inapp=/FBAN|FBAV|Line\/|Instagram|MicroMessenger|TikTok|Messenger|Snapchat/i.test(ua),res=[];
 const add=(ok,t)=>res.push(`<li class="${ok?'ok':'bad'}">${ok?'✓':'✗'} ${t}</li>`);
 add(isSecureContext,'Secure page (https)'+(isSecureContext?'':'. Installing needs https, for example GitHub Pages.'));
 let mj=null;try{const r=await fetch('manifest.json',{cache:'no-store'});add(r.ok,'manifest.json '+(r.ok?'found':'missing'));mj=await r.json()}catch{add(false,'manifest.json could not be loaded. Upload it next to index.html.')}
 if(mj)for(const i of mj.icons||[]){try{const r=await fetch(i.src,{cache:'no-store'});add(r.ok,esc(i.src)+' ('+i.sizes+') '+(r.ok?'found':'missing. Upload this file.'))}catch{add(false,esc(i.src)+' missing. Upload this file.')}}
 const reg=navigator.serviceWorker?await navigator.serviceWorker.getRegistration():null;add(!!reg,'Offline helper (service worker) '+(reg?'running':'not running yet. Reload the page once on https.'));
 add(!inapp,inapp?'You are inside another app\'s browser. Open this page in Chrome or Safari.':'Opened in a normal browser');
 $('#ihl').innerHTML=res.join('');
 $('#iht').innerHTML=ios?'<b>iPhone or iPad:</b> open this page in <b>Safari</b>, tap the Share button, then choose <b>Add to Home Screen</b>.':'<b>Android (Chrome):</b> tap the three-dot menu, then <b>Install app</b> or <b>Add to Home screen</b>. If it is not there, fix any red items above and reload.';
 $('#ihd').showModal()}
$('#ihx').onclick=()=>$('#ihd').close();
$('#thbl').oninput=e=>{BL.px=+e.target.value;saveBL();applyBlur()};$('#thpk').onchange=e=>{BL.peek=e.target.checked;saveBL();applyBlur()};


const byId=id=>links.find(l=>l.id===id);
const STOP=new Set('the and for with from this that your you are was were not but all new video videos vid full free best top how why what who when watch watching episode ep part clip clips hd 4k 1080p 720p mp4 com www http https net org html php page site official channel playlist 2023 2024 2025 2026 not out one two get got has have had its our can will just more most very into over about'.split(' '));
const SEG=typeof Intl!=='undefined'&&Intl.Segmenter?new Intl.Segmenter(undefined,{granularity:'word'}):null,WC=new Map();
function wordsOf(s){s=String(s||'').toLowerCase();if(WC.has(s))return WC.get(s);const out=new Set(),add=w=>{if(/^\d+$/.test(w)||STOP.has(w))return;if(/^[a-z0-9]+$/.test(w)?w.length<3:w.length<2)return;out.add(w)};
 if(SEG){for(const x of SEG.segment(s))if(x.isWordLike)add(x.segment)}else s.split(/[^\p{L}\p{N}]+/u).forEach(w=>w&&add(w));
 if(WC.size>3000)WC.clear();WC.set(s,out);return out}
const siteWord=u=>{const p=host(u).split('.');return p.length>2&&p[p.length-1].length===2&&p[p.length-2].length<=3?p[p.length-3]:p[Math.max(0,p.length-2)]};
const cap=w=>w.charAt(0).toUpperCase()+w.slice(1);
const dismissed=()=>{try{return JSON.parse(localStorage.getItem('nnn-sgd')||'[]')}catch{return[]}};
let SG=[];
function suggestions(){const un=links.filter(l=>!(l.id in dupOf)&&!l.category);if(un.length<4)return[];
 const W={},S={};un.forEach(l=>{wordsOf(l.name).forEach(w=>(W[w]=W[w]||[]).push(l.id));const h=siteWord(l.url);if(h&&h.length>2)(S[h]=S[h]||[]).push(l.id)});
 const dis=new Set(dismissed()),have=new Map(cats.map(c=>[c.toLowerCase(),c])),out=[];
 for(const[w,ids]of Object.entries(W))if(ids.length>=4)out.push({key:'w:'+w,word:w,ids,kind:'word'});
 for(const[w,ids]of Object.entries(S))if(ids.length>=4)out.push({key:'s:'+w,word:w,ids,kind:'site'});
 const pick=[];for(const c of out.filter(x=>!dis.has(x.key)&&!(un.length>8&&x.ids.length>=un.length*.9)).sort((a,b)=>b.ids.length-a.ids.length)){
  if(pick.every(p=>c.ids.filter(i=>p.ids.includes(i)).length<c.ids.length*.5)){c.exists=have.get(c.word)||null;c.name=c.exists||cap(c.word);pick.push(c)}if(pick.length>=2)break}
 return pick}
async function applySg(s){const prev=s.ids.map(id=>[id,byId(id)?.category||'']);await addCat(s.name);
 for(const id of s.ids){const l=byId(id);if(l)await req(st('links','readwrite').put({...l,category:s.name}))}await load();
 toast(`${s.ids.length} links moved to "${s.name}"`,async()=>{for(const[id,c]of prev){const l=byId(id);if(l)await req(st('links','readwrite').put({...l,category:c}))}if(!s.exists)await req(st('cats','readwrite').delete(s.name));await load()})}
function drawSg(){SG=suggestions();$('#sugg').innerHTML=SG.map((s,i)=>`<div class="sg"><span>${s.ids.length} saved links ${s.kind==='site'?'come from':'share the word'} <b>${esc(s.word)}</b>. ${s.exists?'Move them to':'Create a category named'} <b>${esc(s.name)}</b>?</span><button class="btn gold" data-sg="${i}">${s.exists?'Move':'Create'}</button><button class="btn" data-sx="${i}">Skip</button></div>`).join('')}

$('#hsb').onclick=()=>{$('#hsw').hidden=!$('#hsw').hidden};
$('#hsg').onclick=()=>{const u=$('#fu').value.trim(),t=$('#hst').value;if(!u||t.length<50)return toast('Type the link first, then paste the page source');
 const x=parseHtml(t,u);if(!(x.image||(x.videos&&x.videos.length)||(x.embeds&&x.embeds.length)||(x.images&&x.images.length)))return toast('Nothing found in that source');
 HC.set(u,Promise.resolve(t));detected={...detected,...x};candList=x.images||[];showCands(candList,x.image);setPv(x.image,'',x.video);
 if(x.title&&(nameAuto||!$('#fn').value))$('#fn').value=x.title.slice(0,350);$('#hsw').hidden=true;toast('Found '+(x.videos||[]).length+' video(s), '+candList.length+' picture(s)')};


let RULES=[];try{RULES=JSON.parse(localStorage.getItem('nnn-rules')||'[]')}catch{}
const saveRules=()=>{try{localStorage.setItem('nnn-rules',JSON.stringify(RULES))}catch{}},lc=fold;
function hit(l,w,where,whole){w=lc(w.trim());if(!w)return false;const hay=where==='url'?lc(l.url):where==='both'?lc(l.name)+' '+lc(l.url):lc(l.name);
 return whole?new RegExp('(^|[^\\p{L}\\p{N}])'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'($|[^\\p{L}\\p{N}])','u').test(hay):hay.includes(w)}
const matchLinks=(w,where,only,whole)=>links.filter(l=>!(l.id in dupOf)&&(!only||!l.category)&&hit(l,w,where,whole));
const autoCat=()=>{const l={name:$('#fn').value,url:$('#fu').value},r=RULES.find(r=>hit(l,r.w,r.where,r.whole));return r?r.c:''};
function cwPreview(){const q=$('#cwq').value.trim(),m=matchLinks(q,$('#cws').value,$('#cwu').checked,$('#cww').checked);
 $('#cwn').textContent=q?`${m.length} link${m.length===1?'':'s'} match`:'Type a word to preview the matching links';
 $('#cwp').innerHTML=m.slice(0,8).map(l=>`<div class="ri"><div><b>${esc(l.name||host(l.url))}</b><small>${esc(l.category||'No category')}</small></div></div>`).join('')+(m.length>8?`<p class="hint" style="display:block">+ ${m.length-8} more</p>`:'')}
function renderCats(){const cnt=c=>links.filter(l=>!(l.id in dupOf)&&(l.category||'')===c).length,o=cats.map(c=>`<option>${esc(c)}</option>`).join('');
 $('#catlist').innerHTML=[...cats,''].map(c=>`<div class="cr"><span class="dotc" style="background:${c?cc(c):'var(--mut)'}"></span><b>${esc(c||NONE)}</b><small>${cnt(c)} links</small><button class="btn" data-cv="${esc(c||NONE)}">View</button>${c?`<button class="btn" data-cn="${esc(c)}">Rename</button><button class="btn" data-cx="${esc(c)}">Delete</button>`:''}</div>`).join('');
 $('#mf').innerHTML=o;$('#mt').innerHTML=o;
 $('#rules').innerHTML=RULES.map((r,i)=>`<div class="cr"><b>${esc(r.w)}</b><small>${r.where}${r.whole?', whole word':''} → ${esc(r.c)}</small><button class="btn" data-rd="${i}">Remove</button></div>`).join('')||'<p class="hint" style="display:block">No rules yet. Filter a word, pick a category and press Save as rule.</p>';cwPreview()}
async function setCats(pairs,msg,undoNew){const prev=pairs.map(([l])=>[l.id,l.category||'']);
 for(const[l,c]of pairs){if(c)await addCat(c);await req(st('links','readwrite').put({...l,category:c}))}await load();
 toast(msg,async()=>{for(const[id,c]of prev){const l=byId(id);if(l)await req(st('links','readwrite').put({...l,category:c}))}if(undoNew)await req(st('cats','readwrite').delete(undoNew));await load()})}
async function renameCat(o,n){n=n.trim();if(!n||n===o)return;await addCat(n);for(const l of links.filter(l=>l.category===o))await req(st('links','readwrite').put({...l,category:n}));await req(st('cats','readwrite').delete(o));if(filter===o)filter=n;await load();toast('Renamed to "'+n+'"')}
['cwq','cws','cwu','cww'].forEach(i=>$('#'+i).addEventListener('input',cwPreview));
$('#cats').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.cv){filter=d.cv;page=1;document.querySelector('[data-v=links]').click();return render()}
 if(d.cn){const n=prompt('New name (an existing name merges the two)',d.cn);if(n)await renameCat(d.cn,n);return}
 if(d.cx){if(!confirm('Delete "'+d.cx+'"? Its links stay, with no category.'))return;const ps=links.filter(l=>l.category===d.cx).map(l=>[l,'']);await req(st('cats','readwrite').delete(d.cx));if(filter===d.cx)filter='All';await setCats(ps,'Category deleted');return}
 if(d.rd){RULES.splice(+d.rd,1);saveRules();return renderCats()}
 if(b.id==='cwm'){const m=matchLinks($('#cwq').value,$('#cws').value,$('#cwu').checked,$('#cww').checked),c=$('#cwc').value.trim();if(!m.length||!c)return toast(!c?'Type the category first':'No links match');const isNew=!cats.includes(c);await setCats(m.map(l=>[l,c]),`${m.length} links moved to "${c}"`,isNew?c:'')}
 if(b.id==='cwr'){const w=$('#cwq').value.trim(),c=$('#cwc').value.trim();if(!w||!c)return toast('Type a word and a category first');await addCat(c);RULES.push({w,c,where:$('#cws').value,whole:$('#cww').checked});saveRules();await load();toast('Rule saved. New links with that word go to "'+c+'"')}
 if(b.id==='cwa'){const ps=[];for(const l of links.filter(l=>!l.category&&!(l.id in dupOf))){const r=RULES.find(r=>hit(l,r.w,r.where,r.whole));if(r)ps.push([l,r.c])}if(!ps.length)return toast('No uncategorized link matches a rule');await setCats(ps,ps.length+' links filed by your rules')}
 if(b.id==='mg'){const f=$('#mf').value,t=$('#mt').value;if(!f||!t||f===t)return toast('Pick two different categories');await renameCat(f,t)}
 if(b.id==='cde'){const em=cats.filter(c=>!links.some(l=>l.category===c));if(!em.length)return toast('No empty categories');for(const c of em)await req(st('cats','readwrite').delete(c));await load();toast(em.length+' empty categories deleted')}});

function openUrl(u){const a=document.createElement('a');a.href=u;a.target='_blank';a.rel='noopener noreferrer';document.body.append(a);a.click();a.remove()}

const compact=list=>({v:2,e:shareMs()?Math.floor((Date.now()+shareMs())/6e4):0,l:list.map(l=>{const a=[l.name||'',l.url.replace(/^https:\/\//,''),l.category||''];while(a.length>2&&!a[a.length-1])a.pop();return a})});
$('#shs2').onclick=async()=>{const u=new URL('./',location.href).href+'#share='+await packLink(compact(SH));
 if(!confirm('This sends the link, including the list of links inside it, to is.gd to shorten it. Continue?'))return;
 $('#shm').textContent='Shortening...';let s='';
 for(const h of ['is.gd','v.gd']){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),6000),r=await fetch('https://'+h+'/create.php?format=json&url='+encodeURIComponent(u),{signal:c.signal});clearTimeout(t);const j=await r.json();if(j.shorturl){s=j.shorturl;break}}catch{}}
 if(s)SHORT=s;if(!s){$('#shm').textContent='Could not shorten it (service blocked or offline). Use Share link or the share file.';return}
 if(navigator.share){try{await navigator.share({title:'nnn reward',url:s});return}catch{}}
 try{await navigator.clipboard.writeText(s);$('#shm').textContent='Short link copied (valid '+expText()+'): '+s}catch{$('#shm').textContent=s}};

const _sv=(()=>{try{return localStorage.getItem('nnn-exp')}catch{return null}})();let EXPM=_sv===null?15:+_sv;
const shareMs=()=>EXPM*6e4;
const expText=()=>EXPM===0?'forever':'for '+(EXPM%1440===0?EXPM/1440+' day'+(EXPM/1440>1?'s':''):EXPM%60===0?EXPM/60+' hour'+(EXPM/60>1?'s':''):EXPM+' minute'+(EXPM>1?'s':''));
const leftText=ms=>{const m=Math.max(1,Math.ceil(ms/6e4));return m<60?m+' minute'+(m>1?'s':''):m<2880?Math.ceil(m/60)+' hours':Math.ceil(m/1440)+' days'};
const parseExp=t=>{t=String(t).trim().toLowerCase();if(!t)return null;if(/^(forever|never|∞)$/.test(t))return 0;const m=t.match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|minutes?|h|hr|hrs|hours?|d|days?)?$/);if(!m)return NaN;const v=Math.round(+m[1]*({d:1440,h:60}[(m[2]||'m')[0]]||1));return v>=1&&v<=525600?v:NaN};
const setExp=v=>{EXPM=v;try{localStorage.setItem('nnn-exp',v)}catch{}};
function syncExp(){const o=[...$('#she').options].find(x=>x.value!=='c'&&+x.value===EXPM);$('#she').value=o?o.value:'c';$('#shy').value=o?'':(EXPM%1440===0?EXPM/1440+'d':EXPM%60===0?EXPM/60+'h':EXPM+'m');$('#shy').style.borderColor=''}
$('#she').onchange=e=>{if(e.target.value==='c')return;setExp(+e.target.value);$('#shy').value='';$('#shy').style.borderColor=''};
$('#shy').oninput=e=>{const v=parseExp(e.target.value);if(v===null){e.target.style.borderColor='';return}if(Number.isNaN(v)){e.target.style.borderColor='var(--coral)';return}e.target.style.borderColor='';setExp(v);const o=[...$('#she').options].find(x=>x.value!=='c'&&+x.value===v);$('#she').value=o?o.value:'c'};

$('#fn').addEventListener('input',()=>{$('#fnc').textContent=$('#fn').value.length+'/350'});


const SEL=new Set(),selLinks=()=>links.filter(l=>SEL.has(l.id)),put=l=>req(st('links','readwrite').put(l));
const selUpd=()=>{$('#selb').classList.toggle('on',selMode);$('#selbar').hidden=!selMode;$('#selc').textContent=SEL.size+' selected'};
async function trashLinks(ls,msg){const t=Date.now();for(const l of ls)await put({...l,del:t});SEL.clear();await load();toast(msg||'Moved to Trash',async()=>{for(const l of ls)await put(l);await load()})}
async function mergeGroups(gs){const saved=[],t=Date.now();
 for(const g of gs){const[o,...ds]=g;saved.push(o,...ds);const m={...o};
  for(const d of ds){m.category=m.category||d.category;m.notes=[...new Set([m.notes,d.notes].filter(Boolean))].join('\n');m.rating=Math.max(m.rating||0,d.rating||0);m.watched=m.watched||d.watched;m.pinned=m.pinned||d.pinned;m.opens=(m.opens||0)+(d.opens||0);m.image=m.image||d.image}
  await put(m);for(const d of ds)await put({...d,del:t})}
 await load();toast(gs.length+' duplicate set'+(gs.length>1?'s':'')+' merged',async()=>{for(const l of saved)await put(l);await load()})}
function trashHtml(){const dl=l=>Math.max(0,30-Math.floor((Date.now()-l.del)/864e5));
 $('#trashlist').innerHTML=[...trash].sort((a,b)=>b.del-a.del).map(l=>`<div class="hrow"><span>${new Date(l.del).toLocaleDateString(undefined,{day:'numeric',month:'short'})}</span><b>${esc(l.name||host(l.url))}</b><i>${dl(l)} days left</i><div class="mb"><button class="btn" data-tr="${l.id}">Restore</button><button class="btn" data-tx="${l.id}">Delete forever</button></div></div>`).join('')||'<div class="empty"><b>Trash is empty</b></div>'}
$('#trem').onclick=async()=>{if(!trash.length)return toast('Trash is empty');if(!confirm('Delete everything in Trash forever?'))return;for(const l of trash)await req(st('links','readwrite').delete(l.id));await load();toast('Trash emptied')};
$('#selb').onclick=()=>{selMode=!selMode;if(!selMode)SEL.clear();render()};
$('#sdone').onclick=$('#selb').onclick;
$('#sall').onclick=()=>{VIS.forEach(l=>SEL.add(l.id));render()};
$('#scat').onclick=()=>SEL.size?openCpk([...SEL]):toast('Select some links first');
$('#swat').onclick=async()=>{const s=selLinks();if(!s.length)return toast('Select some links first');const v=!s.every(l=>l.watched);for(const l of s)await put({...l,watched:v});await load()};
$('#spin').onclick=async()=>{const s=selLinks();if(!s.length)return toast('Select some links first');const v=!s.every(l=>l.pinned);for(const l of s)await put({...l,pinned:v});await load()};
$('#sshr').onclick=()=>SEL.size?shareSet(selLinks()):toast('Select some links first');
$('#sdel').onclick=()=>SEL.size?trashLinks(selLinks(),SEL.size+' links moved to Trash'):toast('Select some links first');
async function aliveCheck(u){const sg=ms=>{const c=new AbortController();setTimeout(()=>c.abort(),ms);return c.signal};let direct=true;
 try{await fetch(u,{mode:'no-cors',signal:sg(8000)})}catch{direct=false}
 try{const r=await(await fetch('https://api.allorigins.win/get?url='+encodeURIComponent(u),{signal:sg(9000)})).json(),c=r.status&&r.status.http_code;
  if(c===404||c===410)return false;if(!direct)return c===0?false:null;return true}catch{return direct?true:null}}
$('#chk').onclick=async()=>{if(!navigator.onLine)return toast('You are offline');const L=links.filter(l=>!(l.id in dupOf)).slice(0,150),b=$('#chk');let i=0,n=0,dead=0;
 const w=async()=>{while(i<L.length){const l=L[i++],r=await aliveCheck(l.url);n++;b.textContent='Checking '+n+'/'+L.length;
  if(r===false){dead++;await put({...l,dead:true,checked:Date.now()})}else if(r===true&&l.dead)await put({...l,dead:false,checked:Date.now()})}};
 await Promise.all([w(),w(),w(),w()]);b.textContent='Check for dead links';await load();toast(dead?dead+' possible dead link'+(dead>1?'s':'')+'. Use the filter "Dead links".':'No dead links found')};
const lsn=k=>{try{return+localStorage.getItem(k)||0}catch{return 0}};
function renderBackup(){const b=$('#bkb');if(links.length){try{localStorage.setItem('nnn-had','1');if(!lsn('nnn-first'))localStorage.setItem('nnn-first',Date.now())}catch{}}
 const ref=lsn('nnn-lastexp')||lsn('nnn-first')||Date.now(),days=Math.floor((Date.now()-ref)/864e5);
 if(!links.length&&localStorage.getItem('nnn-had')==='1'){b.innerHTML='<div class="sg"><span>Your library looks empty. Restore it from a backup file?</span><button class="btn gold" id="rsb">Restore</button><button class="btn" id="rsx">Dismiss</button></div>';return}
 b.innerHTML=links.length>=3&&days>=7&&Date.now()>lsn('nnn-snooze')?`<div class="sg"><span>${lsn('nnn-lastexp')?'Your last backup was '+days+' days ago.':'You have not made a backup yet.'} Your links only live on this device.</span><button class="btn gold" id="bkx">Export now</button><button class="btn" id="bkl">Later</button></div>`:''}
let SHORT='';
function qrSvg(t){const q=new QRC.QRCode(-1,QRC.EC.L);q.addData(t);q.make();const n=q.getModuleCount(),m=4,s=n+2*m;let d='';for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+=`M${c+m} ${r+m}h1v1h-1z`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges" width="260" height="260" role="img" aria-label="QR code"><rect width="${s}" height="${s}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`}
$('#shq').onclick=async()=>{const u=SHORT||(new URL('./',location.href).href+'#share='+await packLink(compact(SH)));
 try{$('#shqr').innerHTML=qrSvg(u);$('#shm').textContent=SHORT?'Scan this with the other device.':'Scan with the other device. Press Short link first for a simpler, easier-to-scan code.'}catch{$('#shqr').innerHTML='';$('#shm').textContent='Too many links for a QR code. Use Short link first, or the share file.'}};
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch{}
