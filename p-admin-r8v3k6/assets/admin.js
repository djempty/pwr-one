(function(){
var q=function(x,r){return (r||document).querySelector(x)},qa=function(x,r){return [].slice.call((r||document).querySelectorAll(x))};
var H=document.documentElement,body=document.body,page=body.getAttribute('data-page');
var ME='S. Whitfield';
var RN={owner:'Owner',administrator:'Administrator',board:'Board',support:'Support',auditor:'Auditor'};
var ALL=['owner','administrator','board','support','auditor'];
/* what each role can open */
var PG={dashboard:ALL,approvals:['owner','administrator','auditor'],monthend:['owner','administrator','auditor'],members:['owner','administrator','board','auditor'],voting:['owner','administrator','board','auditor'],documents:['owner','administrator','board','auditor'],messages:ALL,audit:['owner','administrator','auditor'],admins:['owner'],settings:['owner','administrator','board','auditor']};
/* what each role can do */
var CAP={approve:['owner','administrator'],monthend:['owner','administrator'],vote:['owner','board'],nominate:['owner','board'],publish:['owner','administrator','board'],notice:['owner','administrator','board'],reply:['owner','administrator','support'],faq:['owner','administrator','support'],admins:['owner'],settings:['owner']};
function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){}}
var role=ss('pgadmin-role');if(!RN[role])role='owner';
var theme;try{theme=localStorage.getItem('pgadmin-theme')}catch(e){}
function can(c){return CAP[c].indexOf(role)>-1}
function reqText(c){var l=CAP[c].map(function(r){return RN[r]});return 'Requires '+(l.length>1?l.slice(0,-1).join(', ')+' or '+l[l.length-1]:l[0])}

/* ---------- tooltip ---------- */
var tip=document.getElementById('tip');
function showTip(el){var t=el.getAttribute('data-tip');if(!t)return;tip.textContent=t;tip.classList.add('on');var r=el.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;var x=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8),y=r.top-h-8;if(y<8)y=r.bottom+8;tip.style.left=x+'px';tip.style.top=y+'px'}
function hideTip(){tip.classList.remove('on')}
document.addEventListener('mouseover',function(e){var el=e.target.closest&&e.target.closest('[data-tip]');if(el)showTip(el)});
document.addEventListener('mouseout',function(e){if(e.target.closest&&e.target.closest('[data-tip]'))hideTip()});
document.addEventListener('focusin',function(e){var el=e.target.closest&&e.target.closest('[data-tip]');if(el)showTip(el)});
document.addEventListener('focusout',hideTip);addEventListener('scroll',hideTip,true);

/* ---------- toast ---------- */
var tt,toast=document.getElementById('toast');
function say(m){toast.textContent=m;toast.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('on')},4000)}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[aria-disabled=true]');if(b){e.preventDefault();e.stopImmediatePropagation()}},true);

/* ---------- role application ---------- */
var blockExtra=[];
function applyRole(){
 H.setAttribute('data-role',role);
 var sel=q('#rolesel');if(sel)sel.value=role;
 qa('[data-pg]').forEach(function(a){a.hidden=PG[a.getAttribute('data-pg')].indexOf(role)<0});
 qa('.ngw').forEach(function(g){var vis=qa('[data-pg]',g).some(function(a){return !a.hidden});g.hidden=!vis});
 qa('.ng').forEach(function(g){var n=g.nextElementSibling,vis=false;while(n&&!n.classList.contains('ng')){if(n.hasAttribute('data-pg')&&!n.hidden)vis=true;n=n.nextElementSibling}g.hidden=!vis});
 qa('[data-needs]').forEach(function(el){el.hidden=PG[el.getAttribute('data-needs')].indexOf(role)<0});
 var okPage=PG[page].indexOf(role)>-1;
 var pb=q('#pagebody'),rs=q('#restricted');if(pb)pb.hidden=!okPage;if(rs){rs.hidden=okPage;if(!okPage){var need=PG[page].map(function(r){return RN[r]});q('#rneed').textContent='Requires '+need.join(', ')+'.'}}
 var ur=q('#userroles');if(ur)ur.textContent=role==='owner'?'Owner · Administrator':RN[role];
 var st=q('#rolestrip');if(st){st.hidden=role==='owner';q('b',st).textContent=RN[role];q('#rsnote',st).textContent=role==='auditor'?'Read-only on everything, including the audit log.':'Navigation and actions follow this role.'}
 qa('[data-cap]').forEach(function(el){
  var c=el.getAttribute('data-cap'),ok=can(c),why=el.getAttribute('data-block'),dis=false,msg='';
  if(!ok){dis=true;msg=role==='auditor'?'Auditor is read-only. '+reqText(c)+'.':reqText(c)+'.'}
  else if(why){dis=true;msg=why}
  if(dis){el.setAttribute('aria-disabled','true');el.setAttribute('data-tip',msg);el.setAttribute('tabindex','0')}
  else{el.removeAttribute('aria-disabled');el.removeAttribute('data-tip');el.removeAttribute('tabindex')}
 });
 qa('[data-capzone]').forEach(function(z){var ok=can(z.getAttribute('data-capzone'));qa('input,select,textarea',z).forEach(function(i){i.disabled=!ok});var n=q('.zn',z);if(n){n.hidden=ok;n.textContent=(role==='auditor'?'Read-only for the Auditor role. ':'Read-only for this role. ')+reqText(z.getAttribute('data-capzone'))+' to change these.'}});
 /* Board may publish notices only */
 var cat=q('#docCat');if(cat){qa('option',cat).forEach(function(o){o.disabled=role==='board'&&o.value!=='Notice'});if(role==='board')cat.value='Notice';var bh=q('#boardHint');if(bh)bh.hidden=role!=='board'}
 var sb=q('#sbmsg');if(sb){}
 document.dispatchEvent(new Event('rolechange'));
}
var rsel=q('#rolesel');if(rsel)rsel.addEventListener('change',function(){role=rsel.value;ss('pgadmin-role',role);applyRole()});

