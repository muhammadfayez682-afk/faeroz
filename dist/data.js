export const TODAY = '2026-09-15';
export const PROJECT = 'مشروع تشغيل حي النواة – حارة الفيروز';
export const rentalSteps = ['طلب جديد','مراجعة البيانات','الموافقة','حجز الوحدة','إنشاء العقد','استلام الدفعة','تسليم الوحدة'];
export const maintenanceSteps = ['استلام البلاغ','مراجعة الطلب','تحديد الأولوية','تعيين الفني','بدء العمل','تنفيذ الإصلاح','فحص التنفيذ','إغلاق الطلب'];
export const technicians = [{id:'tech1',name:'أحمد العتيبي',specialty:'سباكة'},{id:'tech2',name:'علي الحربي',specialty:'تكييف'},{id:'tech3',name:'عمر السالم',specialty:'كهرباء'},{id:'tech4',name:'يوسف ناصر',specialty:'صيانة عامة'}];
export function daysUntil(date) { return Math.ceil((new Date(date+'T12:00:00')-new Date(TODAY+'T12:00:00'))/86400000); }
export function addDays(date,days) {const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10);}
export function makeData(){
  const buildings=[],units=[],tenants=[],contracts=[],payments=[];
  const first=['محمد','عبدالله','خالد','أحمد','إبراهيم','عمر','ناصر','فهد','سعد','يوسف','صالح','راشد','حسن','ماجد','علي','بندر'];
  const last=['العتيبي','القحطاني','الشهري','الحربي','الدوسري','الغامدي','الزهراني','السبيعي','المالكي','السالم','التميمي','العمري','الشمري','الراشد','الهاجري','العنزي','الخالد','الناصر','المحمد','الفارس','الحمد'];
  let index=0, occupied=0,oneBedroom=0;
  for(let b=0;b<12;b++){
    const id='A'+String(b+1).padStart(2,'0'),count=b===0?50:b===11?42:48,occupiedCount=b===0?38:b===1?31:26;
    buildings.push({id,name:'المبنى '+id,floors:5,zone:b<6?'القطاع الشمالي':'القطاع الجنوبي',manager:b<6?'محمد السالم':'عبدالله ناصر'});
    for(let i=0;i<count;i++){
      const number=Math.floor(i/10+1)*100+i%10+1,uid=id+'-'+number;
      const bedrooms=(index%8===0||index===571)&&oneBedroom<73?1:2;if(bedrooms===1)oneBedroom++;
      const unit={id:uid,buildingId:id,number,floor:Math.floor(i/10+1),bedrooms,bathrooms:bedrooms===2?2:1,area:bedrooms===2?112:78,rent:bedrooms===2?36000:26000,status:i<occupiedCount?'OCCUPIED':'VACANT',tenantId:null,contractId:null};
      if(i<occupiedCount){
        const tid='TEN-'+(2001+occupied),cid='CON-'+(5001+occupied),isFeatured=uid==='A01-204';
        const end=isFeatured?'2026-11-26':occupied<30?addDays(TODAY,12+(occupied*3)%78):addDays(TODAY,100+(occupied*7)%245);
        const start=addDays(end,-365), name=isFeatured?'خالد محمد':first[occupied%first.length]+' '+last[Math.floor(occupied/first.length)%last.length];
        tenants.push({id:tid,name,mobile:'05••• ••'+String(100+occupied).slice(-3),nationality:'سعودي',family:bedrooms===2?4:2,unitId:uid,contractId:cid,email:'tenant'+(occupied+1)+'@example.com',joined:start,notes:isFeatured?'يفضل التواصل خلال الفترة المسائية.':'مستأجر ضمن مشروع حارة الفيروز.'});
        contracts.push({id:cid,tenantId:tid,unitId:uid,start,end,amount:unit.rent,status:'ACTIVE'});
        for(let p=0;p<3;p++){
          const amount=p===2?unit.rent-2*Math.round(unit.rent/3):Math.round(unit.rent/3);
          const overdue=occupied<22&&!isFeatured,partial=occupied>=22&&occupied<30&&!isFeatured;
          payments.push({id:'PAY-'+(payments.length+1001),contractId:cid,tenantId:tid,unitId:uid,amount,paid:p<2?amount:partial?Math.round(amount*.5):0,due:p===0?addDays(TODAY,-180):p===1?addDays(TODAY,-60):overdue?addDays(TODAY,-(5+occupied)):partial?addDays(TODAY,-3):addDays(TODAY,30+occupied%60),paidAt:p<2?addDays(TODAY,p===0?-179:-59):partial?addDays(TODAY,-5):null,method:p<2?'تحويل بنكي':partial?'نقد':'—'});
        }
        unit.tenantId=tid;unit.contractId=cid;occupied++;
      }
      units.push(unit);index++;
    }
  }
  const applicants=['محمد أحمد','عبدالرحمن علي','سارة عبدالله','نواف الحربي','ريم خالد','خالد فهد','عبدالعزيز سالم','منيرة أحمد','بدر يوسف','مها إبراهيم','سلطان ناصر','عبدالله فيصل'];
  const applications=applicants.map((name,i)=>({id:'REQ-'+(1001+i),name,mobile:'05••• ••'+(701+i),bedrooms:i>0&&i%4===0?1:2,date:addDays(TODAY,-i%5),phase:i===0?1:i%3,unitId:'',family:4,budget:36000,notes:i===0?'يفضل وحدة في الأدوار المتوسطة. جاهز للانتقال خلال شهر.':'يرغب في الانتقال خلال الشهر المقبل.',history:[{text:'تم استلام طلب الإيجار',date:addDays(TODAY,-i%5),by:'مسؤول التأجير'},...(i===0||i%3>0?[{text:'تمت مراجعة بيانات العميل',date:TODAY,by:'محمد السالم'}]:[])]}));
  const issues=['تسرب مياه أسفل حوض المطبخ','ضعف تبريد المكيف','عطل في إنارة المدخل','تسرب في دورة المياه','صيانة قفل الباب','تنظيف خزان المياه','فحص لوحة الكهرباء','تسرب من وحدة التكييف'];
  const maintenance=Array.from({length:18},(_,i)=>{
    const unit=units.find(u=>u.id===(i===0?'A02-105':i<3?'A01-204':'A'+String(1+i%8).padStart(2,'0')+'-'+(101+i%6)));
    const phase=i===0?4:i<4?0:i<9?4:i<11?5:i<13?6:7;
    return {id:'MNT-'+(1025+i),unitId:unit.id,tenantId:unit.tenantId,issue:issues[i%issues.length],type:['سباكة','تكييف','كهرباء','سباكة','أبواب','نظافة','كهرباء','تكييف'][i%8],description:i===0?'أفاد المستأجر بوجود تسرب مستمر أسفل حوض المطبخ. يحتاج إلى فحص الوصلات واستبدال الجزء التالف.':issues[i%issues.length]+'، يرجى فحص الموقع وإتمام الإصلاح.',priority:i===0||i===3?'EMERGENCY':i%3===0?'HIGH':'NORMAL',technicianId:phase>=3?'tech'+(i%4+1):'',phase,waiting:i===9||i===10,date:addDays(TODAY,-(i%6)),notes:phase===7?'تمت المعالجة وفحص جودة التنفيذ.':'',history:[{time:'09:10',text:'تم استلام البلاغ',by:'خدمة المستأجرين'},...(phase>=1?[{time:'09:20',text:'تمت مراجعة البلاغ وتحديد الأولوية',by:'مشرف الصيانة'}]:[]),...(phase>=3?[{time:'09:30',text:'تم تعيين الفني',by:technicians[i%4].name}]:[]),...(phase>=4?[{time:'10:10',text:'وصل الفني إلى الوحدة',by:technicians[i%4].name},{time:'10:25',text:'بدأ العمل',by:technicians[i%4].name}]:[]),...(phase===7?[{time:'12:15',text:'اكتمل الإصلاح وتم فحص التنفيذ وإغلاق الطلب',by:'مشرف الصيانة'}]:[])]};
  });
  const activities=[{text:'تم استلام دفعة للوحدة A01-204',detail:'تحويل بنكي · 12,000 ر.س',time:'قبل 15 دقيقة',icon:'wallet',tone:'green',href:'/tenants/'+units.find(u=>u.id==='A01-204').tenantId},{text:'بدأ تنفيذ بلاغ الصيانة MNT-1025',detail:'أحمد العتيبي · تسرب مياه',time:'قبل 35 دقيقة',icon:'wrench',tone:'amber',href:'/maintenance/MNT-1025'},{text:'طلب إيجار جديد من محمد أحمد',detail:'شقة غرفتين نوم · تحت المراجعة',time:'قبل ساعة',icon:'file-plus',tone:'blue',href:'/applications/REQ-1001'},{text:'تم تسليم الوحدة A03-202',detail:'اكتملت إجراءات التأجير',time:'قبل ساعتين',icon:'key',tone:'green',href:'/units/A03-202'}];
  return {buildings,units,tenants,contracts,payments,applications,maintenance,activities};
}
export function paymentStatus(p){return p.paid>=p.amount?'PAID':p.paid>0?'PARTIAL':daysUntil(p.due)<0?'OVERDUE':'UPCOMING';}
export function contractStatus(c){return c.status==='EXPIRED'||daysUntil(c.end)<0?'EXPIRED':daysUntil(c.end)<=90?'EXPIRING':'ACTIVE';}
export function maintenanceStatus(m){return m.phase===7?'CLOSED':m.phase===6?'REVIEW':m.waiting?'WAITING_PARTS':m.phase>=4?'IN_PROGRESS':m.phase>=3?'ASSIGNED':'NEW';}
export function metrics(data,buildingId){
 const us=buildingId?data.units.filter(u=>u.buildingId===buildingId):data.units,ids=new Set(us.map(u=>u.id));
 const ps=data.payments.filter(p=>ids.has(p.unitId)),ms=data.maintenance.filter(m=>ids.has(m.unitId)),cs=data.contracts.filter(c=>ids.has(c.unitId));
 const occupied=us.filter(u=>u.status==='OCCUPIED').length,vacant=us.filter(u=>u.status==='VACANT').length;
 return {total:us.length,occupied,vacant,reserved:us.filter(u=>u.status==='RESERVED').length,underMaintenance:us.filter(u=>u.status==='MAINTENANCE').length,occupancy:us.length?occupied/us.length*100:0,amount:ps.reduce((s,p)=>s+p.amount,0),paid:ps.reduce((s,p)=>s+p.paid,0),overdue:ps.filter(p=>daysUntil(p.due)<0&&p.paid<p.amount).reduce((s,p)=>s+p.amount-p.paid,0),overdueCount:ps.filter(p=>daysUntil(p.due)<0&&p.paid<p.amount).length,expiring:cs.filter(c=>contractStatus(c)==='EXPIRING').length,open:ms.filter(m=>m.phase<7).length,emergency:ms.filter(m=>m.phase<7&&m.priority==='EMERGENCY').length,rent:us.filter(u=>u.status==='OCCUPIED').reduce((s,u)=>s+u.rent,0)};
}
