import http from 'node:http';
import {readFile} from 'node:fs/promises';
import handler from './api/search.js';
try{process.loadEnvFile('.env');}catch{}
const files={'/':'index.html','/app.js':'app.js','/core.js':'core.js','/style.css':'style.css'};
http.createServer(async(req,res)=>{res.status=n=>{res.statusCode=n;return res;};res.json=v=>res.end(JSON.stringify(v));const path=new URL(req.url,'http://localhost').pathname;if(path==='/api/search'){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>10000)return res.status(413).json({error:'Request terlalu besar.'});}try{req.body=JSON.parse(raw||'{}');}catch{return res.status(400).json({error:'JSON tidak valid.'});}return handler(req,res);}const file=files[path];if(!file)return res.status(404).end('Not found');res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(await readFile(new URL('./public/'+file,import.meta.url)));}).listen(3000,()=>console.log('Buka http://localhost:3000'));
