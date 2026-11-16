const page = "__PAGE_HTML__";
const consentVersion='early-access-v1';
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const privacy=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rivetara — Early-access privacy</title><style>body{margin:0;padding:60px 24px;background:#f5f3ed;color:#162e28;font:16px/1.8 system-ui}main{max-width:680px;margin:auto}a{color:inherit}h1{font-size:36px;letter-spacing:-1px;line-height:1.2}h2{font-size:20px;margin-top:32px}</style><main><a href="/">← Back to Rivetara</a><h1>Your email. A clear purpose.</h1><p>This notice covers the Rivetara early-access list.</p><h2>What we collect</h2><p>Your email address, the date you join and a record of your consent to receive early-access and product updates.</p><h2>How it is used</h2><p>To keep you informed about Rivetara, product progress and early-access availability. Joining does not create a paid account or guarantee access.</p><h2>Storage and access</h2><p>Signups are stored in the site’s hosted database. The public page does not expose the list. The site owner can access signup records through the hosting tools.</p><h2>Your choices</h2><p>Signing up is optional. Future update emails will need to include an unsubscribe link. No automated marketing emails are sent by this page.</p></main></html>`;
export default {async fetch(request,env){
const url=new URL(request.url);
if(url.pathname==='/api/early-access'){
 if(request.method!=='POST')return new Response(null,{status:405,headers:{Allow:'POST'}});
 if(request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return json({error:'Please sign up from the Rivetara website.'},403);
 if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'Please use the signup form.'},415);
 if(Number(request.headers.get('Content-Length')||0)>4096)return json({error:'This request is too large.'},413);
 let data;try{const text=await request.text();if(text.length>4096)return json({error:'This request is too large.'},413);data=JSON.parse(text);}catch{return json({error:'Please check your email and try again.'},400);}
 if(!data||typeof data!=='object')return json({error:'Please check your email and try again.'},400);
 if(data.website)return json({ok:true});
 const email=typeof data.email==='string'?data.email.trim().toLowerCase():'';
 if(email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return json({error:'Enter a valid email address.'},400);
 if(data.consent!==true)return json({error:'Please agree to receive early-access and product updates.'},400);
 if(!env.DB)return json({error:'Signups are temporarily unavailable. Please try again shortly.'},503);
 try{await env.DB.prepare('INSERT INTO early_access_signups (email, consent_version) VALUES (?, ?) ON CONFLICT(email) DO NOTHING').bind(email,consentVersion).run();return json({ok:true});}catch{return json({error:'We couldn’t save your email. Please try again shortly.'},503);}
}
if(request.method!=='GET'&&request.method!=='HEAD')return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
if(url.pathname!=='/'&&url.pathname!=='/privacy')return new Response('Not found',{status:404});
return new Response(request.method==='HEAD'?null:url.pathname==='/privacy'?privacy:page,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'}});
}};
