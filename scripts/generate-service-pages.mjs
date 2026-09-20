import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
const template=readFileSync('dist/index.html','utf8');
const page=template
  .replace(/<meta name="description"[^>]*>/,'<meta name="description" content="خدمات السكان — أرسل طلبك وتابع حالته." />')
  .replace(/<title>[^<]*<\/title>/,'<meta name="resident-service" content="true" /><title>خدمات السكان | إمدادات الجودة</title>')
  .replaceAll('href="./','href="../').replaceAll('src="./','src="../');
for(const root of ['dist','docs']){
  mkdirSync(root+'/service',{recursive:true});
  writeFileSync(root+'/service/index.html',page);
}
console.log('Generated one reusable service/index.html in dist and docs; unit comes from the query parameter.');
