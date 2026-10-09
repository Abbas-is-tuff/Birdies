const V='birdies-v5';
const CORE=['./','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png','icons/favicon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(async c=>{
 await c.add(new Request('index.html',{cache:'reload'}));          // the game itself must be saved
 await Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})));  // extras are optional
}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// newest version first when online (3s limit), saved copy when offline or slow
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 e.respondWith((async()=>{
  const c=await caches.open(V);
  const net=fetch(new Request(r.url,{cache:'no-store',credentials:'same-origin'})).then(res=>{if(res&&res.ok)c.put(r,res.clone()).catch(()=>{});return res});
  const hit=await c.match(r,{ignoreSearch:true})||(r.mode==='navigate'?await c.match('index.html'):undefined);
  if(!hit)return net;
  return Promise.race([net,new Promise((_,rej)=>setTimeout(rej,3000))]).catch(()=>hit);
 })())});
