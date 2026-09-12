import type { ActionResult, CharacterSheet, Item } from './character-types.ts';
import { activeCharms } from './inventory-grid.ts';

export function setItemLock(sheet: CharacterSheet, id: string, locked: boolean): ActionResult {
  if(typeof id!=='string'||typeof locked!=='boolean')return {ok:false,message:'Invalid item lock.'};
  const index=sheet.inventory.findIndex(i=>i?.id===id);
  if(index>=0){sheet.inventory[index]={...sheet.inventory[index]!,locked};return {ok:true};}
  for(const [slot,item] of Object.entries(sheet.equipped))if(item?.id===id){
    sheet.equipped[slot as keyof typeof sheet.equipped]={...item,locked};return {ok:true};
  }
  return {ok:false,message:'That item has changed.'};
}
/** Items a bulk action may touch. Active charms are excluded without explicit consent because
 *  sweeping them away mid-fight is never what the player meant. Locks guard against selling, not
 *  against storing, so the chest opts back into them. */
export function bulkItems(sheet: CharacterSheet, level: number, options: { includeActiveCharms?: boolean; includeLocked?: boolean } = {}): Item[] {
  const active=new Set(options.includeActiveCharms?[]:activeCharms(sheet,level).map(i=>i.id));
  return sheet.inventory.filter((item):item is Item=>!!item&&(options.includeLocked||!item.locked)&&!active.has(item.id));
}
export const bulkSaleItems = (sheet: CharacterSheet, level: number, includeActiveCharms=false): Item[] =>
  bulkItems(sheet,level,{includeActiveCharms});
export const bulkStorableItems = (sheet: CharacterSheet, level: number, includeActiveCharms=false): Item[] =>
  bulkItems(sheet,level,{includeActiveCharms,includeLocked:true});
export const ITEM_LOCK_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5zM12 14v3"/></svg>';
