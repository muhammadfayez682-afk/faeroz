export const services = {
  maintenance: {label:'طلب صيانة', icon:'wrench', prefix:'MNT'},
  cleaning: {label:'طلب نظافة', icon:'sparkles', prefix:'CLN'},
  general: {label:'خدمة عامة', icon:'home', prefix:'SRV'},
  inquiry: {label:'استفسار أو ملاحظة', icon:'mail', prefix:'INQ'}
};
export const categories = ['تكييف','كهرباء','سباكة','تسرب مياه','أبواب ونوافذ','أخرى'];
export const stages = ['تم استلام الطلب','قيد المراجعة','تم تعيين الفني','جاري التنفيذ','تم الإصلاح','تم الإغلاق'];
export const storageKey = 'nawa.resident-tickets.v1';
export function seedTickets(now = new Date()) {
  return [
    ['MNT-1043','A02-105','maintenance','تكييف','التكييف في غرفة الجلوس لا يبرد بشكل جيد.','NORMAL',0,25],
    ['MNT-1044','A01-204','maintenance','تسرب مياه','تسرب أسفل حوض المطبخ يحتاج إلى إصلاح.','HIGH',3,110],
    ['CLN-1001','A03-102','cleaning','طلب نظافة','نرجو تنظيف المدخل أمام الشقة.','NORMAL',1,90],
    ['SRV-1001','A04-101','general','خدمة عامة','تمت معالجة مشكلة إنارة الممر.','NORMAL',5,180]
  ].map(([id,unitId,service,category,description,priority,stage,minutes])=>{
    const createdAt = new Date(now.getTime()-minutes*60000).toISOString();
    return {id,unitId,service,category,description,priority,stage,createdAt,updatedAt:createdAt,technicianId:stage>=2?'tech1':'',image:'',history:Array.from({length:stage+1},(_,step)=>({stage:step,at:createdAt}))};
  });
}
export function createTicket(tickets, units, input, now = new Date(), reservedIds = []) {
  if (!units.some(u=>u.id===input.unitId)) throw new Error('رابط الوحدة غير صحيح.');
  if (!Object.hasOwn(services,input.service)) throw new Error('اختر نوع الخدمة.');
  if (input.service==='maintenance' && !categories.includes(input.category)) throw new Error('اختر نوع المشكلة.');
  const description=String(input.description||'').trim();
  if (description.length<5 || description.length>1000) throw new Error('اكتب وصفاً للمشكلة بين 5 و1000 حرف.');
  if (!['NORMAL','HIGH'].includes(input.priority)) throw new Error('اختر أولوية الطلب.');
  if (input.image && !validImage(input.image)) throw new Error('تعذر إرفاق الصورة، يرجى اختيار صورة أخرى.');
  const prefix=services[input.service].prefix;
  const number=Math.max(prefix==='MNT'?1044:1000,...[...tickets.map(t=>t.id),...reservedIds].filter(id=>id.startsWith(prefix+'-')).map(id=>Number(id.split('-')[1])||0))+1;
  const createdAt=now.toISOString();
  return {id:prefix+'-'+number,unitId:input.unitId,service:input.service,category:input.service==='maintenance'?input.category:services[input.service].label,description,priority:input.priority,stage:0,createdAt,updatedAt:createdAt,technicianId:'',image:input.image||'',history:[{stage:0,at:createdAt}]};
}
export function advanceTicket(ticket, action, technicianId='', now=new Date()) {
  const next={review:1,assign:2,start:3,repair:4,close:5}[action];
  if (next===undefined || (action==='assign' ? ![0,1].includes(ticket.stage) : ticket.stage!==next-1)) throw new Error('أكمل المرحلة السابقة أولاً.');
  if (action==='assign' && !['tech1','tech2','tech3','tech4'].includes(technicianId)) throw new Error('اختر الفني المسؤول.');
  const at=now.toISOString(),history=[...ticket.history];
  for(let stage=ticket.stage+1;stage<=next;stage++) history.push({stage,at});
  return {...ticket,stage:next,updatedAt:at,technicianId:action==='assign'?technicianId:ticket.technicianId,history};
}
export function ticketForUnit(tickets,id,unitId){return tickets.find(t=>t.id===id&&t.unitId===unitId);}
function validImage(image){return typeof image==='string' && image.length<600000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(image);}
export function validTickets(value,units){
  return Array.isArray(value) && value.length<=2000 && new Set(value.map(t=>t?.id)).size===value.length && value.every(t=>t && typeof t.id==='string' && /^(MNT|CLN|SRV|INQ)-\d+$/.test(t.id) && units.some(u=>u.id===t.unitId) && Object.hasOwn(services,t.service) && t.id.startsWith(services[t.service].prefix+'-') && typeof t.description==='string' && t.description.length<=1000 && typeof t.category==='string' && t.category.length<100 && ['NORMAL','HIGH'].includes(t.priority) && Number.isInteger(t.stage) && t.stage>=0 && t.stage<stages.length && Number.isFinite(Date.parse(t.createdAt)) && Number.isFinite(Date.parse(t.updatedAt)) && (!t.image||validImage(t.image)) && Array.isArray(t.history) && t.history.every(h=>Number.isInteger(h.stage)&&h.stage>=0&&h.stage<=5&&Number.isFinite(Date.parse(h.at))));
}
