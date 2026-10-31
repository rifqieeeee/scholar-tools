import { timingSafeEqual } from 'node:crypto';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({error:'Gunakan POST.'});
  const secret = process.env.APP_PASSWORD;
  if (!secret || !process.env.SERPAPI_API_KEY) return res.status(503).json({error:'Atur SERPAPI_API_KEY dan APP_PASSWORD di Environment Variables, lalu redeploy.'});
  const supplied = String(req.headers['x-app-password'] || '');
  if (Buffer.byteLength(supplied) !== Buffer.byteLength(secret) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))) return res.status(401).json({error:'Password akses salah.'});
  const b = typeof req.body === 'object' && req.body ? req.body : {};
  let authorId = '';
  try {
    const u = new URL(String(b.profile || ''));
    if (u.protocol !== 'https:' || u.hostname !== 'scholar.google.com' || u.pathname !== '/citations') throw Error();
    authorId = u.searchParams.get('user') || '';
  } catch { return res.status(400).json({error:'Masukkan URL profil https://scholar.google.com/citations?user=ID_PROFIL'}); }
  const start = b.start ?? 0;
  if (!/^[a-zA-Z0-9_-]{6,40}$/.test(authorId) || !Number.isInteger(start) || start < 0 || start > 100000 || start % 100) return res.status(400).json({error:'ID profil atau halaman tidak valid.'});
  const p = new URLSearchParams({engine:'google_scholar_author',author_id:authorId,api_key:process.env.SERPAPI_API_KEY,hl:'en',num:'100',start:String(start)});
  try {
    const upstream = await fetch('https://serpapi.com/search.json?'+p, {signal:AbortSignal.timeout(25000)});
    const data = await upstream.json();
    if (!upstream.ok || data.error) return res.status(upstream.status === 429 ? 429 : 502).json({error:upstream.status === 429 ? 'Kuota atau batas permintaan SerpApi tercapai. Periksa dashboard Anda.' : 'SerpApi gagal memproses pencarian. Periksa API key dan kuota di dashboard SerpApi.'});
    const time = new Date().toISOString();
    const profileURL = 'https://scholar.google.com/citations?user='+authorId;
    const rows = (data.articles || []).map(r=>({id:r.citation_id || '',title:r.title || '',authors:String(r.authors || '').split(',').map(a=>a.trim()).filter(Boolean),authorsRaw:String(r.authors || ''),publication:r.publication || '',year:r.year || '',snippet:'',url:r.link || '',citations:r.cited_by?.value ?? null,query:profileURL,authorId,profileName:data.author?.name || '',retrievedAt:time}));
    return res.status(200).json({rows,start,nextStart:rows.length && Boolean(data.serpapi_pagination?.next) ? start+100 : null,profile:{id:authorId,name:data.author?.name || '',affiliations:data.author?.affiliations || '',url:profileURL,metrics:data.cited_by?.table || []}});

  } catch {return res.status(502).json({error:'Koneksi ke SerpApi gagal atau melebihi waktu tunggu. Coba kembali.'});}
}
