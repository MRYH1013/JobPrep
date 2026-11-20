import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source_refs=[['Harvard MCS · Interviewing','https://careerservices.fas.harvard.edu/resources/interviewing/'],['Yale OCS · The Behavioral Interview','https://ocs.yale.edu/channels/the-behavioral-interview/']]
questions=[];categories=[]
for line in (root/'content/general.txt').read_text(encoding='utf-8-sig').splitlines():
 if line.startswith('## '):
  category=line[3:];key='hr-category-'+str(len(categories)+1).zfill(2);categories.append({'id':key,'name':category,'count':0});continue
 if not line or line.startswith('#'):continue
 parts=line.split('|');assert len(parts)==7,(len(parts),line)
 title,logic,framework,example,reason,pitfall,follow=parts
 number=len(questions)+1;categories[-1]['count']+=1
 assert len(example)>=35 and len(logic)>=15 and len(reason)>=20,title
 questions.append({'id':'general-'+str(number).zfill(3),'kind':'general','industry':'general','role':'通用问答','subrole':category,'subId':key,'topic':category,'title':title,'hrLogic':logic,'knowledge':logic,'thinking':framework,'answer':example,'rationale':reason,'pitfall':pitfall,'follow':follow,'level':'进阶' if len(categories) in [4,5,6,7,9] else '基础','stages':[0,1,2,3],'type':'HR沟通','sources':source_refs,'source':source_refs[0],'reviewed':'2026-11-19','evidence':'编辑原创情景解析 · 通用面试方法参考','exercise':'请结合自己的真实经历、条件和偏好回答。替换【】中的信息，说明结论、依据和边界；没有的经历或报价不要编造。','number':number})
assert len(questions)==100
assert len(categories)==10 and all(c['count']==10 for c in categories)
for field in ['title','answer','hrLogic','rationale']:
 assert len({q[field] for q in questions})==100,field
for q in questions:
 for field in ('sources','source'):
  q.pop(field,None)
payload='window.GENERAL_CATEGORIES = '+json.dumps(categories,ensure_ascii=False,indent=2)+';\nwindow.GENERAL_QUESTIONS = '+json.dumps(questions,ensure_ascii=False,indent=2)+';\nwindow.PROFESSIONAL_QUESTIONS = window.QUESTIONS.slice();\nwindow.QUESTIONS.push(...window.GENERAL_QUESTIONS);\n'
(root/'general-data.js').write_text(payload,encoding='utf-8')
print('Built 100 complete HR Q&A entries in 10 categories; all intentions, examples and rationales distinct.')
