(function(root){
 'use strict';
 const record=v=>v&&typeof v==='object'&&!Array.isArray(v);
 const safeKey=k=>!['__proto__','constructor','prototype'].includes(k);
 function clean(input,validIds){
  if(!record(input))throw Error('备份内容必须是 JSON 对象');
  if(input.version!==undefined&&(!Number.isInteger(input.version)||input.version<1||input.version>4))throw Error('不支持的备份版本');
  const output={saved:[],done:[],needsReview:[],notes:{},attempts:{},checks:{}};
  const unknown=new Set();
  for(const name of ['saved','done','needsReview']){
   if(input[name]!==undefined&&!Array.isArray(input[name]))throw Error(name+' 格式错误');
   if((input[name]||[]).length>20000)throw Error('记录数量超出限制');
   for(const id of input[name]||[]){if(typeof id!=='string')throw Error('题目编号格式错误');if(validIds.has(id))output[name].push(id);else unknown.add(id)}
   output[name]=[...new Set(output[name])];
  }
  for(const name of ['notes','attempts','checks']){
   if(input[name]!==undefined&&!record(input[name]))throw Error(name+' 格式错误');
   for(const [id,value] of Object.entries(input[name]||{})){
    if(!safeKey(id))throw Error('备份包含无效字段');
    if(!validIds.has(id)){unknown.add(id);continue;}
    if(name==='notes'){if(typeof value!=='string'||value.length>100000)throw Error('回答格式错误或过长');output.notes[id]=value}
    if(name==='attempts'){
     if(!record(value)||!Number.isFinite(value.answeredAt)||value.answeredAt<0||!Number.isFinite(value.dueAt)||value.dueAt<0)throw Error('复习时间格式错误');
     output.attempts[id]={answeredAt:value.answeredAt,dueAt:value.dueAt};
    }
    if(name==='checks'){if(!Array.isArray(value)||value.length>20||value.some(x=>!Number.isInteger(x)||x<0||x>19))throw Error('自查记录格式错误');output.checks[id]=[...new Set(value)]}
   }
  }
  if(record(input.target)&&typeof input.target.industry==='string'&&typeof input.target.subrole==='string')output.target={industry:input.target.industry,subrole:input.target.subrole};
  if(record(input.lastSession)&&validIds.has(input.lastSession.id)){
   const x=input.lastSession;
   output.lastSession={id:x.id,page:Number.isInteger(x.page)&&x.page>0?Math.min(x.page,1000):1,stage:['all','0','1','2','3'].includes(x.stage)?x.stage:'all',level:['all','基础','进阶','挑战'].includes(x.level)?x.level:'all',query:typeof x.query==='string'?x.query.slice(0,200):'',scroll:Number.isFinite(x.scroll)?Math.max(0,x.scroll):0};
  }
  output.settings={fontSize:[15,17,19].includes(input.settings?.fontSize)?input.settings.fontSize:17,comfortable:input.settings?.comfortable!==false};
  output.needsReview=output.needsReview.filter(id=>!output.done.includes(id));
  return {data:output,unknown:unknown.size};
 }
 function merge(current,imported){
  const result={...current,...imported,notes:{...current.notes,...imported.notes},attempts:{...current.attempts,...imported.attempts},checks:{...current.checks,...imported.checks}};
  result.saved=[...new Set([...(current.saved||[]),...imported.saved])];
  result.done=[...new Set([...(current.done||[]).filter(id=>!imported.needsReview.includes(id)),...imported.done])];
  result.needsReview=[...new Set([...(current.needsReview||[]),...imported.needsReview])].filter(id=>!result.done.includes(id));
  if(!imported.target)result.target=current.target;
  if(!imported.lastSession)result.lastSession=current.lastSession;
  return result;
 }
 function status(s,id){return s.done.includes(id)?'mastered':s.needsReview.includes(id)?'review':'new'}
 function reviewMatch(s,q,mode,now=Date.now()){
  if(mode==='due')return Boolean(s.attempts[q.id]?.dueAt&&s.attempts[q.id].dueAt<=now);
  if(mode==='weak')return s.needsReview.includes(q.id);
  if(mode==='saved')return s.saved.includes(q.id);
  return !s.done.includes(q.id);
 }
 const api={clean,merge,status,reviewMatch};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.JobPrepLearning=api;
})(typeof window==='object'?window:globalThis);
