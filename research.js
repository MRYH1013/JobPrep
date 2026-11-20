/* Local research catalogue. Candidate sources are independent of practice questions. */
(() => {
  const data = window.RESEARCH_DATA;
  const root = document.querySelector('#research-workspace');
  const roles = data.roles;
  const sourceById = new Map(data.sources.map(s => [s.id, s]));
  const roleById = new Map(roles.map(r => [r.id, r]));
  const industries = [...new Set(roles.slice().sort((a,b)=>a.id.localeCompare(b.id)).map(r=>r.industry))];
  const types = ['官方/专业主题资料','招聘指南','社区/面经线索','待核验站点'];
  const typeLabels = ['官方／专业','招聘指南','社区／面经','待核验站点'];
  const accessible = s => s.reviewStatus === '页面可访问，待内容评审' && !s.openIssue;
  const safeUrl = value => { try { const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  state.researchSaved = Array.isArray(state.researchSaved) ? state.researchSaved.filter(id=>sourceById.has(id)) : [];
  let selectedIndustry = 'all', mode = 'roles', term = '', sourceType = 'all', onlyAccessible = false, listPage = 1;
  let modalRole = null, modalTerm = '', modalType = 'all', modalAccessible = false, modalPage = 1;
  const perPage = 18;
  const links = Object.fromEntries(roles.map(r=>[r.id,['career-'+r.id.slice(0,2),r.id]]));
  const practiceFor = r => { const match=links[r.id]; return match ? QUESTIONS.filter(q=>q.industry===match[0]&&(match[1]==='all'||q.subId===match[1])) : []; };
  const sourceText = new Map(data.sources.map(s=>[s.id, `${s.title} ${s.host} ${s.type} ${(s.roleIds||[]).map(id=>{const r=roleById.get(id);return r?`${r.role} ${r.industry} ${r.english}`:''}).join(' ')}`.toLowerCase()]));
  const rank = s => s.openIssue ? 9 : accessible(s) ? 0 : s.type==='招聘指南' ? 1 : s.type==='官方/专业主题资料' ? 2 : s.type==='社区/面经线索' ? 3 : 4;
  const sortedSources = data.sources.slice().sort((a,b)=>rank(a)-rank(b)||a.id.localeCompare(b.id));
  const typeButtons = (prefix,selected) => `<button data-${prefix}-type="all" class="${selected==='all'?'active':''}" aria-pressed="${selected==='all'}">全部类型</button>`+types.map((t,i)=>`<button data-${prefix}-type="${esc(t)}" class="${selected===t?'active':''}" aria-pressed="${selected===t}">${typeLabels[i]}</button>`).join('');
  function pagination(count,page,prefix) {
    const max=Math.max(1,Math.ceil(count/perPage));
    if(max===1)return '';
    const numbers=Array.from({length:max},(_,i)=>i+1).filter(n=>n===1||n===max||Math.abs(n-page)<=1);
    return `<button data-${prefix}-page="${page-1}" ${page===1?'disabled':''}>上一页</button>${numbers.map((n,i)=>`${i&&n-numbers[i-1]>1?'<span>…</span>':''}<button data-${prefix}-page="${n}" class="${page===n?'active':''}" ${page===n?'aria-current="page"':''}>${n}</button>`).join('')}<button data-${prefix}-page="${page+1}" ${page===max?'disabled':''}>下一页</button><span>${page} / ${max}</span>`;
  }
  function sourceCard(s) {
    const url=safeUrl(s.url), saved=state.researchSaved.includes(s.id);
    const status=s.openIssue?'访问异常':accessible(s)?'可访问 · 待评审':'待核验';
    return `<article class="r-source"><div class="r-source-top"><span class="r-type">${esc(s.type)}</span><span class="r-status ${accessible(s)?'accessible':''}">${status}</span></div><h3>${url?`<a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(s.title)}</a>`:esc(s.title)}</h3><p class="r-host">${esc(s.host)}</p>${s.scope?`<p class="r-scope">${esc(s.scope)}</p>`:''}<div class="r-source-footer"><span>检索 ${esc(s.retrieved)} · ${s.publicationDate?esc(s.publicationDate):'发布日期待核对'}</span><button class="icon-button ${saved?'saved':''}" data-resource-save="${s.id}" aria-label="${saved?'取消收藏':'收藏资料'} ${esc(s.title)}" aria-pressed="${saved}">${icon('bookmark')}</button></div></article>`;
  }
  function emptyMessage(saved=false) { return `<div class="wide empty">${icon(saved?'bookmark':'search')}<h3>${saved?'还没有匹配的收藏资料':'没有找到匹配内容'}</h3><p>${saved?'在资料卡片上点击收藏按钮，即可保留想继续阅读的内容。':'试试其他关键词，或清除方向、来源类型和可访问筛选。'}</p></div>`; }
  function renderRail() {
    document.querySelector('#research-industries').innerHTML=`<button data-r-industry="all" class="${selectedIndustry==='all'?'active':''}" aria-pressed="${selectedIndustry==='all'}">全部职业方向<span>120</span></button>`+industries.map(name=>`<button data-r-industry="${esc(name)}" class="${selectedIndustry===name?'active':''}" aria-pressed="${selectedIndustry===name}">${esc(name)}<span>${roles.filter(r=>r.industry===name).length}</span></button>`).join('');
  }
  function candidateSources() { return sortedSources.filter(s=>(selectedIndustry==='all'||(s.roleIds||[]).some(id=>roleById.get(id)?.industry===selectedIndustry))&&(sourceType==='all'||s.type===sourceType)&&(!onlyAccessible||accessible(s))&&(!term||sourceText.get(s.id).includes(term))&&(mode!=='saved'||state.researchSaved.includes(s.id))); }
  function renderList(animate=true) {
    renderRail();
    root.querySelectorAll('[data-r-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.rMode===mode);b.setAttribute('aria-pressed',String(b.dataset.rMode===mode));});
    document.querySelector('#research-search').placeholder=mode==='roles'?'搜索岗位、方向，例如：心理测量、Unity':'搜索资料标题、站点或关联岗位…';
    document.querySelector('#research-types').hidden=mode==='roles';
    document.querySelector('#research-types').innerHTML=typeButtons('r',sourceType)+`<button class="r-accessible ${onlyAccessible?'active':''}" data-r-accessible aria-pressed="${onlyAccessible}">${icon('check')}仅看可访问</button>`;
    document.querySelector('#research-title').textContent=selectedIndustry==='all'?(mode==='roles'?'找到你的职业资料入口':mode==='saved'?'为下一次阅读，保留线索':'浏览全部候选资料'):selectedIndustry;
    let list;
    if(mode==='roles') {
      list=roles.filter(r=>(selectedIndustry==='all'||r.industry===selectedIndustry)&&(!term||`${r.role} ${r.industry} ${r.english}`.toLowerCase().includes(term)));
      listPage=Math.max(1,Math.min(listPage,Math.ceil(list.length/perPage)||1));
      document.querySelector('#research-count').textContent=`${list.length} 个匹配岗位`;
      document.querySelector('#research-list').innerHTML=list.slice((listPage-1)*perPage,listPage*perPage).map(r=>{
        const live=practiceFor(r).length, count=r.sourceIds.filter(id=>accessible(sourceById.get(id))).length;
        return `<article class="r-role-card"><div class="r-role-category">${esc(r.industry)}</div><h3>${esc(r.role)}</h3><p>${esc(r.english)}</p><div class="r-role-numbers"><span><b>${r.sourceIds.length}</b>份资料线索</span><span>${count} 份可访问</span></div><div class="r-role-bottom"><span>${live?`关联 ${live} 道练习`:'练习题待整理'}</span><button data-r-open="${r.id}">查看资料${icon('book')}</button></div></article>`;
      }).join('')||emptyMessage();
    } else {
      list=candidateSources();listPage=Math.max(1,Math.min(listPage,Math.ceil(list.length/perPage)||1));
      document.querySelector('#research-count').textContent=`${list.length} 份匹配资料`;
      document.querySelector('#research-list').innerHTML=list.slice((listPage-1)*perPage,listPage*perPage).map(sourceCard).join('')||emptyMessage(mode==='saved');
    }
    document.querySelector('#research-pagination').innerHTML=pagination(list.length,listPage,'r');
    document.querySelector('#research-saved-count').textContent=state.researchSaved.length;
    if(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelector('#research-list').animate([{opacity:.4,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:170,easing:'ease-out'});
  }
  function openRole(id) {
    modalRole=roleById.get(id);if(!modalRole)return;
    modalTerm='';modalType='all';modalAccessible=false;modalPage=1;
    const modal=document.querySelector('#research-role-modal');
    document.querySelector('#r-modal-title').textContent=modalRole.role;
    document.querySelector('#r-modal-category').textContent=modalRole.industry;
    document.querySelector('#r-modal-search').value='';
    const live=practiceFor(modalRole).length;
    document.querySelector('#r-modal-practice').hidden=!live;
    document.querySelector('#r-modal-practice').textContent=`查看 ${live} 道关联练习`;
    renderModal();modal.showModal();
  }
  function renderModal() {
    if(!modalRole)return;
    const list=modalRole.sourceIds.map(id=>sourceById.get(id)).filter(s=>(modalType==='all'||s.type===modalType)&&(!modalAccessible||accessible(s))&&(!modalTerm||sourceText.get(s.id).includes(modalTerm))).sort((a,b)=>rank(a)-rank(b)||a.id.localeCompare(b.id));
    modalPage=Math.max(1,Math.min(modalPage,Math.ceil(list.length/perPage)||1));
    document.querySelector('#r-modal-count').textContent=`${list.length} 份匹配资料 · 候选来源仍待内容评审`;
    document.querySelector('#r-modal-types').innerHTML=typeButtons('rm',modalType)+`<button data-rm-accessible class="${modalAccessible?'active':''}" aria-pressed="${modalAccessible}">${icon('check')}仅看可访问</button>`;
    document.querySelector('#r-modal-list').innerHTML=list.slice((modalPage-1)*perPage,modalPage*perPage).map(sourceCard).join('')||emptyMessage();
    document.querySelector('#r-modal-pagination').innerHTML=pagination(list.length,modalPage,'rm');
  }
  function saveSource(id) {
    if(!sourceById.has(id))return;
    state.researchSaved=state.researchSaved.includes(id)?state.researchSaved.filter(x=>x!==id):[...state.researchSaved,id];
    persist();renderList(false);if(document.querySelector('#research-role-modal').open)renderModal();
  }
  function bootstrap() {
    root.innerHTML=`<div class="r-heading"><div><span class="eyebrow">CAREER RESOURCE LIBRARY</span><h1>打开视野，找到你的下一步。</h1><p>按职业与岗位浏览公开资料，把下一次准备建立在清晰的线索上。</p></div><span class="r-updated">检索 ${esc(data.summary.retrievedAt)}</span></div><div class="r-overview"><div>${icon('grid')}<b>${industries.length}</b><span>职业方向</span></div><div>${icon('layers')}<b>${roles.length}</b><span>细分岗位</span></div><div>${icon('book')}<b>${data.sources.length.toLocaleString()}</b><span>候选资料</span></div><div>${icon('check')}<b>${data.sources.filter(accessible).length}</b><span>可访问 · 待评审</span></div></div><div class="r-notice">${icon('book')}<p>资料索引与练习题分别统计。当前可练习 <b>${QUESTIONS.length}</b> 道；资料的发布日期、岗位适用性与内容仍需核对。</p></div><div class="r-controls"><div class="r-modes"><button data-r-mode="roles" class="active">岗位目录</button><button data-r-mode="sources">全部资料</button><button data-r-mode="saved">收藏资料 <span id="research-saved-count">0</span></button></div><label class="search"><span>${icon('search')}</span><input id="research-search" type="search" aria-label="搜索职业资料库" placeholder="搜索岗位、方向，例如：心理测量、Unity"><kbd>Ctrl K</kbd></label></div><div class="r-layout"><aside class="r-industry-rail"><div class="r-rail-label">职业方向</div><div id="research-industries"></div></aside><section class="r-results"><div class="r-results-heading"><div><h2 id="research-title"></h2><p id="research-count"></p></div><button id="research-reset" class="text-button">重置筛选</button></div><div id="research-types" class="r-type-filters" hidden></div><div id="research-list" class="r-list"></div><div id="research-pagination" class="pagination"></div></section></div>`;
    const modal=document.createElement('dialog');modal.id='research-role-modal';modal.className='r-modal';
    modal.innerHTML=`<div class="r-modal-heading"><div><span class="eyebrow" id="r-modal-category"></span><h2 id="r-modal-title"></h2></div><button id="r-modal-close" class="icon-button" aria-label="关闭岗位资料">${icon('close')}</button></div><div class="r-modal-controls"><label class="search">${icon('search')}<input id="r-modal-search" type="search" aria-label="搜索当前岗位资料" placeholder="在此岗位内搜索资料…"></label><button id="r-modal-practice" hidden></button></div><div class="r-type-filters" id="r-modal-types"></div><p id="r-modal-count"></p><div class="r-modal-scroll"><div id="r-modal-list" class="r-list"></div><div id="r-modal-pagination" class="pagination"></div></div>`;
    document.body.appendChild(modal);
    document.querySelector('#r-modal-close').onclick=()=>modal.close();
    document.querySelector('#r-modal-practice').onclick=()=>{const match=links[modalRole.id];if(match){modal.close();setIndustry(...match);}};
    let searchTimer,modalTimer;
    document.querySelector('#research-search').oninput=e=>{term=e.target.value.trim().toLowerCase();listPage=1;clearTimeout(searchTimer);searchTimer=setTimeout(()=>renderList(),100);};
    document.querySelector('#r-modal-search').oninput=e=>{modalTerm=e.target.value.trim().toLowerCase();modalPage=1;clearTimeout(modalTimer);modalTimer=setTimeout(()=>renderModal(),100);};
    document.querySelector('#research-reset').onclick=()=>{selectedIndustry=sourceType='all';onlyAccessible=false;term='';listPage=1;document.querySelector('#research-search').value='';renderList();};
    document.addEventListener('click',e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-resource-save'))saveSource(b.dataset.resourceSave);
      else if(b.hasAttribute('data-r-industry')){selectedIndustry=b.dataset.rIndustry;listPage=1;renderList();}
      else if(b.hasAttribute('data-r-mode')){mode=b.dataset.rMode;term='';document.querySelector('#research-search').value='';listPage=1;renderList();}
      else if(b.hasAttribute('data-r-open'))openRole(b.dataset.rOpen);
      else if(b.hasAttribute('data-r-type')){sourceType=b.dataset.rType;listPage=1;renderList();}
      else if(b.hasAttribute('data-r-accessible')){onlyAccessible=!onlyAccessible;listPage=1;renderList();}
      else if(b.hasAttribute('data-r-page')){listPage=Number(b.dataset.rPage);renderList();document.querySelector('#research-title').scrollIntoView({block:'start',behavior:'instant'});}
      else if(b.hasAttribute('data-rm-type')){modalType=b.dataset.rmType;modalPage=1;renderModal();}
      else if(b.hasAttribute('data-rm-accessible')){modalAccessible=!modalAccessible;modalPage=1;renderModal();}
      else if(b.hasAttribute('data-rm-page')){modalPage=Number(b.dataset.rmPage);renderModal();document.querySelector('.r-modal-scroll').scrollTop=0;}
    });
  }
  bootstrap();
  window.JobPrepResearch={show:()=>renderList(false)};
})();
