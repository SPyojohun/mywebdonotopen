const $=s=>document.querySelector(s);
let db,links=[],cats=[],filter='All',editId=null;
const NONE='Uncategorized';
const req=r=>new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
const st=(n,m='readonly')=>db.transaction(n,m).objectStore(n);
function open(){return new Promise((ok,no)=>{const r=indexedDB.open('nnn-reward',1);
 r.onupgradeneeded=()=>{r.result.createObjectStore('links',{keyPath:'id',autoIncrement:true});r.result.createObjectStore('cats',{keyPath:'name'})};
 r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function load(){links=await req(st('links').getAll());cats=(await req(st('cats').getAll())).map(c=>c.name).sort();render()}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(t,undo){const e=$('#toast');$('#tt').textContent=t;$('#undo').hidden=!undo;$('#undo').onclick=()=>{undo();e.classList.remove('show')};e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),undo?5000:1400)}
const ic=(d,f)=>`<svg viewBox="0 0 24 24" width="17" height="17" fill="${f?'currentColor':'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const P={copy:'<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',del:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'};
function host(u){try{return new URL(u).hostname.replace(/^www\./,'')}catch{return u}}
function imgSrc(l){if(l.image)return l.image;if(/\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i.test(l.url))return l.url;return 'https://image.thum.io/get/width/600/crop/400/'+l.url}
function hue(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))%360;return h}
const isVid=u=>/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u||'');
function media(l){const v=l.video||(isVid(l.url)?l.url:'');
 if(v&&!l.image)return `<video src="${esc(v)}#t=0.1" muted playsinline preload="metadata" onerror="this.remove()"></video>`;
 return `<img src="${esc(imgSrc(l))}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`}
function card(l,g){
 const c=g?((l.id in dupOf?'Duplicate':'Original')+(why[l.id]?' · '+why[l.id]:'')+(l.created?' · '+new Date(l.created).toLocaleDateString(undefined,{day:'numeric',month:'short'}):'')):(l.category||NONE),n=l.name||host(l.url);
 return `<article class="card" data-id="${l.id}">
 <a class="thumb" href="${esc(l.url)}" target="_blank" rel="noopener" style="background:linear-gradient(135deg,hsl(${hue(host(l.url))} 55% 42%),hsl(${(hue(host(l.url))+50)%360} 60% 28%))" title="${esc(n)}">
  <span class="ph">${esc(n[0].toUpperCase())}</span>${media(l)}</a>
 <div class="tools"><button class="icon pin ${l.pinned?'on':''}" data-a="pin" aria-label="${l.pinned?'Unpin':'Pin'}">${ic(P.star,l.pinned)}</button>
 <button class="icon" data-a="edit" aria-label="Edit">${ic(P.edit)}</button>
 <button class="icon del" data-a="del" aria-label="Delete">${ic(P.del)}</button></div>
 <div class="info"><h3>${esc(n)}</h3><small>${esc(host(l.url))}</small>
 <div class="meta"><span class="cat ${g?(l.id in dupOf?'dupe':'orig'):''}">${esc(c)}</span><button class="btn" data-a="copy">${ic(P.copy)}<span>Copy</span></button></div></div></article>`}
let page=1,dupOf={},why={};const PER=12,DUP='__dup';
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
 const q=$('#q').value.toLowerCase(),SORT={new:(a,b)=>b.id-a.id,old:(a,b)=>a.id-b.id,az:(a,b)=>(a.name||'').localeCompare(b.name||'')};
 const isD=l=>l.id in dupOf,normal=links.filter(l=>!isD(l)),dups=links.filter(isD);
 if(filter===DUP&&!dups.length)filter='All';
 const match=l=>!q||[l.name,l.url,l.category].join(' ').toLowerCase().includes(q);
 const groups=Object.values(dups.reduce((m,l)=>{const o=dupOf[l.id];(m[o.id]=m[o.id]||[o]).push(l);return m},{})).map(g=>g.sort((a,b)=>a.id-b.id));
 const items=filter===DUP?groups.filter(g=>g.some(match)).sort((a,b)=>nkey(a[0].url).localeCompare(nkey(b[0].url))):normal.filter(l=>(filter==='All'||(l.category||NONE)===filter)&&match(l)).sort(SORT[$('#sort').value]);
 const per=filter===DUP?4:PER,total=Math.max(1,Math.ceil(items.length/per));if(page>total)page=total;
 const slice=items.slice((page-1)*per,page*per);
 const bar=filter===DUP?`<div class="dupbar"><span>${groups.length} link${groups.length>1?'s are':' is'} saved more than once (same link or same name). The first copy stays in your normal list.</span><button class="btn" id="rmdup">Delete all duplicates</button></div>`:'';
 const grp=gs=>gs.map(g=>`<section class="dgroup"><div class="dhead"><h3>${esc(g[0].name||host(g[0].url))}</h3><small>${g.length} saved · ${g.some(l=>/link/.test(why[l.id]||''))&&g.some(l=>/name/.test(why[l.id]||''))?'same link and name':g.some(l=>/link/.test(why[l.id]||''))?'same link':'same name'}</small></div><div class="dcards">${g.map(l=>card(l,1)).join('')}</div></section>`).join('');
 const content=filter===DUP?grp(slice):slice.map(l=>card(l)).join('');
 $('#grid').classList.toggle('dmode',filter===DUP);
 $('#grid').innerHTML=bar+(content||`<div class="empty"><b>${q?'Nothing matches your search':'No links here yet'}</b>${q?'Try another word.':'Press Add link to save your first one.'}</div>`);
 $('#pager').innerHTML=pager(page,total);
 const count=c=>normal.filter(l=>(l.category||NONE)===c).length;
 const all=[...cats];if(normal.some(l=>!l.category))all.push(NONE);
 $('#chips').innerHTML=[`<button class="chip ${filter==='All'?'on':''}" data-c="All">All (${normal.length})</button>`,
  ...all.map(c=>`<button class="chip ${filter===c?'on':''}" data-c="${esc(c)}">${esc(c)} (${count(c)})${cats.includes(c)?`<i data-r="${esc(c)}" title="Rename category">✎</i><i data-x="${esc(c)}" title="Delete category">×</i>`:''}</button>`),
  dups.length?`<button class="chip dupchip ${filter===DUP?'on':''}" data-c="${DUP}">Duplicated (${dups.length})</button>`:'',
  `<button class="chip" id="nc">+ Category</button>`].join('');
 $('#cl').innerHTML=cats.map(c=>`<option value="${esc(c)}">`).join('');
 const pins=normal.filter(l=>l.pinned);
 $('#pins').innerHTML=pins.map(l=>card(l)).join('')||'<div class="empty"><b>No pinned links</b>Tap the star on a link to keep it here.</div>';
 $('#stats').innerHTML=`<div>Links<b>${normal.length}</b></div><div>Categories<b>${cats.length}</b></div><div>Pinned<b>${pins.length}</b></div><div>Duplicates<b>${dups.length}</b></div>`}