/* ---------- theme ---------- */
var tb=q('#thm');
function setTheme(t){H.setAttribute('data-theme',t);try{localStorage.setItem('pgadmin-theme',t)}catch(e){}if(tb)tb.textContent=t==='dark'?'Light':'Dark'}
if(tb){tb.textContent=H.getAttribute('data-theme')==='dark'?'Light':'Dark';tb.addEventListener('click',function(){setTheme(H.getAttribute('data-theme')==='dark'?'light':'dark')})}

/* ---------- session timer ---------- */
var t0=+ss('pgadmin-t0');if(!t0){t0=Date.now()-4*60000-18000;ss('pgadmin-t0',String(t0))}
function tick(){var left=Math.max(0,1800-Math.floor((Date.now()-t0)/1000)),m=Math.floor(left/60),s=left%60,el=q('#sesst');if(!el)return;el.textContent=left?(m+':'+(s<10?'0':'')+s):'Expired';q('#sess').classList.toggle('low',left<300)}
tick();setInterval(tick,1000);

/* ---------- mobile menu ---------- */
var hb=q('#hb'),mm=q('#mm');
if(hb)hb.addEventListener('click',function(){var o=!mm.classList.contains('open');mm.classList.toggle('open',o);hb.setAttribute('aria-expanded',o);hb.setAttribute('aria-label',o?'Close menu':'Open menu');H.style.overflow=o?'hidden':''});

/* ---------- drawer / modal plumbing ---------- */
var scrim=q('#scrim'),dr=q('#drawer'),md=q('#modal'),lastFocus=null;
function openDrawer(){lastFocus=document.activeElement;scrim.classList.add('on');dr.classList.add('on');dr.setAttribute('aria-hidden','false');setTimeout(function(){var x=q('.x',dr);x&&x.focus()},50)}
function closeDrawer(){dr.classList.remove('on');dr.setAttribute('aria-hidden','true');if(!md.classList.contains('on'))scrim.classList.remove('on');if(lastFocus)lastFocus.focus()}
function closeModal(){md.classList.remove('on');md.setAttribute('aria-hidden','true');if(!dr.classList.contains('on'))scrim.classList.remove('on')}
if(scrim)scrim.addEventListener('click',function(){if(md.classList.contains('on'))closeModal();else closeDrawer()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(md&&md.classList.contains('on'))closeModal();else if(dr&&dr.classList.contains('on'))closeDrawer()}});
if(dr)dr.addEventListener('click',function(e){if(e.target.closest('[data-x]'))closeDrawer()});
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var KEYSVG='<svg viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="12" cy="17" r="6"/><path d="M18 17h14M27 17v5M23 17v3"/></svg>';
/* generic modal: opts{k,title,html,confirm,key,onDone,cancelOnly} */
function modal(o){
 lastFocus=document.activeElement;
 md.innerHTML='<div class="k">'+esc(o.k||'Confirm')+'</div><h2 id="mt">'+esc(o.title)+'</h2><div id="mb">'+(o.html||'')+'</div><div class="mf" id="mf"></div>';
 md.setAttribute('aria-labelledby','mt');
 var mf=q('#mf',md);
 function btn(t,c,fn,id){var b=document.createElement('button');b.type='button';b.className='btn '+c;b.textContent=t;if(id)b.id=id;b.addEventListener('click',fn);mf.appendChild(b);return b}
 function done(){closeModal();o.onDone&&o.onDone()}
 function keyStep(){
  var mb=q('#mb',md);mf.innerHTML='';q('.k',md).textContent='Security key required';
  mb.innerHTML=(o.summary||'')+'<div class="key" id="keyv"><div class="ring">'+KEYSVG+'</div><b>Touch your security key</b><p>Waiting for FIDO2 key (YubiKey 5C, ending 4F21).</p></div>';
  btn('Cancel','ghost',closeModal);
  btn('Simulate touch','',function(){
   var kv=q('#keyv',md);kv.querySelector('b').textContent='Verifying';kv.querySelector('p').textContent='Checking the assertion with the console.';
   setTimeout(function(){kv.classList.add('ok');kv.querySelector('b').textContent='Confirmed';kv.querySelector('p').textContent='Mock only. Nothing is posted.';setTimeout(done,610)},377);
  },'touch');
  setTimeout(function(){var t=q('#touch');t&&t.focus()},60);
 }
 if(o.key){btn('Cancel','ghost',closeModal);btn(o.confirm||'Continue','',function(){if(o.validate&&!o.validate(md))return;keyStep()},'cont')}
 else{btn('Cancel','ghost',closeModal);btn(o.confirm||'Confirm','',function(){closeModal();o.onDone&&o.onDone(md)})}
 scrim.classList.add('on');md.classList.add('on');md.setAttribute('aria-hidden','false');
 setTimeout(function(){var f=q('textarea,input,#cont',md);f&&f.focus()},60);
}
window.AdminUI={modal:modal,say:say,esc:esc,can:can,role:function(){return role},ME:ME,applyRole:applyRole,openDrawer:openDrawer,closeDrawer:closeDrawer,drawer:dr};

