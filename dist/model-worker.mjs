import {MODEL,REVISION,TEMPLATE} from './levels.mjs';
let pipe,RawImage;
self.onmessage=async({data:m})=>{
 try{
  if(m.type==='load'){
   const lib=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
   lib.env.allowLocalModels=false;lib.env.backends.onnx.wasm.numThreads=1;lib.env.backends.onnx.wasm.proxy=false;
   RawImage=lib.RawImage;
   pipe=await lib.pipeline('zero-shot-image-classification',MODEL,{revision:REVISION,device:'wasm',dtype:'q8',progress_callback:p=>self.postMessage({type:'progress',id:m.id,file:p.file,progress:p.progress,status:p.status,loaded:p.loaded,total:p.total})});
   self.postMessage({type:'ready',id:m.id});
  } else if(m.type==='infer'){
   if(!pipe)throw Error('模型尚未加载');
   const start=performance.now();const image=new RawImage(new Uint8ClampedArray(m.pixels),m.width,m.height,4);
   const scores=await pipe(image,m.labels,{hypothesis_template:TEMPLATE});
   self.postMessage({type:'result',id:m.id,scores,ms:performance.now()-start});
  }
 }catch(error){self.postMessage({type:'error',id:m.id,message:error.message||String(error)});}
};