async function addCat(n){n=n.trim();if(n&&n!==NONE&&!cats.includes(n))await req(st('cats','readwrite').put({name:n}))}
let upImg='',detected={},nameAuto=true,pending=Promise.resolve(),dtm;
async function getMeta(url){
 const out={},yt=url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
 if(yt)out.image='https://img.youtube.com/vi/'+yt[1]+'/hqdefault.jpg';
 try{const d=await(await fetch('https://noembed.com/embed?url='+encodeURIComponent(url))).json();if(d.title)out.title=d.title;if(!out.image&&d.thumbnail_url)out.image=d.thumbnail_url}catch{}
 if(!out.title||!out.image){try{const d=(await(await fetch('https://api.microlink.io/?url='+encodeURIComponent(url))).json()).data||{};out.title=out.title||d.title;out.image=out.image||d.image?.url||d.logo?.url}catch{}}
 if(!out.image||!out.title){const x=await scrape(url);out.image=out.image||x.image;out.title=out.title||x.title;out.video=x.video}
 if(isVid(url))out.video=url;if(out.image)out.image=out.image.replace(/^http:/,'https:');if(out.video)out.video=out.video.replace(/^http:/,'https:');
 return out}
async function scrape(url){
 for(const p of ['https://api.allorigins.win/raw?url=','https://corsproxy.io/?url=']){
  try{const r=await fetch(p+encodeURIComponent(url));if(!r.ok)continue;
   const txt=await r.text(),d=new DOMParser().parseFromString(txt,'text/html'),m=n=>d.querySelector(`meta[property="${n}"],meta[name="${n}"]`)?.content;
   const rel=x=>{try{return x&&!x.startsWith('data:')?new URL(x,url).href:''}catch{return''}};
   const im=d.querySelector('video[poster]')||d.querySelector('article img,.entry-content img,main img,img');
   const first=im&&(im.getAttribute('poster')||im.getAttribute('data-src')||im.getAttribute('data-lazy-src')||im.getAttribute('src'));
   const image=rel(m('og:image:secure_url')||m('og:image')||m('twitter:image')||m('twitter:image:src')||d.querySelector('link[rel=image_src]')?.getAttribute('href')||d.querySelector('meta[itemprop=image]')?.content||first);
   const title=(m('og:title')||d.title||'').trim();
   const vr=m('og:video:secure_url')||m('og:video:url')||m('og:video')||d.querySelector('video[src]')?.getAttribute('src')||d.querySelector('video source[src]')?.getAttribute('src')||(txt.match(/https?:\/\/[^"'\s<>\\]+?\.(?:mp4|webm|mov|m4v)(?:\?[^"'\s<>\\]*)?/i)||[])[0];
   const video=isVid(rel(vr))?rel(vr):'';
   if(image||title||video)return{image,title,video}}catch{}}
 return{}}
function setPv(src,msg,vid){const p=$('#pv');p.hidden=!src&&!msg&&!vid;p.innerHTML=!src&&vid?`<video src="${esc(vid)}#t=0.1" muted playsinline preload="metadata"></video>`:src?`<img src="${esc(src)}" alt="" referrerpolicy="no-referrer" onerror="this.parentNode.hidden=true">`:`<span>${msg||''}</span>`}
$('#fu').addEventListener('input',()=>{clearTimeout(dtm);const u=$('#fu').value.trim();detected={};
 if(!/^https?:\/\/\S+\.\S+/.test(u)){setPv(upImg);return}
 setPv(upImg,upImg?'':'Detecting title and picture...');
 dtm=setTimeout(()=>{pending=getMeta(u).then(m=>{if($('#fu').value.trim()!==u)return;detected=m;setPv(upImg||m.image,upImg||m.image||m.video?'':'No picture found. A page screenshot will be tried instead.',upImg?'':m.video);if(m.title&&(nameAuto||!$('#fn').value))$('#fn').value=m.title;chk()})},500)});
$('#fn').addEventListener('input',()=>nameAuto=false);
async function backfill(){if(!navigator.onLine)return;let ch=0;
 for(const l of links){if(l.image||l.video||l.tried==='v3'||/\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/i.test(l.url))continue;
  const m=await getMeta(l.url);await req(st('links','readwrite').put({...l,image:m.image||'',video:m.image?'':(m.video||''),name:(!l.name||l.name===host(l.url))&&m.title?m.title:l.name,tried:'v3'}));ch++}
 if(ch)load()}
function openForm(l){editId=l?l.id:null;detected={};upImg=/^data:/.test(l?.image||'')?l.image:'';$('#upx').hidden=!upImg;nameAuto=!l;setPv(l?.image||'','',l?.video);$('#dt').textContent=l?'Edit link':'Add link';
 $('#fn').value=l?.name||'';$('#fu').value=l?.url||'';$('#fc').value=l?.category||(filter!=='All'&&filter!==NONE&&filter!==DUP?filter:'');$('#fi').value=l?.image||'';renderCP();$('#dupnote').hidden=true;$('#dlg').showModal();if(!l)navigator.clipboard?.readText().then(t=>{if(/^https?:\/\//i.test(t.trim())&&!$('#fu').value)$('#fu').value=t.trim()}).catch(()=>{});$('#fu').focus()}
$('#f').addEventListener('submit',async e=>{await pending;
 const cat=$('#fc').value.trim();await addCat(cat);
 const old=links.find(x=>x.id===editId)||{};
 const ci=$('#fi').value.trim(),same=old.url===$('#fu').value.trim(),img=upImg||(isVid(ci)?'':(ci||detected.image||(same&&!/^data:/.test(old.image||'')?old.image:'')||'')),vid=img?'':(isVid(ci)?ci:(detected.video||(same?old.video:'')||''));
 const rec={...old,name:$('#fn').value.trim()||detected.title||host($('#fu').value.trim()),url:$('#fu').value.trim(),category:cat,image:img,video:vid,tried:'v3'};
 if(!editId){delete rec.id;rec.created=Date.now()}
 const dupNew=links.some(x=>x.id!==editId&&sameAs(x,rec));await req(st('links','readwrite').put(rec));await load();toast(dupNew?'Saved. Moved to Duplicated':'Saved')});
$('#cancel').onclick=()=>$('#dlg').close();
$('#add').onclick=()=>openForm();
$('#q').oninput=()=>{page=1;render()};
document.addEventListener('click',async e=>{
 const pg=e.target.closest('[data-p]');if(pg){if(!pg.disabled){page=+pg.dataset.p;render();$('#chips').scrollIntoView({behavior:'smooth'})}return}
 const pk=e.target.closest('[data-pick]');if(pk){$('#fc').value=$('#fc').value.trim()===pk.dataset.pick?'':pk.dataset.pick;renderCP();return}
 if(e.target.id==='rmdup'){if(!confirm('Delete all duplicated links? The first copy of each stays.'))return;for(const id of Object.keys(dupOf))await req(st('links','readwrite').delete(+id));filter='All';await load();return toast('Duplicates deleted')}
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
 if(a==='copy'){try{await navigator.clipboard.writeText(l.url)}catch{const t=document.createElement('textarea');t.value=l.url;document.body.append(t);t.select();document.execCommand('copy');t.remove()}toast('Link copied');b.querySelector('span').textContent='Copied';setTimeout(()=>b.querySelector('span').textContent='Copy',1200)}
 if(a==='edit')openForm(l);
 if(a==='del'){await req(st('links','readwrite').delete(l.id));await load();toast('Link deleted',async()=>{await req(st('links','readwrite').put(l));load()})}
 if(a==='pin'){await req(st('links','readwrite').put({...l,pinned:!l.pinned}));load()}});
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
 document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===t));
 document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!==t.dataset.v)});
$('#exp').onclick=()=>{const a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([JSON.stringify({cats,links},null,1)],{type:'application/json'}));
 a.download='nnn-reward-backup.json';a.click()};
$('#imp').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());
 for(const c of d.cats||[])await addCat(c);
 for(const l of d.links||[]){delete l.id;await req(st('links','readwrite').add(l))}
 await load();toast('Imported')}catch{toast('Invalid backup file')}e.target.value=''};
