(()=>{
  'use strict';
  if(document.documentElement.hasAttribute('data-stackup-native-cast'))return;
  const BASE_W=1920,BASE_H=1080;
  const isMobileLandscape=()=>matchMedia('(orientation: landscape)').matches&&Math.min(innerWidth,innerHeight)<=700;
  function resetCast(cast){
    ['position','inset','left','top','width','height','transform','transform-origin'].forEach(p=>cast.style.removeProperty(p));
  }
  function fitCastMobile(){
    const cast=document.querySelector('.cast');
    if(!cast)return;
    if(!isMobileLandscape()){
      resetCast(cast);
      return;
    }
    const vw=window.visualViewport?.width||innerWidth;
    const vh=window.visualViewport?.height||innerHeight;
    const scale=Math.min(vw/BASE_W,vh/BASE_H);
    const left=Math.max(0,(vw-BASE_W*scale)/2);
    const top=Math.max(0,(vh-BASE_H*scale)/2);
    cast.style.setProperty('position','fixed','important');
    cast.style.setProperty('inset','auto','important');
    cast.style.setProperty('left',left+'px','important');
    cast.style.setProperty('top',top+'px','important');
    cast.style.setProperty('width',BASE_W+'px','important');
    cast.style.setProperty('height',BASE_H+'px','important');
    cast.style.setProperty('transform-origin','0 0','important');
    cast.style.setProperty('transform',`scale(${scale})`,'important');
  }
  const schedule=()=>requestAnimationFrame(()=>requestAnimationFrame(fitCastMobile));
  addEventListener('resize',schedule,{passive:true});
  addEventListener('orientationchange',schedule,{passive:true});
  addEventListener('pageshow',schedule,{passive:true});
  document.addEventListener('fullscreenchange',schedule);
  window.visualViewport?.addEventListener('resize',schedule,{passive:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
  setInterval(fitCastMobile,250);
})();