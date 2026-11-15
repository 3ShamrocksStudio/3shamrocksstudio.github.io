const {chromium}=require('playwright');const fs=require('fs');
const D={shomer:150,lickpick:120,th:120};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
for(const br of Object.keys(D)){fs.rmSync(`f-${br}`,{recursive:true,force:true});fs.mkdirSync(`f-${br}`);
 await p.goto(`file://${__dirname}/reveal.html?b=${br}&m=reveal`);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 for(let i=0;i<D[br];i++){await p.evaluate(t=>seek(t),i/30);await p.screenshot({path:`f-${br}/${String(i).padStart(4,'0')}.jpg`,type:'jpeg',quality:92});}
 await p.goto(`file://${__dirname}/reveal.html?b=${br}&m=frame`);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);await p.screenshot({path:`frame-${br}.png`});}
await b.close();})();