function tick(){
 const now=new Date();let t=new Date(now.getFullYear(),11,1);if(now>t&&!(now.getMonth()===11&&now.getDate()===1))t=new Date(now.getFullYear()+1,11,1);
 if(now.getMonth()===11&&now.getDate()===1){$('#cdLabel').textContent='It is 1 December. Time to claim your reward.';$('#cd').innerHTML='';$('#pf').style.strokeDashoffset=0;$('#pp').textContent='100%';return}
 const d=Math.max(0,t-now),p=[[Math.floor(d/864e5),'days'],[Math.floor(d/36e5)%24,'hours'],[Math.floor(d/6e4)%60,'minutes'],[Math.floor(d/1e3)%60,'seconds']];
 {const s=new Date(t.getFullYear(),10,1),p=Math.max(0,Math.min(100,(now-s)/(t-s)*100));$('#pf').style.strokeDashoffset=314.16*(1-p/100);$('#pp').textContent=Math.floor(p)+'%'}$('#cdLabel').textContent=`Until 1 December ${t.getFullYear()}`;
 $('#cd').innerHTML=p.map(([v,l])=>`<div><b>${String(v).padStart(2,'0')}</b><span>${l}</span></div>`).join('')}
tick();setInterval(tick,1000);
open().then(d=>{db=d;load().then(backfill)});
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

