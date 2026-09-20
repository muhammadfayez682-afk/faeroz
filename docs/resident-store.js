import {seedTickets,validTickets,storageKey} from './resident-data.js?v=20260920-quality';
// Only resident tickets persist; the rest of the investor demo remains in memory.
export function createResidentStore(units, storage) {
  let memory=seedTickets(),available=Boolean(storage);
  function read(){
    if(available) try {
      const raw=storage.getItem(storageKey);
      if(raw!==null){const parsed=JSON.parse(raw);if(validTickets(parsed,units))memory=parsed;}
    } catch { /* Keep the last valid local snapshot. */ }
    return structuredClone(memory);
  }
  function write(tickets){
    if(!validTickets(tickets,units))throw new Error('تعذر حفظ بيانات الطلب.');
    if(available)try{storage.setItem(storageKey,JSON.stringify(tickets));}catch{throw new Error('مساحة المتصفح غير كافية لحفظ الطلب. جرّب إزالة الصورة ثم أرسل مجدداً.');}
    memory=structuredClone(tickets);
  }
  read();
  return {read,write,reset(){write(seedTickets());},persistent:available};
}
export function browserStorage(){try{return window.localStorage;}catch{return null;}}
