import {freshSticker,allCompleted,hintAt} from './journey.mjs';
import {LEVELS,LABELS,NAMES,MODEL,REVISION,TEMPLATE} from './levels.mjs';
import {evaluateRun,stickerBounds,sanitizeProgress} from './rules.mjs';
import {compose} from './compose.mjs';
const $=id=>document.getElementById(id),canvas=$('game-canvas'),ctx=canvas.getContext('2d');
const STORE='misread-stickers-v1';let progress;try{progress=sanitizeProgress(JSON.parse(localStorage.getItem(STORE)),LEVELS.length);}catch{progress=sanitizeProgress(null,LEVELS.length);}
let index=0,image=null,worker=null,ready=false,loading=false,busy=false,baseline=null,version=0,lastRun=null,control=null,sequence=0,loadTimer=null,levelGeneration=0;
let hintStep=0;
const pending=new Map();const level=()=>LEVELS[index];
const inputs=['sticker-text','sticker-size','sticker-x','sticker-y','sticker-angle'];
const setting=()=>{const width=Number($('sticker-size').value)/100;return {text:$('sticker-text').value.trim().slice(0,32),width,height:width*.4,x:Number($('sticker-x').value)/100,y:Number($('sticker-y').value)/100,angle:Number($('sticker-angle').value)};};
const tell=text=>{$('result-message').textContent=text;if($('live-feedback'))$('live-feedback').textContent=text;};
function updateButtons(){const s=setting(),bounds=stickerBounds(s),valid=!!image&&bounds.inside&&bounds.area<=.35&&!!s.text;
 $('run').disabled=!ready||busy||!baseline||!valid;$('blank').disabled=!ready||busy||!baseline||!bounds.inside;
 $('load-model').disabled=loading||ready;$('load-model').hidden=ready;$('cancel-load').hidden=!loading;
 $('next-level').disabled=busy||!progress[index]||(index===LEVELS.length-1&&!allCompleted(progress,LEVELS.length));
 $('next-level').textContent=index===LEVELS.length-1?'通关解密 →':'下一关 →';
 $('ending-open').hidden=!allCompleted(progress,LEVELS.length);
 $('download-card').disabled=!lastRun||lastRun.version!==version||busy;$('download-json').disabled=$('download-card').disabled;
 $('area-value').textContent=`${(bounds.area*100).toFixed(1)}%${bounds.inside?'':' · 贴纸超出边界'}`;
 for(const id of inputs){const out=document.querySelector(`[data-output-for="${id}"]`);if(out)out.textContent=$(id).value+(id==='sticker-angle'?'°':id==='sticker-text'?'':'%');}
}
function renderLevels(){const list=$('level-list');list.replaceChildren();LEVELS.forEach((l,i)=>{const b=document.createElement('button');b.type='button';b.className='level-button'+(i===index?' active':'');b.disabled=busy||loading||(i>0&&!progress[i-1]);b.setAttribute('aria-current',i===index?'step':'false');b.textContent=`${String(i+1).padStart(2,'0')}  ${l.title}  ${progress[i]?'★'.repeat(progress[i]):i>0&&!progress[i-1]?'🔒':'挑战'}`;b.onclick=()=>selectLevel(i);list.append(b);});$('stars-total').textContent=`${progress.reduce((a,b)=>a+b,0)} / ${LEVELS.length*3}`;}
function scorePanel(id,scores){const box=$(id);box.replaceChildren();if(!scores){const p=document.createElement('p');p.className='score-empty';p.textContent='等待本机模型推理';box.append(p);return;}
 for(const item of scores){const row=document.createElement('div');row.className='score-row'+(item.label===level().target?' target':'');const label=document.createElement('span');label.textContent=NAMES[item.label]||item.label;const val=document.createElement('b');val.textContent=(item.score*100).toFixed(1)+'%';const bar=document.createElement('i');bar.style.width=(item.score*100)+'%';const track=document.createElement('div');track.className='score-track';track.append(bar);row.append(label,val,track);box.append(row);}
}
function redraw(){if(image)compose(ctx,image,setting());updateButtons();}
function changed(){version++;lastRun=null;control=null;scorePanel('result-scores',null);scorePanel('control-scores',null);tell('贴纸已修改。点击“让 AI 再看一次”获取新判断。');redraw();}
for(const id of inputs)$(id).addEventListener('input',changed);
function defaults(){const s=freshSticker();for(const [id,key] of [['sticker-text','text'],['sticker-size','width'],['sticker-x','x'],['sticker-y','y'],['sticker-angle','angle']])$(id).value=String(s[key]);}
async function selectLevel(i){if(busy||loading||i<0||i>=LEVELS.length||(i>0&&!progress[i-1]))return;index=i;version++;const token=++levelGeneration;baseline=null;lastRun=null;control=null;image=null;defaults();$('level-number').textContent=String(i+1).padStart(2,'0');$('level-title').textContent=level().title;$('mission').textContent=`让模型把${NAMES[level().source]}排在后面，把${NAMES[level().target]}排到第一。`;$('target-label').textContent=NAMES[level().target];hintStep=0;$('hint').textContent='给我一点提示 · 1/3';$('hint').disabled=false;$('hint-text').textContent='';$('hint-text').hidden=true;
 for(const id of ['original-scores','result-scores','control-scores'])scorePanel(id,null);renderLevels();updateButtons();tell('正在读取关卡照片…');
 try{const img=new Image();img.src=new URL(level().image,import.meta.url).href;await img.decode();if(token!==levelGeneration)return;image=img;redraw();if(ready)await runBaseline();else tell('先启动本机 AI，再试着用一张贴纸改变它的判断。');}catch{if(token===levelGeneration)tell('关卡图片加载失败，请刷新页面重试。');}
}
function stopWorker(message){clearTimeout(loadTimer);worker?.terminate();worker=null;ready=false;loading=false;busy=false;for(const p of pending.values())p.reject(Error(message));pending.clear();baseline=null;lastRun=null;scorePanel('original-scores',null);$('model-status').textContent=message;$('model-progress').value=0;updateButtons();renderLevels();}
function call(type,payload={}){const id=++sequence;return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});worker.postMessage({type,id,...payload});});}
async function start(){if(loading||ready)return;loading=true;$('model-status').textContent='连接模型资源…首次约 150 MB 权重，外加运行库。';$('model-progress').value=0;updateButtons();renderLevels();
 worker=new Worker(new URL('./model-worker.mjs',import.meta.url),{type:'module'});
 worker.onmessage=({data:m})=>{if(m.type==='progress'){if(Number.isFinite(m.progress))$('model-progress').value=m.progress;$('model-status').textContent=m.status==='done'?'文件已就绪，正在初始化模型…':`正在准备 ${m.file||'模型'}${Number.isFinite(m.progress)?' · '+m.progress.toFixed(0)+'%':''}`;return;}const p=pending.get(m.id);if(!p)return;pending.delete(m.id);if(m.type==='error')p.reject(Error(m.message));else p.resolve(m);};
 worker.onerror=()=>stopWorker('模型运行失败。请重试，或使用桌面 Chrome / Edge。');
 loadTimer=setTimeout(()=>stopWorker('下载超时。请检查网络后重试；已缓存的文件可复用。'),300000);
 try{await call('load');clearTimeout(loadTimer);loading=false;ready=true;$('model-progress').value=100;$('model-status').textContent='CLIP · 本机 WASM 推理 · q8';updateButtons();renderLevels();if(image)await runBaseline();}
 catch(e){if(worker)stopWorker('加载失败：'+e.message);}
}
function pixelSnapshot(s=null,blank=false){const c=document.createElement('canvas');c.width=c.height=512;compose(c.getContext('2d'),image,s,blank);return c;}
async function infer(c){const data=c.getContext('2d').getImageData(0,0,512,512);return call('infer',{pixels:data.data.buffer,width:512,height:512,labels:LABELS});}
async function runBaseline(){busy=true;const token=index;updateButtons();renderLevels();tell('AI 先看一眼没有贴纸的原图…');
 try{const r=await infer(pixelSnapshot());if(index!==token)return;baseline=r.scores;scorePanel('original-scores',baseline);if(baseline[0]?.label!==level().source){tell('当前环境下原图未被正确识别，本关暂不计分。请重新加载模型后再试。');baseline=null;}else tell(`原图判断：${NAMES[level().source]}。现在轮到你了。`);}
 catch(e){tell('原图推理失败：'+e.message);}finally{busy=false;updateButtons();renderLevels();}
}
async function submit(blank=false){if(busy||!ready||!baseline||!image)return;const s=setting(),bounds=stickerBounds(s);if(!bounds.inside||bounds.area>.35||(!blank&&!s.text)){tell('请把完整贴纸放在图片内，并填写文字。');return;}
 const v=version,levelIndex=index,c=pixelSnapshot(s,blank),base=structuredClone(baseline);busy=true;updateButtons();renderLevels();tell(blank?'正在测试同样位置的空白贴纸…':'AI 正在看你的贴纸…');
 try{const r=await infer(c);if(v!==version||index!==levelIndex){tell('推理时贴纸发生变化，旧结果已作废。请重新提交。');return;}
 if(blank){control={sticker:s,scores:r.scores,ms:r.ms};scorePanel('control-scores',r.scores);if(lastRun)lastRun.control=control;tell(`空白对照：${NAMES[r.scores[0].label]}排在第一。对照不计分；与有字贴纸比较，观察文字的作用。`);}
 else{const verdict=evaluateRun({baseline:base,result:r.scores,source:level().source,target:level().target,area:bounds.area});lastRun={version:v,level:level().id,levelIndex,sticker:s,baseline:base,result:r.scores,control,verdict,ms:r.ms,png:c.toDataURL('image/png')};scorePanel('result-scores',r.scores);
 if(verdict.won){progress[index]=Math.max(progress[index],verdict.stars);try{localStorage.setItem(STORE,JSON.stringify(progress));}catch{}tell(`${'★'.repeat(verdict.stars)} 挑战成功！${NAMES[level().target]}升到第一。${index===LEVELS.length-1?'你已通关全部挑战！':'下一关已解锁。'}`);}else tell(`还差一点！当前第一名是${NAMES[r.scores[0]?.label]||'未知'}。试试调整文字、大小或位置。`);}
 }catch(e){tell('推理失败：'+e.message);}finally{busy=false;updateButtons();renderLevels();}
}
$('load-model').onclick=start;$('cancel-load').onclick=()=>stopWorker('已取消下载，可重新启动。');$('run').onclick=()=>submit(false);$('blank').onclick=()=>submit(true);$('reset-sticker').onclick=()=>{defaults();changed();};$('next-level').onclick=()=>index===LEVELS.length-1?showEnding():selectLevel(index+1);$('hint').onclick=()=>{const hints=['模型也会把图片里的文字当作视觉线索。试试与目标有关的英文词，再观察分数如何变化。',`试试目标的英文名称：${level().target.toUpperCase()}。位置、字号和遮挡范围也会影响结果。`,level().hint];$('hint-text').textContent=hintAt(hints,hintStep);$('hint-text').hidden=false;hintStep++;$('hint').textContent=hintStep>=3?'提示已全部展开':'再给一点提示 · '+(hintStep+1)+'/3';$('hint').disabled=hintStep>=3;};
let dragging=false;canvas.addEventListener('pointerdown',e=>{if(!image)return;dragging=true;canvas.setPointerCapture(e.pointerId);move(e);});canvas.addEventListener('pointermove',e=>{if(dragging)move(e);});canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
function move(e){const rect=canvas.getBoundingClientRect();$('sticker-x').value=String(Math.round(Math.max(0,Math.min(100,(e.clientX-rect.left)/rect.width*100))));$('sticker-y').value=String(Math.round(Math.max(0,Math.min(100,(e.clientY-rect.top)/rect.height*100))));changed();}
$('about-open').onclick=()=>$('about').showModal();$('about-close').onclick=()=>$('about').close();$('export-close').onclick=()=>$('export-dialog').close();let exportUrl=null;
function showExport(blob,name,preview){if(exportUrl)URL.revokeObjectURL(exportUrl);exportUrl=URL.createObjectURL(blob);$('export-link').href=exportUrl;$('export-link').download=name;$('export-image').hidden=!preview;if(preview)$('export-image').src=exportUrl;else $('export-image').removeAttribute('src');$('export-dialog').showModal();}
$('download-json').onclick=()=>{if(!lastRun||lastRun.version!==version)return;const {png,version:submittedVersion,...run}=lastRun;showExport(new Blob([JSON.stringify({schema:1,model:MODEL,revision:REVISION,dtype:'q8',backend:'wasm',library:'Transformers.js 3.8.1',template:TEMPLATE,candidates:LABELS,preprocessing:'512 square center crop, CLIP processor to 224',scores:'softmax relative to fixed candidates, not calibrated confidence',...run},null,2)],{type:'application/json'}),'misread-run.json',false);};
$('download-card').onclick=async()=>{const run=lastRun;if(!run||run.version!==version)return;const c=document.createElement('canvas');c.width=1400;c.height=1020;const g=c.getContext('2d');g.fillStyle='#f5f2e9';g.fillRect(0,0,1400,1020);g.fillStyle='#f04d32';g.fillRect(70,65,20,20);g.fillStyle='#20231e';g.font='bold 22px Arial';g.fillText('MISREAD LAB / STICKER CHALLENGE',105,84);g.font='bold 58px Arial';g.fillText(run.verdict.won?'一张贴纸，让 AI 改了口。':'这次，AI 没有被我骗到。',70,172);g.font='24px Arial';g.fillText(`LEVEL ${run.levelIndex+1} · 贴纸面积 ${(run.sticker.width*run.sticker.height*100).toFixed(1)}% · ${run.verdict.stars} 星`,70,225);
 const original=pixelSnapshot();const result=new Image();result.src=run.png;await result.decode();g.drawImage(original,70,290,580,580);g.drawImage(result,750,290,580,580);g.font='bold 25px Arial';g.fillText(`原图 → ${NAMES[run.baseline[0].label]}`,70,275);g.fillText(`贴纸后 → ${NAMES[run.result[0].label]}`,750,275);g.font='20px Arial';g.fillText('真实本机 CLIP 分类 · 固定 8 个候选类别 · 不代表 MLLM 越狱',70,925);g.fillText('jingsong-wang.github.io/sticker-challenge/',70,963);c.toBlob(blob=>{if(blob)showExport(blob,'misread-sticker-card.png',true);},'image/png');};
function showEnding(){
 if(!allCompleted(progress,LEVELS.length)||busy)return;
 $('play-view').hidden=true;$('ending').hidden=false;
 $('ending-stars').textContent=progress.reduce((a,b)=>a+b,0)+' / 9';
 const r=lastRun;
 $('ending-evidence').textContent=r?.verdict.won?`刚才这一局：原图第一名是${NAMES[r.baseline[0].label]}，加入「${r.sticker.text}」后，${NAMES[r.result[0].label]}升到第一（相对分数 ${(r.result[0].score*100).toFixed(1)}%）。${r.control?'相同位置的空白贴纸第一名是'+NAMES[r.control.scores[0].label]+'。':'这一局还没有空白对照，回到实验可以补做。'}`:'你已完成三关。返回任意关卡，用同一位置、同一大小的空白贴纸复测，区分文字与遮挡的影响。';
 $('ending-title').focus();window.scrollTo({top:0,behavior:'instant'});
}
$('ending-open').onclick=showEnding;
$('back-to-game').onclick=()=>{$('ending').hidden=true;$('play-view').hidden=false;$('next-level').focus();};
selectLevel(0);