$('#theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('nnn-theme',t)}catch{}};
$('#sort').onchange=()=>{page=1;render()};
$('#view').onclick=()=>{$('#grid').classList.toggle('list');$('#view').textContent=$('#grid').classList.contains('list')?'☰':'▦'};
$('#fab').onclick=()=>openForm();
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{$('#fab').hidden=t.dataset.v!=='links';scrollTo(0,0)}));
$('#fab').hidden=true;
addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!$('#dlg').open){e.preventDefault();document.querySelector('[data-v=links]').click();$('#q').focus()}});
$('#fc').addEventListener('input',renderCP);
const sameAs=(l,r)=>nkey(l.url)===nkey(r.url)||(!!r.name&&r.name.toLowerCase()===(l.name||'').trim().toLowerCase()&&r.name.toLowerCase()!==host(r.url).toLowerCase());
function chk(){const u=$('#fu').value.trim(),r={url:u,name:$('#fn').value.trim()},n=$('#dupnote'),m=u&&links.find(l=>l.id!==editId&&sameAs(l,r));n.hidden=!m;if(m)n.textContent=`Already saved as "${m.name||host(m.url)}" (${nkey(m.url)===nkey(u)?'same link':'same name'}). This one will go to Duplicated.`}
$('#fu').addEventListener('input',chk);$('#fn').addEventListener('input',chk);

