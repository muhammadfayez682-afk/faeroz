// The query parameter is authoritative on the reusable resident entry page.
export function resolveRoute(hash, search, residentEntry=false) {
  const [path,query='']=(hash.replace(/^#/,'')||'/').split('?');
  if(!residentEntry)return {path,q:new URLSearchParams(query)};
  const candidate=new URLSearchParams(search).get('unit')?.trim()||'';
  const unit=/^A\d{2}-\d{3}$/.test(candidate)?candidate:'';
  const base='/service/'+unit;
  if(unit&&(path===base||path.startsWith(base+'/')))return {path,q:new URLSearchParams(query)};
  return {path:base,q:new URLSearchParams()};
}
export function residentServiceUrl(unitId,rootUrl){
  const url=new URL('service/',rootUrl);
  url.searchParams.set('unit',unitId);
  return url.href;
}
