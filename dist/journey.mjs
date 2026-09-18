export const freshSticker=()=>({text:'',width:25,x:50,y:50,angle:0});
export const allCompleted=(progress,count)=>progress.length===count&&progress.every(n=>Number.isInteger(n)&&n>=1&&n<=3);
export const hintAt=(hints,step)=>hints[Math.min(Math.max(0,step),hints.length-1)]||'';
