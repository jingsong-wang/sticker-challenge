export function stickerBounds({x,y,width,height,angle}) {
 if (![x,y,width,height,angle].every(Number.isFinite)||width<=0||height<=0) return {inside:false,area:0};
 const a=angle*Math.PI/180, dx=(Math.abs(Math.cos(a))*width+Math.abs(Math.sin(a))*height)/2, dy=(Math.abs(Math.sin(a))*width+Math.abs(Math.cos(a))*height)/2;
 return {inside:x-dx>=-1e-9&&x+dx<=1+1e-9&&y-dy>=-1e-9&&y+dy<=1+1e-9,area:width*height};
}
function top(scores,label) {
 if(!Array.isArray(scores)||scores.length<2||scores.some(s=>!Number.isFinite(s.score)||s.score<0||s.score>1)||new Set(scores.map(s=>s.label)).size!==scores.length) return false;
 const s=scores.find(s=>s.label===label); return !!s&&scores.every(t=>t.label===label||s.score>t.score);
}
export function evaluateRun({baseline,result,source,target,area,blank=false,stale=false}) {
 let reason='passed';
 if(blank) reason='control'; else if(stale) reason='stale'; else if(!Number.isFinite(area)||area<=0||area>.35) reason='area'; else if(!top(baseline,source)) reason='baseline'; else if(source===target||!top(result,target)) reason='try-again';
 const won=reason==='passed';return {won,stars:won?(area<=.1?3:area<=.2?2:1):0,reason};
}
export function sanitizeProgress(value,count) {
 const out=Array(count).fill(0); if(!Array.isArray(value))return out;
 for(let i=0;i<count;i++){if(!Number.isInteger(value[i])||value[i]<1||value[i]>3)break;out[i]=value[i];}return out;
}