$('#redo').onclick=()=>$('#fu').dispatchEvent(new Event('input'));

$('#clr').onclick=async()=>{if(!links.length&&!cats.length)return toast('Nothing to clear');
 if(!confirm('Delete ALL links and categories on this device?\n\nTip: press Cancel and use Export backup first.'))return;
 if((prompt('Type DELETE to confirm')||'').trim()!=='DELETE')return toast('Cancelled');
 const L=[...links],C=[...cats];
 await req(st('links','readwrite').clear());await req(st('cats','readwrite').clear());
 filter='All';page=1;await load();
 toast('All data cleared',async()=>{for(const c of C)await req(st('cats','readwrite').put({name:c}));for(const l of L)await req(st('links','readwrite').put(l));load()})};

$('#upb').onclick=()=>$('#upf').click();
async function useFile(f){try{const b=await createImageBitmap(f),k=Math.min(1,900/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=Math.round(b.width*k);c.height=Math.round(b.height*k);c.getContext('2d').drawImage(b,0,0,c.width,c.height);
  upImg=c.toDataURL(f.type==='image/png'?'image/png':'image/jpeg',.85);setPv(upImg);$('#upx').hidden=false;toast('Image added')}catch{toast('Could not read that image')}}
$('#upf').onchange=e=>{const f=e.target.files[0];e.target.value='';if(f)useFile(f)};
addEventListener('paste',e=>{if(!$('#dlg').open)return;const f=[...(e.clipboardData?.items||[])].find(i=>i.type.startsWith('image/'))?.getAsFile();if(f){e.preventDefault();useFile(f)}});
$('#upp').onclick=async()=>{try{for(const it of await navigator.clipboard.read()){const t=it.types.find(x=>x.startsWith('image/'));if(t)return useFile(new File([await it.getType(t)],'pasted',{type:t}))}toast('No image in clipboard')}catch{toast('Clipboard blocked. Try Ctrl+V instead')}};
$('#upx').onclick=()=>{upImg='';$('#upx').hidden=true;setPv(detected.image||'','',detected.video)};