/* generic mock buttons */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-mock]');if(!b||b.getAttribute('aria-disabled')==='true')return;say(b.getAttribute('data-mock'))});
/* generic key-confirmed actions */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-keyact]');if(!b||b.getAttribute('aria-disabled')==='true')return;
 modal({k:'Confirm with hardware key',title:b.getAttribute('data-keyact'),html:'<div class="sum">'+esc(b.getAttribute('data-keysum')||'')+'<span>Recorded in the audit log with your admin ID, role and device.</span></div>',key:true,confirm:'Continue',onDone:function(){var d=b.getAttribute('data-done');if(d)say(d);document.dispatchEvent(new CustomEvent('keyact',{detail:b}))}});
});

applyRole();

/* ---------- load animation: every load, skipped on back/forward and reduced motion ---------- */
(function(){
 var rm=matchMedia('(prefers-reduced-motion:reduce)').matches,skip=false;
 try{var nv=performance.getEntriesByType('navigation')[0];skip=nv&&nv.type==='back_forward'}catch(e){}
 if(rm||skip||!H.animate)return;
 var E='cubic-bezier(.16,1,.3,1)';
 function an(el,kf,o){return el.animate(kf,Object.assign({easing:E,fill:'backwards'},o))}
 var cards=qa('main #pagebody .card:not([hidden]), main #pagebody .kpi:not([hidden])').filter(function(c){return !c.closest('[hidden]')&&!c.closest('.card .card')});
 cards.forEach(function(c,i){an(c,[{opacity:0,transform:'translateY(13px)'},{opacity:1,transform:'none'}],{duration:610,delay:i*55})});
 qa('main #pagebody .tbl tbody').forEach(function(tb){qa('tr',tb).slice(0,9).forEach(function(r,i){an(r,[{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:377,delay:233+i*55})})});
 qa('main #pagebody .pbar2 i').forEach(function(b,i){an(b,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:987,delay:377+i*55})});
 qa('main #pagebody .seats i.f').forEach(function(s,i){an(s,[{opacity:0},{opacity:1}],{duration:233,delay:233+i*8})});
 var h1=q('main h1');if(h1&&q('#pagebody:not([hidden])')){}
 /* figures count up from 98% */
 qa('.num[data-v]').forEach(function(el,i){var fin=+el.getAttribute('data-v'),dec=+(el.getAttribute('data-d')||0),pre=el.getAttribute('data-p')||'',st=fin*.98,t0=performance.now()+144+i*55,dur=987;
  function f(v){return pre+v.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec})}
  function step(n){var x=Math.min(1,Math.max(0,(n-t0)/dur));x=1-Math.pow(1-x,3);el.textContent=f(st+(fin-st)*x);if(n-t0<dur)requestAnimationFrame(step);else el.textContent=f(fin)}
  el.textContent=f(st);requestAnimationFrame(step)});
})();

/* ---------- page modules ---------- */
var mod=window.PageModules||{};
if(mod[page])mod[page]({q:q,qa:qa,modal:modal,say:say,esc:esc,can:can,role:function(){return role},ME:ME,openDrawer:openDrawer,closeDrawer:closeDrawer});
})();
