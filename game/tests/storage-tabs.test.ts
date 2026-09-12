import test from 'node:test';
import assert from 'node:assert/strict';
import { createCharacterSheet, generateItem } from '../src/items.ts';
import { quoteService, planService, type ServiceRequest } from '../src/commerce.ts';
import { executeService } from '../src/commerce-command.ts';
import { storageTabCount, storageTabItems, STORAGE_TAB_PRICES, STASH_CAPACITY } from '../src/storage-content.ts';
import { sortStorage } from '../src/inventory-tools.ts';
import { decodeCharacterSave } from '../src/character-save.ts';
import { Simulation } from '../src/simulation.ts';
import { WORLD_GENERATION_VERSION } from '../src/world.ts';
import type { CharacterSheet } from '../src/character-types.ts';
import type { TownNPC } from '../src/npcs.ts';

const npc: TownNPC = {id:'test:stash',buildingId:'test',role:'stash',name:'Storage',seed:1,level:1,x:0,y:0};
const world = {blocked:()=>false,move:(x:number,y:number)=>({x,y})};
const wealthy=():CharacterSheet=>({...createCharacterSheet(),gold:2_000_000});
function quote(sheet:CharacterSheet,request:ServiceRequest) {
  const result=quoteService(sheet,npc,1,request); assert.ok(result.ok); return result.quote;
}
function apply(sheet:CharacterSheet,request:ServiceRequest) {
  const result=planService(sheet,npc,1,quote(sheet,request)); assert.ok(result.ok); return result.character;
}
function save(sheet:CharacterSheet) {
  const sim=new Simulation(world,{spawn:false});
  return decodeCharacterSave(JSON.stringify({version:4,id:'storage-tabs',name:'Rowan',worldSeed:7319,worldVersion:WORLD_GENERATION_VERSION,
    createdAt:1,updatedAt:2,checkpoint:{...sim.captureCheckpoint(),character:sheet}}));
}

test('four increasingly expensive purchases permanently unlock five tabs and keep existing possessions',()=>{
  let sheet=wealthy(); const item=generateItem(80001,1,'charm','jade-monolith','rare');
  sheet.stash=Array(STASH_CAPACITY).fill(null); sheet.stash[45]=item;
  const inventory=JSON.stringify(sheet.inventory); let spent=0;
  assert.equal(storageTabCount(sheet),1);
  for(let tab=1;tab<5;tab++) {
    const before=structuredClone(sheet),offer=quote(sheet,{type:'unlockStorage',tab});
    assert.equal(offer.price,STORAGE_TAB_PRICES[tab-1]);
    if(tab>1)assert.ok(offer.price>STORAGE_TAB_PRICES[tab-2]);
    const planned=planService(sheet,npc,1,offer); assert.ok(planned.ok); assert.equal(planned.item,null);
    assert.deepEqual(sheet,before,'planning never mutates the current save');
    sheet=planned.character; spent+=offer.price;
    assert.equal(sheet.gold,2_000_000-spent); assert.equal(storageTabCount(sheet),tab+1);
    assert.equal(sheet.stash![45],item); assert.equal(sheet.stash!.length,(tab+1)*STASH_CAPACITY);
    assert.ok(storageTabItems(sheet,tab).every(i=>i===null));
    assert.equal(JSON.stringify(sheet.inventory),inventory);
    assert.ok(save(sheet),'every purchased capacity round trips through shared save validation');
  }
  assert.equal(quoteService(sheet,npc,1,{type:'unlockStorage',tab:5}).ok,false);
});

