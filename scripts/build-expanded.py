import json,re
from pathlib import Path
from collections import Counter
root=Path(__file__).resolve().parents[1]
roles=json.loads((root/'research/roles.json').read_text(encoding='utf-8'))
source_records=json.loads((root/'research/sources.json').read_text(encoding='utf-8'))
source_by_id={s['id']:s for s in source_records}
role_by_id={r['id']:r for r in roles}
legacy=json.loads((root/'content/legacy-questions.json').read_text(encoding='utf-8'))
sources={s['url']:s for s in json.loads((root/'content/legacy-sources.json').read_text(encoding='utf-8'))}
profiles={}
for file in sorted((root/'content/expanded').glob('*.txt')):
 current=None
 for line in file.read_text(encoding='utf-8-sig').splitlines():
  if line.startswith('## '):
   current,name=line[3:].split('|');assert current not in profiles;profiles[current]=[]
   assert role_by_id[current]['role']==name,(current,name)
  elif line and not line.startswith('#'):
   fields=line.split('|');assert len(fields)==7,(file,line)
   assert len(fields[0])>=2 and all(len(s)>=6 for s in fields[1:]),line
   profiles[current].append(fields)
assert len(profiles)==120 and all(len(v)==7 for v in profiles.values())
objectives=['原理判断','实施设计','异常排查','效果验证','方案取舍','协作交付']
tasks=['原理','实施','排查','验证','取舍','协作']
followups=['如果适用前提变化，你会先重新确认哪条结论？','第一步迟迟无法完成时，你会怎样调整后续安排？','如果暂时找不到根因，如何避免继续扩大影响？','哪种反例会让你撤回当前的达标判断？','在资源减半时，你会保留什么并明确放弃什么？','接手方理解不同，你会如何核对并留下共同记录？']
def references(r):
 candidates=[source_by_id[i] for i in r['sourceIds'] if i in source_by_id]
 candidates=[s for s in candidates if not s.get('openIssue') and s['type'] in ['官方/专业主题资料','招聘指南']]
 candidates.sort(key=lambda s:(s.get('reviewStatus')!='页面可访问，待内容评审',s['type']!='官方/专业主题资料',len(s['url'])))
 selected=candidates[:2]
 if not selected:
  selected=[source_by_id[i] for i in r['sourceIds'][:1]]
 refs=[]
 for s in selected:
  title=s['title'];url=s['url'];refs.append([title,url])
  sources.setdefault(url,{'title':title,'url':url,'retrieved':'2026-11-19','kind':s['type'],'scope':'岗位主题背景候选；并非逐题真题或逐句答案依据，内容尚待领域评审。'})
 return refs
questions=[]
for rid in sorted(profiles):
 r=role_by_id[rid];refs=references(r)
 for topic_index,(topic,p,steps,risk,check,tradeoff,handoff) in enumerate(profiles[rid]):
  answers=[f'核心原理是：{p}。实际工作中先明确目标和适用条件，再{steps}。需要认识到的风险或限制是：{risk}。',f'实施前先确认目标、输入和职责范围。执行要点：{steps}。验收方式：{check}。协作要求：{handoff}。应同时说明必要前提、过程记录和异常入口，不把流程走完直接当作任务成功。',f'优先关注的风险线索是：{risk}。把现象、输入、近期变化和影响范围分别记录，再{check}。处置可参考以下路径：{steps}；重大或超出能力的情况按授权流程升级。',f'验证重点是：{check}。这应能支持对“{p}”的判断；同时需要检查以下风险或限制：{risk}。保留验证条件和未能确认的范围，避免只报一个好看的平均结果。',f'取舍重点是：{tradeoff}。先比较可行方案对目标和关键约束的影响，再通过“{check}”获取证据。不能忽略的边界是：{risk}；重要选择需由有相应权限的人确认。',f'协作交付重点是：{handoff}。同时写清实施要求（{steps}）、验证方式（{check}）和风险边界（{risk}）。接手者应知道下一步、异常入口和需要再次确认的事项。']
  principles=[p,steps,risk,check,tradeoff,handoff]
  prompts=[f'{topic}：为什么说“{p}”？',f'{topic}：如何落实“{steps}”这项实施要求？',f'{topic}：针对“{risk}”，如何排查或控制影响？',f'{topic}：怎样设计证据和检查以落实“{check}”？',f'{topic}：面对“{tradeoff}”，你会怎样选择方案？',f'{topic}：怎样落实“{handoff}”，避免协作遗漏？']
  for mode in range(6):
   number=topic_index*6+mode+1
   questions.append({'id':f'career-{rid}-{number:02d}','industry':'career-'+rid[:2],'role':r['industry'],'subrole':r['role'],'subId':rid,'topic':topic,'title':f"{r['role']}｜{prompts[mode]}",'knowledge':principles[mode]+'。','answer':answers[mode],'thinking':f'先明确{topic}的任务目标和适用条件 → 说明{objectives[mode]}的判断依据 → 结合岗位事实展开 → 用证据和边界收束。','pitfall':risk+'。不要只使用概念或通用口号，应解释其在本岗位中的具体影响。','follow':f'{topic}：{followups[mode]}','level':['基础','进阶','挑战','进阶','挑战','进阶'][mode],'stages':[[0,1],[0,1,2],[1,2,3],[1,2],[2,3],[1,2,3]][mode],'type':objectives[mode],'sources':refs,'source':refs[0],'reviewed':'2026-11-20','evidence':'编辑原创岗位能力任务 · 非企业真题 · 待领域评审','exercise':f"围绕{r['role']}的一项真实工作，说明{topic}的目标、条件、行动、验证和协作边界。专业资格、法规和安全相关判断须结合当前地区与机构要求。",'topicCase':f'{rid}-{topic_index+1}','objective':objectives[mode],'assessmentPoint':principles[mode],'origin':'competency-task'})
