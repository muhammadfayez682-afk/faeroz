export const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const num=(v,d=0)=>new Intl.NumberFormat('en-US',{maximumFractionDigits:d}).format(v);
export const money=v=>`${num(v)} <span class="currency">ر.س</span>`;
export const date=v=>v?new Intl.DateTimeFormat('ar-SA',{day:'numeric',month:'short',year:'numeric',calendar:'gregory',numberingSystem:'latn'}).format(new Date(v+'T12:00:00')):'—';
const paths={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 building:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/>',
 layers:'<path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5"/>',
 key:'<circle cx="8" cy="8" r="5"/><path d="m11.5 11.5 9 9M17 17l3-3M14 14l3-3"/>',
 door:'<path d="M3 21h18M6 21V3h12v18M14 12h.01"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h5"/>',
 'file-plus':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 15h8M12 11v8"/>',
 wallet:'<path d="M20 8V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v11H5a3 3 0 0 1-3-3V6M20 13h-5v4h5"/>',
 wrench:'<path d="M14.5 6.3 18 3a6 6 0 0 0-7.5 7.5l-7 7a2.1 2.1 0 0 0 3 3l7-7A6 6 0 0 0 21 6l-3.3 3.5Z"/>',
 chart:'<path d="M3 3v18h18M7 16v-4M12 16V8M17 16V5"/>',
 route:'<circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M7 6h10a4 4 0 0 1 0 8H7a4 4 0 0 0 0 8h5"/>',
 sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4M18 4h4"/>',
 search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
 bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
 chevron:'<path d="m9 5 7 7-7 7"/>',down:'<path d="m6 9 6 6 6-6"/>',left:'<path d="M20 12H4m6-6-6 6 6 6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="m5 12 4 4L19 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
 trend:'<path d="m3 17 6-6 4 4 8-10M15 5h6v6"/>',alert:'<path d="m12 3 10 18H2ZM12 9v4M12 17h.01"/>',
 arrow:'<path d="M7 17 17 7M7 7h10v10"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M5 17v4h14v-4"/>',
 play:'<path d="m8 4 12 8-12 8Z"/>',filter:'<path d="M4 5h16M7 12h10M10 19h4"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16M15 5v16"/>',pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 shield:'<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6ZM8 12l3 3 5-6"/>',refresh:'<path d="M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 14 6M4 12a8 8 0 0 0 14 6"/>',
 phone:'<path d="m4 3 5 1 1 5-3 2c2 4 3 5 6 6l2-3 5 1 1 5c-9 4-22-9-17-17Z"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'
};
export function icon(name,cls=''){return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.grid}</svg>`;}
export const statusMap={OCCUPIED:['مؤجرة','green'],VACANT:['شاغرة','blue'],RESERVED:['محجوزة','amber'],MAINTENANCE:['تحت الصيانة','amber'],ACTIVE:['نشط','green'],EXPIRING:['قريب الانتهاء','amber'],EXPIRED:['منتهي','gray'],PAID:['مدفوع','green'],PARTIAL:['مدفوع جزئياً','amber'],OVERDUE:['متأخر','red'],UPCOMING:['قادم','blue'],NEW:['جديد','blue'],ASSIGNED:['تم تعيين الفني','blue'],IN_PROGRESS:['قيد التنفيذ','amber'],WAITING_PARTS:['بانتظار قطع غيار','amber'],REVIEW:['بانتظار الفحص','blue'],CLOSED:['مكتمل','green'],EMERGENCY:['طارئ','red'],HIGH:['عالي','amber'],NORMAL:['عادي','gray'],LOW:['منخفض','gray']};
export function badge(key){const [label,tone]=statusMap[key]||[key,'gray'];return `<span class="badge ${tone}"><span class="status-dot"></span>${e(label)}</span>`;}
export function appBadge(a){const texts=['جديد','تحت المراجعة','تمت الموافقة','تم حجز الوحدة','تم إنشاء العقد','تم استلام الدفعة','تم التسليم'];return `<span class="badge ${a.phase>=6?'green':a.phase>=2?'green':a.phase===0?'blue':'amber'}"><span class="status-dot"></span>${texts[a.phase]}</span>`;}
export function link(href,text,cls=''){return `<a href="#${href}" class="${cls}">${text}</a>`;}
export function button(text,action,cls='btn',attrs=''){return `<button class="${cls}" data-action="${action}" ${attrs}>${text}</button>`;}
export function empty(text='لا توجد نتائج مطابقة',desc='جرّب تغيير البحث أو الفلاتر.'){return `<div class="empty">${icon('search')}<strong>${text}</strong><p>${desc}</p></div>`;}
export function title(kicker,heading,description,actions=''){return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${heading}</h1>${description?`<p>${description}</p>`:''}</div><div class="heading-actions">${actions}</div></div>`;}
export function card(label,value,detail,ico='grid',tone='green'){return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="icon-box ${tone}">${icon(ico)}</span></div><div class="stat-number">${value}</div><div class="stat-foot">${detail}</div></div>`;}
export function panel(heading,content,action='',cls=''){return `<section class="panel ${cls}"><div class="panel-heading"><h2>${heading}</h2>${action}</div>${content}</section>`;}
export function progress(value,cls=''){return `<div class="progress ${cls}" role="meter" aria-label="النسبة" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(value)}"><span style="width:${Math.min(100,Math.max(0,value))}%"></span></div>`;}
export function table(headers,rows){return `<div class="table-scroll"><table><thead><tr>${headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;}
export function field(label,input,wide=false){return `<label class="field ${wide?'wide':''}"><span>${label}</span>${input}</label>`;}
export function info(items){return `<dl class="info-grid">${items.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`;}
export function timeline(items){return `<ol class="timeline">${items.map((x,i)=>`<li><span class="timeline-dot ${i===0?'current':''}"></span><div><strong>${e(x.text)}</strong><p>${e(x.by||'فريق التشغيل')}</p></div><time>${x.time||date(x.date)}</time></li>`).join('')}</ol>`;}
export function workflow(steps,current,compact=false){return `<ol class="workflow ${compact?'compact':''}">${steps.map((s,i)=>`<li class="${i<current?'done':i===current?'current':'pending'}"><span class="step-num">${i<current?icon('check'):num(i+1)}</span><div><strong>${s}</strong><small>${i<current?'مكتمل':i===current?'المرحلة الحالية':'الخطوة التالية'}</small></div></li>`).join('')}</ol>`;}
