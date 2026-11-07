(function(){
var q=function(x,r){return (r||document).querySelector(x)},qa=function(x,r){return [].slice.call((r||document).querySelectorAll(x))};
var H=document.documentElement,body=document.body,page=body.getAttribute('data-page');
var ME='Mike Telford';
var RN={owner:'Owner',administrator:'Administrator',board:'Board',support:'Support',auditor:'Auditor'};
var ALL=['owner','administrator','board','support','auditor'];
/* what each role can open */
var PG={dashboard:ALL,approvals:['owner','administrator','auditor'],monthend:['owner','administrator','auditor'],members:['owner','administrator','board','auditor'],voting:['owner','administrator','board','auditor'],documents:['owner','administrator','board','auditor'],messages:ALL,audit:['owner','administrator','auditor'],profile:ALL,admins:['owner'],settings:['owner','administrator','board','auditor']};
/* what each role can do */
var CAP={approve:['owner','administrator'],monthend:['owner','administrator'],vote:['owner','administrator','board'],nominate:['owner','board'],publish:['owner','administrator','board'],notice:['owner','administrator','board'],reply:['owner','administrator','support'],faq:['owner','administrator','support'],admins:['owner'],settings:['owner'],contact:['owner','administrator','board','support'],note:['owner','administrator','board','support'],freeze:['owner','administrator']};
function ss(k,v){try{if(v===undefined)return sessionStorage.getItem(k);sessionStorage.setItem(k,v)}catch(e){}}
var VIEWS={mike:['owner','board','support','auditor'],eric:ALL,owner:['owner'],administrator:['administrator'],board:['board'],support:['support'],auditor:['auditor']};
var view=ss('pgadmin-role');if(!VIEWS[view])view='mike';
var roles=VIEWS[view],role=view;
var theme;try{theme=localStorage.getItem('pgadmin-theme')}catch(e){}
function ok(list){return list.some(function(r){return roles.indexOf(r)>-1})}
function can(c){return ok(CAP[c])}
function other(){return ME==='Eric Savics'?'Mike Telford':'Eric Savics'}
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
function applyRole(){
 roles=VIEWS[view];role=view;ME=view==='eric'?'Eric Savics':'Mike Telford';
 var single=roles.length===1,onlyAud=single&&roles[0]==='auditor';
 H.setAttribute('data-role',view);
 var sel=q('#rolesel');if(sel)sel.value=view;
 qa('[data-pg]').forEach(function(a){a.hidden=!ok(PG[a.getAttribute('data-pg')])});
 qa('[data-needs]').forEach(function(el){el.hidden=!ok(PG[el.getAttribute('data-needs')])});
 var okPage=ok(PG[page]);
 var pb=q('#pagebody'),rs=q('#restricted');if(pb)pb.hidden=!okPage;if(rs){rs.hidden=okPage;if(!okPage){q('#rneed').textContent='Requires '+PG[page].map(function(r){return RN[r]}).join(', ')+'.'}}
 var rl=roles.map(function(r){return RN[r]}).join(' \u00b7 ');
 ['#usrname','#whoName'].forEach(function(i){var e=q(i);if(e)e.textContent=ME});
 var ur=q('#userroles');if(ur)ur.textContent=rl;var u2=q('#userroles2');if(u2)u2.textContent=rl;
 var st=q('#rolestrip');if(st){st.hidden=!single;q('b',st).textContent=RN[roles[0]];q('#rsnote',st).textContent=onlyAud?'Read-only on everything, including the audit log.':'Navigation and actions follow this role.'}
 qa('[data-who]').forEach(function(e){e.textContent=e.getAttribute('data-who')===ME?' (you)':''});
 qa('[data-cap]').forEach(function(el){
  var c=el.getAttribute('data-cap'),why=el.getAttribute('data-block'),prep=el.getAttribute('data-prep'),dis=false,msg='';
  if(!can(c)){dis=true;msg=(onlyAud?'Auditor is read-only. ':'')+reqText(c)+'.'}
  else if(prep&&prep===ME){dis=true;msg='You prepared this. '+other()+' must approve.'}
  else if(why){dis=true;msg=why}
  if(dis){el.setAttribute('aria-disabled','true');el.setAttribute('data-tip',msg);el.setAttribute('tabindex','0')}
  else{el.removeAttribute('aria-disabled');el.removeAttribute('data-tip');el.removeAttribute('tabindex')}
 });
 qa('[data-capzone]').forEach(function(z){var okz=can(z.getAttribute('data-capzone'));qa('input,select,textarea',z).forEach(function(i){i.disabled=!okz});var n=q('.zn',z);if(n){n.hidden=okz;n.textContent=(onlyAud?'Read-only for the Auditor role. ':'Read-only for this role. ')+reqText(z.getAttribute('data-capzone'))+' to change these.'}});
 var cat=q('#docCat');if(cat){var bo=!ok(['owner','administrator'])&&ok(['board']);qa('option',cat).forEach(function(o){o.disabled=bo&&o.value!=='Notice'});if(bo)cat.value='Notice';var bh=q('#boardHint');if(bh)bh.hidden=!bo}
 document.dispatchEvent(new Event('rolechange'));
}
var rsel=q('#rolesel');if(rsel)rsel.addEventListener('change',function(){view=rsel.value;ss('pgadmin-role',view);applyRole()});

/* ---------- ADMIN tag: spans exactly the RITY portion of the wordmark ---------- */
function fitAdm(){var ry=q('.ry'),ad=q('.adm');if(!ry||!ad)return;if(matchMedia('(max-width:900px)').matches){ad.removeAttribute('style');return}var t=ry.firstChild,r=document.createRange();r.setStart(t,0);r.setEnd(t,t.length);var b=r.getBoundingClientRect(),o=ry.getBoundingClientRect();
 ad.style.left=(b.left-o.left)+'px';ad.style.width=b.width+'px';ad.style.letterSpacing='0px';
 var n=ad.firstChild,r2=document.createRange();r2.setStart(n,0);r2.setEnd(n,n.length);var w0=r2.getBoundingClientRect().width;
 ad.style.letterSpacing=((b.width-12-w0)/(n.length-1))+'px'}
fitAdm();addEventListener('resize',fitAdm);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitAdm);

/* ---------- session timer ---------- */
var t0=+ss('pgadmin-t0');if(!t0){t0=Date.now()-4*60000-18000;ss('pgadmin-t0',String(t0))}
function tick(){var left=Math.max(0,900-Math.floor((Date.now()-t0)/1000)),m=Math.floor(left/60),s=left%60,el=q('#sesst');if(!el)return;el.textContent=left?(m+':'+(s<10?'0':'')+s):'Expired';q('#sess').classList.toggle('low',left<300)}
tick();setInterval(tick,1000);
/* idle sign-out: activity resets the 15-minute timer while it is still running */
var lastAct=0;function act(){var n=Date.now();if(n-lastAct<5000)return;lastAct=n;if(Date.now()-t0<900000){t0=n;ss('pgadmin-t0',String(t0));tick()}}
['click','keydown','pointerdown'].forEach(function(ev){addEventListener(ev,act,true)});

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
var BIOSVG='<svg viewBox="0 0 34 34" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" aria-hidden="true"><path d="M4 11V8a4 4 0 0 1 4-4h3M23 4h3a4 4 0 0 1 4 4v3M30 23v3a4 4 0 0 1-4 4h-3M11 30H8a4 4 0 0 1-4-4v-3"/><path d="M12 13v3M22 13v3M17 13v6h-1.5M12.5 23c2.5 2.5 6.5 2.5 9 0"/></svg>';
/* generic modal: opts{k,title,html,confirm,step,onDone}. step=true re-confirms with Face ID / Touch ID; otherwise a plain confirm. */
function modal(o){
 lastFocus=document.activeElement;
 md.innerHTML='<div class="k">'+esc(o.k||'Confirm')+'</div><h2 id="mt">'+esc(o.title)+'</h2><div id="mb">'+(o.html||'')+'</div><div class="mf" id="mf"></div>';
 md.setAttribute('aria-labelledby','mt');
 var mf=q('#mf',md);
 function btn(t,c,fn,id){var b=document.createElement('button');b.type='button';b.className='btn '+c;b.textContent=t;if(id)b.id=id;b.addEventListener('click',fn);mf.appendChild(b);return b}
 function done(){closeModal();o.onDone&&o.onDone()}
 function stepUp(){
  var mb=q('#mb',md);mf.innerHTML='';q('.k',md).textContent='High-risk action';q('#mt',md).textContent='Confirm with Face ID or Touch ID';
  mb.innerHTML=(o.summary||'')+'<div class="key" id="keyv"><div class="ring">'+BIOSVG+'</div><b>Waiting for Face ID or Touch ID</b><p>Re-confirm on this device.</p></div><div class="alt"><a href="#" id="useCode">Use authenticator code instead</a></div>';
  var finished=false;
  function ok(){if(finished)return;finished=true;var kv=q('#keyv',md);kv.querySelector('b').textContent='Verifying';kv.querySelector('p').textContent='Checking with the console.';
   setTimeout(function(){kv.classList.add('ok');kv.querySelector('b').textContent='Confirmed';kv.querySelector('p').textContent='Mock only. Nothing is posted.';setTimeout(done,610)},377)}
  q('#useCode',md).addEventListener('click',function(e){e.preventDefault();
   var al=q('.alt',md);al.innerHTML='<div class="code" id="codev" role="group" aria-label="6-digit authenticator code">'+[1,2,3,4,5,6].map(function(n){return '<input inputmode="numeric" maxlength="1" autocomplete="one-time-code" aria-label="Digit '+n+'">'}).join('')+'</div>';
   var bx=qa('input',al);bx[0].focus();
   bx.forEach(function(x,i){x.addEventListener('input',function(){x.value=x.value.replace(/\D/g,'').slice(0,1);if(x.value&&bx[i+1])bx[i+1].focus();if(bx.every(function(y){return y.value}))ok()});
    x.addEventListener('keydown',function(ev){if(ev.key==='Backspace'&&!x.value&&bx[i-1])bx[i-1].focus()})});
   q('#sim',md).onclick=function(){var al2=qa('#codev input',md);'482916'.split('').forEach(function(ch,i){al2[i].value=ch});ok()};
  });
  btn('Cancel','ghost',closeModal);
  btn('Simulate','',function(){ok()},'sim');
  setTimeout(function(){var t=q('#sim');t&&t.focus()},60);
 }
 btn('Cancel','ghost',closeModal);
 btn(o.confirm||(o.step?'Continue':'Confirm'),'',function(){if(o.validate&&!o.validate(md))return;if(o.step)stepUp();else{closeModal();o.onDone&&o.onDone(md)}},'cont');
 scrim.classList.add('on');md.classList.add('on');md.setAttribute('aria-hidden','false');
 setTimeout(function(){var f=q('textarea,input,#cont',md);f&&f.focus()},60);
}
window.AdminUI={modal:modal,say:say,esc:esc,can:can,role:function(){return role},me:function(){return ME},applyRole:applyRole,openDrawer:openDrawer,closeDrawer:closeDrawer,drawer:dr};

/* generic mock buttons */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-mock]');if(!b||b.getAttribute('aria-disabled')==='true')return;say(b.getAttribute('data-mock'))});
/* generic key-confirmed actions */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-keyact]');if(!b||b.getAttribute('aria-disabled')==='true')return;
 var su=b.hasAttribute('data-step'),sm='<div class="sum">'+esc(b.getAttribute('data-keysum')||'')+'<span>Recorded in the audit log with your admin ID, role and device.</span></div>';
 modal({k:su?'High-risk action':'Confirm',title:b.getAttribute('data-keyact')+'?',summary:sm,html:'<p class="note" style="margin-top:0">This is recorded against '+esc(ME)+'.'+(su?' You will re-confirm with Face ID or Touch ID.':'')+'</p>'+sm,step:su,confirm:su?'Continue':'Confirm',onDone:function(){var d=b.getAttribute('data-done');if(d)say(d);document.dispatchEvent(new CustomEvent('keyact',{detail:b}))}});
});

