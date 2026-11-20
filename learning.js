(function(){
 'use strict';
 const core=window.JobPrepLearning;
 try{state={...state,...core.clean(state,validIds).data}}catch{state.needsReview=[];state.attempts={};state.checks={};state.settings={fontSize:17,comfortable:true}}
 let savedScope='all',reviewScope='current',reviewMode='weak',routeLevel='all',simulation=null,simTimer=null,lastSimulation=null;
 const day=86400000;
 const now=()=>Date.now();
 const qById=new Map(QUESTIONS.map(q=>[q.id,q]));
 const selectedScope=(q,scope)=>scope==='all'||(scope==='general'?q.kind==='general':Boolean(state.target&&q.industry===state.target.industry&&(state.target.subrole==='all'||q.subId===state.target.subrole)));
 const control=(id,label,active)=>`<button data-learning-scope="${id}" class="chip ${active?'active':''}" aria-pressed="${active}">${label}</button>`;
 const baseRender=render,baseDetail=renderDetail,baseOpen=openQuestion,baseToggle=toggle,baseCard=card;
 filtered=function(){const mastered=new Set(state.done);return QUESTIONS.filter(q=>{
  if(view==='saved'){if(!state.saved.includes(q.id)||!selectedScope(q,savedScope))return false}
  else if(view==='review'){if(!selectedScope(q,reviewScope)||!core.reviewMatch(state,q,reviewMode))return false}
  else if((view==='general'&&(q.kind!=='general'||(generalCategory!=='all'&&q.subId!==generalCategory)))||(industry!=='all'&&q.industry!==industry)||(subrole!=='all'&&q.subId!==subrole))return false;
  return (stage==='all'||q.stages.includes(Number(stage)))&&(level==='all'||q.level===level)&&(routeLevel==='all'||view!=='library'||q.level===routeLevel)&&(!query||questionSearchText.get(q.id).includes(query));
 }).sort((a,b)=>Number(mastered.has(a.id))-Number(mastered.has(b.id)))};
 card=function(q){let html=baseCard(q);if(state.needsReview.includes(q.id))html=html.replace(`<span class="">${q.subrole}</span>`,`<span class="review-badge">需复习</span>`);return html};
 function learningControls(){
  const root=$('#learning-controls');
  if(view==='saved'){
   const count=scope=>QUESTIONS.filter(q=>state.saved.includes(q.id)&&selectedScope(q,scope)).length;
   root.innerHTML=`<div class="scope-tabs" aria-label="收藏范围">${control('all',`全部收藏 · ${count('all')}`,savedScope==='all')}${control('current',`当前岗位 · ${count('current')}`,savedScope==='current')}${control('general',`通用问答 · ${count('general')}`,savedScope==='general')}</div><p>收藏独立保存。此处显示所选范围内的题目。</p>`;
  }else if(view==='review'){
   root.innerHTML=`<div class="scope-tabs" aria-label="复习范围">${control('current','当前岗位',reviewScope==='current')}${control('all','全部岗位',reviewScope==='all')}${control('general','通用问答',reviewScope==='general')}</div><div class="scope-tabs" aria-label="复习类型">${[['weak','答过但需复习'],['due','到期复习'],['saved','收藏重点'],['unmastered','全部未掌握']].map(([id,label])=>`<button data-review-mode="${id}" class="chip ${reviewMode===id?'active':''}" aria-pressed="${reviewMode===id}">${label}</button>`).join('')}</div><p>需复习题默认次日再练；掌握后安排七天复习。复习时间仅用于本机学习提示。</p>`;
  }else root.innerHTML='';
  if(view==='saved'||view==='review'){
   $('#industry-picker').hidden=true;$('#stage-picker').parentElement.hidden=true;$('#subrole-chips').innerHTML='';
   $('.overview').hidden=true;$('#progress-heading').hidden=true;
   $('#view-description').textContent=view==='saved'?'全部收藏包含职业题与通用问答，可按范围切换。':'按熟练程度和复习时间安排练习。';
   $('#reset').textContent='清除搜索与难度';
  }else $('#reset').textContent='重置筛选';
  if(routeLevel!=='all'&&view==='library')root.innerHTML=`<div class="route-banner">当前路线：${esc(routeLevel)}阶段 <button class="text-button" id="clear-route">查看岗位全部题目</button></div>`;
 }
 function renderContinue(){
  const root=$('#continue-learning'),last=state.lastSession,q=qById.get(last?.id);
  root.hidden=!q||view!=='library'||(industry!=='all'&&(q.industry!==industry||(subrole!=='all'&&q.subId!==subrole)));
  root.innerHTML=q?`<div><span class="eyebrow">CONTINUE LEARNING</span><h3>${esc(q.subrole)} · ${esc(displayTitle(q))}</h3><p>返回上次题目，继续编辑已保存的回答。</p></div><button id="resume-learning">继续上次学习 ${icon('right')}</button>`:'';
 }
 render=function(animate=true){baseRender(animate);learningControls();renderContinue();
  if(!$('#simulation-open'))$('#practice').insertAdjacentHTML('beforebegin','<button class="text-button" id="simulation-open">离线模拟面试</button>');
  $('#simulation-open').hidden=!['library','general'].includes(view)||(view==='library'&&subrole==='all');
  if(!filtered().length&&['saved','review'].includes(view))$('#content').innerHTML=`<div class="wide empty"><h3>${view==='saved'?'这个范围还没有收藏':'暂时没有待复习题目'}</h3><p>${view==='saved'?'试试全部收藏，或先在题目中添加收藏。':'可切换复习类型；完成作答后自行标记掌握程度。'}</p></div>`;
 };
 const baseSetIndustry=setIndustry,baseSwitch=switchView,baseReset=reset;
 setIndustry=function(...args){routeLevel='all';baseSetIndustry(...args)};
 switchView=function(next){routeLevel='all';if(next==='saved')savedScope='all';baseSwitch(next)};
 reset=function(){routeLevel='all';baseReset()};
 function recordAnswer(q){
  state.attempts[q.id]={answeredAt:now(),dueAt:now()+(state.done.includes(q.id)?7:1)*day};
  if(!state.done.includes(q.id)&&!state.needsReview.includes(q.id))state.needsReview.push(q.id);
  if(simulation)simulation.answered.add(q.id);
  return persist();
 }
 function setStatus(id,status){
  state.done=state.done.filter(x=>x!==id);state.needsReview=state.needsReview.filter(x=>x!==id);
  if(status==='mastered')state.done.push(id);if(status==='review')state.needsReview.push(id);
  if(status==='new')delete state.attempts[id];
  else state.attempts[id]={answeredAt:state.attempts[id]?.answeredAt||now(),dueAt:now()+(status==='mastered'?7:1)*day};
  persist();render(false);if(current?.id===id)syncDetailActions();
 }
 function syncDetailActions(){
  if(!current||!$('#detail').open)return;
  const id=current.id;
  for(const [selector,active,className,symbol,label] of [
   ['#done',state.done.includes(id),'is-mastered','check',state.done.includes(id)?'已掌握 · 点击撤销':'标记已掌握'],
   ['#detail-save',state.saved.includes(id),'is-saved','bookmark',state.saved.includes(id)?'已收藏 · 点击取消':'收藏这道题'],
   ['#needs-review',state.needsReview.includes(id),'is-review','clock',state.needsReview.includes(id)?'需复习 · 点击撤销':'标记需复习']
  ]){
   const button=$(selector);if(!button)continue;
   button.classList.toggle(className,active);button.setAttribute('aria-pressed',String(active));
   const text=button.lastChild;if(text?.nodeType===Node.TEXT_NODE)text.textContent=label;
  }
  const noteStatus=$('#note-status');if(noteStatus){noteStatus.textContent=persistenceHealthy?'已保存':'保存失败 · 请导出备份';noteStatus.classList.toggle('save-failed',!persistenceHealthy)}
 }
 toggle=function(key,id){if(key==='done')setStatus(id,state.done.includes(id)?'new':'mastered');else baseToggle(key,id)};
 function rubric(q){return q.rubric?.length?q.rubric:[`直接回答“${displayTitle(q)}”，明确结论与适用条件`,'说明判断依据和具体步骤','用验证方式、风险边界或反例收束']}
 renderDetail=function(){baseDetail();const q=current;
  $('.detail-actions').insertAdjacentHTML('beforeend',`<button id="needs-review" class="review-button ${state.needsReview.includes(q.id)?'is-review':''}" aria-pressed="${state.needsReview.includes(q.id)}">${icon('clock')}${state.needsReview.includes(q.id)?'需复习 · 点击撤销':'标记需复习'}</button><button id="question-feedback" class="text-button">题目纠错 / 反馈</button>`);
  $('#needs-review').onclick=()=>setStatus(q.id,state.needsReview.includes(q.id)?'new':'review');
  $('#done').onclick=()=>setStatus(q.id,state.done.includes(q.id)?'new':'mastered');
  $('#detail-save').onclick=()=>{baseToggle('saved',q.id);syncDetailActions()};
  $('#question-feedback').onclick=()=>feedback(q);
  if(detailTab==='answer'){
   const my=typeof state.notes[q.id]==='string'?state.notes[q.id]:'';
   const panel=$('.detail-main [role="tabpanel"]'),reference=panel.innerHTML;
   panel.innerHTML=`<div class="answer-comparison"><section class="my-answer"><h3>我的回答</h3><p>${my?esc(my):'尚未填写回答，可以返回作答页补充。'}</p><button class="text-button" data-tab="exercise">继续编辑回答</button></section><section class="reference-answer">${reference}</section></div>`;
   $('.detail-main [role="tabpanel"]').insertAdjacentHTML('beforeend',`${q.caseStudy?`<section class="case-study"><h3>具体场景与示例</h3><p>${esc(q.caseStudy)}</p>${q.code?`<pre><code>${esc(q.code)}</code></pre>`:''}</section>`:''}<section class="self-check"><h3>回答要点自查</h3><p>自行对照勾选，不自动评分，也不自动标记掌握。</p>${rubric(q).map((r,i)=>`<label><input type="checkbox" data-check="${i}" ${(state.checks[q.id]||[]).includes(i)?'checked':''}>${esc(r)}</label>`).join('')}<span id="check-status" role="status"></span></section>`);
  }
  const submit=$('#submit-answer');if(submit)submit.onclick=()=>{
   if(!String(state.notes[q.id]||'').trim()){toast('先写下你的回答，或选择直接查看解析');$('#note').focus();return;}
   const saved=recordAnswer(q);render(false);if(!simulation){detailTab='answer';renderDetail();if(!saved)toast('保存失败，当前回答仍在窗口中，请导出备份')}
   else{const index=detailList.indexOf(q.id);if(index<detailList.length-1){detailTab='exercise';openQuestion(detailList[index+1],false)}else finishSimulation()}
  };
  if(simulation){
   $('.detail-tabs').hidden=true;$('#article .detail-side details').hidden=true;
   const hint=$('#article .exercise-box')?.parentElement.querySelector('details');if(hint)hint.hidden=true;
   const direct=$('#article [data-tab="answer"]');if(direct)direct.hidden=true;
   if(submit)submit.textContent=detailList.indexOf(q.id)===detailList.length-1?'提交本题并结束':'提交本题，进入下一题';
   $('#article .detail-side').insertAdjacentHTML('afterbegin',`<section class="simulation-status"><b>离线模拟面试</b><p id="simulation-clock"></p><button id="finish-simulation">结束并复盘</button></section>`);
   updateClock();$('#finish-simulation').onclick=finishSimulation;
  }
 };
 openQuestion=function(id,newList=true){
  const q=qById.get(id);if(!q)return;
  if(!simulation){state.lastSession={id,page,stage,level,query,scroll:window.scrollY};persist();}
  baseOpen(id,newList);
 };
 function resume(){
  const last=state.lastSession,q=qById.get(last?.id);if(!q)return;
  if(q.kind==='general'){switchView('general');generalCategory=q.subId}
  else setIndustry(q.industry,q.subId);
  stage=last.stage;level=last.level;query=last.query||'';$('#search').value=query;
  if(!filtered().some(x=>x.id===q.id)){stage=level='all';query='';$('#search').value='';}
  page=Math.floor(filtered().findIndex(x=>x.id===q.id)/pageSize)+1;render(false);window.scrollTo(0,last.scroll||0);openQuestion(q.id);
 }
 function download(name,body,type='application/json'){
  const url=URL.createObjectURL(new Blob([body],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }
 $('#export').onclick=()=>{download('JobPrep-学习备份-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({version:4,exportedAt:new Date().toISOString(),...state},null,2));toast('学习记录备份已导出')};
 function modal(id,title,body){
  let d=$('#'+id);if(d)d.remove();document.body.insertAdjacentHTML('beforeend',`<dialog id="${id}" class="utility-dialog"><div class="modal-title"><h2>${title}</h2><button class="icon-button" data-close-dialog="${id}" aria-label="关闭">${icon('close')}</button></div><div class="utility-body">${body}</div></dialog>`);d=$('#'+id);d.showModal();return d;
 }
 let pendingImport=null;
 function previewImport(raw){
  const checked=core.clean(raw,validIds);pendingImport=checked.data;
  const count=new Set([...pendingImport.done,...pendingImport.saved,...pendingImport.needsReview,...Object.keys(pendingImport.notes)]).size;
  modal('backup-preview','预览备份恢复',`<p>有效学习题目 <b>${count}</b> 道；回答 ${Object.keys(pendingImport.notes).length} 条；收藏 ${pendingImport.saved.length} 道；掌握 ${pendingImport.done.length} 道；忽略未知编号 ${checked.unknown} 个。</p><p>合并会保留现有记录。相同题目的回答、复习时间和自查项以导入内容为准；收藏取并集，导入的掌握或需复习状态优先。</p><p>导入前建议先导出当前记录备份。导入不会删除其他题目的回答。</p><div class="utility-actions"><button id="backup-before-import">先备份当前记录</button><button id="confirm-import" class="primary">合并并恢复</button></div><p id="import-status" role="status"></p>`);
  $('#backup-before-import').onclick=()=>$('#export').click();
  $('#confirm-import').onclick=()=>{
   const previous=state;state=core.merge(state,pendingImport);
   if(state.target&&!INDUSTRIES.some(i=>i.id===state.target.industry&&(state.target.subrole==='all'||i.subroles.some(r=>r.id===state.target.subrole))))state.target=null;
   if(!persist()){state=previous;$('#import-status').textContent='保存失败，尚未应用导入，请先导出备份。';return;}
   pendingImport=null;$('#backup-preview').close();applyReading();if(state.target)setIndustry(state.target.industry,state.target.subrole);else chooseDirection();toast('备份已合并，原有其他题目记录保留');
  };
 }
 $('#import-open').onclick=()=>{$('#import-file').value='';$('#import-file').click()};
 $('#import-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>20*1024*1024){toast('备份超过 20MB，无法导入');return;}try{previewImport(JSON.parse(await file.text()))}catch(error){toast('导入失败：'+error.message)}};
 function applyReading(){
  document.documentElement.dataset.readingSize=String(state.settings.fontSize);
  document.documentElement.classList.toggle('reading-comfortable',state.settings.comfortable);
 }
 $('#settings-open').onclick=()=>{
  modal('reading-settings','阅读设置',`<p>只影响题目阅读，不改变窗口布局。</p><div class="scope-tabs">${[[15,'紧凑'],[17,'标准'],[19,'大字']].map(([n,label])=>`<button data-font-size="${n}" class="chip ${state.settings.fontSize===n?'active':''}" aria-pressed="${state.settings.fontSize===n}">${label}</button>`).join('')}</div><label class="setting-label"><input type="checkbox" id="comfortable-reading" ${state.settings.comfortable?'checked':''}>加宽行距，适合长时间阅读</label><p id="settings-status" role="status"></p>`);
  $('#comfortable-reading').onchange=e=>{state.settings.comfortable=e.target.checked;applyReading();$('#settings-status').textContent=persist()?'设置已保存':'保存失败，仅本次窗口生效'};
 };
 function feedback(q){
  modal('feedback-dialog','题目纠错',`<p>题目编号：<b>${esc(q.id)}</b></p><p>${esc(displayTitle(q))}</p><textarea id="feedback-text" aria-label="纠错说明" placeholder="请描述问题、建议修改内容和判断依据。"></textarea><p>生成本地 Markdown 文件后，可提交到项目 Issues；不会自动发送。</p><button id="feedback-export" class="primary">导出反馈文件</button>`);
  $('#feedback-export').onclick=()=>{const text=$('#feedback-text').value.trim();if(!text){toast('请先填写纠错说明');return;}download('JobPrep-纠错-'+q.id+'.md',`# JobPrep 题目纠错\n\n题目编号：${q.id}\n岗位：${q.subrole}\n题干：${displayTitle(q)}\n\n## 问题与建议\n\n${text}\n`,'text/markdown');toast('反馈文件已导出')};
 }
 mapView=function(list){return INDUSTRIES.filter(i=>industry==='all'||industry===i.id).flatMap(i=>i.subroles.filter(r=>list.some(q=>q.subId===r.id)).map(r=>{
  const own=list.filter(q=>q.subId===r.id),topics=[...new Set(own.map(q=>q.topic||q.type))];
  return `<article class="path-card"><span class="tag">${esc(i.name)}</span><h3>${esc(r.name)}</h3><p>${topics.slice(0,4).map(esc).join(' / ')}</p><div class="path-phases">${['基础','进阶','挑战'].map((phase,n)=>{const part=own.filter(q=>q.level===phase),done=part.filter(q=>state.done.includes(q.id)).length;return `<button data-learning-phase="${phase}" data-phase-industry="${i.id}" data-phase-role="${r.id}" ${part.length?'':'disabled'}><span>${n+1}. ${phase}</span><small>${done} / ${part.length} 已掌握</small></button>`}).join('')}</div><button data-path="${r.id}" data-path-industry="${i.id}">查看岗位全部题目 ${icon('right')}</button></article>`;
 })).join('')||empty()};
 function simulationSetup(){
  const pool=filtered();if(!pool.length){toast('当前范围没有可练习题目');return;}
  modal('simulation-setup','离线模拟面试',`<p>从当前岗位或通用问答的筛选结果中随机抽题，共 ${pool.length} 道可选。过程隐藏解析，结束后逐题复盘，不自动评分。</p><fieldset><legend>题目数量</legend>${[5,10,20].map(n=>`<label><input type="radio" name="sim-count" value="${n}" ${n===5?'checked':''}>${Math.min(n,pool.length)} 题</label>`).join('')}</fieldset><fieldset><legend>总时长</legend>${[10,20,30].map(n=>`<label><input type="radio" name="sim-minutes" value="${n}" ${n===10?'checked':''}>${n} 分钟</label>`).join('')}</fieldset><p>文字回答会保存在本机；计时结束或提前结束后均可复盘。关闭答题窗将结束本次模拟。</p><button id="simulation-start" class="primary">开始模拟</button>`);
  $('#simulation-start').onclick=()=>{
   const count=Math.min(Number(document.querySelector('[name="sim-count"]:checked').value),pool.length),minutes=Number(document.querySelector('[name="sim-minutes"]:checked').value);
   const chosen=pool.slice();for(let i=chosen.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[chosen[i],chosen[j]]=[chosen[j],chosen[i]];}
   simulation={ids:chosen.slice(0,count).map(q=>q.id),answered:new Set(),startedAt:now(),endsAt:now()+minutes*60000};
   $('#simulation-setup').close();detailList=simulation.ids.slice();detailTab='exercise';openQuestion(detailList[0],false);simTimer=setInterval(updateClock,1000);
  };
 }
 function updateClock(){if(!simulation)return;const remaining=Math.max(0,Math.ceil((simulation.endsAt-now())/1000)),el=$('#simulation-clock');if(el)el.textContent=`剩余 ${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')} · 已提交 ${simulation.answered.size} / ${simulation.ids.length}`;if(!remaining)finishSimulation()}
 function finishSimulation(){
  if(!simulation)return;const finished=simulation;lastSimulation=finished;simulation=null;clearInterval(simTimer);simTimer=null;
  const note=$('#note');if(note&&current){state.notes[current.id]=note.value;persist();}
  $('#detail').close();render(false);
  modal('simulation-result','模拟面试复盘',`<p>本次 ${finished.ids.length} 题，已提交 ${finished.answered.size} 题，用时 ${Math.max(1,Math.round((now()-finished.startedAt)/60000))} 分钟。自评掌握程度，未提交的草稿也保留在本机。</p><div class="simulation-results">${finished.ids.map(id=>{const q=qById.get(id);return `<button data-sim-review="${id}"><span>${esc(displayTitle(q))}</span><small>${finished.answered.has(id)?'已提交':'未提交'} · ${state.done.includes(id)?'已掌握':state.needsReview.includes(id)?'需复习':'未学习'}</small></button>`}).join('')}</div>`);
 }
 const closeButton=$('#close');closeButton.onclick=()=>{if(simulation)finishSimulation();else $('#detail').close()};
 $('#detail').addEventListener('cancel',e=>{if(simulation){e.preventDefault();finishSimulation()}});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateClock()});
 document.addEventListener('change',e=>{if(e.target.dataset.check!==undefined){
  const index=Number(e.target.dataset.check),items=new Set(state.checks[current.id]||[]);if(e.target.checked)items.add(index);else items.delete(index);state.checks[current.id]=[...items];$('#check-status').textContent=persist()?'自查已保存':'自查保存失败，请导出备份';
 }});
 document.addEventListener('click',e=>{if(e.target.closest('[data-subrole]'))routeLevel='all'},true);
 document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&$('.library').hidden&&!document.querySelector('dialog[open]')){e.preventDefault();openDirectory()}},true);
 document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.closeDialog)$('#'+b.dataset.closeDialog).close();
  if(b.dataset.learningScope){if(view==='saved')savedScope=b.dataset.learningScope;else reviewScope=b.dataset.learningScope;page=1;render()}
  if(b.dataset.reviewMode){reviewMode=b.dataset.reviewMode;page=1;render()}
  if(b.id==='resume-learning')resume();
  if(b.id==='simulation-open')simulationSetup();
  if(b.id==='clear-route'){routeLevel='all';render()}
  if(b.dataset.fontSize){state.settings.fontSize=Number(b.dataset.fontSize);applyReading();$('#settings-status').textContent=persist()?'设置已保存':'保存失败，仅本次窗口生效';document.querySelectorAll('[data-font-size]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))})}
  if(b.dataset.learningPhase){setIndustry(b.dataset.phaseIndustry,b.dataset.phaseRole);routeLevel=b.dataset.learningPhase;render()}
  if(b.dataset.simReview){detailTab='answer';detailList=lastSimulation.ids.slice();openQuestion(b.dataset.simReview,false)}
 });
 applyReading();render(false);
 // A small public surface allows backup validation and deterministic integration tests.
 window.JobPrepFeatures={previewImport,finishSimulation,get simulation(){return simulation},setStatus};
})();
