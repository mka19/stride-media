import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
const root = new URL('../stride-media/dist', import.meta.url).pathname;
const srv=createServer((q,r)=>{let p=root+(q.url.split('?')[0]);if(!existsSync(p)||p.endsWith('/'))p=root+'/index.html';const e=p.split('.').pop();
 r.setHeader('content-type', e==='mp3'?'audio/mpeg':e==='js'?'text/javascript':e==='css'?'text/css':'text/html'); r.end(readFileSync(p));}).listen(4550);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
for (const [w,h,name] of [[1920,1080,'desktop-lg'],[1440,900,'desktop'],[1024,768,'tablet'],[390,844,'mobile']]) {
  const p=await b.newPage({viewport:{width:w,height:h},isMobile:w<500,hasTouch:w<500});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message.slice(0,70)));
  await p.goto('http://localhost:4550/'); await p.waitForTimeout(8000);
  // walk the whole page so every scrubbed section runs
  const H=await p.evaluate(()=>document.body.scrollHeight);
  for(let f=0;f<=1;f+=0.05){ await p.evaluate(y=>window.scrollTo(0,y),Math.round(H*f)); await p.waitForTimeout(160); }
  const r=await p.evaluate(()=>{
    const bad=[];
    for(const s of document.querySelectorAll('section[id], header, footer')){
      const t=(s.innerText||'').trim();
      if(s.offsetHeight < 80) bad.push((s.id||s.tagName)+' height '+s.offsetHeight);
      if(t.length < 40 && s.tagName!=='HEADER') bad.push((s.id||s.tagName)+' text '+t.length);
    }
    return {bad, overflow: document.documentElement.scrollWidth>window.innerWidth
      ? document.documentElement.scrollWidth+' > '+window.innerWidth : null,
      pageHeight: Math.round(document.body.scrollHeight)};
  });
  console.log(name.padEnd(11), 'h='+r.pageHeight, '| overflow:', r.overflow ?? 'none', '| errors:', errs.length?errs:'none', '| sections:', r.bad.length?r.bad:'all ok');
  await p.close();
}
await b.close(); srv.close();
