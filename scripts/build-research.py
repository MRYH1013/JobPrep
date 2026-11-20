import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
roles=json.loads((root/'research/roles.json').read_text(encoding='utf-8'))
sources=json.loads((root/'research/sources.json').read_text(encoding='utf-8'))
summary=json.loads((root/'research/summary.json').read_text(encoding='utf-8'))
role_fields=['id','industry','role','english','sourceIds']
source_fields=['id','title','url','host','type','retrieved','reviewStatus','publicationDate','dateStatus','roleIds','scope','openIssue']
data={'summary':summary,'roles':[{k:r[k] for k in role_fields} for r in roles],'sources':[{k:s[k] for k in source_fields if k in s} for s in sources]}
assert len({r['id'] for r in data['roles']})==120
assert len({r['industry'] for r in data['roles']})==20
ids={s['id'] for s in data['sources']}
assert all(set(r['sourceIds'])<=ids for r in data['roles'])
(root/'research-data.js').write_text('window.RESEARCH_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
print(f"Built research-data.js: {len(roles)} roles, {len(sources)} sources")