# Keep all 252 existing IDs and answers, replacing corresponding new task slots.
legacy_role_map={'game':{'unity':'04-1','unreal':'04-2','game-design':'04-3','level':'04-4','art':'04-5','steam':'04-6'},'sales':{'retail':'09-1','b2b':'09-2','ecommerce':'10-1','channel':'09-3','customer':'09-5','store':'20-6'},'design':{'ui':'05-1','ux':'05-2','visual':'05-3','brand':'05-4','motion':'05-5','service':'06-1'},'psychology':{'research':'17-1','measurement':'17-2','io':'17-3','education':'17-4','behavior':'17-5','ethics':'17-6'}}
legacy_groups={}
for old in legacy:
 rid='01-1' if old['industry']=='frontend' else '01-2' if old['industry']=='backend' else legacy_role_map[old['industry']][old['subId']]
 legacy_groups.setdefault(rid,[]).append(old)
for rid,olds in legacy_groups.items():
 positions=[i for i,q in enumerate(questions) if q['subId']==rid]
 chosen=positions if len(olds)==42 else positions[::6]
 assert len(chosen)==len(olds),(rid,len(chosen),len(olds))
 for position,old in zip(chosen,olds):
  q=dict(old);r=role_by_id[rid]
  q.update(industry='career-'+rid[:2],role=r['industry'],subrole=r['role'],subId=rid,origin='legacy-curated',objective='原有精选题')
  questions[position]=q
refined={}
for filename in ['refined-frontend.txt','refined-backend.txt']:
 for line in (root/'content'/filename).read_text(encoding='utf-8').splitlines():
  if not line or line.startswith('#'):continue
  parts=line.split('|');assert len(parts)==4,(filename,line)
  ident,scenario,example,criteria=parts
  assert ident not in refined and len(example)>=60
  refined[ident]=(scenario,example,criteria.split(';'))
assert len(refined)==84
code_examples=json.loads((root/'content/refined-code.json').read_text(encoding='utf-8'))
for q in questions:
 if q['id'] in refined:
  scenario,example,criteria=refined[q['id']]
  q.update(answer=q['answer']+'\n展开示例：'+example,exercise=scenario,caseStudy=scenario,rubric=criteria,editorialRevision='0.6.0 · 场景与自查增强 · 待专业复核')
for q in questions:
 if q['id'] in code_examples:q['code']=code_examples[q['id']]
counts=Counter(q['subId'] for q in questions)
assert len(questions)==5040 and len(counts)==120 and all(n==42 for n in counts.values())
assert len({q['id'] for q in questions})==5040
assert len({q['title'] for q in questions})==5040
assert len({q['answer'] for q in questions})==5040
assert set(q['id'] for q in legacy)<=set(q['id'] for q in questions)
assert all(q['answer'] and q['thinking'] and q['pitfall'] and q['follow'] and q['sources'] for q in questions)
configs={'01':('code','technology'),'02':('brain','technology'),'03':('server','technology'),'04':('game','creative'),'05':('pen','creative'),'06':('grid','business'),'07':('layers','business'),'08':('target','business'),'09':('bag','business'),'10':('bag','business'),'11':('layers','business'),'12':('server','engineering'),'13':('grid','engineering'),'14':('layers','finance'),'15':('heart','human'),'16':('book','human'),'17':('brain','health'),'18':('heart','health'),'19':('pen','creative'),'20':('bag','life')}
industries=[]
for prefix in sorted(configs):
 own=[r for r in roles if r['id'].startswith(prefix+'')];assert len(own)==6
 icon,group=configs[prefix]
 industries.append({'id':'career-'+prefix,'name':own[0]['industry'],'description':'按细分岗位学习专业知识、工作方法与判断边界；每个岗位42道能力练习。','icon':icon,'group':group,'subroles':[{'id':r['id'],'name':r['role'],'count':42} for r in sorted(own,key=lambda r:r['id'])],'count':252})
for q in questions:
 for field in ('sources','source'):
  q.pop(field,None)
payload='window.INDUSTRIES = '+json.dumps(industries,ensure_ascii=False,separators=(',',':'))+';\nwindow.QUESTIONS = '+json.dumps(questions,ensure_ascii=False,separators=(',',':'))+';\n'
(root/'questions.js').write_text(payload,encoding='utf-8')
report={'professionalQuestions':5040,'generalQuestions':100,'totalQuestions':5140,'industries':20,'roles':120,'minimumPerRole':min(counts.values()),'preservedLegacyQuestions':len(legacy),'newCompetencyTasks':sum(q.get('origin')=='competency-task' for q in questions),'sourceLinks':len(sources),'expertReview':'待逐题领域评审','coverage':[{'id':r['id'],'industry':r['industry'],'role':r['role'],'questions':counts[r['id']]} for r in sorted(roles,key=lambda r:r['id'])]}
(root/'content/coverage.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='coverage'},ensure_ascii=True))
