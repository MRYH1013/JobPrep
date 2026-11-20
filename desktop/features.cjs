const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path');
app.disableHardwareAcceleration();
app.setPath('userData',fs.mkdtempSync(path.join(require('node:os').tmpdir(),'jobprep-features-')));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({width:1500,height:1100,show:true,webPreferences:{contextIsolation:true,sandbox:true,backgroundThrottling:false}}),errors=[];
 win.webContents.on('console-message',e=>{if(e.level==='error')errors.push(e.message)});
 const run=s=>win.webContents.executeJavaScript(s);
 const capture=async name=>{let error;for(let i=0;i<3;i++){try{await new Promise(r=>setTimeout(r,350+i*200));const shot=await win.webContents.capturePage(undefined,{stayHidden:false,stayAwake:true});if(shot.isEmpty())throw Error('Empty screenshot');fs.writeFileSync(path.join(__dirname,'..',name),shot.toPNG());return;}catch(e){error=e;win.show()}}throw error};
 try{
  await win.loadFile(path.join(__dirname,'..','index.html'));
  console.log(await run(`(()=>{
   const assert=(v,m)=>{if(!v)throw Error(m)};
   setIndustry('career-01','01-1');
   assert(PROFESSIONAL_QUESTIONS.filter(q=>['01-1','01-2'].includes(q.subId)).every(q=>q.rubric.length===3&&q.caseStudy&&q.editorialRevision),'84 refined questions');
   const q=QUESTIONS.find(q=>q.id==='fe-effect');
   assert(!document.querySelector('#content').textContent.includes(q.knowledge),'card hides answer');
   openQuestion(q.id);const hint=document.querySelector('.detail-side details');assert(!hint.open,'knowledge hint collapsed');
   const note=document.querySelector('#note');note.value='我会检查订阅和清理的对称性';note.dispatchEvent(new Event('input'));
   document.querySelector('#submit-answer').click();assert(!state.done.includes(q.id)&&state.needsReview.includes(q.id),'submission schedules review instead of mastery');
   assert(document.querySelector('.my-answer').textContent.includes('对称性')&&document.querySelector('.reference-answer'),'my answer and reference comparison');
   assert(document.querySelectorAll('[data-check]').length===3,'question-specific rubric');
   const check=document.querySelector('[data-check="0"]');check.click();assert(state.checks[q.id].includes(0),'rubric persists');
   const mainNode=document.querySelector('.detail-main'),checkNode=check,scrollNode=document.querySelector('#article'),reviewButton=document.querySelector('#needs-review'),saveButton=document.querySelector('#detail-save'),masteryButton=document.querySelector('#done');
   hint.open=true;scrollNode.scrollTop=180;const detailScroll=scrollNode.scrollTop;
   assert(detailScroll>0,'detail scroll regression setup');
   for(const selector of ['#done','#done','#detail-save','#detail-save','#needs-review','#needs-review']){
    const button=document.querySelector(selector);button.focus({preventScroll:true});button.click();
    assert(document.querySelector('.detail-main')===mainNode&&document.querySelector('[data-check="0"]')===checkNode,'state toggle preserves content DOM');
    assert(scrollNode.scrollTop===detailScroll&&hint.open&&checkNode.checked,'state toggle preserves scroll, hints and rubric');
    assert(document.activeElement===button&&document.querySelector('#done')===masteryButton&&document.querySelector('#detail-save')===saveButton&&document.querySelector('#needs-review')===reviewButton,'state toggle preserves controls and focus');
   }
   // Restore the review state expected by the remainder of the workflow.
   JobPrepFeatures.setStatus(q.id,'review');
   document.querySelector('#needs-review').click();assert(!state.needsReview.includes(q.id),'review undone');document.querySelector('#needs-review').click();
   document.querySelector('#close').click();switchView('review');assert(filtered().some(x=>x.id===q.id),'weak review list');
   document.querySelector('[data-review-mode="due"]').click();assert(!filtered().some(x=>x.id===q.id),'not due yet');state.attempts[q.id].dueAt=Date.now()-1;render(false);assert(filtered().some(x=>x.id===q.id),'due review list');
   switchView('library');openQuestion(q.id);document.querySelector('#done').click();assert(state.done.includes(q.id)&&!state.needsReview.includes(q.id),'mastery exclusive from review');assert(state.attempts[q.id].dueAt>Date.now()+6*86400000,'mastery schedules seven day review');document.querySelector('#close').click();
   state.saved=['fe-effect','general-061'];persist();switchView('saved');assert(filtered().length===2,'all saved includes general');document.querySelector('[data-learning-scope="general"]').click();assert(filtered().length===1&&filtered()[0].kind==='general','general saved scope');document.querySelector('[data-learning-scope="current"]').click();assert(filtered().length===1&&filtered()[0].id===q.id,'career saved scope');
   switchView('library');assert(!document.querySelector('#continue-learning').hidden,'resume entry');document.querySelector('#resume-learning').click();assert(current.id===q.id&&document.querySelector('#note').value.includes('对称性'),'resume draft');
   const setItem=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('disk full')};const draft=document.querySelector('#note');draft.value='模拟保存失败时保留这段回答';draft.dispatchEvent(new Event('input'));assert(document.querySelector('#note-status').textContent.includes('保存失败'),'storage failure is not success');Storage.prototype.setItem=setItem;draft.dispatchEvent(new Event('input'));assert(document.querySelector('#note-status').textContent==='已保存','storage recovers');document.querySelector('#close').click();
   const prior=state.notes[q.id];JobPrepFeatures.previewImport({version:3,saved:['general-062'],done:['general-062'],notes:{'general-062':'备份中的回答','obsolete-id':'旧题'}});assert(document.querySelector('#backup-preview').textContent.includes('忽略未知编号 1'),'backup preview unknown id');
   Storage.prototype.setItem=()=>{throw Error('disk full')};document.querySelector('#confirm-import').click();assert(!state.saved.includes('general-062')&&document.querySelector('#import-status').textContent.includes('尚未应用'),'failed import rolls back');Storage.prototype.setItem=setItem;
   document.querySelector('#confirm-import').click();assert(state.notes[q.id]===prior&&state.notes['general-062']==='备份中的回答'&&state.saved.includes('general-062'),'successful merge preserves other answers');
   let rejected=false;try{JobPrepFeatures.previewImport({version:99})}catch{rejected=true}assert(rejected,'unsupported backup rejected');
   document.querySelector('#settings-open').click();document.querySelector('[data-font-size="19"]').click();assert(document.documentElement.dataset.readingSize==='19','large reading font');document.querySelector('#comfortable-reading').click();assert(!document.documentElement.classList.contains('reading-comfortable'),'reading spacing');document.querySelector('[data-close-dialog="reading-settings"]').click();
   switchView('map');document.querySelector('[data-learning-phase="进阶"][data-phase-role="01-1"]').click();assert(filtered().every(x=>x.level==='进阶'),'real phase route');document.querySelector('#clear-route').click();assert(filtered().length===42,'clear phase route');
   openQuestion(q.id);document.querySelector('#question-feedback').click();assert(document.querySelector('#feedback-dialog').textContent.includes(q.id),'feedback contains stable id');document.querySelector('[data-close-dialog="feedback-dialog"]').click();document.querySelector('#close').click();
   document.querySelector('#simulation-open').click();document.querySelector('#simulation-start').click();assert(JobPrepFeatures.simulation.ids.length===5&&new Set(JobPrepFeatures.simulation.ids).size===5,'random unique simulation pool');assert(document.querySelector('.detail-tabs').hidden&&!document.querySelector('.reference-answer'),'simulation hides answers');const simulated=current.id;const sn=document.querySelector('#note');sn.value='这是本次模拟回答';sn.dispatchEvent(new Event('input'));document.querySelector('#submit-answer').click();assert(current.id!==simulated&&JobPrepFeatures.simulation.answered.has(simulated),'simulation submit advances');JobPrepFeatures.finishSimulation();assert(document.querySelector('#simulation-result').open&&state.notes[simulated]==='这是本次模拟回答','simulation summary and drafts');document.querySelector('[data-sim-review]').click();assert(document.querySelector('.reference-answer')&&detailList.length===5,'simulation review every question');document.querySelector('#close').click();assert(document.querySelector('#simulation-result').open,'closing review returns summary');document.querySelector('[data-close-dialog="simulation-result"]').click();
   document.querySelector('#simulation-open').click();document.querySelector('#simulation-start').click();document.querySelector('#close').click();assert(!JobPrepFeatures.simulation&&document.querySelector('#simulation-result').open,'early exit finishes simulation');document.querySelector('[data-close-dialog="simulation-result"]').click();
   document.querySelector('#simulation-open').click();document.querySelector('#simulation-start').click();JobPrepFeatures.simulation.endsAt=Date.now()-1;document.dispatchEvent(new Event('visibilitychange'));assert(!JobPrepFeatures.simulation&&document.querySelector('#simulation-result').open,'timer expiry finishes simulation');document.querySelector('[data-close-dialog="simulation-result"]').click();
   setIndustry('career-01','01-1');openQuestion('fe-effect');return 'PASS: scoped collections, rubric, schedules, backup preview/merge/rollback, failed saves, resume, reading, routes, feedback, simulation/expiry';
  })()`));
  await capture('preview-learning.png');
  await run(`document.querySelector('[data-tab="answer"]').click()`);await capture('preview-comparison.png');
  await run(`document.querySelector('#close').click();persist()`);
  const loaded=new Promise(r=>win.webContents.once('did-finish-load',r));win.reload();await loaded;
  if(!await run(`state.settings.fontSize===19&&state.settings.comfortable===false&&state.notes['general-062']==='备份中的回答'&&state.checks['fe-effect'].includes(0)&&!document.querySelector('#continue-learning').hidden`))throw Error('learning state persisted after restart');
  await run(`(()=>{const dt=new DataTransfer();dt.items.add(new File([JSON.stringify({version:4,notes:{'general-063':'文件导入测试'}})],'backup.json',{type:'application/json'}));const el=document.querySelector('#import-file');el.files=dt.files;el.dispatchEvent(new Event('change'));})()`);await new Promise(r=>setTimeout(r,150));
  if(!await run(`document.querySelector('#backup-preview').open`))throw Error('file input import preview');
  await run(`document.querySelector('#confirm-import').click()`);
  if(!await run(`state.notes['general-063']==='文件导入测试'`))throw Error('file input import merge');
  const backupPath=path.join(app.getPath('userData'),'export-test.json');
  const downloaded=new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('Export timeout')),10000);
   win.webContents.session.once('will-download',(_event,item)=>{item.setSavePath(backupPath);item.once('done',(_e,status)=>{clearTimeout(timeout);status==='completed'?resolve():reject(Error('Export failed: '+status))})});
  });
  await run(`document.querySelector('#export').click()`);await downloaded;
  const backup=JSON.parse(fs.readFileSync(backupPath,'utf8'));
  if(backup.version!==4||backup.notes['general-063']!=='文件导入测试')throw Error('Exported backup incomplete');
  win.setSize(900,900);await new Promise(r=>setTimeout(r,250));if(!await run('document.documentElement.scrollWidth<=innerWidth'))throw Error('compact layout overflow');
  if(errors.length)throw Error(errors.join('\n'));console.log('PASS: restart persistence, screenshots, compact layout, no renderer errors');app.exit(0);
 }catch(error){console.error(error);console.error(errors.join('\n'));app.exit(1)}
});
