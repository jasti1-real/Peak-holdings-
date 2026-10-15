const response = (data, status=200) => new Response(JSON.stringify(data), {status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const enc = new TextEncoder();
const b64 = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const id = () => crypto.randomUUID();
async function hash(text){return b64(await crypto.subtle.digest("SHA-256",enc.encode(text)))}
async function makePassword(password,salt=b64(crypto.getRandomValues(new Uint8Array(16)))){const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:enc.encode(salt),iterations:310000,hash:"SHA-256"},key,256);return salt+"."+b64(bits)}
async function checkPassword(password,stored){const salt=(stored||"").split(".")[0];if(!salt)return false;return (await makePassword(password,salt)).split(".")[1]===stored.split(".")[1]}
const phoneNorm=v=>String(v||"").replace(/[\s()-]/g,"");
const validPhone=v=>/^\+?\d{9,15}$/.test(v);
const makeCode=()=> "PK"+b64(crypto.getRandomValues(new Uint8Array(9))).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8);
async function authUser(request,env){const token=(request.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");if(!token)return null;return await env.DB.prepare("SELECT u.id,u.name,u.phone,u.referral_code FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.status='active'").bind(await hash(token),new Date().toISOString()).first()}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{"access-control-allow-origin":env.ALLOWED_ORIGIN||"*","access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type,authorization"}});
 const headers={"access-control-allow-origin":env.ALLOWED_ORIGIN||"*","vary":"Origin"};
 const send=(data,status=200)=>{const r=response(data,status);const h=new Headers(r.headers);for(const [k,v] of Object.entries(headers))h.set(k,v);return new Response(r.body,{status:r.status,headers:h})};
 if(!env.DB)return send({error:"Database binding DB is missing."},500);
 try{
  if(request.method==="GET"&&url.pathname==="/api/health"){await env.DB.prepare("SELECT 1").first();return send({ok:true,database:"connected",service:"peak-holdings-api"})}
  if(request.method==="GET"&&url.pathname==="/api/products"){const q=await env.DB.prepare("SELECT id,name,price_ugx,daily_income_ugx,duration_days FROM products WHERE active=1 ORDER BY id").all();return send({products:q.results})}
  if(request.method==="POST"&&url.pathname==="/api/register"){
   const body=await request.json(),name=String(body.name||"").trim(),phone=phoneNorm(body.phone),password=String(body.password||""),referral=String(body.referral||"").trim().toUpperCase();
   if(name.length<2||name.length>80||!validPhone(phone)||password.length<10||password.length>128)return send({error:"Enter a name, valid phone number, and password of at least 10 characters."},400);
   if(await env.DB.prepare("SELECT id FROM users WHERE phone=?").bind(phone).first())return send({error:"An account already exists for this telephone number."},409);
   let referrer=null;if(referral){referrer=await env.DB.prepare("SELECT id FROM users WHERE referral_code=? AND status='active'").bind(referral).first();if(!referrer)return send({error:"Referral code not found."},400)}
   const userId=id(),referralCode=makeCode(),passwordHash=await makePassword(password),token=b64(crypto.getRandomValues(new Uint8Array(32))),expiry=new Date(Date.now()+7*86400000).toISOString();
   try{await env.DB.batch([
    env.DB.prepare("INSERT INTO users(id,name,phone,password_hash,referral_code,referred_by_user_id) VALUES(?,?,?,?,?,?)").bind(userId,name,phone,passwordHash,referralCode,referrer?referrer.id:null),
    env.DB.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)").bind(await hash(token),userId,expiry),
    env.DB.prepare("INSERT INTO ledger(id,user_id,type,direction,amount_ugx,status,reference,description) VALUES(?,?,'welcome_bonus','credit',5000,'successful',?,'Registration welcome bonus')").bind(id(),userId,"welcome_"+userId)
   ])}catch(e){return send({error:"Account creation failed. Please try again."},500)}
   return send({user:{id:userId,name,phone,referralCode},token,bonusUgx:5000},201)
  }
  if(request.method==="POST"&&url.pathname==="/api/login"){
   const body=await request.json(),phone=phoneNorm(body.phone),password=String(body.password||"");if(!validPhone(phone)||!password)return send({error:"Enter phone and password."},400);
   const u=await env.DB.prepare("SELECT id,name,phone,password_hash,referral_code,status FROM users WHERE phone=?").bind(phone).first();
   if(!u||u.status!=="active"||!(await checkPassword(password,u.password_hash)))return send({error:"Invalid telephone number or password."},401);
   const token=b64(crypto.getRandomValues(new Uint8Array(32))),expiry=new Date(Date.now()+7*86400000).toISOString();await env.DB.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)").bind(await hash(token),u.id,expiry).run();
   return send({user:{id:u.id,name:u.name,phone:u.phone,referralCode:u.referral_code},token})
  }
  if(request.method==="POST"&&url.pathname==="/api/logout"){const token=(request.headers.get("authorization")||"").replace(/^Bearer\s+/i,"");if(token)await env.DB.prepare("DELETE FROM sessions WHERE token_hash=?").bind(await hash(token)).run();return send({ok:true})}
  if(request.method==="GET"&&url.pathname==="/api/me"){
   const u=await authUser(request,env);if(!u)return send({error:"Authentication required."},401);
   const bal=await env.DB.prepare("SELECT COALESCE(SUM(CASE WHEN direction='credit' AND status='successful' THEN amount_ugx WHEN direction='debit' AND status='successful' THEN -amount_ugx ELSE 0 END),0) AS balance FROM ledger WHERE user_id=?").bind(u.id).first();
   const ledger=await env.DB.prepare("SELECT type,direction,amount_ugx,status,reference,description,created_at FROM ledger WHERE user_id=? ORDER BY created_at DESC LIMIT 100").bind(u.id).all();
   return send({user:u,balanceUgx:bal.balance,ledger:ledger.results})
  }
  return send({error:"Not found."},404)
 }catch(e){return send({error:"Unexpected server error."},500)}
}};