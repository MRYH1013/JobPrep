const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../learning-core.js'),ids=new Set(['a','b','c']);
test('legacy backup migration, unknown IDs and safe maps',()=>{
 const {data,unknown}=core.clean({version:3,saved:['a','a','obsolete'],done:['b'],notes:{a:'保留回答'}},ids);
 assert.deepEqual(data.saved,['a']);assert.equal(unknown,1);assert.equal(data.notes.a,'保留回答');assert.deepEqual(data.needsReview,[]);
 assert.throws(()=>core.clean(JSON.parse('{"notes":{"__proto__":"bad"}}'),ids));
 for(const v of [null,[],{version:99},{done:'bad'},{notes:{a:8}},{attempts:{a:{answeredAt:'bad',dueAt:1}}}])assert.throws(()=>core.clean(v,ids));
});
test('merge preserves other answers and explicitly imports status',()=>{
 const a=core.clean({done:['a'],saved:['c'],notes:{a:'旧',c:'保留'}},ids).data;
 const b=core.clean({needsReview:['a'],done:['b'],notes:{a:'新'},saved:['a']},ids).data;
 const result=core.merge(a,b);assert.deepEqual(result.done,['b']);assert.deepEqual(result.needsReview,['a']);assert.deepEqual(result.saved,['c','a']);assert.equal(result.notes.a,'新');assert.equal(result.notes.c,'保留');
});
test('review schedules distinguish mastery and due date',()=>{
 const s=core.clean({done:['a'],needsReview:['b'],saved:['c'],attempts:{a:{answeredAt:10,dueAt:100}}},ids).data;
 assert.equal(core.status(s,'a'),'mastered');assert.equal(core.status(s,'b'),'review');assert.equal(core.status(s,'c'),'new');
 assert.equal(core.reviewMatch(s,{id:'a'},'due',90),false);assert.equal(core.reviewMatch(s,{id:'a'},'due',101),true);assert.equal(core.reviewMatch(s,{id:'b'},'weak'),true);
});
