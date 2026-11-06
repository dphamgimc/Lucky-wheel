import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseNames, chooseEntry, removeEntry } from '../src/wheel.js';
test('trim names, ignore empty lines, preserve duplicate line identities',()=> { assert.deepEqual(parseNames(' An \n\nAn\n Bình '),[{name:'An',line:0},{name:'An',line:2},{name:'Bình',line:3}]); });
test('duplicate names are independently selectable and only winning occurrence is removed',()=> { const text='An\nBình\nAn', entries=parseNames(text), winner=chooseEntry(entries,()=>.99); assert.equal(winner.line,2); assert.equal(removeEntry(text,winner),'An\nBình'); assert.equal(chooseEntry(entries,()=>0).line,0); });
test('each duplicate occupies its own equal probability interval',()=> { const entries=parseNames('An\nAn\nBình'); assert.deepEqual([.1,.5,.9].map(value=>chooseEntry(entries,()=>value).line),[0,1,2]); });
test('empty, single, boundaries and invalid random',()=> { assert.equal(chooseEntry([]),null); assert.equal(chooseEntry(parseNames('An'),()=>.999).name,'An'); assert.throws(()=>chooseEntry(parseNames('An'),()=>1),RangeError); });
test('remove exact source line even with blank lines',()=> { assert.equal(removeEntry('\n An \n\nAn',{name:'An',line:3}),'\n An \n'); });
