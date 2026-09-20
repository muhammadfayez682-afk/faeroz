import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {makeData,metrics} from '../dist/data.js';
import {initializeRenovation,renovationMetrics,assignTemporaryUnit,confirmRelocation,approveRenovation,approveInspection,confirmReturn} from '../dist/renovation-data.js';
import {renderPage} from '../dist/pages.js';
const d=makeData();d.renovation=initializeRenovation(d);
assert.equal(d.units.length,572);assert.equal(metrics(d).occupied,329);assert.equal(metrics(d).vacant,243);
assert.deepEqual([metrics(d).ready,metrics(d).reserved,metrics(d).underMaintenance],[150,45,48]);
assert.equal(metrics(d).ready+metrics(d).reserved+metrics(d).underMaintenance,metrics(d).vacant);
for(const b of d.buildings){const x=metrics(d,b.id);assert.equal(x.occupied+x.ready+x.reserved+x.underMaintenance,x.total);}
for(const p of d.renovation.pool)assert.equal(d.units.find(u=>u.id===p.unitId).status,p.state==='READY'?'VACANT':'RESERVED');
assert.equal(d.units.filter(u=>u.bedrooms===1).length,73);assert.equal(d.units.filter(u=>u.bedrooms===2).length,499);
assert.equal(new Set(d.units.map(u=>u.id)).size,572);
for(const c of d.contracts){assert.equal(d.payments.filter(p=>p.contractId===c.id).reduce((sum,p)=>sum+p.amount,0),c.amount);assert.ok(d.units.some(u=>u.id===c.unitId));assert.ok(d.tenants.some(t=>t.id===c.tenantId));}
const m=renovationMetrics(d);assert.deepEqual([m.planned,m.underWork,m.affected,m.moved,m.poolReady,m.returned,m.progress],[12,2,46,31,38,17,24]);assert.equal(m.poolTotal,m.poolUsed+m.poolReady+m.poolReserved);assert.equal(m.affected,m.moved+m.pending);assert.equal(m.current,m.moved-m.returned);assert.equal(m.current,m.poolUsed);
for(const p of d.renovation.pool){assert.equal(d.units.find(u=>u.id===p.unitId).usageType,'TEMPORARY_HOUSING');if(p.state!=='READY')assert.ok(d.renovation.residents.some(r=>r.id===p.residentId&&r.temporaryUnitId===p.unitId));}
const pending=d.renovation.residents.find(r=>r.status==='NOTIFIED'),available=d.renovation.pool.find(p=>p.state==='READY'),used=d.renovation.pool.find(p=>p.state==='USED');
assert.throws(()=>assignTemporaryUnit(d,pending.id,used.unitId));
assignTemporaryUnit(d,pending.id,available.unitId);assert.equal(pending.status,'ASSIGNED');assert.equal(renovationMetrics(d).poolReady,37);
assert.equal(d.units.find(u=>u.id===available.unitId).status,'RESERVED');assert.equal(metrics(d).ready,149);
assert.throws(()=>assignTemporaryUnit(d,pending.id,available.unitId));
confirmRelocation(d,pending.id);assert.equal(pending.status,'RELOCATED');assert.equal(renovationMetrics(d).poolUsed,15);assert.throws(()=>confirmRelocation(d,pending.id));
assert.throws(()=>approveRenovation(d,'A02'));
approveRenovation(d,'A01');assert.equal(d.renovation.plans[0].status,'INSPECTION');
const first=d.renovation.residents.find(r=>r.buildingId==='A01'&&r.status==='RELOCATED');assert.throws(()=>confirmReturn(d,first.id));
approveInspection(d,'A01');assert.equal(first.status,'READY');
confirmReturn(d,first.id);assert.equal(first.status,'RETURNED');assert.equal(d.renovation.pool.find(p=>p.unitId===first.temporaryUnitId).state,'READY');assert.throws(()=>confirmReturn(d,first.id));
assert.equal(d.units.find(u=>u.id===first.temporaryUnitId).status,'VACANT');
for(const r of d.renovation.residents.filter(r=>r.buildingId==='A01'&&r.status==='READY'))confirmReturn(d,r.id);
assert.equal(d.renovation.plans[0].status,'COMPLETED');assert.equal(d.renovation.plans[0].progress,100);assert.equal(metrics(d).occupied,329,'Temporary relocation must not change lease occupancy');
const initial=makeData();initial.renovation=initializeRenovation(initial);
const routes=['/','/overview','/buildings','/buildings/A01','/units','/units?status=VACANT','/units?usage=TEMPORARY_HOUSING','/units?usage=MAINTENANCE','/units/A01-204','/units/A01-204?tab=payments','/units/A01-204?tab=maintenance','/units/A01-204?tab=history','/units/'+initial.renovation.pool[0].unitId,'/applications','/applications/REQ-1001','/rental-journey','/tenants','/tenants/TEN-2014','/contracts','/contracts/CON-5014','/payments','/payments?status=OVERDUE','/maintenance','/maintenance/MNT-1025','/reports','/lifecycle','/value','/roadmap','/renovation','/renovation/A01','/renovation/A02?resident=PENDING','/renovation/A03','/renovation?status=COMPLETED'];
for(const r of routes){const [path,query]=r.split('?');const html=renderPage(initial,path,new URLSearchParams(query));assert.ok(html.length>150,r);assert.ok(!html.includes('undefined'),r+' has undefined text');assert.ok(!html.includes('NaN'),r+' has invalid number');}
for(const phase of [0,1,2,3,4,5,6]){initial.applications[0].phase=phase;assert.ok(renderPage(initial,'/applications/REQ-1001',new URLSearchParams()).length>100);}
for(const file of ['index.html','app.js','data.js','pages.js','ui.js','renovation.js','renovation-data.js','renovation-controller.js','styles.css','favicon.svg','fonts/arabic-regular.ttf','fonts/arabic-semibold.ttf','fonts/OFL.txt'])assert.ok(existsSync('dist/'+file),file+' missing');
for(const file of ['app.js','data.js','pages.js','renovation.js','renovation-data.js','renovation-controller.js'])assert.ok(!/\b(fetch|XMLHttpRequest|localStorage|sessionStorage)\b/.test(readFileSync('dist/'+file,'utf8')),file+' must remain local and ephemeral');
console.log('PASS: 572 units, 329 occupied, 243 vacant, 499 two-bedroom, 73 one-bedroom.');
console.log('PASS: consistent renovation totals, exclusive assignment, relocation, quality gate, return, pool release, unchanged lease occupancy.');
console.log(`PASS: ${routes.length} core route states render; assets exist; core demo stays in memory without API calls.`);
