import assert from 'node:assert/strict';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {resolveRoute,residentServiceUrl} from '../dist/resident-routing.js';
import {makeData} from '../dist/data.js';
import {services,seedTickets,createTicket,advanceTicket,ticketForUnit,validTickets,storageKey} from '../dist/resident-data.js';
import {createResidentStore} from '../dist/resident-store.js';
import {renderResident,renderResidentAdmin} from '../dist/resident.js';
import qrcode from '../dist/vendor/qrcode.js';
const data=makeData(),now=new Date('2026-09-19T09:00:00Z'),initial=seedTickets(now);
const input={unitId:'A02-105',service:'maintenance',category:'تسرب مياه',description:'تسرب أسفل حوض المطبخ',priority:'HIGH'};
const ticket=createTicket(initial,data.units,input,now);
assert.equal(ticket.id,'MNT-1045');assert.equal(ticket.stage,0);assert.equal(ticket.unitId,'A02-105');
assert.equal(createTicket([ticket,...initial],data.units,input,now).id,'MNT-1046');
assert.equal(createTicket(initial,data.units,input,now,['MNT-1070']).id,'MNT-1071');
for(const invalid of [{unitId:'A99-999'},{service:'__proto__'},{category:'unknown'},{description:' '},{description:'a'.repeat(1001)},{priority:'LOW'},{image:'data:image/svg+xml,<svg/>'}])assert.throws(()=>createTicket(initial,data.units,{...input,...invalid},now));
for(const service of Object.keys(services)){const t=createTicket(initial,data.units,{...input,service},now);assert.ok(t.id.startsWith(services[service].prefix));}
assert.equal(ticketForUnit([ticket],ticket.id,'A01-101'),undefined);
assert.throws(()=>advanceTicket(ticket,'close'));assert.throws(()=>advanceTicket(ticket,'start'));assert.throws(()=>advanceTicket(ticket,'assign','unknown'));
let progressed=advanceTicket(ticket,'assign','tech1',now);assert.equal(progressed.stage,2);assert.deepEqual(progressed.history.map(h=>h.stage),[0,1,2]);
assert.throws(()=>advanceTicket(progressed,'assign','tech1'));
for(const step of ['start','repair','close'])progressed=advanceTicket(progressed,step,'',now);
assert.equal(progressed.stage,5);assert.equal(progressed.history.length,6);assert.throws(()=>advanceTicket(progressed,'close'));
assert.ok(validTickets([progressed,...initial],data.units));assert.ok(!validTickets([ticket,ticket],data.units));assert.ok(!validTickets([{...ticket,stage:9}],data.units));assert.ok(!validTickets([{...ticket,unitId:'A99-999'}],data.units));
const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
const first=createResidentStore(data.units,storage);first.write([ticket,...initial]);
const second=createResidentStore(data.units,storage);assert.equal(second.read()[0].id,ticket.id);
second.write([progressed,...initial]);assert.equal(first.read()[0].stage,5,'Cross-tab refresh reads latest persisted ticket');
map.set(storageKey,'{bad json');assert.equal(first.read()[0].stage,5,'Corrupt storage preserves valid in-memory snapshot');
const failing=createResidentStore(data.units,{getItem:()=>null,setItem(){throw new Error('quota');}});assert.throws(()=>failing.write([ticket,...initial]),/مساحة/);assert.equal(failing.read().length,4,'A failed save cannot report a new successful ticket');
const volatile=createResidentStore(data.units,null);volatile.write([ticket]);assert.equal(volatile.read()[0].id,ticket.id);assert.equal(volatile.persistent,false);
for(const route of ['/service/A02-105','/service/A02-105/request?service=maintenance','/service/A02-105/request?service=cleaning','/service/A02-105/request?service=general','/service/A02-105/request?service=inquiry','/service/A02-105/success/MNT-1045','/service/A02-105/track/MNT-1045','/service/A99-999']){
  const [path,query]=route.split('?'),html=renderResident(data,path,new URLSearchParams(query),[ticket,...initial]);
  assert.ok(!/sidebar|الإيجار|الدفعات|مدير المشروع|undefined|NaN/.test(html),route);assert.ok(html.includes('id="main"'));
}
const wrongUnit=renderResident(data,'/service/A01-101/track/MNT-1045',new URLSearchParams(),[ticket]);assert.ok(!wrongUnit.includes(input.description));assert.ok(wrongUnit.includes('الطلب غير موجود'));
const injected={...ticket,description:'<script>alert(1)</script>'};assert.ok(renderResidentAdmin(data,'/resident-requests/'+ticket.id,new URLSearchParams(),[injected]).includes('&lt;script&gt;'));
assert.ok(renderResidentAdmin(data,'/resident-requests',new URLSearchParams(),[ticket]).includes('MNT-1045'));
for(const root of ['dist','docs']){const file=root+'/service/index.html';assert.ok(existsSync(file));const html=readFileSync(file,'utf8');assert.ok(html.includes('name="resident-service"'));assert.ok(html.includes('src="../app.js'));assert.deepEqual(readdirSync(root+'/service'),['index.html']);}
for(const unit of data.units){const route=resolveRoute('', '?unit='+unit.id,true);assert.equal(route.path,'/service/'+unit.id);}
for(const search of ['', '?unit=', '?unit=%3Cscript%3E']){const route=resolveRoute('#/service/A02-105',search,true);assert.equal(route.path,'/service/');assert.ok(renderResident(data,route.path,route.q,initial).includes('تعذر تحديد الوحدة، يرجى مسح رمز QR الموجود داخل الشقة.'));}
assert.equal(resolveRoute('#/service/A01-101','?unit=A02-105',true).path,'/service/A02-105');
assert.equal(resolveRoute('#/resident-requests','?unit=A02-105',true).path,'/service/A02-105');
assert.equal(resolveRoute('#/units','',false).path,'/units');
const formRoute=resolveRoute('#/service/A02-105/request?service=maintenance','?unit=A02-105',true);assert.equal(formRoute.path,'/service/A02-105/request');assert.equal(formRoute.q.get('service'),'maintenance');
assert.equal(residentServiceUrl('A02-105','https://example.github.io/faeroz/'),'https://example.github.io/faeroz/service/?unit=A02-105');
assert.equal(residentServiceUrl('A02-105','http://127.0.0.1:4173/'),'http://127.0.0.1:4173/service/?unit=A02-105');
assert.ok(readFileSync('dist/pages.js','utf8').includes('href="./service/?unit=A02-105"'));
const qr=qrcode(0,'M');qr.addData('https://example.github.io/faeroz/service/?unit=A02-105');qr.make();assert.ok(qr.getModuleCount()>20);assert.ok(qr.createSvgTag().includes('<svg'));
for(const file of ['resident.js','resident-controller.js','resident-data.js','resident-store.js'])assert.ok(!/\b(fetch|XMLHttpRequest)\b/.test(readFileSync('dist/'+file,'utf8')));
console.log('PASS: resident validation, all four services, unique IDs, six-stage lifecycle, unit-scoped tracking, escaped content, persistence, cross-tab refresh, corrupt storage and quota handling.');
console.log('PASS: one shared page for 572 units, missing-unit message, query-authoritative routing, GitHub Pages prefix and local QR generation.');
