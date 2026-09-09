(() => {
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const loader=$('#loader'); window.addEventListener('load',()=>setTimeout(()=>{loader.style.opacity='0';loader.style.visibility='hidden'},1150));
const drawer=$('.drawer'), menu=$('.menu'); menu?.addEventListener('click',()=>drawer.classList.add('open')); $('.drawer-close')?.addEventListener('click',()=>drawer.classList.remove('open')); $$('.drawer a').forEach(a=>a.addEventListener('click',()=>drawer.classList.remove('open'))); window.addEventListener('keydown',e=>{if(e.key==='Escape'){drawer.classList.remove('open');closeModal()}});
const modal=$('#authModal'); const closeModal=()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}; const openModal=()=>{modal.classList.add('open');modal.setAttribute('aria-hidden','false')}; $$('[data-open-auth]').forEach(b=>b.addEventListener('click',openModal)); $('.modal-close')?.addEventListener('click',closeModal); modal?.addEventListener('click',e=>{if(e.target===modal)closeModal()});
$('#authForm')?.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const user={name:fd.get('name').trim(),email:fd.get('email').trim().toLowerCase(),phone:fd.get('phone').trim(),createdAt:new Date().toISOString()};localStorage.setItem('btya_demo_account',JSON.stringify(user));$('#authStatus').textContent='Account created locally. Membership still requires a separate application and approval.';e.currentTarget.reset()});
// --- Three.js: progressive enhancement, never a dependency for the mobile experience ---
const mount=$('#webgl');
const canUseWebGL=(()=>{try{const c=document.createElement('canvas');return !!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl')))}catch{return false}})();
if(mount&&window.THREE&&canUseWebGL){
  try{
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(38,innerWidth/innerHeight,.1,100);camera.position.set(0,0,12);
    const renderer=new THREE.WebGLRenderer({antialias:innerWidth>700,alpha:true,powerPreference:'high-performance',failIfMajorPerformanceCaveat:false});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,innerWidth<700?1.15:1.6));renderer.setSize(innerWidth,innerHeight,false);renderer.outputColorSpace=THREE.SRGBColorSpace;mount.appendChild(renderer.domElement);
    const group=new THREE.Group();scene.add(group);
    const mobile=innerWidth<700;const count=mobile?850:2600;
    const pos=new Float32Array(count*3),sizes=new Float32Array(count),phase=new Float32Array(count);
    for(let i=0;i<count;i++){const r=4.1*Math.pow(Math.random(),.44),a=Math.random()*Math.PI*2,z=Math.random()*2-1,q=Math.sqrt(1-z*z);pos[i*3]=r*q*Math.cos(a);pos[i*3+1]=r*z;pos[i*3+2]=r*q*Math.sin(a);sizes[i]=.65+Math.random()*1.4;phase[i]=Math.random()*6.283}
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));pg.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));pg.setAttribute('aPhase',new THREE.BufferAttribute(phase,1));
    const pm=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uPointer:{value:new THREE.Vector2()}},vertexShader:`attribute float aSize;attribute float aPhase;uniform float uTime;uniform vec2 uPointer;varying float vA;void main(){vec3 p=position;p.y+=sin(length(p.xz)*1.7+uTime*.32+aPhase)*.045;float dx=p.x-uPointer.x*2.2;float dy=p.y+uPointer.y*1.6;float influence=max(0.,1.-sqrt(dx*dx+dy*dy)*.35);p.z+=influence*.16;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=aSize*(105./max(1.,-mv.z));gl_Position=projectionMatrix*mv;vA=.35+.65*sin(aPhase+uTime*.7);}`,fragmentShader:`varying float vA;void main(){float d=distance(gl_PointCoord,vec2(.5));float a=smoothstep(.5,.04,d);gl_FragColor=vec4(.404,.969,1.,a*vA*.48);}`});
    group.add(new THREE.Points(pg,pm));
    const ring=new THREE.Mesh(new THREE.TorusGeometry(3.45,.006,8,180),new THREE.MeshBasicMaterial({color:0x67f7ff,transparent:true,opacity:.2}));ring.rotation.x=Math.PI*.38;group.add(ring);
    const coreGeo=new THREE.IcosahedronGeometry(2.08,2);
    const coreMat=new THREE.ShaderMaterial({wireframe:true,transparent:true,opacity:.16,uniforms:{uTime:{value:0}},vertexShader:`uniform float uTime;varying float v;void main(){vec3 p=position;float n=sin(position.x*2.6+uTime*.26)*sin(position.y*1.8+uTime*.18);p+=normal*n*.018;v=n;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying float v;void main(){gl_FragColor=vec4(.57,.41,1.,.08+abs(v)*.11);}`});
    const core=new THREE.Mesh(coreGeo,coreMat);group.add(core);
    let tx=0,ty=0,x=0,y=0,scroll=0;
    const pointer=window.matchMedia('(pointer:fine)');
    if(pointer.matches)window.addEventListener('pointermove',e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5;pm.uniforms.uPointer.value.set(tx,ty)},{passive:true});
    window.addEventListener('scroll',()=>{scroll=window.scrollY||0},{passive:true});
    const clock=new THREE.Clock();let raf=0;
    const frame=()=>{const t=clock.getElapsedTime();pm.uniforms.uTime.value=t;coreMat.uniforms.uTime.value=t;x+=(tx-x)*.025;y+=(ty-y)*.025;group.rotation.y=t*.025+x*.1;group.rotation.x=y*.055;ring.rotation.z=-t*.045;camera.position.z=12+Math.min(scroll/1200,1.4);camera.position.x=x*.3;camera.position.y=-y*.2;camera.lookAt(0,0,0);renderer.render(scene,camera);raf=requestAnimationFrame(frame)};
    frame();
    const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,innerWidth<700?1.15:1.6));renderer.setSize(innerWidth,innerHeight,false)};
    window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf)}else{clock.start();frame()}});
  }catch(err){mount.classList.add('webgl-fallback');console.warn('BTYA motion fallback:',err)}
}
// subtle reveal on scroll
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('seen')}),{threshold:.12});$$('.section,.manifesto,.footer').forEach(e=>obs.observe(e));
})();


// Luxury fluid interaction layer
if(window.matchMedia('(pointer:fine)').matches){
  const glowTargets=document.querySelectorAll('.principles article,.orbit-card,.update-feature,.timeline article,.modal-card');
  glowTargets.forEach(el=>el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');el.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');},{passive:true}));
  document.addEventListener('pointermove',e=>{document.documentElement.style.setProperty('--cursor-x',e.clientX+'px');document.documentElement.style.setProperty('--cursor-y',e.clientY+'px')},{passive:true});
}
