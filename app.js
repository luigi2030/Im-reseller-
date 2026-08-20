const KEY='lm_reseller_clients_v1', MOV='lm_reseller_mov_v1';
let clients=JSON.parse(localStorage.getItem(KEY)||'[]');
let movements=JSON.parse(localStorage.getItem(MOV)||'[]');
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(clients));localStorage.setItem(MOV,JSON.stringify(movements));render();}
function days(d){return Math.ceil((new Date(d)-new Date())/86400000)}
function state(c){let n=days(c.expiry);return n<0?['Vencido','bad']:n<=7?['Por vencer','warn']:['Activo','ok']}
function render(){
 let active=clients.filter(c=>state(c)[0]=='Activo').length, exp=clients.filter(c=>state(c)[0]=='Por vencer').length, expired=clients.filter(c=>state(c)[0]=='Vencido').length;
 $('active').textContent=active;$('expiring').textContent=exp;$('expired').textContent=expired;
 $('income').textContent='$'+movements.reduce((a,m)=>a+m.amount,0).toLocaleString('es-AR');
 $('summary').innerHTML=`<p>Clientes registrados: <b>${clients.length}</b></p><p>Renovaciones registradas: <b>${movements.length}</b></p>`;
 let q=($('search').value||'').toLowerCase();
 $('clientList').innerHTML=clients.filter(c=>(c.name+c.user+c.service).toLowerCase().includes(q)).map((c,i)=>{let s=state(c);return `<div class="client"><div><b>${esc(c.name)}</b><div class="muted">@${esc(c.user)} · ${esc(c.service)}</div><div class="muted">Vence: ${c.expiry} · $${Number(c.price).toLocaleString('es-AR')}</div></div><div><span class="status ${s[1]}">${s[0]}</span><br><button onclick="renew(${i})" class="primary">Renovar</button></div></div>`}).join('')||'<div class="panel">No hay clientes.</div>';
 $('renewalList').innerHTML=clients.filter(c=>days(c.expiry)<=7).map((c,i)=>`<div class="client"><div><b>${esc(c.name)}</b><div class="muted">Vence ${c.expiry}</div></div><button onclick="renew(${clients.indexOf(c)})" class="primary">Renovar</button></div>`).join('')||'<div class="panel">No hay renovaciones pendientes.</div>';
 $('movementList').innerHTML=movements.slice().reverse().map(m=>`<div class="client"><div><b>${esc(m.name)}</b><div class="muted">${m.date}</div></div><b>$${m.amount.toLocaleString('es-AR')}</b></div>`).join('')||'<div class="panel">Sin movimientos.</div>';
}
function esc(x){return String(x).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
$('clientForm').onsubmit=e=>{e.preventDefault();clients.push({name:$('name').value,user:$('user').value,service:$('service').value,price:Number($('price').value),expiry:$('expiry').value});e.target.reset();save()};
function renew(i){let c=clients[i], d=new Date(c.expiry); if(d<new Date())d=new Date(); d.setDate(d.getDate()+30); c.expiry=d.toISOString().slice(0,10); movements.push({name:c.name,amount:Number(c.price),date:new Date().toLocaleString('es-AR')});save()}
$('search').oninput=render;
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));$(b.dataset.page).classList.add('active');render()});
let deferred;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;$('install').hidden=false});$('install').onclick=async()=>{if(deferred){deferred.prompt();deferred=null}};
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
render();