(function(){try{if(page==='dashboard'&&localStorage.getItem('pgpx-bc')==='1'){var n=q('#dTurn');if(n){n.setAttribute('data-v',26);n.textContent=26}var t=q('#dTx');if(t)t.innerHTML='26 of 37 &middot; 70.3%';var b=q('#dBar');if(b)b.style.width='70.3%';var p=q('#dBp');if(p)p.textContent='4 cast'}}catch(e){}})();

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

/* ---------- member profile (admin only; sample data) ---------- */
var PD=/*PD*/[{"no":"PL-0087","n":"J. Morrison","j":"Jan 30, 2026","st":"Active","kyc":["ok","Jan 12, 2026","Jan 2027"],"dob":"1971","em":"james.morrison@example.com","ph":"+1 555 010 0142","ad":"1 Sample Street, Suite 100, Anytown","pref":"Email","banks":[["RBC Chequing ···· 4417","Verified","Verified Jan 30, 2026 by micro-deposit"],["TD Savings ···· 9082","Verified","Added Jun 18, 2026"],["BMO Chequing ···· 2203","Pending","Added Oct 8 (AP-2044). Micro-deposits sent Oct 9"]],"by":"PL-0019","appr":"Jan 22, 2026","dep":[["Jan 30","EFT",8000000,"Confirmed","EFT-0130-0087","Initial deposit"],["Mar 31","EFT",2500000,"Confirmed","EFT-0331-0087",""],["Sep 30","EFT",1000000,"Confirmed","AP-2038","Approved Oct 3"]],"wd":[["Oct 30","Standing payout",100000,"Scheduled","AP-2045","Instruction awaiting approval"],["Oct 6","Redemption",500000,"Awaiting approval","AP-2041","Paid at the lower of month-end $4,919.33 and today $5,000.00"]],"cap":12505480,"res":335162,"sep":267907,"oct":67255},{"no":"PL-0131","n":"T. Alvarez","j":"Mar 12, 2026","st":"Active","kyc":["ok","Mar 12, 2026","Mar 2027"],"dob":"1964","em":"t.alvarez@example.com","ph":"+1 604 555 0142","ad":"88 Harbour Lane, Vancouver BC V6B 1A1","pref":"Phone","banks":[["TD Savings ···· 6150","Verified","Verified Mar 12, 2026"]],"by":"PL-0054","appr":"Mar 5, 2026","dep":[["Mar 12","EFT",15000000,"Confirmed","EFT-0312-0131","Initial deposit"],["Aug 3","EFT",4000000,"Confirmed","EFT-0803-0131",""],["Oct 7","EFT",2500000,"Awaiting approval","AP-2042","Allocated at Oct 30 processing"]],"wd":[["Oct 10","Reserve early release",300000,"Awaiting approval","AP-2047","Paid at Oct 30 processing"]],"cap":20782292,"res":505718,"sep":394218,"oct":111500},{"no":"PL-0062","n":"K. Brennan","j":"Jan 30, 2026","st":"Active","kyc":["ok","Jan 30, 2026","Jan 2027"],"dob":"1978","em":"k.brennan@example.com","ph":"+1 905 555 0119","ad":"27 Willow Court, Mississauga ON L5B 3C2","pref":"Email","banks":[["BMO Chequing ···· 3318","Verified","Verified Jan 30, 2026"]],"by":"PL-0054","appr":"Jan 22, 2026","dep":[["Jan 30","EFT",6000000,"Confirmed","EFT-0130-0062","Initial deposit"],["Jul 1","EFT",1500000,"Confirmed","EFT-0701-0062",""],["Oct 8","EFT",1000000,"Awaiting approval","AP-2043","Prepared by Mike Telford"]],"wd":[],"cap":9404177,"res":241360,"sep":190840,"oct":50520},{"no":"PL-0054","n":"R. Delacroix","j":"Jan 30, 2026","st":"Active","kyc":["ok","Jan 30, 2026","Jan 2027"],"dob":"1959","em":"r.delacroix@example.com","ph":"+1 514 555 0173","ad":"1560 Rue Sherbrooke O, Montréal QC H3G 1K4","pref":"Phone","banks":[["RBC Savings ···· 7741","Verified","Verified Jan 30, 2026"]],"by":"PL-0019","appr":"Jan 22, 2026","dep":[["Jan 30","Wire",25000000,"Confirmed","PL-0054-W","Initial deposit"],["Jun 1","EFT",5000000,"Confirmed","EFT-0601-0054",""]],"wd":[["Oct 9","Redemption",1800000,"Awaiting approval","AP-2046","Paid at the lower of month-end and today"]],"pnom":["NM-0014","E. Whitcombe","Colleague of PL-0054","Oct 8"],"cap":33328904,"res":863304,"sep":684215,"oct":179089},{"no":"PL-0019","n":"M. Osei","j":"Jan 12, 2026","st":"Active","kyc":["ok","Jan 12, 2026","Jan 2027"],"dob":"1966","em":"m.osei@example.com","ph":"+1 613 555 0166","ad":"305 Elgin Street, Ottawa ON K2P 1M6","pref":"Email","banks":[["Scotiabank Chequing ···· 5502","Verified","Verified Jan 12, 2026"]],"by":"Board","appr":"Jan 8, 2026 (founding member)","dep":[["Jan 12","EFT",6000000,"Confirmed","EFT-0112-0019","Initial deposit"],["Jun 15","EFT",1900000,"Confirmed","EFT-0615-0019",""]],"wd":[],"cap":8575524,"res":225966,"sep":179866,"oct":46100},{"no":"PL-0033","n":"H. Lindqvist","j":"Jan 12, 2026","st":"Active","kyc":["ok","Jan 12, 2026","Jan 2027"],"dob":"1957","em":"h.lindqvist@example.com","ph":"+1 403 555 0138","ad":"740 Prairie View Drive, Calgary AB T2P 4K9","pref":"Email","banks":[["CIBC Chequing ···· 9014","Verified","Verified Jan 12, 2026"]],"by":"Board","appr":"Jan 8, 2026 (founding member)","dep":[["Jan 12","Wire",10000000,"Confirmed","PL-0033-W","Initial deposit"],["Jul 1","EFT",3500000,"Confirmed","EFT-0701-0033",""]],"wd":[],"cap":14845103,"res":384897,"sep":305127,"oct":79770},{"no":"PL-0071","n":"S. Moreau","j":"Feb 20, 2026","st":"Active","kyc":["ok","Feb 20, 2026","Feb 2027"],"dob":"1982","em":"s.moreau@example.com","ph":"+1 416 555 0104","ad":"19 Beech Avenue, Toronto ON M4E 3H7","pref":"Email","banks":[["TD Chequing ···· 2276","Verified","Verified Feb 20, 2026"]],"by":"PL-0033","appr":"Feb 12, 2026","dep":[["Feb 20","EFT",6000000,"Confirmed","EFT-0220-0071","Initial deposit"],["Aug 3","EFT",600000,"Confirmed","EFT-0803-0071",""]],"wd":[],"pnom":["NM-0015","D. Park","Family of PL-0071","Oct 10"],"cap":7284886,"res":176269,"sep":137190,"oct":39079},{"no":"PL-0098","n":"F. Nakamura","j":"Apr 3, 2026","st":"Active","kyc":["ok","Apr 3, 2026","Apr 2027"],"dob":"1975","em":"f.nakamura@example.com","ph":"+1 778 555 0151","ad":"2205 Granville Street, Vancouver BC V6H 3E5","pref":"Email","banks":[["TD Chequing ···· 1189","Verified","Verified Apr 3, 2026"]],"by":"PL-0087","appr":"Mar 26, 2026","dep":[["Apr 3","EFT",7500000,"Confirmed","EFT-0403-0098","Initial deposit"],["Jul 1","EFT",3300000,"Confirmed","EFT-0701-0098",""],["Oct 2","EFT",2000000,"Received, pending allocation","AP-2037","Approved Oct 2. Allocated at Oct 30 processing"]],"wd":[],"cap":11767592,"res":219428,"sep":156644,"oct":62784},{"no":"PL-0105","n":"D. Whitaker","j":"May 8, 2026","st":"Active","kyc":["gd","May 8, 2026","Due now"],"dob":"1969","em":"d.whitaker@example.com","ph":"+1 902 555 0128","ad":"63 Quay Street, Halifax NS B3J 1T4","pref":"Email","banks":[["RBC Chequing ···· 8120","Verified","Verified May 8, 2026"],["CIBC Chequing ···· 5520","Failed","Add rejected Oct 2 (AP-2036): name mismatch"]],"by":"PL-0071","appr":"May 1, 2026","dep":[["May 8","EFT",5500000,"Confirmed","EFT-0508-0105","Initial deposit"]],"wd":[],"kycnote":"KYC refresh due. Documents requested Oct 8.","cap":5932213,"res":92787,"sep":61230,"oct":31557},{"no":"PL-0118","n":"C. Vasquez","j":"Jun 18, 2026","st":"Active","kyc":["ok","Jun 18, 2026","Jun 2027"],"dob":"1986","em":"c.vasquez@example.com","ph":"+1 647 555 0190","ad":"9 Dundas Place, Toronto ON M5B 2G1","pref":"Email","banks":[["BMO Savings ···· 6603","Verified","Verified Jun 18, 2026"]],"by":"PL-0033","appr":"Jun 10, 2026","dep":[["Jun 18","EFT",4200000,"Confirmed","EFT-0618-0118","Initial deposit"]],"wd":[],"cap":4436175,"res":63825,"sep":40255,"oct":23570},{"no":"PL-0126","n":"E. Ibrahim","j":"Jul 2, 2026","st":"Active","kyc":["ok","Jul 2, 2026","Jul 2027"],"dob":"1961","em":"e.ibrahim@example.com","ph":"+1 587 555 0176","ad":"1180 Jasper Avenue, Edmonton AB T5J 3N5","pref":"Phone","banks":[["RBC Chequing ···· 3957","Verified","Verified Jul 2, 2026"]],"by":"PL-0131","appr":"Jun 24, 2026","dep":[["Jul 2","Wire",21000000,"Confirmed","PL-0126-W","Initial deposit"]],"wd":[],"cap":22632410,"res":409156,"sep":288471,"oct":120685},{"no":"PL-0142","n":"B. Thorne","j":"Aug 14, 2026","st":"Active","kyc":["ok","Aug 14, 2026","Aug 2027"],"dob":"1973","em":"b.thorne@example.com","ph":"+1 416 555 0165","ad":"34 Cedar Row, Toronto ON M5R 2L4","pref":"Email","banks":[["RBC Chequing ···· 8836","Verified","Verified Aug 14, 2026"]],"by":"PL-0087","appr":"Aug 5, 2026","dep":[["Aug 14","EFT",2500000,"Confirmed","EFT-0814-0142","Initial deposit"],["Oct 11","Wire",2500000,"Received, pending allocation","AP-2048","Matched by reference PL-0142-W. Allocated at Oct 30 processing"]],"wd":[],"cap":2477288,"res":22712,"sep":9618,"oct":13094},{"no":"PL-0149","n":"G. Papadakis","j":"Sep 22, 2026","st":"Onboarding","kyc":["gd","Pending","On completion"],"dob":"1980","em":"g.papadakis@example.com","ph":"+1 289 555 0113","ad":"5 Lakeshore Terrace, Hamilton ON L8P 4S7","pref":"Email","banks":[["Scotiabank Chequing ···· 7745","Pending","Micro-deposits sent"]],"by":"PL-0126","appr":"Sep 15, 2026","dep":[["Sep 22","EFT",1000000,"Confirmed","EFT-0922-0149","Initial deposit"]],"wd":[],"kycnote":"Onboarding: KYC, agreement and bank verification in progress.","cap":1000000,"res":0,"sep":0,"oct":0},{"no":"PL-0063","n":"S. Okafor","j":"Mar 18, 2026","st":"Active","kyc":["ok","Mar 18, 2026","Mar 2027"],"dob":"1985","em":"s.okafor@example.com","ph":"+1 416 555 0163","ad":"73 Elm Court, Toronto ON M5V 2H1","pref":"Phone","banks":[["Scotiabank Chequing ···· 3331","Verified","Verified Mar 18, 2026"]],"by":"PL-0062","appr":"Mar 10, 2026","dep":[["Mar 18","EFT",10500000,"Confirmed","EFT-0318-0063","Initial deposit"]],"wd":[],"cap":10950857,"res":278122,"sep":219111,"oct":59011},{"no":"PL-0155","n":"N. Ibarra","j":"May 21, 2026","st":"Active","kyc":["ok","May 21, 2026","May 2027"],"dob":"1978","em":"n.ibarra@example.com","ph":"+1 416 555 0165","ad":"165 Oak Terrace, Ottawa ON K1P 5G4","pref":"Email","banks":[["RBC Chequing ···· 6735","Verified","Verified May 21, 2026"]],"by":"PL-0071","appr":"May 13, 2026","dep":[["May 21","EFT",6500000,"Confirmed","EFT-0521-0155","Initial deposit"]],"wd":[],"cap":6821845,"res":173256,"sep":136495,"oct":36761},{"no":"PL-0176","n":"M. Castellanos","j":"Feb 9, 2026","st":"Active","kyc":["ok","Feb 9, 2026","Feb 2027"],"dob":"1966","em":"m.castellanos@example.com","ph":"+1 416 555 0186","ad":"186 Birch Lane, Ottawa ON K1P 5G4","pref":"Email","banks":[["TD Chequing ···· 7512","Verified","Verified Feb 9, 2026"]],"by":"PL-0054","appr":"Feb 1, 2026","dep":[["Feb 9","EFT",19500000,"Confirmed","EFT-0209-0176","Initial deposit"]],"wd":[],"cap":20106492,"res":510650,"sep":402302,"oct":108348},{"no":"PL-0201","n":"L. Verhoeven","j":"Apr 14, 2026","st":"Active","kyc":["ok","Apr 14, 2026","Apr 2027"],"dob":"1958","em":"l.verhoeven@example.com","ph":"+1 416 555 0121","ad":"21 Harbour Road, Halifax NS B3H 2Y9","pref":"Phone","banks":[["TD Chequing ···· 8437","Verified","Verified Apr 14, 2026"]],"by":"PL-0176","appr":"Apr 6, 2026","dep":[["Apr 14","EFT",8000000,"Confirmed","EFT-0414-0201","Initial deposit"]],"wd":[],"cap":8437546,"res":214290,"sep":168823,"oct":45467},{"no":"PL-0240","n":"A. Hartwell","j":"Jul 21, 2026","st":"Active","kyc":["ok","Jul 21, 2026","Jul 2027"],"dob":"1964","em":"a.hartwell@example.com","ph":"+1 416 555 0160","ad":"60 Birch Lane, Vancouver BC V6Z 2K3","pref":"Phone","banks":[["RBC Chequing ···· 9880","Verified","Verified Jul 21, 2026"]],"by":"PL-0131","appr":"Jul 13, 2026","dep":[["Jul 21","EFT",5000000,"Confirmed","EFT-0721-0240","Initial deposit"]],"wd":[],"cap":5206145,"res":132221,"sep":104167,"oct":28054},{"no":"PL-0007","n":"A. Fontaine","j":"Jan 12, 2026","st":"Active","kyc":["ok","Jan 12, 2026","Jan 2027"],"dob":"1962","em":"a.fontaine@example.com","ph":"+1 416 555 0107","ad":"17 Elm Court, Toronto ON M5V 2H1","pref":"Email","banks":[["BMO Savings ···· 1259","Verified","Verified Jan 12, 2026"]],"by":"Board","appr":"Jan 8, 2026","dep":[["Jan 12","EFT",4500000,"Confirmed","EFT-0112-0007","Initial deposit"]],"wd":[],"cap":4847101,"res":123103,"sep":96983,"oct":26120},{"no":"PL-0011","n":"P. Lindgren","j":"Jan 12, 2026","st":"Active","kyc":["ok","Jan 12, 2026","Jan 2027"],"dob":"1966","em":"p.lindgren@example.com","ph":"+1 416 555 0111","ad":"21 Oak Terrace, Montréal QC H2Y 1C6","pref":"Email","banks":[["TD Chequing ···· 1407","Verified","Verified Jan 12, 2026"]],"by":"Board","appr":"Jan 8, 2026","dep":[["Jan 12","EFT",7500000,"Confirmed","EFT-0112-0011","Initial deposit"]],"wd":[],"cap":7898979,"res":200612,"sep":158047,"oct":42565},{"no":"PL-0023","n":"V. Castellane","j":"Jan 30, 2026","st":"Active","kyc":["ok","Jan 30, 2026","Jan 2027"],"dob":"1978","em":"v.castellane@example.com","ph":"+1 416 555 0123","ad":"33 Elm Court, Vancouver BC V6Z 2K3","pref":"Email","banks":[["Scotiabank Chequing ···· 1851","Verified","Verified Jan 30, 2026"]],"by":"PL-0019","appr":"Jan 22, 2026","dep":[["Jan 30","EFT",12500000,"Confirmed","EFT-0130-0023","Initial deposit"]],"wd":[],"cap":13105124,"res":332835,"sep":262215,"oct":70620},{"no":"PL-0028","n":"J. Okonkwo","j":"Jan 30, 2026","st":"Active","kyc":["ok","Jan 30, 2026","Jan 2027"],"dob":"1983","em":"j.okonkwo@example.com","ph":"+1 416 555 0128","ad":"38 Queen Avenue, Toronto ON M5V 2H1","pref":"Email","banks":[["Scotiabank Chequing ···· 2036","Verified","Verified Jan 30, 2026"]],"by":"PL-0033","appr":"Jan 22, 2026","dep":[["Jan 30","EFT",5500000,"Confirmed","EFT-0130-0028","Initial deposit"]],"wd":[],"cap":5565190,"res":141340,"sep":111351,"oct":29989},{"no":"PL-0036","n":"R. Haldane","j":"Feb 20, 2026","st":"Active","kyc":["ok","Feb 20, 2026","Feb 2027"],"dob":"1958","em":"r.haldane@example.com","ph":"+1 416 555 0136","ad":"46 Queen Avenue, Ottawa ON K1P 5G4","pref":"Phone","banks":[["TD Chequing ···· 2332","Verified","Verified Feb 20, 2026"]],"by":"PL-0071","appr":"Feb 12, 2026","dep":[["Feb 20","EFT",9500000,"Confirmed","EFT-0220-0036","Initial deposit"]],"wd":[],"cap":9873724,"res":250766,"sep":197559,"oct":53207},{"no":"PL-0041","n":"L. Tremblay","j":"Mar 12, 2026","st":"Active","kyc":["ok","Mar 12, 2026","Mar 2027"],"dob":"1963","em":"l.tremblay@example.com","ph":"+1 416 555 0141","ad":"51 Harbour Road, Winnipeg MB R3C 1A5","pref":"Email","banks":[["TD Chequing ···· 2517","Verified","Verified Mar 12, 2026"]],"by":"PL-0131","appr":"Mar 4, 2026","dep":[["Mar 12","EFT",14000000,"Confirmed","EFT-0312-0041","Initial deposit"]],"wd":[],"cap":14720824,"res":373868,"sep":294542,"oct":79326},{"no":"PL-0045","n":"S. Kowalski","j":"Mar 12, 2026","st":"Active","kyc":["ok","Mar 12, 2026","Mar 2027"],"dob":"1967","em":"s.kowalski@example.com","ph":"+1 416 555 0145","ad":"55 River Walk, Calgary AB T2R 0C5","pref":"Phone","banks":[["RBC Chequing ···· 2665","Verified","Verified Mar 12, 2026"]],"by":"PL-0054","appr":"Mar 4, 2026","dep":[["Mar 12","EFT",6000000,"Confirmed","EFT-0312-0045","Initial deposit"]],"wd":[],"cap":6462801,"res":164137,"sep":129311,"oct":34826},{"no":"PL-0058","n":"M. Beaulieu","j":"Apr 3, 2026","st":"Active","kyc":["ok","Apr 3, 2026","Apr 2027"],"dob":"1980","em":"m.beaulieu@example.com","ph":"+1 416 555 0158","ad":"68 King Street, Vancouver BC V6Z 2K3","pref":"Email","banks":[["Scotiabank Chequing ···· 3146","Verified","Verified Apr 3, 2026"]],"by":"PL-0087","appr":"Apr 3, 2026","dep":[["Apr 3","EFT",8500000,"Confirmed","EFT-0403-0058","Initial deposit"]],"wd":[],"cap":8796590,"res":223409,"sep":176007,"oct":47402},{"no":"PL-0066","n":"D. Raman","j":"Apr 3, 2026","st":"Active","kyc":["ok","Apr 3, 2026","Apr 2027"],"dob":"1955","em":"d.raman@example.com","ph":"+1 416 555 0166","ad":"76 King Street, Calgary AB T2R 0C5","pref":"Phone","banks":[["TD Chequing ···· 3442","Verified","Verified Apr 3, 2026"]],"by":"PL-0062","appr":"Apr 3, 2026","dep":[["Apr 3","EFT",15500000,"Confirmed","EFT-0403-0066","Initial deposit"]],"wd":[],"cap":16336525,"res":414903,"sep":326870,"oct":88033},{"no":"PL-0074","n":"T. Sorensen","j":"May 8, 2026","st":"Active","kyc":["ok","May 8, 2026","May 2027"],"dob":"1963","em":"t.sorensen@example.com","ph":"+1 416 555 0174","ad":"84 King Street, Montréal QC H2Y 1C6","pref":"Email","banks":[["CIBC Savings ···· 3738","Verified","Verified May 8, 2026"]],"by":"PL-0071","appr":"May 8, 2026","dep":[["May 8","EFT",11500000,"Confirmed","EFT-0508-0074","Initial deposit"]],"wd":[],"cap":11848468,"res":300919,"sep":237071,"oct":63848},{"no":"PL-0079","n":"C. Ndiaye","j":"May 8, 2026","st":"Active","kyc":["ok","May 8, 2026","May 2027"],"dob":"1968","em":"c.ndiaye@example.com","ph":"+1 416 555 0179","ad":"89 Elm Court, Vancouver BC V6Z 2K3","pref":"Email","banks":[["CIBC Savings ···· 3923","Verified","Verified May 8, 2026"]],"by":"PL-0019","appr":"May 8, 2026","dep":[["May 8","EFT",7000000,"Confirmed","EFT-0508-0079","Initial deposit"]],"wd":[],"cap":7180890,"res":182375,"sep":143679,"oct":38696},{"no":"PL-0083","n":"W. Ferreira","j":"Jun 18, 2026","st":"Active","kyc":["ok","Jun 18, 2026","Jun 2027"],"dob":"1972","em":"w.ferreira@example.com","ph":"+1 416 555 0183","ad":"93 Oak Terrace, Winnipeg MB R3C 1A5","pref":"Email","banks":[["Scotiabank Chequing ···· 4071","Verified","Verified Jun 18, 2026"]],"by":"PL-0033","appr":"Jun 10, 2026","dep":[["Jun 18","EFT",10000000,"Confirmed","EFT-0618-0083","Initial deposit"]],"wd":[],"cap":10412290,"res":264444,"sep":208335,"oct":56109},{"no":"PL-0092","n":"H. Yamada","j":"Jun 18, 2026","st":"Active","kyc":["ok","Jun 18, 2026","Jun 2027"],"dob":"1981","em":"h.yamada@example.com","ph":"+1 416 555 0102","ad":"102 Queen Avenue, Ottawa ON K1P 5G4","pref":"Email","banks":[["BMO Savings ···· 4404","Verified","Verified Jun 18, 2026"]],"by":"PL-0126","appr":"Jun 10, 2026","dep":[["Jun 18","EFT",5500000,"Confirmed","EFT-0618-0092","Initial deposit"]],"wd":[],"cap":5924234,"res":150459,"sep":118535,"oct":31924},{"no":"PL-0101","n":"N. Bellamy","j":"Jul 2, 2026","st":"Active","kyc":["ok","Jul 2, 2026","Jul 2027"],"dob":"1957","em":"n.bellamy@example.com","ph":"+1 416 555 0111","ad":"111 River Walk, Calgary AB T2R 0C5","pref":"Email","banks":[["TD Chequing ···· 4737","Verified","Verified Jul 2, 2026"]],"by":"PL-0131","appr":"Jul 2, 2026","dep":[["Jul 2","EFT",13000000,"Confirmed","EFT-0702-0101","Initial deposit"]],"wd":[],"cap":13823213,"res":351072,"sep":276583,"oct":74489},{"no":"PL-0113","n":"O. Petrov","j":"Jul 2, 2026","st":"Active","kyc":["ok","Jul 2, 2026","Jul 2027"],"dob":"1969","em":"o.petrov@example.com","ph":"+1 416 555 0123","ad":"123 Harbour Road, Ottawa ON K1P 5G4","pref":"Email","banks":[["Scotiabank Chequing ···· 5181","Verified","Verified Jul 2, 2026"]],"by":"PL-0087","appr":"Jul 2, 2026","dep":[["Jul 2","EFT",9000000,"Confirmed","EFT-0702-0113","Initial deposit"]],"wd":[],"cap":9335157,"res":237087,"sep":186783,"oct":50304},{"no":"PL-0121","n":"K. Aubin","j":"Jul 21, 2026","st":"Active","kyc":["ok","Jul 21, 2026","Jul 2027"],"dob":"1977","em":"k.aubin@example.com","ph":"+1 416 555 0131","ad":"131 Harbour Road, Vancouver BC V6Z 2K3","pref":"Email","banks":[["TD Chequing ···· 5477","Verified","Verified Jul 21, 2026"]],"by":"PL-0098","appr":"Jul 13, 2026","dep":[["Jul 21","EFT",7500000,"Confirmed","EFT-0721-0121","Initial deposit"]],"wd":[],"cap":8078501,"res":205172,"sep":161639,"oct":43533},{"no":"PL-0134","n":"I. Marchetti","j":"Aug 14, 2026","st":"Active","kyc":["ok","Aug 14, 2026","Aug 2027"],"dob":"1957","em":"i.marchetti@example.com","ph":"+1 416 555 0144","ad":"144 Station Road, Ottawa ON K1P 5G4","pref":"Email","banks":[["CIBC Savings ···· 5958","Verified","Verified Aug 14, 2026"]],"by":"PL-0142","appr":"Aug 6, 2026","dep":[["Aug 14","EFT",12000000,"Confirmed","EFT-0814-0134","Initial deposit"]],"wd":[],"cap":12387035,"res":314597,"sep":247847,"oct":66750},{"no":"PL-0138","n":"E. Dubois","j":"Aug 14, 2026","st":"Active","kyc":["ok","Aug 14, 2026","Aug 2027"],"dob":"1961","em":"e.dubois@example.com","ph":"+1 416 555 0148","ad":"148 King Street, Halifax NS B3H 2Y9","pref":"Phone","banks":[["Scotiabank Chequing ···· 6106","Verified","Verified Aug 14, 2026"]],"by":"PL-0126","appr":"Aug 6, 2026","dep":[["Aug 14","EFT",6500000,"Confirmed","EFT-0814-0138","Initial deposit"]],"wd":[],"cap":6821845,"res":173256,"sep":136495,"oct":36761},{"no":"PL-0147","n":"F. Lacroix","j":"Sep 22, 2026","st":"Active","kyc":["ok","Sep 22, 2026","Sep 2027"],"dob":"1970","em":"f.lacroix@example.com","ph":"+1 416 555 0157","ad":"157 Oak Terrace, Toronto ON M5V 2H1","pref":"Phone","banks":[["BMO Savings ···· 6439","Verified","Verified Sep 22, 2026"]],"by":"PL-0176","appr":"Sep 14, 2026","dep":[["Sep 22","EFT",10500000,"Confirmed","EFT-0922-0147","Initial deposit"]],"wd":[],"cap":10771338,"res":273565,"sep":215521,"oct":58044}]/*END*/;
(function(){
var INV=390684758,CLUBRES=9527042,BASE='/p-admin-r8v3k6/';
var MAP={};PD.forEach(function(p){MAP[p.no]=p});
function m2(c){return '$'+(c/100).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
function m0(c){return c%100===0?'$'+(c/100).toLocaleString('en-US'):m2(c)}
function pc(a,b){return (a/b*100).toFixed(2)+'%'}
function dt(s){return Date.parse(/\d{4}/.test(s)?s:s+', 2026')}
function hs(s){var h=7,i;for(i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
function tg(c,t){return '<span class="tag '+c+'">'+esc(t)+'</span>'}
function stTag(s){return tg(/^(Confirmed|Verified|Active|Accepted|Paid|Credited|Yes|Matched|Sent|Replied|Delivered)/.test(s)?'ok':/^(Failed|Declined|Frozen)/.test(s)?'dn':/^(Revoked|Not eligible)/.test(s)?'':'gd',s)}
function who(no){var p=MAP[no];return p?'<a class="link" href="?id='+no+'">'+esc(p.n)+'</a> <small class="nm">'+no+'</small>':esc(no)}
function LSg(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
function LSs(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function roleLabel(){return view==='eric'?'Administrator':view==='mike'?'Owner':RN[view]}
function logA(act,tgt,cat){var a=LSg('pgpx-al')||[],d=new Date(),p=function(n){return String(n).padStart(2,'0')};
 a.unshift(['Oct 11, '+p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds()),ME,roleLabel(),act,tgt,ME==='Eric Savics'?'10.20.5.12 &middot; VPN &middot; Safari, macOS':'10.20.4.17 &middot; VPN &middot; Chrome, macOS',cat||'member']);LSs('pgpx-al',a)}

/* proxy register (matches the Voting page): delegator, holder, scope, status, voted */
var PX=[['PL-0019','Board','All votes','Accepted','Not yet'],['PL-0149','Board','All votes','Accepted','Not yet'],['PL-0126','Board','This vote','Accepted','Not yet'],['PL-0098','Board','All votes','Accepted','Not yet'],
 ['PL-0054','Board','All votes','Accepted','Overridden'],['PL-0131','Board','This vote','Accepted','Overridden'],['PL-0033','PL-0071','This vote','Accepted','Yes'],['PL-0105','PL-0071','All votes','Accepted','Yes'],
 ['PL-0201','PL-0176','All votes','Accepted','Yes'],['PL-0142','PL-0087','All votes','Accepted','Not yet'],['PL-0063','PL-0087','This vote','Accepted','Not yet'],['PL-0118','PL-0071','This vote','Pending','Not yet'],
 ['PL-0155','PL-0071','All votes','Declined','Not yet'],['PL-0240','PL-0176','All votes','Revoked','Not yet']];
var VT=[{id:'V-2026-04',t:'Core holdings limit',closed:'Oct 14, 2026',open:1,res:'Open &middot; closes Wed, Oct 14, 4:00 PM ET'},
 {id:'V-2026-03',t:'Move allocation review to monthly',closed:'Aug 14, 2026',res:'Passed 24 &ndash; 9, 1 abstained',ab:1},
 {id:'V-2026-02',t:'Confirm Board composition',closed:'Jun 12, 2026',res:'Passed 28 &ndash; 3, 2 abstained',ab:1},
 {id:'V-2026-01',t:'Ratify Member Agreement v2.1',closed:'Jan 26, 2026',res:'Passed 19 &ndash; 0'}];
var VFIX={'PL-0087':{'V-2026-02':'For','V-2026-03':'Against'}};
function votesOf(p){var out=[];
 VT.forEach(function(v){
  if(dt(p.j)>dt(v.closed)){out.push({v:v,how:'Not eligible',by:'Joined '+p.j,cast:0,na:1});return}
  if(v.open){var gx=PX.filter(function(r){return r[0]===p.no})[0],h=hs(p.no+v.id)%100,o;
   if(gx&&gx[1]!=='Board'&&gx[3]==='Accepted'&&gx[4]==='Yes')o={how:'Cast by proxy',by:'Proxy &middot; '+gx[1]+' voted for them',cast:1};
   else if(gx&&gx[4]==='Overridden')o={how:'Voted directly',by:'Direct &middot; overrode their Board proxy',cast:1};
   else if(gx&&gx[1]==='Board'&&gx[3]==='Accepted')o={how:'Not yet cast',by:'Board proxy &middot; to be cast by the Board',cast:0};
   else if(gx&&gx[3]!=='Accepted')o={how:'Not voted yet',by:'Proxy '+gx[3].toLowerCase(),cast:0};
   else if(p.no==='PL-0087')o={how:'Not voted yet',by:'Holds 2 proxies, also not yet cast',cast:0};
   else if(h<62||p.no==='PL-0071'||p.no==='PL-0176')o={how:'Voted directly',by:'Direct',cast:1};
   else o={how:'Not voted yet',by:'Direct',cast:0};
   o.v=v;o.ballot='Ballot hidden until the vote closes';out.push(o);return}
  var h2=hs(p.no+v.id),fx=(VFIX[p.no]||{})[v.id],c=fx||(v.ab?(h2%100<68?'For':h2%100<90?'Against':'Abstain'):'For'),prox=!fx&&h2%9===0;
  out.push({v:v,how:c,by:prox?'Proxy &middot; Board':'Direct',cast:1})});
 return out}

/* activity seed, taken from the audit log: time, admin, action, target, members involved */
var AUD=[['Oct 11, 16:31:40','Eric Savics','Matched incoming wire','AP-2048 &middot; PL-0142-W &rarr; PL-0142 &middot; +$25,000.00',['PL-0142']],
 ['Oct 11, 16:28:12','PL-0087 (member)','Generated wire instructions','PL-0087-W &middot; $25,000.00 CAD &middot; authenticator confirmed',['PL-0087']],
 ['Oct 11, 14:22:51','Mike Telford','Prepared deposit','AP-2043 &middot; PL-0062 &middot; +$10,000.00',['PL-0062']],
 ['Oct 11, 13:55:30','Mike Telford','Replied to secure message','MSG-3318 &middot; PL-0054',['PL-0054']],
 ['Oct 11, 11:41:08','PL-0071 (member)','Member proxy votes cast by PL-0071 (2)','V-2026-04 &middot; for PL-0033, PL-0105 &middot; Raise to 38.2%',['PL-0071','PL-0033','PL-0105']],
 ['Oct 11, 11:12:09','Eric Savics','Reviewed KYC refresh','PL-0105',['PL-0105']],
 ['Oct 11, 10:18:52','PL-0176 (member)','Member proxy votes cast by PL-0176 (1)','V-2026-04 &middot; for PL-0201 &middot; Raise to 38.2%',['PL-0176','PL-0201']],
 ['Oct 10, 11:34:22','Eric Savics','Prepared tax reserve early release','AP-2047 &middot; PL-0131 &middot; &minus;$3,000.00',['PL-0131']],
 ['Oct 9, 16:40:02','Eric Savics','Sent bank micro-deposits','PL-0087 &middot; BMO 2203',['PL-0087']],
 ['Oct 9, 13:26:41','Eric Savics','Prepared redemption','AP-2046 &middot; PL-0054 &middot; &minus;$18,000.00',['PL-0054']],
 ['Oct 7, 09:21:03','Eric Savics','Prepared deposit','AP-2042 &middot; PL-0131 &middot; +$25,000.00',['PL-0131']],
 ['Oct 6, 14:25:12','Eric Savics','Prepared standing instruction','AP-2045 &middot; PL-0087',['PL-0087']],
 ['Oct 6, 14:19:48','Eric Savics','Prepared redemption','AP-2041 &middot; PL-0087 &middot; &minus;$5,000.00',['PL-0087']],
 ['Oct 3, 10:41:20','Mike Telford','Approved','AP-2038 &middot; Deposit &middot; PL-0087 &middot; +$10,000.00',['PL-0087']],
 ['Oct 2, 16:30:09','Mike Telford','Rejected bank account change','AP-2036 &middot; PL-0105',['PL-0105']],
 ['Oct 2, 15:48:30','Eric Savics','Approved','AP-2037 &middot; Deposit &middot; PL-0098 &middot; +$20,000.00',['PL-0098']]];

/* messages: id, type, date, subject, state (open states are counted) */
var MS={'PL-0087':[['MSG-3321','Secure message','Oct 11, 10:42','Question about the October payout date','Unread'],['ESC-0112','Agent escalation','Oct 11, 11:03','What happens to my standing instruction if I redeem my full balance?','Open'],['ADM-0912','Administrator message','Oct 7, 09:20','Re: Redemption request, October 6','Sent']],
 'PL-0131':[['MSG-3320','Secure message','Oct 10, 16:05','Confirming receipt of my deposit instructions','Unread']],'PL-0098':[['MSG-3319','Secure message','Oct 9, 14:18','Statement shows a rounding difference','Unread']],
 'PL-0054':[['MSG-3318','Secure message','Oct 9, 09:57','Redemption timing','Replied']],'PL-0062':[['MSG-3315','Secure message','Oct 8, 12:30','Change of mailing address','Unread']],
 'PL-0142':[['ESC-0111','Agent escalation','Oct 10, 18:21','Can I name my spouse as a beneficiary on my capital account?','Open']],'PL-0071':[['ESC-0110','Agent escalation','Oct 10, 09:36','Is the club&rsquo;s year-end audited, and can I get a copy of the report?','Open']]};
var CLUBMSG=[['NTC-0031','Club notice','Oct 11, 09:04','Notice of vote: core holdings limit','Delivered'],['NTC-0030','Club notice','Oct 5','Club update, Q3 2026','Delivered']];

/* admin notes: seed, private to administrators */
var NS={'PL-0087':[{id:'N-0003',a:'Mike Telford',t:'Oct 8, 2026, 09:30',pin:1,x:'Prefers email to phone. Has asked twice about payout timing; point him to the standing instruction (AP-2045) before he calls again.'},
  {id:'N-0002',a:'Eric Savics',t:'Sep 15, 2026, 14:05',x:'Adding BMO Chequing 2203 as a second account. Micro-deposits to be sent once AP-2044 is prepared. KYC refresh is not due until Jan 2027.'},
  {id:'N-0001',a:'Mike Telford',t:'Jun 18, 2026, 11:40',x:'Added TD Savings 9082; verified by micro-deposit. Holds proxies for two members who know him personally.'}],
 'PL-0105':[{id:'N-0004',a:'Eric Savics',t:'Oct 8, 2026, 10:15',pin:1,x:'KYC refresh documents requested. Do not approve further bank changes until the refresh is complete. CIBC 5520 was rejected for a name mismatch.'}],
 'PL-0054':[{id:'N-0005',a:'Mike Telford',t:'Oct 9, 2026, 09:58',x:'Redemption AP-2046 queried by phone: wants funds before month-end. Explained next business day after approval.'}],
 'PL-0149':[{id:'N-0006',a:'Eric Savics',t:'Sep 22, 2026, 16:20',x:'Onboarding call done. Waiting on micro-deposit confirmation and signed agreement.'}]};
function notesOf(no){var s=LSg('pgpx-notes')||{};return s[no]||(NS[no]||[]).map(function(n){return Object.assign({},n)})}
function saveNotes(no,list){var s=LSg('pgpx-notes')||{};s[no]=list;LSs('pgpx-notes',s)}
function frozenSet(){return LSg('pgpx-frozen')||[]}
function nowStamp(){var d=new Date(),p=function(n){return String(n).padStart(2,'0')};return 'Oct 11, 2026, '+p(d.getHours())+':'+p(d.getMinutes())}

function sec(id,title,sum,body,open,extra){return '<details class="sec" id="s-'+id+'"'+(open?' open':'')+'><summary><span class="chev" aria-hidden="true"></span><span class="lbl">'+title+'</span> <span class="ss">'+(sum?'&middot; '+sum:'')+'</span>'+(extra?'<span class="sx">'+extra+'</span>':'')+'</summary><div class="sb">'+body+'</div></details>'}
function tbl(heads,rows,empty){if(!rows.length)return '<p class="note" style="margin:0">'+empty+'</p>';return '<div class="tw"><table class="tbl"><thead><tr>'+heads.map(function(h){return '<th'+(h[1]?' class="r"':'')+'>'+h[0]+'</th>'}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(c,i){return '<td data-l="'+heads[i][0]+'"'+(heads[i][1]?' class="r nw"':heads[i][2]?' class="nw"':'')+'>'+c+'</td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'}

function render(p,U){
 var no=p.no,fz=frozenSet().indexOf(no)>-1,kycDue=p.kyc[0]==='gd'&&p.st==='Active';
 var status=fz?['Frozen','dn']:p.st==='Onboarding'?['Onboarding','gd']:kycDue?['KYC review due','gd']:['Active','ok'];
 var h='';
 /* 1 header */
 h+='<section class="card hl pfh"><div class="hd"><div class="lbl" style="color:var(--gold)">'+no+' &middot; '+esc(p.st==='Onboarding'?'Onboarding':'Member')+'</div>'+tg(status[1],status[0])+(fz?'':'')+'</div>'
  +'<div class="kpis k3"><div class="pk"><div class="lbl">Capital account</div><div class="v">'+m2(p.cap)+'</div><div class="delta">After tax reserve</div></div>'
  +'<div class="pk"><div class="lbl">Tax reserve</div><div class="v">'+m2(p.res)+'</div><div class="delta">'+pc(p.res,CLUBRES)+' of the club reserve</div></div>'
  +'<div class="pk"><div class="lbl">Share of club</div><div class="v">'+pc(p.cap,INV)+'</div><div class="delta">Of invested NAV $3,906,848</div></div></div>'
  +'<div class="rows pfm"><div><span>Member since</span><span>'+esc(p.j)+'</span></div><div><span>Status</span><span>'+esc(status[0])+(fz?' &middot; withdrawals blocked':'')+'</span></div></div>'
  +'<div class="acts" style="margin-top:21px"><a class="btn" id="pfNotice" data-cap="contact" href="'+BASE+'messages/?to='+no+'">Send notice</a><button class="btn ghost" type="button" id="pfAddNote" data-cap="note">Add note</button>'
  +'<button class="btn risk" type="button" id="pfFreeze" data-cap="freeze">'+(fz?'Unfreeze account':'Freeze account')+'</button></div>'
  +'<p class="note">Freezing blocks withdrawals and bank changes for this member until it is lifted. It needs a Face ID or Touch ID step-up and is recorded in the audit log.</p></section>';
 /* 2 contact */
 var kyc=p.kyc;
 h+=sec('contact','Contact &amp; identity',esc(p.em),
  '<div class="g2"><div class="rows"><div><span>Email</span><span>'+esc(p.em)+'</span></div><div><span>Mobile phone</span><span>'+esc(p.ph)+'</span></div><div><span>Mailing address</span><span>'+esc(p.ad)+'</span></div><div><span>Preferred contact</span><span>'+esc(p.pref)+'</span></div><div><span>Date of birth</span><span>&bull;&bull;/&bull;&bull;/'+esc(p.dob)+'</span></div></div>'
  +'<div class="rows"><div><span>KYC status</span><span>'+tg(kyc[0],kyc[0]==='ok'?'Verified':p.st==='Onboarding'?'In progress':'Review due')+'</span></div><div><span>Verified</span><span>'+esc(kyc[1])+'</span></div><div><span>Next review</span><span>'+esc(kyc[2])+'</span></div>'
  +(p.kycnote?'<div><span>Note</span><span>'+esc(p.kycnote)+'</span></div>':'')+'</div></div>'
  +'<div class="lbl" style="margin:21px 0 8px">Linked bank accounts</div><div class="rows">'+p.banks.map(function(b){return '<div><span>'+esc(b[0])+'<small>'+esc(b[2])+'</small></span><span>'+stTag(b[1])+'</span></div>'}).join('')+'</div>'
  +'<p class="note"><b>Sample data.</b> Contact and identity details are visible to administrators only. Opening this section is recorded in the audit log. Members never see another member&rsquo;s details.</p>',1,tg('','Sample data'));
 /* 3 membership */
 var ref=PD.filter(function(x){return x.by===no}),a2=p.j.indexOf('Jan 12')===0;
 h+=sec('membership','Membership',ref.length+' referred',
  '<div class="rows"><div><span>Referred / nominated by</span><span>'+(p.by==='Board'?'Board (founding member)':who(p.by))+'</span></div><div><span>Board approval</span><span>'+esc(p.appr)+'</span></div>'
  +'<div><span>Members they have referred</span><span>'+(ref.length?ref.map(function(r){return who(r.no)}).join('<br>'):'None yet')+'</span></div>'
  +(p.pnom?'<div><span>Nomination in review</span><span>'+esc(p.pnom[1])+' <small class="nm">'+p.pnom[0]+' &middot; submitted '+p.pnom[3]+'</small></span></div>':'')
  +'<div><span>Member Agreement</span><span>v2.1 &middot; signed '+esc(a2?'Jan 30, 2026':p.j)+(a2?'<small>Replaced v2.0 signed '+esc(p.j)+'</small>':'')+'</span></div></div>',1);
 /* 4 proxies */
 var gave=PX.filter(function(r){return r[0]===no}),holds=PX.filter(function(r){return r[1]===no});
 h+=sec('proxies','Proxies','gave '+gave.length+' &middot; holds '+holds.length,
  '<div class="lbl" style="margin-bottom:8px">Gave</div>'+tbl([['To'],['Scope'],['Status'],['Vote']],gave.map(function(r){return [r[1]==='Board'?'Board':who(r[1]),r[2],stTag(r[3]),r[4]==='Overridden'?'Overridden (voted directly)':r[4]==='Yes'?'Cast by holder':'Not yet']}),'Has not delegated a vote.')
  +'<div class="lbl" style="margin:21px 0 8px">Holds <small style="text-transform:none;letter-spacing:0">(maximum 3)</small></div>'+tbl([['From'],['Scope'],['Status'],['Voted']],holds.map(function(r){return [who(r[0]),r[2],stTag(r[3]),r[4]==='Yes'?'Yes':'Not yet']}),'Holds no proxies.')
  +'<p class="note">Matches the proxy register on the Voting page'+(can('vote')?': <a class="link" href="'+BASE+'voting/">open register</a>':'')+'. A proxy to the Board takes effect immediately; a member must accept. Voting yourself overrides your proxy.</p>',1);
 /* 5 voting */
 var vs=votesOf(p),cast=vs.filter(function(x){return x.cast}).length,elig=vs.filter(function(x){return !x.na}).length;
 h+=sec('voting','Voting history',elig+' votes &middot; '+cast+' cast',tbl([['Vote'],['Closed'],['How voted'],['Direct or proxy'],['Result']],vs.map(function(x){
  return [esc(x.v.id)+'<small>'+esc(x.v.t)+'</small>',x.v.open?'Oct 14, 2026':esc(x.v.closed),x.na?tg('','Not eligible'):x.v.open?(x.cast?tg('ok',x.how):tg('gd',x.how))+(x.ballot?'<small>'+x.ballot+'</small>':''):tg(x.how==='For'?'ok':x.how==='Against'?'dn':'',x.how),x.by,x.na?'&mdash;':x.v.res]}),'No votes.')
  +'<p class="note">Ballots on an open vote stay hidden until it closes. Proxy votes are counted for the delegator&rsquo;s own number.</p>',0);
 /* 6 deposits */
 var dep=p.dep.slice().sort(function(a,b){return dt(b[0])-dt(a[0])}),dc=dep.filter(function(d){return d[3]==='Confirmed'}),dp=dep.filter(function(d){return d[3]!=='Confirmed'});
 var dsum=dc.reduce(function(s,d){return s+d[2]},0),psum=dp.reduce(function(s,d){return s+d[2]},0),wdp=p.wd;
 var dist=no==='PL-0087'?[['Oct 11, 2026','October distribution (month to date)',201763,'Accrued','Reinvested, after $672.55 tax reserve'],['Sep 30, 2026','September distribution',184407,'Credited','Reinvested']]:(p.oct?[['Oct 11, 2026','October distribution (month to date)',Math.round(p.oct*3),'Accrued','Reinvested, after '+m2(p.oct)+' tax reserve']]:[]);
 h+=sec('deposits','Deposits',dc.length+' &middot; '+m0(dsum)+(psum?' &middot; '+m0(psum)+' pending':''),
  tbl([['Date',0,1],['Method'],['Amount',1],['Status'],['Reference']],dep.map(function(d){return [esc(d[0])+', 2026',d[1]==='Wire'?'Wire':'EFT',(d[2]?'+':'')+m2(d[2]),stTag(d[3]),esc(d[4])+(d[5]?'<small>'+esc(d[5])+'</small>':'')]}),'No deposits.')
  +'<div class="lbl" style="margin:21px 0 8px">Distributions</div>'+tbl([['Date',0,1],['Entry'],['Amount',1],['Status'],['Treatment']],dist.map(function(d){return [d[0],d[1],'+'+m2(d[2]),stTag(d[3]),d[4]]}),'No distributions yet.')
  +'<p class="note">Deposits to date '+m2(dsum)+(psum?' confirmed, '+m2(psum)+' pending allocation':'')+'. Redemptions paid to date $0.00'+(wdp.length?'; '+wdp.length+' open (below)':'')+'. '+(no==='PL-0087'?'Matches the member portal (Deposits &amp; Redemptions) figure for figure. ':'')+'Deposits pending allocation take no part in returns until month-end.</p>',0);
 /* 7 withdrawals */
 var wd=wdp.slice().sort(function(a,b){return dt(b[0])-dt(a[0])}),wsum=wd.reduce(function(s,w){return s+w[2]},0);
 h+=sec('withdrawals','Withdrawals &amp; redemptions',wd.length?wd.length+' &middot; '+m0(wsum)+' pending':'none',
  tbl([['Date',0,1],['Type'],['Method'],['Amount',1],['Status'],['Reference']],wd.map(function(w){var link=can('approve')?'<a class="link" href="'+BASE+'approvals/">'+esc(w[4])+'</a>':esc(w[4]);return [esc(w[0])+', 2026',w[1],'EFT',"&minus;"+m2(w[2]),stTag(w[3]),link+(w[5]?'<small>'+esc(w[5])+'</small>':'')]}),'No withdrawals or redemptions.')
  +(no==='PL-0087'?'<div class="rows" style="margin-top:21px"><div><span>Standing instruction</span><span>$1,000.00 / month to RBC Chequing &middot;&middot;&middot;&middot; 4417<small>AP-2045, effective at Oct 30 processing</small></span></div></div>':'')
  +'<p class="note">Redemptions are paid at the lower of the last month-end value and today&rsquo;s value, by the next business day after approval. Standing payouts are made from the month&rsquo;s distribution only.</p>',0);
 /* 8 tax reserve */
 h+=sec('tax','Tax reserve',m2(p.res),'<div class="rows"><div><span>Balance, held apart from capital</span><span>'+m2(p.res)+'</span></div><div><span>Rate</span><span>25%</span></div><div><span>Posted through Sep 30</span><span>'+m2(p.sep)+'</span></div><div><span>October, to post Oct 30</span><span>'+m2(p.oct)+'</span></div><div><span>Share of club reserve</span><span>'+pc(p.res,CLUBRES)+'</span></div>'
  +(no==='PL-0087'?'<div><span>Withheld year to date</span><span>$3,570.13</span></div><div><span>Released in loss months</span><span>$218.51</span></div>':'')
  +(no==='PL-0131'?'<div><span>Early release pending</span><span>$3,000.00 &middot; AP-2047</span></div>':'')
  +'<div><span>Payout date</span><span>Apr 1, 2027</span></div></div><p class="note">Not remitted to CRA; the member files their own return. '+(ok(PG.monthend)?'<a class="link" href="'+BASE+'month-end/">Open the reserve ledger in Month-end</a>':'The reserve ledger is in Month-end.')+'</p>',0);
 /* 9 messages */
 var ms=(MS[no]||[]).concat(CLUBMSG),mo=ms.filter(function(x){return x[4]==='Unread'||x[4]==='Open'}).length;
 h+=sec('messages','Messages &amp; escalations',(MS[no]||[]).length+' &middot; '+mo+' open',tbl([['Reference'],['Type'],['Date',0,1],['Subject'],['State']],ms.map(function(x){return [x[0],x[1],x[2],x[3],stTag(x[4])]}),'No messages.')
  +'<p class="note">Club notices go to every member and are listed for reference. Replies go through the member&rsquo;s secure inbox from Messages.</p>',0);
 /* 10 notes */
 h+='<section class="card pfn" id="s-notes"><div class="hd"><div class="lbl">Admin notes</div>'+'<span class="tag gd">Private &middot; never visible to the member</span>'+'</div><div id="noteList"></div>'
  +'<div class="notecomp" data-capzone="note"><label class="fl" for="noteTx">Add a note</label><textarea class="in" id="noteTx" maxlength="1000" placeholder="Visible to administrators only. Do not paste identity numbers or bank details."></textarea>'
  +'<p class="note zn" hidden></p><div class="acts" style="margin-top:13px;align-items:center"><label class="opt" style="padding:5px 13px"><input type="checkbox" id="notePin"> Pin to top</label><button class="btn" type="button" id="noteAdd" data-cap="note">Add note</button></div>'
  +'<p class="note">Saved in this browser (mock). Adding or editing a note is recorded in the audit log; the note text is not.</p></div></section>';
 /* 11 activity */
 h+='<div id="actSec"></div>';
 return h}

function activity(p){var dyn=(LSg('pgpx-al')||[]).filter(function(r){return String(r[4]).indexOf(p.no)>-1}),rows=dyn.map(function(r){return [r[0],r[1],r[3],r[4]]}).concat(AUD.filter(function(a){return a[4].indexOf(p.no)>-1}).map(function(a){return [a[0],a[1],a[2],a[3]]}));
 var last=rows.length?rows[0][0]:'none';
 return sec('activity','Activity &amp; audit trail',rows.length+' entr'+(rows.length===1?'y':'ies')+(rows.length?' &middot; last '+last:''),tbl([['Time (ET)',0,1],['Admin'],['Action'],['Target']],rows.slice(0,40),'No recorded activity.')+'<p class="note">Everything an administrator does to this member, newest first. The full append-only log is in <a class="link" href="'+(ok(PG.audit)?BASE+'audit-log/':'#')+'">Audit log</a>'+(ok(PG.audit)?'':' (not available to this role)')+'.</p>',0)}

window.PageModules=window.PageModules||{};
window.PageModules.profile=function(U){
 var qp=new URLSearchParams(location.search),id=(qp.get('id')||'').toUpperCase(),p=MAP[id],root=q('#pfRoot');
 if(!p){q('#pName').textContent='Member not found';q('#pCrumb').textContent='Not found';q('#pCrumb2').textContent='Not found';q('#pK').textContent='Member profile';q('#pSub').textContent='';
  root.innerHTML='<section class="card"><div class="lbl">No such member</div><p class="note">'+(id?'No member '+esc(id)+' is on the register.':'Open a member from the register.')+'</p><p style="margin-top:21px"><a class="btn ghost sm" href="'+BASE+'members/">Back to Members</a></p></section>';return}
 document.title=p.n+' \u00b7 Member profile \u00b7 Admin Console';
 q('#pName').textContent=p.n;q('#pCrumb').textContent=p.n;q('#pCrumb2').textContent=p.n;q('#pK').textContent=p.no+' \u00b7 Member profile';q('#pSub').textContent='Names and personal details are visible to administrators only. Sample data.';
 function paintNotes(){var L=notesOf(p.no).slice().sort(function(a,b){return (b.pin?1:0)-(a.pin?1:0)}),me=U.me();
  q('#noteList').innerHTML=L.length?L.map(function(n){return '<article class="note-i'+(n.pin?' pinned':'')+'" data-n="'+n.id+'"><div class="nh"><b>'+esc(n.a)+'</b><span>'+esc(n.t)+(n.ed?' &middot; edited '+esc(n.ed):'')+'</span>'+(n.pin?tg('gd','Pinned'):'')+'</div><p class="nt">'+esc(n.x)+'</p>'
   +(n.a===me?'<div class="acts"><button class="btn ghost sm" type="button" data-cap="note" data-pin="'+n.id+'">'+(n.pin?'Unpin':'Pin')+'</button><button class="btn ghost sm" type="button" data-cap="note" data-edit="'+n.id+'">Edit</button></div>':'')+'</article>'}).join(''):'<p class="note" style="margin:0 0 13px">No notes for this member yet.</p>';
  window.AdminUI.applyRole()}
 function paintAct(){var s=q('#actSec'),o=s.firstChild&&s.firstChild.open;s.innerHTML=activity(p);if(o)s.firstChild.open=true}
 function mount(){
  root.innerHTML=render(p,U);paintNotes();paintAct();
  var cs=q('#s-contact'),seen=false;cs.addEventListener('toggle',function(){if(cs.open&&seen){logA('Viewed contact details',p.no,'member');paintAct()}seen=true});seen=true;
  q('#pfAddNote').addEventListener('click',function(){if(this.getAttribute('aria-disabled')==='true')return;q('#s-notes').scrollIntoView({behavior:'smooth',block:'center'});q('#noteTx').focus()});
  q('#noteAdd').addEventListener('click',function(){if(this.getAttribute('aria-disabled')==='true')return;var t=q('#noteTx'),v=t.value.trim();if(!v){t.focus();U.say('Write the note first.');return}
   var L=notesOf(p.no),nid='N-'+String(Date.now()).slice(-6),pin=q('#notePin').checked?1:0;L.unshift({id:nid,a:U.me(),t:nowStamp(),x:v,pin:pin});saveNotes(p.no,L);t.value='';q('#notePin').checked=false;
   logA('Added admin note',p.no+' &middot; '+nid+(pin?' &middot; pinned':'')+' &middot; '+v.length+' characters','member');paintNotes();paintAct();U.say('Note added (mock). Saved in this browser and recorded in the audit log.')});
  q('#noteList').addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.getAttribute('aria-disabled')==='true')return;var L=notesOf(p.no);
   if(b.hasAttribute('data-pin')){var pid=b.getAttribute('data-pin');L.forEach(function(n){if(n.id===pid){n.pin=n.pin?0:1;logA(n.pin?'Pinned admin note':'Unpinned admin note',p.no+' &middot; '+pid,'member')}});saveNotes(p.no,L);paintNotes();paintAct();return}
   if(b.hasAttribute('data-edit')){var eid=b.getAttribute('data-edit'),n=L.filter(function(x){return x.id===eid})[0],art=b.closest('article');
    art.innerHTML='<div class="nh"><b>'+esc(n.a)+'</b><span>Editing</span></div><textarea class="in" maxlength="1000" aria-label="Edit note">'+esc(n.x)+'</textarea><div class="acts" style="margin-top:8px"><button class="btn sm" type="button" data-save="'+eid+'">Save</button><button class="btn ghost sm" type="button" data-cancel="1">Cancel</button></div>';
    art.querySelector('textarea').focus();return}
   if(b.hasAttribute('data-save')){var sid=b.getAttribute('data-save'),tx=b.closest('article').querySelector('textarea').value.trim();if(!tx)return;
    L.forEach(function(n){if(n.id===sid){n.x=tx;n.ed=nowStamp()}});saveNotes(p.no,L);logA('Edited admin note',p.no+' &middot; '+sid+' &middot; '+tx.length+' characters','member');paintNotes();paintAct();U.say('Note updated (mock). Recorded in the audit log.');return}
   if(b.hasAttribute('data-cancel'))paintNotes()});
  q('#pfFreeze').addEventListener('click',function(){if(this.getAttribute('aria-disabled')==='true')return;var fz=frozenSet().indexOf(p.no)>-1,S='<div class="sum"><b>'+p.no+' &middot; '+esc(p.n)+'</b><br>'+(fz?'Lift the freeze on withdrawals and bank changes':'Freeze withdrawals and bank changes')+'<span>Recorded in the audit log with your admin ID, role and device.</span></div>';
   U.modal({k:'High-risk action',title:(fz?'Unfreeze ':'Freeze ')+p.no+'?',summary:S,html:'<p class="note" style="margin-top:0">This is recorded against '+esc(U.me())+'. You will re-confirm with Face ID or Touch ID.</p>'+S,step:true,confirm:'Continue',
    onDone:function(){var f=frozenSet();if(fz)f=f.filter(function(x){return x!==p.no});else f.push(p.no);LSs('pgpx-frozen',f);logA(fz?'Unfroze account (Face ID)':'Froze account (Face ID)',p.no,'member');U.say((fz?'Unfrozen':'Frozen')+' (mock). Nothing was posted.');mount()}})});
  window.AdminUI.applyRole()}
 mount();
 logA('Viewed contact details',p.no,'member');paintAct();
};
})();

/* ---------- page modules ---------- */
var mod=window.PageModules||{};
if(mod[page])mod[page]({q:q,qa:qa,modal:modal,say:say,esc:esc,can:can,role:function(){return role},me:function(){return ME},other:other,openDrawer:openDrawer,closeDrawer:closeDrawer});
})();