test('tab purchases reject unaffordable, forged, stale, skipped and wrong-vendor offers',()=>{
  const sheet=wealthy(),before=structuredClone(sheet),offer=quote(sheet,{type:'unlockStorage',tab:1});
  assert.equal(planService({...sheet,gold:offer.price-1},npc,1,offer).ok,false);
  assert.equal(planService(sheet,npc,1,{...offer,price:0}).ok,false);
  for(const tab of [-1,0,2,1.5,NaN])assert.equal(quoteService(sheet,npc,1,{type:'unlockStorage',tab}).ok,false);
  assert.equal(quoteService(sheet,{...npc,role:'blacksmith'},1,{type:'unlockStorage',tab:1}).ok,false);
  const bought=apply(sheet,{type:'unlockStorage',tab:1});
  assert.equal(planService(bought,npc,1,offer).ok,false,'replaying a purchase cannot charge or unlock again');
  assert.deepEqual(sheet,before);
});

test('store, take and auto-sort operate within their selected purchased tab',()=>{
  let sheet=apply(wealthy(),{type:'unlockStorage',tab:1});
  const ring=generateItem(81001,1,'ring'),sword=generateItem(81002,1,'weapon','greatblade'),other=generateItem(81003,1,'chest');
  sheet.stash![0]=other; sheet.inventory[0]=ring; sheet.inventory[1]=sword;
  assert.equal(quoteService(sheet,npc,1,{type:'store',bag:0,tab:2}).ok,false);
  sheet=apply(sheet,{type:'store',bag:0,tab:1}); sheet=apply(sheet,{type:'store',bag:1,tab:1});
  assert.equal(sheet.stash![96],ring); assert.equal(sheet.stash![97],sword); assert.equal(sheet.stash![0],other);
  const first=storageTabItems(sheet,0),bag=JSON.stringify(sheet.inventory);
  assert.equal(sortStorage(sheet,1).ok,true);
  assert.deepEqual(storageTabItems(sheet,0),first); assert.equal(JSON.stringify(sheet.inventory),bag);
  assert.equal(sheet.stash![96],sword); assert.equal(sortStorage(sheet,2).ok,false);
  sheet=apply(sheet,{type:'retrieve',slot:96});
  assert.equal(sheet.stash![96],null); assert.equal(sheet.inventory.filter(i=>i?.id===sword.id).length,1);
  assert.ok(save(sheet));
});

test('a full selected tab cannot silently spill stored gear into another tab',()=>{
  const sheet=apply(wealthy(),{type:'unlockStorage',tab:1});
  for(let i=0;i<STASH_CAPACITY;i++)sheet.stash![i]=generateItem(82000+i,1,'ring');
  sheet.inventory[0]=generateItem(83000,1,'boots'); const before=structuredClone(sheet);
  assert.equal(planService(sheet,npc,1,quote(sheet,{type:'store',bag:0,tab:0})).ok,false);
  assert.deepEqual(sheet,before);
  assert.equal(planService(sheet,npc,1,quote(sheet,{type:'store',bag:0,tab:1})).ok,true);
});

test('purchasing waits for durable storage and preserves gold and tabs after failure',async()=>{
  const player=new Simulation(world,{spawn:false}).player; player.character=wealthy(); player.hp=7; player.mana=3;
  const offer=quote(player.character,{type:'unlockStorage',tab:1}),before=structuredClone(player.character);
  assert.equal((await executeService(player,npc,world,offer,()=>({ok:false,message:'Disk full'}))).ok,false);
  assert.deepEqual(player.character,before);
  let finish!:(value:{ok:boolean})=>void;
  const pending=executeService(player,npc,world,offer,()=>new Promise(resolve=>{finish=resolve;}));
  assert.deepEqual(player.character,before); finish({ok:true}); assert.equal((await pending).ok,true);
  assert.equal(storageTabCount(player.character),2); assert.equal(player.character.gold,before.gold!-10_000);
  assert.equal(player.hp,7); assert.equal(player.mana,3);
  let persisted=false;
  assert.equal((await executeService(player,npc,world,offer,()=>{persisted=true;return{ok:true};})).ok,false);
  assert.equal(persisted,false);
});

test('save validation accepts old chests and rejects malformed capacities or duplicate ownership across tabs',()=>{
  assert.ok(save(wealthy()));
  const sheet=wealthy();sheet.stash=Array(96).fill(null); assert.ok(save(sheet));
  for(const length of [0,95,97,481,576])assert.equal(save({...sheet,stash:Array(length).fill(null)}),null);
  const item=generateItem(84001,1,'ring');sheet.stash=Array(192).fill(null);sheet.stash[0]=item;sheet.stash[96]=item;
  assert.equal(save(sheet),null);
});


