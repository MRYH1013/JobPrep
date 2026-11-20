import json,re
from pathlib import Path
from urllib.parse import urlsplit,urlunsplit,parse_qsl,urlencode
from collections import Counter
root=Path(__file__).resolve().parents[1]
base=root/'research'
data=json.loads((base/'harvest.json').read_text(encoding='utf-8'))
tracking={'bc','sourceSSR','urlSource','weFlow','ref','source','lm','pt','format','trk','msockid','swcfpc','authuser','wt.mc_id','mons_sel_locale'}
def canonical(url):
 u=urlsplit(url);host=u.netloc.lower().removeprefix('www.');path=u.path.rstrip('/') or '/'
 query=[(k,v) for k,v in parse_qsl(u.query,keep_blank_values=True) if k not in tracking and not k.lower().startswith('utm_')]
 return urlunsplit(('https',host,path,urlencode(sorted(query)),''))
merged={};aliases={}
for s in data['sources']:
 key=canonical(s['url']);s=dict(s)
 if key not in merged:
  s['canonicalUrl']=key;s['roleIds']=[];merged[key]=s
 else:
  old=merged[key]
  if s.get('reviewStatus')=='页面可访问，待内容评审':
   old['reviewStatus']=s['reviewStatus'];old['scope']=s.get('scope','');old['url']=s['url']
  if s.get('openIssue'):old['openIssue']=s['openIssue']
 aliases[s['id']]=merged[key]['id']
sources={s['id']:s for s in merged.values()}
checks={}
for check in data['pageChecks']:
 key=canonical(check['url']);checks.setdefault(key,[]).append(check)
 for s in sources.values():
  if s['canonicalUrl']==key:
   s['pageChecks']=checks[key]
   if any(c['status']=='页面可访问，待内容评审' for c in checks[key]):s['reviewStatus']='页面可访问，待内容评审'
roles=[]
for r in data['roles']:
 r=dict(r);r['sourceIds']=list(dict.fromkeys(aliases[i] for i in r['sourceIds']));r['targetQuestions']=42;r['questionDraftsProducedByThisSearch']=0;r['status']='首轮检索完成；来源与问题仍待内容评审'
 for sid in r['sourceIds']:sources[sid]['roleIds'].append(r['id'])
 roles.append(r)
assert len(roles)==120 and len({r['id'] for r in roles})==120
assert len({r['industry'] for r in roles})==20
assert all(len(r['sourceIds'])>0 for r in roles)
source_list=list(sources.values());counts=Counter(s['type'] for s in source_list)
summary={'retrievedAt':data['retrievedAt'],'industries':20,'roles':len(roles),'queries':data['searchQueries'],'uniqueCandidateSources':len(source_list),'sourceTypes':dict(counts),'pageOpenAttempts':len(data['pageChecks']),'uniquePagesAttempted':len(checks),'accessiblePages':sum(any(c['status']=='页面可访问，待内容评审' for c in cs) for cs in checks.values()),'questionsAdded':0,'currentApplicationQuestions':252,'targetApplicationQuestions':5040}
(base/'roles.json').write_text(json.dumps(roles,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(base/'sources.json').write_text(json.dumps(source_list,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(base/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Refresh batch snapshots so they use normalized source IDs too.
for p in base.glob('roles-*.json'):
 first,last=map(int,re.findall(r'\d+',p.stem));p.write_text(json.dumps(roles[first-1:last],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
industry_dir=base/'industries';industry_dir.mkdir(exist_ok=True)
index=['# JobPrep 扩充检索资料库','',f"检索日期：{summary['retrievedAt']}。已对 **20 个方向、120 个细分岗位** 完成首轮搜索，共执行 **{summary['queries']} 条查询**。",'',f"清理跟踪参数并合并重复后，保留 **{len(source_list)} 个候选链接**。这是资料线索数量，不是题目数量，也不是已核验资料数量。",'', '## 资料状态','',f"- 页面打开检查 {summary['pageOpenAttempts']} 次，覆盖 {summary['uniquePagesAttempted']} 个不同页面；其中 {summary['accessiblePages']} 个页面可访问，内容仍待进一步评审。",'- 来源类型主要按域名与页面用途初筛；专业机构域名不自动保证内容与该岗位完全匹配。','- 2026 为首轮搜索关键词，不是经过核实的发布时间过滤；发布时间未确认的链接不会标成近一年真题。','- 社区面经是用户自述；转载、商业题库与其他站点单独保留为待核验线索。','- 海外认证、伦理或监管资料需要标明适用范围，不直接当作中国岗位要求。','- 本轮新增完成题目：0。应用现有 252 道；每岗位 42 道、总量 5,040 道的内容编写目标尚未完成。','', '## 按职业方向查看','', '| 职业方向 | 岗位数 | 候选链接（方向内去重） |','|---|---:|---:|']
for industry in sorted({r['industry'] for r in roles},key=lambda name:min(r['id'] for r in roles if r['industry']==name)):
 own=[r for r in roles if r['industry']==industry];slug=own[0]['id'].split('-')[0];filename=slug+'.md';all_ids=set(i for r in own for i in r['sourceIds'])
 index.append(f'| [{industry}](industries/{filename}) | {len(own)} | {len(all_ids)} |')
 lines=['# '+industry,'','本文件为岗位资料候选目录，不代表题库已完成。每个岗位目标至少 42 道独立问题。']
 for r in own:
  lines+=['','## '+r['role'],'',f"英文检索词：{r['english']}。候选来源 {len(r['sourceIds'])} 个；本次尚未产生完成题目。",'', '检索记录：']
  lines += ['- `'+q+'`' for q in r.get('queries',[])+r.get('supplementalQueries',[])]
  candidates=[sources[i] for i in r['sourceIds']]
  candidates.sort(key=lambda s:(s.get('openIssue') is not None,s.get('reviewStatus')!='页面可访问，待内容评审',s['type']!='招聘指南',s['type']!='官方/专业主题资料',s['type']!='社区/面经线索'))
  lines+=['','部分候选入口（完整列表见 sources.json，按角色 ID 关联；仍需核对相关性）：','']
  for s in candidates[:8]:
   title=s['title'].replace('|','／').replace('\n',' ')
   lines.append(f"- [{title}]({s['url']}) — {s['type']}；{s.get('reviewStatus','待核验')}。")
   if s.get('scope'):lines.append('  - 使用范围：'+s['scope'])
  if r['id'] in ['10-1','10-4']:lines+=['','范围提醒：候选可能涉及 Amazon、TikTok 等海外平台，不能代替国内平台规则，后续仍需补国内官方来源。']
 (industry_dir/filename).write_text('\n'.join(lines)+'\n',encoding='utf-8')
index+=['','## 机器可读文件','', '- [roles.json](roles.json)：120 个岗位及查询、来源 ID。','- [sources.json](sources.json)：去重后的候选目录与状态。','- [summary.json](summary.json)：本轮数量与边界。','- [harvest.json](harvest.json)：规范化前的元数据与页面打开记录；不保存第三方文章正文。','','可运行 `python scripts/research-index.py` 重建目录。','', '## 下一阶段的内容门槛','', '逐岗位完成：筛选相关来源 → 建立知识专题 → 撰写独立题目与解析 → 去重与事实校对 → 标明版本/地区/证据等级 → 入库检查。共同概念、追问和同义改写不得反复计数。']
(base/'README.md').write_text('\n'.join(index)+'\n',encoding='utf-8')
print(json.dumps(summary,ensure_ascii=True))
