export const normalize = s => String(s || '').normalize('NFKC').toLowerCase().replace(/^\[(pdf|html|citation|book)\]\s*/i,'').replace(/[^\p{L}\p{N}]/gu,'');
export function mergeRows(old, incoming) {
  const out = [...old]; let duplicates = 0;
  const ids = new Set(old.map(r=>r.id).filter(Boolean));
  const titles = new Set(old.map(r=>normalize(r.title)).filter(Boolean));
  for (const r of incoming) {
    const title = normalize(r.title);
    if (r.id && ids.has(r.id) || title && titles.has(title)) {duplicates++; continue;}
    out.push(r); if(r.id) ids.add(r.id); if(title) titles.add(title);
  }
  return {rows:out,duplicates};
}
const line = s => String(s ?? '').replace(/[\r\n]+/g,' ').trim();
const csvCell = s => {let v=line(s); if(/^[=+@\-\t]/.test(v)) v="'"+v; return '"'+v.replaceAll('"','""')+'"';};
export function csv(rows) {
  const fields=['Title','Authors','Year','Publication information','Citations','URL','Source profile','Profile name','Retrieved at','Scholar result ID'];
  return '\uFEFF'+[fields,...rows.map(r=>[r.title,r.authorsRaw||r.authors.join('; '),r.year||'',r.publication,r.citations,r.url,r.query,r.profileName||'',r.retrievedAt,r.id])].map(r=>r.map(csvCell).join(',')).join('\r\n');
}
export function ris(rows) {
  return rows.map(r=>['TY  - GEN','TI  - '+line(r.title),...r.authors.filter(a=>a!=='...'&&a!=='…').map(a=>'AU  - '+line(a)),...(r.year?['PY  - '+line(r.year)]:[]),...(r.url?['UR  - '+line(r.url)]:[]),'N1  - Publication information: '+line(r.publication),'N1  - Authors as displayed on profile: '+line(r.authorsRaw||r.authors.join(', ')),'N1  - Cited by: '+line(r.citations),'N1  - Source profile: '+line(r.query)+'; retrieved: '+line(r.retrievedAt),'ER  - '].join('\r\n')).join('\r\n\r\n');
}
