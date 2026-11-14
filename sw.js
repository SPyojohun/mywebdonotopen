const V='nnn-reward-v46',F=['./','index.html','style.css','app.js','theme.js','qr.js','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(F.map(u=>fetch(u,{cache:'reload'}).then(r=>{if(!r.ok)throw new Error(u);return c.put(u,r)})))));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!=='nnn-img').map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);
 if(e.request.method==='GET'&&e.request.destination==='image'&&u.origin!==location.origin){e.respondWith(caches.open('nnn-img').then(async c=>{const m=await c.match(e.request.url);if(m)return m;
  try{const r=await fetch(e.request.url,{mode:'cors',referrerPolicy:'no-referrer'});if(r.ok){c.put(e.request.url,r.clone());c.keys().then(k=>{if(k.length>400)c.delete(k[0])})}return r}catch{return fetch(e.request)}}));return}
 if(e.request.method!=='GET'||u.origin!==location.origin)return;
 e.respondWith(fetch(e.request.url,{cache:'no-cache'}).then(n=>{if(n.ok){const c=n.clone();caches.open(V).then(x=>x.put(e.request,c))}return n}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():clients.openWindow('./')))});