test('all five full tabs round trip through the shared save validator',()=>{
  const sheet=wealthy();
  sheet.stash=Array.from({length:5*STASH_CAPACITY},(_,i)=>generateItem(90000+i,40,'charm','astral-monolith','legendary'));
  const decoded=save(sheet);assert.ok(decoded);
  assert.equal(decoded.checkpoint.character.stash!.filter(Boolean).length,480);
  assert.equal(storageTabCount(decoded.checkpoint.character),5);
});

test('bulk storing fills one tab forward, keeps locked items and refuses a selection that would not fit',()=>{
  const sheet=wealthy(); sheet.stash=Array(STASH_CAPACITY).fill(null);
  sheet.stash[0]=generateItem(81000,1,'ring'); sheet.stash[3]=generateItem(81001,1,'boots');
  sheet.inventory=Array(sheet.inventory.length).fill(null);
  for(let i=0;i<4;i++)sheet.inventory[i*2]=generateItem(81100+i,1,'weapon');
  sheet.inventory[0]!.locked=true;
  const items=sheet.inventory.flatMap((item,bag)=>item?[{bag,id:item.id,revision:item.recipe.revision}]:[]);
  const ids=items.map(i=>i.id), stored=apply(sheet,{type:'storeMany',items,tab:0,includeActiveCharms:true});
  // Placement walks past slots the same batch just filled instead of re-finding slot 1 four times.
  assert.deepEqual([1,2,4,5].map(slot=>stored.stash![slot]?.id),ids);
  assert.equal(stored.stash![0]?.id,sheet.stash[0]!.id); assert.equal(stored.stash![3]?.id,sheet.stash[3]!.id);
  assert.ok(stored.stash![1]!.locked,'a lock guards against selling, never against storing');
  assert.ok(stored.inventory.every(item=>!ids.includes(item?.id??'')));
  assert.equal(stored.commerce.revision,sheet.commerce.revision+1);

  const full=wealthy(); full.stash=Array(STASH_CAPACITY).fill(null);
  for(let slot=0;slot<STASH_CAPACITY-2;slot++)full.stash[slot]=generateItem(82000+slot,1,'ring');
  full.inventory=[...sheet.inventory];
  const offer=quoteService(full,npc,1,{type:'storeMany',items,tab:0,includeActiveCharms:true});
  assert.equal(offer.ok,false); assert.match(offer.ok?'':offer.message,/Only 2 slots/);
  assert.ok(quote(full,{type:'storeMany',items:items.slice(0,2),tab:0,includeActiveCharms:true}));
});

test('bulk storage quotes reject a locked tab, duplicates and a selection that changed',()=>{
  const sheet=wealthy(); sheet.inventory=Array(sheet.inventory.length).fill(null);
  sheet.inventory[0]=generateItem(83000,1,'weapon'); sheet.inventory[1]=generateItem(83001,1,'ring');
  const first={bag:0,id:sheet.inventory[0]!.id,revision:sheet.inventory[0]!.recipe.revision};
  const second={bag:1,id:sheet.inventory[1]!.id,revision:sheet.inventory[1]!.recipe.revision};
  for(const request of [{items:[],tab:0},{items:[first,first],tab:0},{items:[{...first,bag:2}],tab:0},
    {items:[{...first,revision:99}],tab:0},{items:[first],tab:1}]) {
    assert.equal(quoteService(sheet,npc,1,{type:'storeMany',...request} as ServiceRequest).ok,false);
  }
  const offer=quote(sheet,{type:'storeMany',items:[{...first},{...second}],tab:0});
  sheet.inventory[1]=generateItem(83002,1,'ring');
  assert.equal(planService(sheet,npc,1,offer).ok,false,'one replaced item rejects the whole batch');
});
