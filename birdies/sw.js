const V='birdies-v4';
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png','icons/favicon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// network first (newest game every launch), saved copy only when offline or very slow
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 e.respondWith((async()=>{
  const c=await caches.open(V);
  const net=fetch(r,{cache:'no-store'}).then(res=>{if(res&&res.ok){c.put(r,res.clone())}return res});
  const hit=await c.match(r,{ignoreSearch:true});
  if(!hit)return net.catch(()=>c.match('index.html'));
  return Promise.race([net,new Promise((_,rej)=>setTimeout(rej,3000))]).catch(()=>hit);
 })())});
