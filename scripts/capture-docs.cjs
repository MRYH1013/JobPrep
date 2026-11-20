const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
app.disableHardwareAcceleration();
app.setPath('userData',fs.mkdtempSync(path.join(require('node:os').tmpdir(),'jobprep-docs-')));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({width:1440,height:1000,show:true,webPreferences:{contextIsolation:true,sandbox:true,backgroundThrottling:false}});
 const run=code=>win.webContents.executeJavaScript('(()=>{'+code+';})()');
 const capture=async name=>{let last;for(let i=0;i<3;i++){try{await new Promise(r=>setTimeout(r,350+i*200));const image=await win.webContents.capturePage(undefined,{stayHidden:false,stayAwake:true});if(image.isEmpty())throw Error('Empty image');fs.writeFileSync(path.join(root,'docs/images',name+'.jpg'),image.toJPEG(88));return;}catch(e){last=e;win.show()}}throw last};
 try{
  fs.mkdirSync(path.join(root,'docs/images'),{recursive:true});fs.mkdirSync(path.join(root,'build'),{recursive:true});
  await win.loadFile(path.join(root,'index.html'));
  await capture('home');
  await run(`setIndustry('career-01')`);await capture('roles');
  await run(`setIndustry('career-01','01-1');openQuestion('fe-effect');document.querySelector('#note').value='我会让连接的创建与清理保持对称：切换 roomId 时断开旧连接，卸载时释放资源，并验证旧房间不再推送消息。';document.querySelector('#note').dispatchEvent(new Event('input'));document.activeElement.blur()`);await capture('practice');
  await run(`document.querySelector('#submit-answer').click();document.activeElement.blur()`);await capture('answer');
  await run(`document.querySelector('#close').click();document.querySelector('#simulation-open').click();document.activeElement.blur()`);await capture('simulation');
  // Render the application's existing brand mark at icon size; no user data is used.
  await run(`for(const d of document.querySelectorAll('dialog[open]'))d.close();const mark=document.querySelector('.brand-mark').cloneNode(true);document.body.replaceChildren(mark);Object.assign(document.body.style,{margin:'0',width:'256px',height:'256px',background:'transparent',overflow:'hidden'});Object.assign(mark.style,{width:'256px',height:'256px',fontSize:'190px',borderRadius:'64px',boxShadow:'none',fontFamily:'Segoe UI, sans-serif',fontWeight:'650',position:'absolute',left:'0',top:'0'});Object.assign(mark.querySelector('span').style,{fontSize:'100px',right:'24px',top:'4px'});`);
  await new Promise(r=>setTimeout(r,200));const icon=await win.webContents.capturePage({x:0,y:0,width:256,height:256},{stayHidden:false,stayAwake:true});
  const sizes=[256,128,64,48,32,16],images=sizes.map(n=>icon.resize({width:n,height:n,quality:'best'}).toPNG());
  const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);let offset=header.length;
  sizes.forEach((size,i)=>{const pos=6+i*16;header[pos]=size===256?0:size;header[pos+1]=size===256?0:size;header.writeUInt16LE(1,pos+4);header.writeUInt16LE(32,pos+6);header.writeUInt32LE(images[i].length,pos+8);header.writeUInt32LE(offset,pos+12);offset+=images[i].length});
  fs.writeFileSync(path.join(root,'build/icon.ico'),Buffer.concat([header,...images]));fs.writeFileSync(path.join(root,'build/icon.png'),images[0]);
  console.log('Documentation screenshots and JobPrep application icon generated from isolated demo data.');app.exit(0);
 }catch(error){console.error(error);app.exit(1)}
});
