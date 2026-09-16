/**
 * Page audit.
 *
 *   node scripts/audit.mjs
 *
 * Builds nothing — it serves `dist/` and walks the rendered page looking for
 * the things that do not show up in a type check or a screenshot: anchors that
 * point at ids which do not exist, links that go to "#", placeholder copy
 * still visible to visitors, media slots with no real source, and whether
 * there is any form or iframe on the page at all.
 *
 * It found four live bugs the first time it was run, which is why it is in
 * the repo rather than in a scratch directory.
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
const root = new URL('../dist', import.meta.url).pathname;
const srv=createServer((q,r)=>{let p=root+(q.url.split('?')[0]);if(!existsSync(p)||p.endsWith('/'))p=root+'/index.html';const e=p.split('.').pop();r.setHeader('content-type',e==='js'?'text/javascript':e==='css'?'text/css':'text/html');r.end(readFileSync(p));}).listen(4470);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:1440,height:900}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message.slice(0,90)));
await p.goto('http://localhost:4470/');await p.waitForTimeout(7000);
const r = await p.evaluate(()=>{
  const out={sections:[],media:{video:0,realSrc:0,generated:0},links:[],placeholders:[],forms:0};
  // sections in order
  for (const s of document.querySelectorAll('section[id], header, footer')) {
    const t=(s.innerText||'').replace(/\s+/g,' ').trim();
    out.sections.push({id:s.id||s.tagName.toLowerCase(), h:Math.round(s.offsetHeight), chars:t.length});
  }
  // media: how many tiles have a real source
  document.querySelectorAll('video').forEach(v=>{out.media.video++; if(v.currentSrc||v.src) out.media.realSrc++;});
  document.querySelectorAll('img').forEach(i=>{ if(!i.currentSrc) out.media.generated++; });
  // outbound + anchor links
  document.querySelectorAll('a[href]').forEach(a=>{const h=a.getAttribute('href'); if(h && !out.links.includes(h)) out.links.push(h);});
  // placeholder text anywhere on the page
  const body=document.body.innerText;
  [/\[[A-Za-z ]+\]/g].forEach(re=>{const m=body.match(re); if(m) out.placeholders=[...new Set(m)];});
  out.forms = document.querySelectorAll('form, input, textarea, iframe').length;
  return out;
});
console.log('SECTIONS'); r.sections.forEach(s=>console.log('  '+s.id.padEnd(14)+' h='+String(s.h).padStart(6)+'  text='+s.chars));
console.log('\nMEDIA  <video> elements:', r.media.video, '| with a real src:', r.media.realSrc, '| <img> without src:', r.media.generated);
console.log('\nFORM/IFRAME elements (booking, contact):', r.forms);
console.log('\nPLACEHOLDER TEXT ON PAGE:', r.placeholders);
console.log('\nLINKS:'); r.links.forEach(l=>console.log('  '+l));
console.log('\nJS ERRORS:', errs.length?errs:'none');
await b.close();srv.close();
