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
function card(l){
 const c=l.category||NONE,n=l.name||host(l.url);
 return `<article class="card" data-id="${l.id}">
 <a class="thumb" href="${esc(l.url)}" target="_blank" rel="noopener" style="background:linear-gradient(135deg,hsl(${hue(host(l.url))} 55% 42%),hsl(${(hue(host(l.url))+50)%360} 60% 28%))" title="${esc(n)}">
  <span class="ph">${esc(n[0].toUpperCase())}</span><img src="${esc(imgSrc(l))}" alt="" loading="lazy" onerror="this.remove()"></a>
 <div class="tools"><button class="icon pin ${l.pinned?'on':''}" data-a="pin" aria-label="${l.pinned?'Unpin':'Pin'}">${ic(P.star,l.pinned)}</button>
 <button class="icon" data-a="edit" aria-label="Edit">${ic(P.edit)}</button>
 <button class="icon del" data-a="del" aria-label="Delete">${ic(P.del)}</button></div>
 <div class="info"><h3>${esc(n)}</h3><small>${esc(host(l.url))}</small>
 <div class="meta"><span class="cat">${esc(c)}</span><button class="btn" data-a="copy">${ic(P.copy)}<span>Copy</span></button></div></div></article>`}
function render(){
 const q=$('#q').value.toLowerCase();const SORT={new:(a,b)=>b.id-a.id,old:(a,b)=>a.id-b.id,az:(a,b)=>(a.name||'').localeCompare(b.name||'')};
 const list=links.filter(l=>(filter==='All'||(l.category||NONE)===filter)&&(!q||[l.name,l.url,l.category].join(' ').toLowerCase().includes(q))).sort(SORT[$('#sort').value]);
 $('#grid').innerHTML=list.map(card).join('')||`<div class="empty"><b>${q?'Nothing matches your search':'No links here yet'}</b>${q?'Try another word.':'Press Add link to save your first one.'}</div>`;
 const count=c=>links.filter(l=>(l.category||NONE)===c).length;
 const all=[...cats];if(links.some(l=>!l.category))all.push(NONE);
 $('#chips').innerHTML=[`<button class="chip ${filter==='All'?'on':''}" data-c="All">All (${links.length})</button>`,
  ...all.map(c=>`<button class="chip ${filter===c?'on':''}" data-c="${esc(c)}">${esc(c)} (${count(c)})${cats.includes(c)?`<i data-x="${esc(c)}" title="Delete category">×</i>`:''}</button>`),
  `<button class="chip" id="nc">+ Category</button>`].join('');
 $('#cl').innerHTML=cats.map(c=>`<option value="${esc(c)}">`).join('');
 const pins=links.filter(l=>l.pinned);
 $('#pins').innerHTML=pins.map(card).join('')||'<div class="empty"><b>No pinned links</b>Tap the star on a link to keep it here.</div>';
 $('#stats').innerHTML=`<div>Links<b>${links.length}</b></div><div>Categories<b>${cats.length}</b></div><div>Pinned<b>${pins.length}</b></div>`}
async function addCat(n){n=n.trim();if(n&&n!==NONE&&!cats.includes(n))await req(st('cats','readwrite').put({name:n}))}
function openForm(l){editId=l?l.id:null;$('#dt').textContent=l?'Edit link':'Add link';
 $('#fn').value=l?.name||'';$('#fu').value=l?.url||'';$('#fc').value=l?.category||(filter!=='All'&&filter!==NONE?filter:'');$('#fi').value=l?.image||'';$('#dlg').showModal();if(!l)navigator.clipboard?.readText().then(t=>{if(/^https?:\/\//i.test(t.trim())&&!$('#fu').value)$('#fu').value=t.trim()}).catch(()=>{});$('#fu').focus()}
$('#f').addEventListener('submit',async e=>{
 const cat=$('#fc').value.trim();await addCat(cat);
 const old=links.find(x=>x.id===editId)||{};
 const rec={...old,name:$('#fn').value.trim()||host($('#fu').value.trim()),url:$('#fu').value.trim(),category:cat,image:$('#fi').value.trim()};
 if(!editId){delete rec.id;rec.created=Date.now()}
 await req(st('links','readwrite').put(rec));await load();toast('Saved')});
$('#cancel').onclick=()=>$('#dlg').close();
$('#add').onclick=()=>openForm();
$('#q').oninput=render;
document.addEventListener('click',async e=>{
 const x=e.target.closest('[data-x]');
 if(x){e.stopPropagation();const c=x.dataset.x;if(!confirm(`Delete category "${c}"? Its links stay, but become Uncategorized.`))return;
  await req(st('cats','readwrite').delete(c));
  for(const l of links.filter(l=>l.category===c))await req(st('links','readwrite').put({...l,category:''}));
  if(filter===c)filter='All';return load()}
 const ch=e.target.closest('.chip');
 if(ch){if(ch.id==='nc'){const n=prompt('New category name');if(n){await addCat(n);await load()}}else{filter=ch.dataset.c;render()}return}
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
 {const s=new Date(t.getFullYear()-1,11,1),p=Math.min(100,(now-s)/(t-s)*100);$('#pf').style.strokeDashoffset=314.16*(1-p/100);$('#pp').textContent=Math.floor(p)+'%'}$('#cdLabel').textContent=`Until 1 December ${t.getFullYear()}`;
 $('#cd').innerHTML=p.map(([v,l])=>`<div><b>${String(v).padStart(2,'0')}</b><span>${l}</span></div>`).join('')}
tick();setInterval(tick,1000);
open().then(d=>{db=d;load()});
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));

$('#theme').onclick=()=>{const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem('nnn-theme',t)}catch{}};
$('#sort').onchange=render;
$('#view').onclick=()=>{$('#grid').classList.toggle('list');$('#view').textContent=$('#grid').classList.contains('list')?'☰':'▦'};
$('#fab').onclick=()=>openForm();
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>{$('#fab').hidden=t.dataset.v!=='links';scrollTo(0,0)}));
$('#fab').hidden=true;
addEventListener('keydown',e=>{if(e.key==='/'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)&&!$('#dlg').open){e.preventDefault();document.querySelector('[data-v=links]').click();$('#q').focus()}});
