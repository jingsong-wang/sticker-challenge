import test from 'node:test';
import assert from 'node:assert/strict';
import {freshSticker,allCompleted,hintAt} from '../dist/journey.mjs';
test('every attempt starts without an answer and resets independently',()=>{
 const first=freshSticker(); first.text='PIZZA';
 assert.equal(freshSticker().text,'');
 assert.ok(freshSticker().width<45);
});
test('ending only unlocks after every valid sequential completion',()=>{
 for(const p of [[],[3],[3,3,0],[0,3,3],[3,3,4],[3,3,NaN]])assert.equal(allCompleted(p,3),false);
 assert.equal(allCompleted([3,2,1],3),true);
});
test('hints reveal one step at a time and stop at the final hint',()=>{
 const hints=['concept','word','recipe'];
 assert.equal(hintAt(hints,0),'concept');
 assert.equal(hintAt(hints,1),'word');
 assert.equal(hintAt(hints,8),'recipe');
});
