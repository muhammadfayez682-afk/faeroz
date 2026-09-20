import {residentServiceUrl} from './resident-routing.js?v=20260920-query';
import {e,icon,button,field} from './ui.js?v=20260920-query';
import {technicians} from './data.js?v=20260920-query';
import {createTicket,advanceTicket,storageKey} from './resident-data.js?v=20260920-query';
import {createResidentStore,browserStorage} from './resident-store.js?v=20260920-query';
import qrcode from './vendor/qrcode.js?v=20260920-query';
let store,photo='',photoVersion=0,processing=false;
export function initializeResident(units){store=createResidentStore(units,browserStorage());}
export function residentSnapshot(){return store.read();}
export function residentPersistent(){return store.persistent;}
export function resetResident(){store.reset();}
export function residentRouteChanged(){photo='';processing=false;photoVersion++;}
export function residentStorageEvent(event,ctx){if(event.key===storageKey && !ctx.route().path.includes('/request'))ctx.render();}
export function serviceUrl(unitId){return residentServiceUrl(unitId,new URL('./',import.meta.url));}
function qrMarkup(unitId){const qr=qrcode(0,'M');qr.addData(serviceUrl(unitId));qr.make();return qr.createSvgTag({cellSize:5,margin:20,scalable:true});}
function qrContents(unitId){return `<div class="rs-qr-image" role="img" aria-label="رمز QR للوحدة ${e(unitId)}">${qrMarkup(unitId)}</div><p class="rs-qr-unit" dir="ltr">${e(unitId)}</p><p class="small muted">امسح الرمز لفتح خدمات الوحدة مباشرة.</p><div class="rs-qr-actions"><a class="btn primary" href="${serviceUrl(unitId)}">فتح صفحة السكان ${icon('left')}</a>${button(icon('download')+' تنزيل QR','resident-download-qr','btn',`data-id="${unitId}"`)}</div>`;}
export function residentAction(action,id,ctx){
  if(!action.startsWith('resident-'))return false;
  try{
    if(action==='resident-remove-photo'){photoVersion++;photo='';processing=false;const input=document.querySelector('#resident-photo');if(input)input.value='';document.querySelector('#resident-photo-preview').innerHTML='';document.querySelector('#resident-request-form [type="submit"]').disabled=false;return true;}
    if(action==='resident-qr'){
      const selected=ctx.data.units.some(u=>u.id===id)?id:'A02-105';
      ctx.openModal('QR خدمات السكان',`<label class="field"><span>اختر الوحدة</span><select id="resident-qr-unit">${ctx.data.units.map(u=>`<option value="${u.id}" ${selected===u.id?'selected':''}>${u.id}</option>`).join('')}</select></label><div id="resident-qr-content" class="rs-qr-content">${qrContents(selected)}</div><p class="small muted">نسخة تجريبية: تظهر الطلبات على الجهاز والمتصفح نفسيهما. مسح الرمز من جهاز آخر لا يزامن الطلبات مع هذا الجهاز.</p>`);return true;
    }
    if(action==='resident-download-qr'){
      if(!ctx.data.units.some(u=>u.id===id))return true;
      const blob=new Blob([qrMarkup(id)],{type:'image/svg+xml'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='EMDADAT-'+id+'-QR.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
    }
    const tickets=store.read(),ticket=tickets.find(t=>t.id===id);if(!ticket)throw new Error('الطلب غير موجود.');
    if(action==='resident-assign'){
      ctx.openModal('تعيين فني',`<input type="hidden" name="ticketId" value="${e(id)}">${field('الفني المسؤول',`<select name="technicianId" required><option value="">اختر الفني</option>${technicians.map(t=>`<option value="${t.id}">${t.name} · ${t.specialty}</option>`).join('')}</select>`)}`,'resident-assign-form','تعيين الفني');return true;
    }
    const verb=action.slice('resident-'.length),updated=advanceTicket(ticket,verb);
    store.write(tickets.map(t=>t.id===id?updated:t));ctx.render();ctx.toast('تم تحديث حالة الطلب.');
  }catch(err){ctx.toast(err.message);}
  return true;
}
export function residentSubmit(form,values,ctx){
  const id=form.getAttribute('id');
  if(!['resident-request-form','resident-assign-form'].includes(id))return false;
  const submit=form.querySelector('[type="submit"]');
  try{
    if(id==='resident-request-form'){
      if(processing)throw new Error('انتظر لحظة حتى تجهز الصورة.');
      if(submit.disabled)return true;
      submit.disabled=true;
      const tickets=store.read(),ticket=createTicket(tickets,ctx.data.units,{...values,unitId:form.dataset.unit,service:form.dataset.service,image:photo},new Date(),ctx.data.maintenance.map(t=>t.id));
      store.write([ticket,...tickets]);photo='';ctx.go('/service/'+ticket.unitId+'/success/'+ticket.id);
    }else{
      const tickets=store.read(),ticket=tickets.find(t=>t.id===values.ticketId);if(!ticket)throw new Error('الطلب غير موجود.');
      const updated=advanceTicket(ticket,'assign',values.technicianId);
      store.write(tickets.map(t=>t.id===updated.id?updated:t));ctx.closeModal();ctx.render();ctx.toast('تم تعيين الفني المسؤول.');
    }
  }catch(err){if(submit)submit.disabled=false;const error=form.querySelector('#resident-error, #form-error');error.textContent=err.message;error.scrollIntoView({block:'nearest'});}
  return true;
}
export async function residentChange(target,ctx){
  if(target.id==='resident-qr-unit'){document.querySelector('#resident-qr-content').innerHTML=qrContents(target.value);return;}
  if(target.id!=='resident-photo')return;
  const form=target.closest('form'),preview=form.querySelector('#resident-photo-preview'),error=form.querySelector('#resident-error'),submit=form.querySelector('[type="submit"]'),file=target.files[0],version=++photoVersion;
  photo='';error.textContent='';preview.innerHTML='';
  if(!file){processing=false;submit.disabled=false;return;}
  processing=true;submit.disabled=true;
  try{
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>8*1024*1024)throw new Error('اختر صورة JPG أو PNG أو WebP بحجم أقل من 8 ميجابايت.');
    preview.textContent='جارٍ تجهيز الصورة…';
    const source=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('تعذر قراءة الصورة.'));reader.readAsDataURL(file);});
    const img=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('تعذر فتح هذه الصورة.'));img.src=source;});
    const ratio=Math.min(1,1000/img.width,1000/img.height),canvas=document.createElement('canvas');canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio);const draw=canvas.getContext('2d');draw.fillStyle='#ffffff';draw.fillRect(0,0,canvas.width,canvas.height);draw.drawImage(img,0,0,canvas.width,canvas.height);
    let result=canvas.toDataURL('image/jpeg',.75);if(result.length>550000)result=canvas.toDataURL('image/jpeg',.45);
    if(result.length>550000)throw new Error('الصورة كبيرة جداً؛ اختر صورة أصغر.');
    if(version!==photoVersion||!form.isConnected)return;
    photo=result;preview.innerHTML=`<img class="rs-photo-preview" src="${photo}" alt="معاينة الصورة المختارة">${button('إزالة الصورة','resident-remove-photo','rs-remove-photo','type="button"')}`;
  }catch(err){if(version===photoVersion&&form.isConnected){preview.innerHTML='';error.textContent=err.message;target.value='';}}
  finally{if(version===photoVersion){processing=false;submit.disabled=false;}}
}
