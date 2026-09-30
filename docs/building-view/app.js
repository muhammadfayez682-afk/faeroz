(() => {
  'use strict';
  const icons = {
    building: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h1m4 0h1M9 12h1m4 0h1M9 17h1m4 0h1"/>',
    home: '<path d="m3 11 9-8 9 8M5 10v11h14V10M10 21v-7h4v7"/>',
    size: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="m8 16 8-8M8 12v4h4m0-8h4v4"/>',
    floor: '<path d="M3 21h6v-6h6V9h6V3M3 3h6m-6 0v6"/>',
    arrow: '<path d="M20 12H4m6-6-6 6 6 6"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const number = value => new Intl.NumberFormat('en-US').format(value);
  const services = ['مواقف', 'صيانة', 'نظافة المناطق المشتركة', 'أمن', 'إدارة المبنى'];
  const floors = ['الأرضي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس'];
  const bedrooms = value => value === 1 ? 'غرفة نوم' : 'غرفتان نوم';

  // Independent illustrative inventory; never reads or changes administration data.
  function makeBuilding(id, total, available, occupied, maintenance) {
    const featured = [
      {suffix:'204', bedrooms:2, bathrooms:2, size:95, floor:2, price:14000},
      {suffix:'305', bedrooms:1, bathrooms:1, size:72, floor:3, price:12000},
      {suffix:'401', bedrooms:2, bathrooms:2, size:100, floor:4, price:14000}
    ];
    const suffixes = [];
    for (let floor = 1; floor <= 5; floor++) for (let unit = 1; unit <= 12; unit++) suffixes.push(`${floor}${String(unit).padStart(2, '0')}`);
    const ordered = [...featured.map(u => u.suffix), ...suffixes.filter(s => !featured.some(u => u.suffix === s))].slice(0, total);
    const units = ordered.map((suffix, index) => {
      const spec = featured.find(u => u.suffix === suffix) || {bedrooms:index % 3 === 0 ? 1 : 2, bathrooms:index % 3 === 0 ? 1 : 2, size:index % 3 === 0 ? 70 + index % 5 : 92 + index % 10, floor:Number(suffix[0]), price:index % 3 === 0 ? 12000 : 14000};
      const status = index < available ? 'AVAILABLE' : index < available + occupied ? 'OCCUPIED' : index < available + occupied + maintenance ? 'MAINTENANCE' : 'RESERVED';
      return {id:`${id}-${suffix}`, buildingId:id, bedrooms:spec.bedrooms, bathrooms:spec.bathrooms, size:spec.size, floor:spec.floor, price:spec.price, status, services:[...services], payment:'دفعتان نصف سنويتين'};
    });
    return {name:`المبنى ${id}`, totalUnits:total, availableUnits:available, occupiedUnits:occupied, maintenanceUnits:maintenance, units};
  }
  const buildings = {
    A01: makeBuilding('A01', 50, 10, 38, 2),
    A02: makeBuilding('A02', 48, 15, 31, 2),
    B01: makeBuilding('B01', 36, 8, 24, 3)
  };
  const main = document.querySelector('#main');
  const unitDialog = document.querySelector('#unit-dialog');
  const viewingDialog = document.querySelector('#viewing-dialog');
  const feedbackDialog = document.querySelector('#feedback-dialog');
  let filter = 'all';
  let sort = 'default';
  let activeUnit = null;
  let previousFocus = null;
  const memoryTracking = {};

  // Counts only: no personal fields, external analytics or network calls.
  function track(event, buildingId, unitId = '') {
    const key = 'emdadat.building-view.demo-tracking.v1';
    let counters = memoryTracking;
    try {
      const stored = JSON.parse(localStorage.getItem(key) || '{}');
      if (stored && typeof stored === 'object' && !Array.isArray(stored)) counters = stored;
    } catch { /* The portal works with storage disabled or malformed data. */ }
    const bucket = `${event}:${buildingId}${unitId ? ':' + unitId : ''}`;
    counters[bucket] = (Number.isSafeInteger(counters[bucket]) && counters[bucket] >= 0 ? counters[bucket] : 0) + 1;
    Object.assign(memoryTracking, counters);
    try { localStorage.setItem(key, JSON.stringify(counters)); } catch { /* Keep session counters only. */ }
  }

  const requested = new URLSearchParams(location.search).get('building');
  const buildingId = requested ? requested.trim().toUpperCase() : '';
  if (!buildingId || !/^[A-Z][A-Z0-9-]{0,19}$/.test(buildingId)) {
    main.innerHTML = `<section class="empty-state"><span class="unit-icon">${icon('building')}</span><h1>تعذر تحديد المبنى.</h1><p>يرجى مسح رمز QR الموجود عند مدخل المبنى.</p></section>`;
    return;
  }
  // Other well-formed IDs reuse demo inventory in this single page.
  if (!Object.hasOwn(buildings, buildingId)) buildings[buildingId] = makeBuilding(buildingId, 48, 15, 31, 2);
  const building = buildings[buildingId];
  const availableUnits = building.units.filter(unit => unit.status === 'AVAILABLE');
  document.title = `الوحدات المتاحة — ${building.name} | إمدادات الجودة`;
  track('Building View', buildingId);

  function card(unit, nearby = false) {
    return `<article class="unit-card" data-unit="${escape(unit.id)}">${nearby ? `<p class="building-caption">المبنى <bdi>${escape(unit.buildingId)}</bdi></p>` : ''}<div class="card-top"><h3>الوحدة <bdi>${escape(unit.id)}</bdi></h3><span class="status">متاحة الآن</span></div><p class="price"><span class="price-label">الإيجار السنوي</span><strong>${number(unit.price)}</strong> ريال / سنة</p><p class="bedrooms">${bedrooms(unit.bedrooms)}</p><div class="unit-specs"><span>${icon('size')} ${unit.size} م²</span><span>${icon('floor')} الدور ${floors[unit.floor]}</span></div><button type="button" class="btn secondary" data-detail="${escape(unit.id)}" aria-label="عرض تفاصيل الوحدة ${escape(unit.id)}">عرض التفاصيل ${icon('arrow')}</button></article>`;
  }
  main.innerHTML = `<section class="hero" aria-labelledby="page-title"><div><span class="eyebrow">مساحة تناسبك، وخيارات واضحة</span><h1 id="page-title">الوحدات المتاحة<br>المبنى <bdi>${escape(buildingId)}</bdi></h1><p>استعرض الوحدات المتاحة حالياً والأسعار والمواصفات.</p></div><div class="building-seal" aria-hidden="true">${icon('building')}<span>أهلاً بك في المبنى</span><bdi>${escape(buildingId)}</bdi></div></section><section class="stats" aria-label="معلومات المبنى"><div class="stat"><span>إجمالي الوحدات</span><strong>${building.totalUnits}</strong></div><div class="stat available"><span>الوحدات المتاحة</span><strong>${building.availableUnits}</strong></div><div class="stat"><span>الوحدات المؤجرة</span><strong>${building.occupiedUnits}</strong></div><div class="stat"><span>تحت الصيانة</span><strong>${building.maintenanceUnits}</strong></div></section><section aria-labelledby="available-title"><div class="section-heading"><div><h2 id="available-title">الوحدات المتاحة حالياً</h2><p>اختر وحدتك، واطّلع على تفاصيلها بكل وضوح.</p></div><span id="results-count" class="results-count" role="status" aria-live="polite"></span></div><div class="filters"><div class="filter-tabs" role="group" aria-label="عدد غرف النوم"><button type="button" data-filter="all" aria-pressed="true">الكل</button><button type="button" data-filter="1" aria-pressed="false">غرفة نوم</button><button type="button" data-filter="2" aria-pressed="false">غرفتان نوم</button></div><label class="sort-control">ترتيب الوحدات<select id="price-sort"><option value="default">الترتيب الافتراضي</option><option value="asc">السعر الأقل</option><option value="desc">السعر الأعلى</option></select></label></div><div id="unit-grid" class="unit-grid"></div></section><section class="other-options"><div><h2>لم تجد الوحدة المناسبة؟</h2><p>استعرض وحدات أخرى متاحة في المشروع.</p></div><button class="btn secondary" type="button" id="other-options" aria-expanded="false" aria-controls="nearby">عرض خيارات أخرى ${icon('arrow')}</button></section><section class="nearby" id="nearby" aria-labelledby="nearby-title" hidden><h2 id="nearby-title">خيارات أخرى في المشروع</h2><div class="unit-grid"></div></section>`;

  function renderUnits() {
    const units = availableUnits.filter(unit => filter === 'all' || unit.bedrooms === Number(filter));
    if (sort !== 'default') units.sort((a,b) => sort === 'asc' ? a.price - b.price : b.price - a.price);
    document.querySelector('#unit-grid').innerHTML = units.length ? units.map(unit => card(unit)).join('') : '<p class="empty-state">لا توجد وحدات متاحة تطابق هذا الاختيار.</p>';
    document.querySelector('#results-count').textContent = `${units.length} وحدة متاحة`;
  }
  function findUnit(id) {
    return Object.values(buildings).flatMap(item => item.units).find(unit => unit.id === id && unit.status === 'AVAILABLE');
  }
  function header(title, id) { return `<div class="dialog-header"><h2 id="${id}">${title}</h2><button type="button" class="close" data-close aria-label="إغلاق">×</button></div>`; }
  function openDialog(dialog, rememberFocus = false) {
    if (rememberFocus) previousFocus = document.activeElement;
    for (const item of [unitDialog, viewingDialog, feedbackDialog]) if (item.open) item.close();
    dialog.showModal();
  }
  function details(unit) {
    activeUnit = unit;
    track('Unit View', unit.buildingId, unit.id);
    const rows = [['رقم الوحدة',`<bdi>${escape(unit.id)}</bdi>`],['عدد الغرف',bedrooms(unit.bedrooms)],['دورات المياه',unit.bathrooms],['المساحة',`${unit.size} م²`],['الدور',floors[unit.floor]],['حالة الوحدة','متاحة الآن'],['طريقة الدفع',escape(unit.payment)]];
    unitDialog.innerHTML = header(`الوحدة <bdi>${escape(unit.id)}</bdi>`, 'unit-dialog-title') + `<div class="dialog-body"><p class="price"><span class="price-label">السعر السنوي</span><strong>${number(unit.price)}</strong> ريال / سنة</p><dl class="detail-grid">${rows.map(([label,value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><h3 class="services-heading">الخدمات</h3><ul class="services">${unit.services.map(service => `<li>${escape(service)}</li>`).join('')}</ul><div class="dialog-actions"><button type="button" class="btn primary" data-viewing>طلب معاينة</button><button type="button" class="btn secondary" data-interest>أنا مهتم بهذه الوحدة</button></div></div>`;
    openDialog(unitDialog, true);
  }
  function viewing() {
    track('Viewing Request', activeUnit.buildingId, activeUnit.id);
    viewingDialog.innerHTML = header('طلب معاينة', 'viewing-dialog-title') + `<form id="viewing-form" class="dialog-body"><p class="demo-note">نموذج تجريبي فقط. استخدم بيانات توضيحية؛ لن تُحفظ بيانات التواصل أو تُرسل.</p><label class="form-field">الاسم<input name="name" required maxlength="80" autocomplete="off" placeholder="اكتب الاسم"></label><label class="form-field">رقم الجوال<input name="mobile" type="tel" inputmode="tel" required pattern="(?:05[0-9]{8}|(?:\\+?966)5[0-9]{8})" maxlength="13" autocomplete="off" placeholder="05xxxxxxxx" title="أدخل رقم جوال مثل 0501234567 أو +966501234567"><small>مثال توضيحي: 0501234567</small></label><label class="form-field">الوحدة المطلوبة<input name="unit" readonly value="${escape(activeUnit.id)}" dir="ltr"></label><label class="form-field">الوقت المفضل للزيارة<select name="time" required><option value="">اختر الوقت المناسب</option><option>صباحاً · 9 ص – 12 م</option><option>ظهراً · 12 م – 4 م</option><option>مساءً · 4 م – 8 م</option></select></label><label class="form-field">ملاحظات اختيارية<textarea name="notes" maxlength="500" rows="3" placeholder="هل هناك شيء تود إخبارنا به؟"></textarea></label><button class="btn primary form-submit" type="submit">إرسال طلب المعاينة</button></form>`;
    openDialog(viewingDialog);
  }
  function feedback(interested) {
    feedbackDialog.innerHTML = header('شكراً لاهتمامك', 'feedback-dialog-title') + `<div class="dialog-body"><div class="feedback"><span class="success-icon" aria-hidden="true">✓</span><h3>${interested ? 'تم تسجيل اهتمامك بالوحدة.' : 'تم تسجيل طلب المعاينة تجريبياً.'}</h3><p>الوحدة <bdi>${escape(activeUnit.id)}</bdi></p><p>${interested ? 'سيتواصل معك فريق التأجير.' : 'تم اختيار وقت الزيارة بنجاح.'}</p><p class="demo-note">هذه محاكاة فقط؛ لم تُرسل بياناتك، ولن يجري تواصل فعلي.</p><button type="button" class="btn primary" data-close>متابعة استعراض الوحدات</button></div></div>`;
    openDialog(feedbackDialog);
    viewingDialog.replaceChildren();
  }
  main.addEventListener('click', event => {
    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) {
      filter = filterButton.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === filterButton)));
      renderUnits();
    }
    const detailButton = event.target.closest('[data-detail]');
    if (detailButton) { const unit = findUnit(detailButton.dataset.detail); if (unit) details(unit); }
    if (event.target.closest('#other-options')) {
      const nearby = document.querySelector('#nearby');
      nearby.hidden = !nearby.hidden;
      document.querySelector('#other-options').setAttribute('aria-expanded', String(!nearby.hidden));
      if (!nearby.hidden) {
        const options = Object.entries(buildings).filter(([id]) => id !== buildingId).slice(0, 2).map(([,item]) => item.units.find(unit => unit.status === 'AVAILABLE')).filter(Boolean);
        nearby.querySelector('.unit-grid').innerHTML = options.map(unit => card(unit, true)).join('');
        nearby.scrollIntoView({behavior:'auto',block:'start'});
      }
    }
  });
  document.querySelector('#price-sort').addEventListener('change', event => { sort = event.target.value; renderUnits(); });
  for (const dialog of [unitDialog, viewingDialog, feedbackDialog]) {
    dialog.addEventListener('click', event => {
      if (event.target.closest('[data-close]')) { dialog.close(); previousFocus?.focus(); }
      if (event.target.closest('[data-viewing]')) viewing();
      if (event.target.closest('[data-interest]')) feedback(true);
    });
    dialog.addEventListener('cancel', () => { requestAnimationFrame(() => previousFocus?.focus()); });
    dialog.addEventListener('close', () => { if (dialog === viewingDialog && !dialog.open) viewingDialog.replaceChildren(); });
  }
  viewingDialog.addEventListener('submit', event => {
    if (event.target.id !== 'viewing-form') return;
    event.preventDefault();
    track('Viewing Submitted', activeUnit.buildingId, activeUnit.id);
    feedback(false);
  });
  renderUnits();
})();
