import * as T from '../js/three.module.js';
import {RoundedBoxGeometry} from '../js/jsm/RoundedBoxGeometry.js';

// Procedural MacBook Pro. Units are the CSS laptop's px: base 760x520x20, top face at y=0, hinge at z=-260.
export function createMac(opts){
  var host=opts.host, keys=opts.keys, legends=opts.legends, texUrl=opts.texUrl;
  var phone=matchMedia('(max-width:700px)').matches;
  var renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.setClearColor(0xffffff,0);
  renderer.toneMapping=T.NeutralToneMapping; renderer.toneMappingExposure=1.0;
    var cv=renderer.domElement; cv.className='m3gl'; cv.setAttribute('aria-hidden','true'); host.appendChild(cv);
  var gl=renderer.getContext(); if(!gl||gl.isContextLost()) throw new Error('nogl');

  var scene=new T.Scene();
  var pm=new T.PMREMGenerator(renderer);
  // bright neutral studio: white cyclorama, big soft key above, faint side/front cards
  var studio=new T.Scene();
  (function(){var wall=new T.Mesh(new T.BoxGeometry(60,40,60),new T.MeshBasicMaterial({color:new T.Color(.6,.6,.62),side:T.BackSide}));studio.add(wall);
    function card(w,h,x,y,z,v,rx,ry){var m=new T.MeshBasicMaterial({color:new T.Color(v,v,v),side:T.DoubleSide});var c=new T.Mesh(new T.PlaneGeometry(w,h),m);c.position.set(x,y,z);c.rotation.set(rx||0,ry||0,0);studio.add(c)}
    card(26,22,0,19.5,0,2.3,Math.PI/2,0);card(10,22,-24,4,4,2.2,0,Math.PI/2);card(10,18,24,4,6,1.6,0,-Math.PI/2);card(34,8,0,2,28,1.5,0,0);
    var fl=new T.Mesh(new T.PlaneGeometry(60,60),new T.MeshBasicMaterial({color:new T.Color(.74,.75,.77)}));fl.rotation.x=-Math.PI/2;fl.position.y=-19.8;studio.add(fl)})();
  scene.environment=pm.fromScene(studio,0.02).texture;
  scene.environmentIntensity=1.0;
  var cam=new T.PerspectiveCamera(20,1,400,6000);
  var G=new T.Group(); scene.add(G);
  var maxAn=renderer.capabilities.getMaxAnisotropy();

  // ---- materials
  var alu=new T.MeshPhysicalMaterial({color:0xc5c5c4,metalness:1,roughness:.36,envMapIntensity:1.0,clearcoat:.12,clearcoatRoughness:.5});
  var aluDark=new T.MeshPhysicalMaterial({color:0xc1c1c1,metalness:1,roughness:.4,envMapIntensity:1.0});
  var black=new T.MeshPhysicalMaterial({color:0x050506,metalness:0,roughness:.4,envMapIntensity:.05});
  var keyMat=new T.MeshPhysicalMaterial({color:0x050506,metalness:0,roughness:.72,envMapIntensity:.05});
  var well=new T.MeshStandardMaterial({color:0x0b0b0c,metalness:.1,roughness:.8});

  // smooth normals across shallow edges only (keeps hard creases)
  function crease(g,ang,ax){g=g.index?g.toNonIndexed():g;var P=g.attributes.position,n=P.count,F=new Float32Array(n*3),FL=[],a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),e=new T.Vector3(),f=new T.Vector3();
    for(var i=0;i<n;i+=3){a.fromBufferAttribute(P,i);b.fromBufferAttribute(P,i+1);c.fromBufferAttribute(P,i+2);e.subVectors(c,b);f.subVectors(a,b);e.cross(f).normalize();var flat=Math.abs(ax==='z'?e.z:e.y)>.9995;for(var k=0;k<3;k++){FL[i+k]=flat;F[(i+k)*3]=e.x;F[(i+k)*3+1]=e.y;F[(i+k)*3+2]=e.z}}
    var map={};for(i=0;i<n;i++){var key=Math.round(P.getX(i)*50)+','+Math.round(P.getY(i)*50)+','+Math.round(P.getZ(i)*50);(map[key]=map[key]||[]).push(i)}
    var N=new Float32Array(n*3),cs=Math.cos(ang),m=new T.Vector3();
    for(i=0;i<n;i++){var k2=Math.round(P.getX(i)*50)+','+Math.round(P.getY(i)*50)+','+Math.round(P.getZ(i)*50),L=map[k2];m.set(0,0,0);if(FL[i]){N[i*3]=F[i*3];N[i*3+1]=F[i*3+1];N[i*3+2]=F[i*3+2];continue}
      for(var j=0;j<L.length;j++){var t=L[j];if(F[t*3]*F[i*3]+F[t*3+1]*F[i*3+1]+F[t*3+2]*F[i*3+2]>=cs){m.x+=F[t*3];m.y+=F[t*3+1];m.z+=F[t*3+2]}}
      m.normalize();N[i*3]=m.x;N[i*3+1]=m.y;N[i*3+2]=m.z}
    g.setAttribute('normal',new T.BufferAttribute(N,3));return g}
  // ---- base: extruded rounded outline with keywell + trackpad cut-outs, bevelled
  function rr(sh,cx,cz,w,h,r){var x=cx-w/2,y=-(cz+h/2); // shape y = -world z
    sh.moveTo(x+r,y);sh.lineTo(x+w-r,y);sh.absarc(x+w-r,y+r,r,-Math.PI/2,0);sh.lineTo(x+w,y+h-r);sh.absarc(x+w-r,y+h-r,r,0,Math.PI/2);
    sh.lineTo(x+r,y+h);sh.absarc(x+r,y+h-r,r,Math.PI/2,Math.PI);sh.lineTo(x,y+r);sh.absarc(x+r,y+r,r,Math.PI,Math.PI*1.5);return sh}
  var KX=.5,KZ=-112,TX=0,TZ=130,BT=24; // base thickness
  var shape=rr(new T.Shape(),0,0,756,516,18);
  function hole(cx,cz,w,h,r){var p=rr(new T.Path(),cx,cz,w,h,r);shape.holes.push(p)}
  hole(KX,KZ,621,236,6); hole(TX,TZ,340,200,9);
  var bg=new T.ExtrudeGeometry(shape,{depth:BT-4.4,bevelEnabled:true,bevelThickness:2.2,bevelSize:2,bevelSegments:6,curveSegments:20});
  bg.rotateX(-Math.PI/2); bg.translate(0,-BT+2.2,0); bg=crease(bg,.9,'y');
  var base=new T.Mesh(bg,alu); G.add(base);
  var wellFloor=new T.Mesh(new RoundedBoxGeometry(626,4,242,2,1.5),well); wellFloor.position.set(KX,-9,KZ); G.add(wellFloor);
  var tpGroove=new T.Mesh(new RoundedBoxGeometry(344,4,204,2,1.5),well); tpGroove.position.set(TX,-9,TZ); G.add(tpGroove);
  var tp=new T.Mesh(new RoundedBoxGeometry(338,6,198,3,2.5),aluDark); tp.position.set(TX,-2.9,TZ); G.add(tp);
  // thumb notch on the front lip
  var nt=new T.Mesh(new RoundedBoxGeometry(110,1.2,9,2,.5),new T.MeshPhysicalMaterial({color:0xb4b7bd,metalness:1,roughness:.5}));nt.position.set(0,-.55,254.6);G.add(nt);
  // trackpad edge hairline
  // keys
  var kgeo=new RoundedBoxGeometry(1,1,1,4,.2);
  var im=new T.InstancedMesh(kgeo,keyMat,keys.length); var m4=new T.Matrix4(),q=new T.Quaternion(),pv=new T.Vector3(),sv=new T.Vector3();
  var KH=3.2, kx0=KX-307.5, kz0=KZ-115.2;
  keys.forEach(function(k,i){pv.set(kx0+k[0]+k[2]/2,-4.6+KH/2,kz0+k[1]+k[3]/2);sv.set(k[2]-1.2,KH,k[3]-1.2);m4.compose(pv,q,sv);im.setMatrixAt(i,m4)});
  G.add(im);
  // legends
  if(legends){var lc=document.createElement('canvas');var S=4;lc.width=615*S;lc.height=230.4*S;var cx=lc.getContext('2d');cx.scale(S,S);cx.fillStyle='rgba(200,203,210,.78)';
    legends.forEach(function(t){cx.font=(t.s||6.5)+'px Helvetica,Arial,sans-serif';cx.textAlign=t.a;cx.fillText(t.t,t.x,t.y)});
    var lt=new T.CanvasTexture(lc);lt.colorSpace=T.SRGBColorSpace;lt.anisotropy=maxAn;
    var lp=new T.Mesh(new T.PlaneGeometry(615,230.4),new T.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2}));
    lp.rotation.x=-Math.PI/2;lp.position.set(kx0+307.5,-4.6+KH+.02,kz0+115.2);G.add(lp)}
  // speaker grilles
  var dots=[];[-380+20+20,-380+700+20].forEach(function(gx){for(var r=0;r<37;r++)for(var c=0;c<6;c++)dots.push([gx-17+c*6+(r%2?3:0)+1,-260+36+r*6+3])});
  var dg=new T.CircleGeometry(1.15,10);dg.rotateX(-Math.PI/2);
  var di=new T.InstancedMesh(dg,new T.MeshBasicMaterial({color:0x8d9097,polygonOffset:true,polygonOffsetFactor:-2}),dots.length);
  dots.forEach(function(d,i){m4.makeTranslation(d[0],.05,d[1]);di.setMatrixAt(i,m4)});G.add(di);
  // hinge
  var hg=new T.Mesh(new T.CylinderGeometry(5.5,5.5,610,28,1),new T.MeshPhysicalMaterial({color:0x2a2b2f,metalness:.9,roughness:.4}));
  hg.rotation.z=Math.PI/2;hg.position.set(0,1.5,-256);G.add(hg);

  // soft AO where the lid meets the base
  (function(){var c=document.createElement('canvas');c.width=4;c.height=64;var x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,64);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,4,64);
    var m=new T.Mesh(new T.PlaneGeometry(700,26),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));m.rotation.x=-Math.PI/2;m.position.set(0,.04,-247);G.add(m)})();
  // ---- lid (pivot at hinge)
  var lid=new T.Group(); lid.position.set(0,2,-260); G.add(lid);
  var lsh=rr(new T.Shape(),0,0,756,480,18); // plan-view corners match the base
  var lg2=new T.ExtrudeGeometry(lsh,{depth:3.6,bevelEnabled:true,bevelThickness:2.2,bevelSize:2,bevelSegments:6,curveSegments:20});
  lg2.translate(0,0,-1.8);
  lg2=crease(lg2,.9,'z'); lg2.translate(0,242,0);
  var shell=new T.Mesh(lg2,alu); lid.add(shell);
  var logo=new T.Mesh(new T.CircleGeometry(40,48),new T.MeshPhysicalMaterial({color:0xf4f5f7,metalness:1,roughness:.15,envMapIntensity:1.0}));
  logo.rotation.y=Math.PI;logo.position.set(0,242,-4.08);lid.add(logo);
  // front black glass panel with rounded corners
  function panel(w,h,r,x,y){var s=new T.Shape(),X=-w/2,Y=0;s.moveTo(X+r,Y);s.lineTo(X+w-r,Y);s.absarc(X+w-r,Y+r,r,-Math.PI/2,0);s.lineTo(X+w,Y+h-r);s.absarc(X+w-r,Y+h-r,r,0,Math.PI/2);s.lineTo(X+r,Y+h);s.absarc(X+r,Y+h-r,r,Math.PI/2,Math.PI);s.lineTo(X,Y+r);s.absarc(X+r,Y+r,r,Math.PI,Math.PI*1.5);return new T.ShapeGeometry(s,12)}
  var bz=new T.Mesh(panel(756,478,16),black); bz.position.set(0,3,4.5); lid.add(bz);
  var tex=new T.TextureLoader().load(texUrl,function(){host.dispatchEvent(new Event('m3ready'))});
  tex.colorSpace=T.SRGBColorSpace; tex.anisotropy=maxAn; tex.generateMipmaps=true; tex.minFilter=T.LinearMipmapLinearFilter;
  var scr=new T.Mesh(panel(740,462,10),new T.MeshBasicMaterial({map:tex,toneMapped:false}));
  // panel() y origin is bottom; ShapeGeometry uv are in shape units -> normalise
  (function(g){var p=g.attributes.position,uv=g.attributes.uv;for(var i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+370)/740,p.getY(i)/462)})(scr.geometry);
  scr.position.set(0,10,5); lid.add(scr);
  var notch=new T.Mesh(new T.ShapeGeometry((function(){var s=new T.Shape(),w=140,h=16,r=8;s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,-h+r);s.absarc(w/2-r,-h+r,r,0,-Math.PI/2,true);s.lineTo(-w/2+r,-h);s.absarc(-w/2+r,-h+r,r,-Math.PI/2,-Math.PI,true);s.closePath();return s})(),12),new T.MeshBasicMaterial({color:0x000000}));
  notch.position.set(0,10+462,5.3);lid.add(notch);

  // ---- ground: analytic soft contact AO (rounded-rect SDF of the base footprint) + very faint wide haze
  var FLOOR=-BT;
  var gmat=new T.ShaderMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:2,polygonOffsetUnits:2,
   uniforms:{lid:{value:0}},
   vertexShader:'varying vec2 gp;void main(){gp=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:'varying vec2 gp;uniform float lid;'+
    'float sdr(vec2 p,vec2 c,vec2 h,float r){vec2 q=abs(p-c)-h+r;return length(max(q,0.))+min(max(q.x,q.y),0.)-r;}'+
    'void main(){vec2 p=vec2(gp.x,-gp.y);float d=sdr(p,vec2(0.),vec2(378.,258.),18.);'+
    'float dl=sdr(p,vec2(0.,-258.-lid*.5),vec2(380.,lid*.5),6.);'+
    'float a=.30*exp(-max(d,0.)/3.2)+.11*exp(-max(d,0.)/11.)+.05*exp(-max(d,0.)/46.)+.035*exp(-max(d,0.)/150.);'+
    'a+=.07*lid/200.*exp(-max(dl,0.)/60.);'+
    'a*=1.-smoothstep(380.,620.,length(gp));a*=1.26;'+
    'float ign=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715))));'+
    'a=clamp(a+(ign-.5)*1.5/255.,0.,1.);'+
    'gl_FragColor=vec4(vec3(.16,.17,.2),a);}'});
  var ground=new T.Mesh(new T.PlaneGeometry(2400,2400),gmat);
  ground.rotation.x=-Math.PI/2;ground.position.y=FLOOR-.02;ground.renderOrder=-1;G.add(ground);
  var key=new T.DirectionalLight(0xffffff,.9); key.position.set(-300,1200,500); G.add(key,key.target);
  var fill=new T.DirectionalLight(0xf2f5ff,.35); fill.position.set(700,300,300); G.add(fill);

  // ---- sizing + pose (mirrors the CSS transform chain)
  var W=1,H=1;
  var PAD=0,PADR=0,PADL=0; // extra canvas rows below the frame so the ground shadow fades out fully (view offset keeps the laptop's placement identical)
  function size(){W=host.clientWidth;H=host.clientHeight;PAD=Math.round(H*.45);PADR=Math.round(W*.42);PADL=Math.round(W*.2);renderer.setSize(W+PADL+PADR,H+PAD,false);cv.style.width=(W+PADL+PADR)+'px';cv.style.height=(H+PAD)+'px';cv.style.left=(-PADL)+'px'}
  var ev=new T.Euler(),qq=new T.Quaternion();
  function pose(p,u,ty){ // p 0..1, u scale, ty = css translateY px
    function cl(x){return x<0?0:x>1?1:x}function eo(x){return 1-Math.pow(1-x,3)}function io(x){return x*x*(3-2*x)}
    var a=eo(p),ry=-88+60*a,rx=38-20*a,ph=-82+97*io(cl((p-.08)/.8));
    var d=2600*u/.84; cam.fov=2*Math.atan(H/2/d)*180/Math.PI; cam.aspect=W/H; cam.position.set(0,0,d); cam.lookAt(0,0,0); cam.setViewOffset(W,H,-PADL,0,W+PADL+PADR,H+PAD); cam.updateProjectionMatrix();
    G.position.set(0,-ty,0); G.scale.setScalar(u); G.rotation.set(rx*Math.PI/180,ry*Math.PI/180,0,'XYZ');
    lid.rotation.x=-ph*Math.PI/180;
    G.updateMatrixWorld(true);
    qq.copy(G.quaternion).invert(); scene.environmentRotation.setFromQuaternion(qq);
    gmat.uniforms.lid.value=Math.max(0,Math.sin(ph*Math.PI/180))*484*.9; renderer.render(scene,cam);
  }
  size();
  function warm(){ // precompile shaders + draw one frame offscreen-hidden so the first visible frame costs nothing
    size(); pose(0.5,1,0);
    return (renderer.compileAsync?renderer.compileAsync(scene,cam):Promise.resolve()).catch(function(){}).then(function(){renderer.render(scene,cam)});
  }
  return {pose:pose,size:size,warm:warm,dispose:function(){renderer.dispose();cv.remove()},canvas:cv};
}
