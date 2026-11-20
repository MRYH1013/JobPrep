const {build}=require('electron-builder');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
async function main(){
 if(process.platform!=='win32')throw Error('Windows release packages must be built on Windows');
 process.chdir(root);
 const files=await build({publish:'never',config:{directories:{output:'release'},electronDist:path.join(root,'node_modules/electron/dist')}});
 const assets=files.filter(f=>/\.(exe|zip)$/i.test(f));
 if(!assets.some(f=>f.endsWith('.exe'))||!assets.some(f=>f.endsWith('.zip')))throw Error('Expected both installer and archive');
 const rows=assets.map(f=>`${crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')}  ${path.basename(f)}`).sort();
 fs.writeFileSync(path.join(root,'release/SHA256SUMS.txt'),rows.join('\n')+'\n');
 console.log('Release packages and SHA256SUMS.txt ready.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
