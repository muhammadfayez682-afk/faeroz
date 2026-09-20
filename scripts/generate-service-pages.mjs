import {makeData} from '../dist/data.js';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
const template=readFileSync('dist/index.html','utf8');
for(const unit of makeData().units){
  const directory='dist/service/'+unit.id;
  mkdirSync(directory,{recursive:true});
  const page=template.replace('content="إمدادات الجودة — نموذج استثماري تفاعلي لإدارة وتشغيل العقارات. مشروع حي النواة، حارة الفيروز."','content="خدمات السكان — أرسل طلبك وتابع حالته."').replace('<title>إمدادات الجودة | إدارة وتشغيل العقارات</title>',`<meta name="service-unit" content="${unit.id}" /><title>خدمات السكان | ${unit.id}</title>`).replaceAll('href="./','href="../../').replaceAll('src="./','src="../../');
  writeFileSync(directory+'/index.html',page);
}
console.log('Generated direct QR entry pages for all 572 units.');
