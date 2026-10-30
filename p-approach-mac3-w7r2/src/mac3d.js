import * as T from '../js/three.module.js';
import {RoomEnvironment} from '../js/jsm/RoomEnvironment.js';
import {RoundedBoxGeometry} from '../js/jsm/RoundedBoxGeometry.js';

// Procedural MacBook Pro. Units are the CSS laptop's px: base 760x520x20, top face at y=0, hinge at z=-260.
export function createMac(opts){
  var host=opts.host, keys=opts.keys, legends=opts.legends, texUrl=opts.texUrl;
  var phone=matchMedia('(max-width:700px)').matches;
  var renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.setClearColor(0xffffff,0);
  renderer.toneMapping=T.NeutralToneMapping; renderer.toneMappingExposure=1.0;
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFShadowMap;
  var cv=renderer.domElement; cv.className='m3gl'; cv.setAttribute('aria-hidden','true'); host.appendChild(cv);
  var gl=renderer.getContext(); if(!gl||gl.isContextLost()) throw new Error('nogl');

  var scene=new T.Scene();
  var pm=new T.PMREMGenerator(renderer);
  scene.environment=pm.fromScene(new RoomEnvironment(),0.03).texture;
  scene.environmentIntensity=1.0;
  var cam=new T.PerspectiveCamera(20,1,400,6000);
  var G=new T.Group(); scene.add(G);
  var maxAn=renderer.capabilities.getMaxAnisotropy();

  // ---- materials
  var alu=new T.MeshPhysicalMaterial({color:0xb6bac1,metalness:1,roughness:.3,anisotropy:.35,anisotropyRotation:Math.PI/2,clearcoat:.0,envMapIntensity:1.3});
  var aluDark=new T.MeshPhysicalMaterial({color:0xb9bcc3,metalness:1,roughness:.42,envMapIntensity:1.0});
  var black=new T.MeshPhysicalMaterial({color:0x08090a,metalness:0,roughness:.28,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:.9});
  var keyMat=new T.MeshPhysicalMaterial({color:0x121316,metalness:0,roughness:.55,clearcoat:.25,clearcoatRoughness:.5,envMapIntensity:.7});
  var well=new T.MeshStandardMaterial({color:0x060607,metalness:.2,roughness:.7});

  // ---- base: extruded rounded outline with keywell + trackpad cut-outs, bevelled
  function rr(sh,cx,cz,w,h,r){var x=cx-w/2,y=-(cz+h/2); // shape y = -world z
    sh.moveTo(x+r,y);sh.lineTo(x+w-r,y);sh.absarc(x+w-r,y+r,r,-Math.PI/2,0);sh.lineTo(x+w,y+h-r);sh.absarc(x+w-r,y+h-r,r,0,Math.PI/2);
    sh.lineTo(x+r,y+h);sh.absarc(x+r,y+h-r,r,Math.PI/2,Math.PI);sh.lineTo(x,y+r);sh.absarc(x+r,y+r,r,Math.PI,Math.PI*1.5);return sh}
  var KX=.5,KZ=-112,TX=0,TZ=130;
  var shape=rr(new T.Shape(),0,0,754,514,17);
  function hole(cx,cz,w,h,r){var p=rr(new T.Path(),cx,cz,w,h,r);shape.holes.push(p)}
  hole(KX,KZ,621,236,6); hole(TX,TZ,340,200,9);
  var bg=new T.ExtrudeGeometry(shape,{depth:14,bevelEnabled:true,bevelThickness:3,bevelSize:3,bevelSegments:5,curveSegments:16});
  bg.rotateX(-Math.PI/2); bg.translate(0,-17,0);
  var base=new T.Mesh(bg,alu); base.castShadow=base.receiveShadow=true; G.add(base);
  // underside plate
  var wellFloor=new T.Mesh(new RoundedBoxGeometry(626,6,242,2,2),well); wellFloor.position.set(KX,-6,KZ); G.add(wellFloor);
  var tp=new T.Mesh(new RoundedBoxGeometry(342,3,202,3,2.5),aluDark); tp.position.set(TX,-1.6,TZ); tp.receiveShadow=true; G.add(tp);
  // trackpad edge hairline
  // keys
  var kgeo=new RoundedBoxGeometry(1,1,1,3,.16);
  var im=new T.InstancedMesh(kgeo,keyMat,keys.length); var m4=new T.Matrix4(),q=new T.Quaternion(),pv=new T.Vector3(),sv=new T.Vector3();
  var KH=3.6, kx0=KX-307.5, kz0=KZ-115.2;
  keys.forEach(function(k,i){pv.set(kx0+k[0]+k[2]/2,-4.6+KH/2,kz0+k[1]+k[3]/2);sv.set(k[2]-1.2,KH,k[3]-1.2);m4.compose(pv,q,sv);im.setMatrixAt(i,m4)});
  im.castShadow=true; im.receiveShadow=true; G.add(im);
  // legends
  if(legends){var lc=document.createElement('canvas');var S=4;lc.width=615*S;lc.height=230.4*S;var cx=lc.getContext('2d');cx.scale(S,S);cx.fillStyle='rgba(205,208,214,.8)';
    legends.forEach(function(t){cx.font=(t.s||6.5)+'px Helvetica,Arial,sans-serif';cx.textAlign=t.a;cx.fillText(t.t,t.x,t.y)});
    var lt=new T.CanvasTexture(lc);lt.colorSpace=T.SRGBColorSpace;lt.anisotropy=maxAn;
    var lp=new T.Mesh(new T.PlaneGeometry(615,230.4),new T.MeshBasicMaterial({map:lt,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2}));
    lp.rotation.x=-Math.PI/2;lp.position.set(kx0+307.5,-4.6+KH+.02,kz0+115.2);G.add(lp)}
  // speaker grilles
  var dots=[];[-380+20+20,-380+700+20].forEach(function(gx){for(var r=0;r<37;r++)for(var c=0;c<6;c++)dots.push([gx-17+c*6+(r%2?3:0)+1,-260+36+r*6+3])});
  var dg=new T.CircleGeometry(1.15,10);dg.rotateX(-Math.PI/2);
  var di=new T.InstancedMesh(dg,new T.MeshBasicMaterial({color:0x2a2c31,polygonOffset:true,polygonOffsetFactor:-2}),dots.length);
  dots.forEach(function(d,i){m4.makeTranslation(d[0],.05,d[1]);di.setMatrixAt(i,m4)});G.add(di);
  // hinge
  var hg=new T.Mesh(new T.CylinderGeometry(6.5,6.5,610,28,1),new T.MeshPhysicalMaterial({color:0x1a1b1e,metalness:.9,roughness:.35}));
  hg.rotation.z=Math.PI/2;hg.position.set(0,1.5,-256);hg.castShadow=true;G.add(hg);

  // ---- lid (pivot at hinge)
  var lid=new T.Group(); lid.position.set(0,2,-260); G.add(lid);
  var shell=new T.Mesh(new RoundedBoxGeometry(760,484,10,5,4.2),alu); shell.position.set(0,242,0); shell.castShadow=true; lid.add(shell);
  var logo=new T.Mesh(new T.CircleGeometry(40,48),new T.MeshPhysicalMaterial({color:0xf2f3f5,metalness:1,roughness:.12,envMapIntensity:1.3}));
  logo.rotation.y=Math.PI;logo.position.set(0,242,-5.08);lid.add(logo);
  // front black glass panel with rounded corners
  function panel(w,h,r,x,y){var s=new T.Shape(),X=-w/2,Y=0;s.moveTo(X+r,Y);s.lineTo(X+w-r,Y);s.absarc(X+w-r,Y+r,r,-Math.PI/2,0);s.lineTo(X+w,Y+h-r);s.absarc(X+w-r,Y+h-r,r,0,Math.PI/2);s.lineTo(X+r,Y+h);s.absarc(X+r,Y+h-r,r,Math.PI/2,Math.PI);s.lineTo(X,Y+r);s.absarc(X+r,Y+r,r,Math.PI,Math.PI*1.5);return new T.ShapeGeometry(s,12)}
  var bz=new T.Mesh(panel(752,476,12),black); bz.position.set(0,4,5.5); lid.add(bz);
  var tex=new T.TextureLoader().load(texUrl,function(){host.dispatchEvent(new Event('m3ready'))});
  tex.colorSpace=T.SRGBColorSpace; tex.anisotropy=maxAn; tex.generateMipmaps=true; tex.minFilter=T.LinearMipmapLinearFilter;
  var scr=new T.Mesh(panel(740,462,6),new T.MeshBasicMaterial({map:tex,toneMapped:false}));
  // panel() y origin is bottom; ShapeGeometry uv are in shape units -> normalise
  (function(g){var p=g.attributes.position,uv=g.attributes.uv;for(var i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)+370)/740,p.getY(i)/462)})(scr.geometry);
  scr.position.set(0,10,6); lid.add(scr);
  var glass=new T.Mesh(scr.geometry,new T.MeshPhysicalMaterial({color:0x000000,roughness:.06,metalness:0,clearcoat:1,clearcoatRoughness:.05,transparent:true,blending:T.AdditiveBlending,depthWrite:false,envMapIntensity:.55}));
  glass.position.set(0,10,6.5);lid.add(glass);
  var notch=new T.Mesh(new T.ShapeGeometry((function(){var s=new T.Shape(),w=140,h=16,r=8;s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,-h+r);s.absarc(w/2-r,-h+r,r,0,-Math.PI/2,true);s.lineTo(-w/2+r,-h);s.absarc(-w/2+r,-h+r,r,-Math.PI/2,-Math.PI,true);s.closePath();return s})(),12),new T.MeshBasicMaterial({color:0x000000}));
  notch.position.set(0,10+462,6.3);lid.add(notch);

  // ---- ground: directional soft shadow + contact shadow
  var FLOOR=-20.3;
  var ground=new T.Mesh(new T.PlaneGeometry(2400,2400),new T.ShadowMaterial({opacity:.2,color:0x0f121a}));
  var gm=ground.material;gm.onBeforeCompile=function(sh){sh.vertexShader='varying vec2 gp;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ngp=position.xy;');sh.fragmentShader='varying vec2 gp;\n'+sh.fragmentShader.replace('#include <fog_fragment>','#include <fog_fragment>\ngl_FragColor.a*=1.0-smoothstep(330.0,590.0,length(gp));')};
  dith(gm);ground.rotation.x=-Math.PI/2;ground.position.y=FLOOR;ground.receiveShadow=true;G.add(ground);
  var sun=new T.DirectionalLight(0xffffff,2.2); sun.position.set(-260,1500,420); sun.target.position.set(0,0,0);
  sun.castShadow=true; var ss=phone?1024:2048; sun.shadow.mapSize.set(ss,ss); var sc=sun.shadow.camera; sc.left=-900;sc.right=900;sc.top=900;sc.bottom=-900;sc.near=200;sc.far=2600;
  sun.shadow.radius=phone?6:10; sun.shadow.bias=-.0006; sun.shadow.normalBias=1.5; G.add(sun,sun.target);
  var fill=new T.DirectionalLight(0xdfe6ff,.6); fill.position.set(700,300,300); G.add(fill);
  // contact shadow
  var TSO=.5, BSO=.8, CS=1300, RS=phone?256:512;
  var hf=!!(renderer.extensions.has('EXT_color_buffer_half_float')||renderer.extensions.has('EXT_color_buffer_float'));var rto={type:hf?T.HalfFloatType:T.UnsignedByteType,minFilter:T.LinearFilter,magFilter:T.LinearFilter,depthBuffer:false};
  var rtA=new T.WebGLRenderTarget(RS,RS,rto),rtB=new T.WebGLRenderTarget(RS,RS,rto),rtC=new T.WebGLRenderTarget(RS,RS,rto);
  var DITH='float ign=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(0.06711056,0.00583715))));float ign2=fract(ign+0.618034*mod(gl_FragCoord.x+gl_FragCoord.y,7.0));gl_FragColor.a=clamp(gl_FragColor.a+(ign-0.5+ign2-0.5)*0.5/255.0,0.0,1.0);';
  function dith(m){var o=m.onBeforeCompile;m.onBeforeCompile=function(sh){if(o)o(sh);sh.fragmentShader=sh.fragmentShader.replace(/}\s*$/,DITH+'\n}')}}
  var cc=new T.OrthographicCamera(-CS/2,CS/2,CS/2,-CS/2,0,700); cc.rotation.x=Math.PI/2; cc.position.y=FLOOR; G.add(cc);
  var depthMat=new T.MeshDepthMaterial(); depthMat.userData.dark={value:3.2};
  depthMat.onBeforeCompile=function(s){s.uniforms.dark=depthMat.userData.dark;s.fragmentShader='uniform float dark;\n'+s.fragmentShader.replace('gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );','gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * dark );')};
  depthMat.depthTest=false;depthMat.depthWrite=false;
  var blurMat=new T.ShaderMaterial({uniforms:{t:{value:null},d:{value:new T.Vector2()}},vertexShader:'varying vec2 u;void main(){u=uv;gl_Position=vec4(position.xy,0.,1.);}',
   fragmentShader:'uniform sampler2D t;uniform vec2 d;varying vec2 u;void main(){float a=0.;float w=0.;for(int i=-12;i<=12;i++){float x=float(i)*.5;float k=exp(-x*x/14.);a+=texture2D(t,u+d*x).a*k;w+=k;}gl_FragColor=vec4(0.,0.,0.,a/w);}',depthTest:false,depthWrite:false});
  var bq=new T.Mesh(new T.PlaneGeometry(2,2),blurMat),bs=new T.Scene();bs.add(bq);var bcam=new T.Camera();
  var cplane=new T.Mesh(new T.PlaneGeometry(CS,CS),new T.MeshBasicMaterial({map:rtA.texture,transparent:true,opacity:BSO,depthWrite:false,toneMapped:false}));
  dith(cplane.material);cplane.rotation.x=-Math.PI/2;cplane.position.y=FLOOR+.1;cplane.renderOrder=-2;G.add(cplane);
  var cplane2=new T.Mesh(cplane.geometry,new T.MeshBasicMaterial({map:rtC.texture,transparent:true,opacity:TSO,depthWrite:false,toneMapped:false}));
  dith(cplane2.material);cplane2.rotation.x=-Math.PI/2;cplane2.position.y=FLOOR+.2;cplane2.renderOrder=-1;G.add(cplane2);
  var hid=[ground,cplane,cplane2];
  function contact(){
    hid.forEach(function(o){o.visible=false});var bgc=scene.background;var rt0=renderer.getRenderTarget();var ca=renderer.getClearAlpha();
    var tm=renderer.toneMapping;renderer.toneMapping=T.NoToneMapping;
    scene.overrideMaterial=depthMat;renderer.setClearColor(0xffffff,0);renderer.setRenderTarget(rtA);renderer.clear();
    var sm=renderer.shadowMap.enabled;renderer.shadowMap.enabled=false;
    var env=scene.environment;scene.environment=null;
    var vs=[sun,fill];vs.forEach(function(l){l.visible=false});
    renderer.render(scene,cc);
    scene.overrideMaterial=null;scene.environment=env;vs.forEach(function(l){l.visible=true});renderer.shadowMap.enabled=sm;
    blurMat.uniforms.t.value=rtA.texture;blurMat.uniforms.d.value.set(1.7/RS,0);renderer.setRenderTarget(rtB);renderer.clear();renderer.render(bs,bcam);
    blurMat.uniforms.t.value=rtB.texture;blurMat.uniforms.d.value.set(0,1.7/RS);renderer.setRenderTarget(rtC);renderer.clear();renderer.render(bs,bcam);
    blurMat.uniforms.t.value=rtA.texture;blurMat.uniforms.d.value.set(6/RS,0);renderer.setRenderTarget(rtB);renderer.clear();renderer.render(bs,bcam);
    blurMat.uniforms.t.value=rtB.texture;blurMat.uniforms.d.value.set(0,6/RS);renderer.setRenderTarget(rtA);renderer.clear();renderer.render(bs,bcam);
    blurMat.uniforms.t.value=rtA.texture;blurMat.uniforms.d.value.set(6/RS,0);renderer.setRenderTarget(rtB);renderer.clear();renderer.render(bs,bcam);
    blurMat.uniforms.t.value=rtB.texture;blurMat.uniforms.d.value.set(0,6/RS);renderer.setRenderTarget(rtA);renderer.clear();renderer.render(bs,bcam);
    renderer.setRenderTarget(rt0);renderer.toneMapping=tm;renderer.setClearColor(0xffffff,0);
    hid.forEach(function(o){o.visible=true});
  }

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
    var k=.79/u; cc.zoom=k; cc.far=700/k; cc.updateProjectionMatrix();
    contact(); renderer.render(scene,cam);
  }
  size();
  return {pose:pose,size:size,dispose:function(){renderer.dispose();cv.remove()},canvas:cv};
}
