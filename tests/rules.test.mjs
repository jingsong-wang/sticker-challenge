import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateRun,stickerBounds,sanitizeProgress} from '../dist/rules.mjs';
const baseline=[{label:'apple',score:.8},{label:'iPod',score:.2}];
const result=[{label:'iPod',score:.7},{label:'apple',score:.3}];
const run={baseline,result,source:'apple',target:'iPod',area:.1};
test('only a genuine unique flip earns area-based stars',()=>{
 assert.deepEqual(evaluateRun(run),{won:true,stars:3,reason:'passed'});
 assert.equal(evaluateRun({...run,area:.1001}).stars,2);
 assert.equal(evaluateRun({...run,area:.2001}).stars,1);
 assert.equal(evaluateRun({...run,area:.3501}).won,false);
});
test('wrong original, tied target, stale state and blank control never unlock',()=>{
 for(const patch of [{baseline:result},{result:[{label:'iPod',score:.5},{label:'apple',score:.5}]},{stale:true},{blank:true},{area:NaN},{result:[]}]) assert.equal(evaluateRun({...run,...patch}).won,false);
});
test('rectangle clipping is detected after rotation and exact area counted',()=>{
 assert.deepEqual(stickerBounds({x:.5,y:.5,width:.5,height:.2,angle:0}),{inside:true,area:.1});
 assert.equal(stickerBounds({x:.8,y:.5,width:.5,height:.2,angle:0}).inside,false);
 assert.equal(stickerBounds({x:.75,y:.5,width:.5,height:.5,angle:45}).inside,false);
 assert.equal(stickerBounds({x:NaN,y:.5,width:.5,height:.2,angle:0}).inside,false);
});
test('untrusted saved progress cannot unlock nonconsecutive levels or invalid stars',()=>{
 assert.deepEqual(sanitizeProgress([3,2,1],3),[3,2,1]);
 assert.deepEqual(sanitizeProgress([0,3,3],3),[0,0,0]);
 assert.deepEqual(sanitizeProgress([3,9,2],3),[3,0,0]);
 assert.deepEqual(sanitizeProgress(null,3),[0,0,0]);
});
