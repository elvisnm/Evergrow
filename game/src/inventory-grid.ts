import type { CharacterSheet, Item } from './character-types.ts';

export const PACK_COLUMNS = 8;
export const PACK_ROWS = 3;
export const PACK_CELLS = PACK_COLUMNS * PACK_ROWS;
export const CHARM_ROWS = 3;
export const INVENTORY_CELLS = PACK_CELLS + PACK_COLUMNS * CHARM_ROWS;
export interface ItemFootprint { width: number; height: number; }
export type PackLayout = Record<string, number>;

const UNIFORM_FOOTPRINT: ItemFootprint = Object.freeze({ width: 1, height: 1 });

/** Physical size is uniform: every carried item occupies exactly one cell. Size *class*
 * (charm sizes, weapon handedness) lives in content data and still drives balance. */
export function itemFootprint(_item: Item): ItemFootprint { return UNIFORM_FOOTPRINT; }

/** Storage presentation grows vertically to preserve its item-count capacity.
 * A stored item's cell is its saved slot index, so retrieval stays position-stable. */
export function storageGridLayout(items: readonly (Item | null)[]): { cells: Array<number | null>; rows: number } {
  return { cells: items.map((item, slot) => item ? slot : null), rows: Math.max(8, Math.ceil(items.length / PACK_COLUMNS)) };
}

export function footprintCells(item: Item, cell: number): number[] | null {
  if (!Number.isInteger(cell) || cell < 0 || cell >= INVENTORY_CELLS
    || (cell >= PACK_CELLS) !== (item.kind === 'charm')) return null;
  return [cell];
}
export function packOccupancy(inventory: CharacterSheet['inventory'], layout: PackLayout): Set<number> {
  return new Set(inventory.flatMap(item => item && layout[item.id] !== undefined ? footprintCells(item, layout[item.id]) ?? [] : []));
}
export function findPackSpace(item: Item, occupied: ReadonlySet<number>, preferred?: number): number | null {
  const charms = item.kind === 'charm';
  if (preferred !== undefined && footprintCells(item, preferred) && !occupied.has(preferred)) return preferred;
  for (let cell = charms ? PACK_CELLS : 0; cell < (charms ? INVENTORY_CELLS : PACK_CELLS); cell++) if (!occupied.has(cell)) return cell;
  return null;
}

/** Keep placed items fixed; older unpositioned items pack deterministically. Unfitted items remain owned in overflow. */
export function resolvePackLayout(sheet: Pick<CharacterSheet, 'inventory' | 'inventoryLayout'>): PackLayout {
  const result: PackLayout = {}, occupied = new Set<number>();
  for (const item of sheet.inventory) if (item && sheet.inventoryLayout?.[item.id] !== undefined) {
    const cell = sheet.inventoryLayout[item.id];
    if (footprintCells(item, cell) && !occupied.has(cell)) { result[item.id] = cell; occupied.add(cell); }
  }
  for (const item of sheet.inventory) if (item && result[item.id] === undefined) {
    const cell = findPackSpace(item, occupied);
    if (cell !== null) { result[item.id] = cell; occupied.add(cell); }
  }
  return result;
}
export function normalizePackLayout(sheet: CharacterSheet): void { sheet.inventoryLayout = resolvePackLayout(sheet); }
export function validPackLayout(inventory: CharacterSheet['inventory'], value: unknown): boolean {
  if (value === undefined) return true;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const items = new Map(inventory.filter((item): item is Item => !!item).map(item => [item.id, item]));
  const occupied = new Set<number>();
  for (const [id, cell] of Object.entries(value)) {
    const item = items.get(id);
    if (!item || typeof cell !== 'number' || !footprintCells(item, cell) || occupied.has(cell)) return false;
    occupied.add(cell);
  }
  return true;
}

export function canPackItem(sheet: Pick<CharacterSheet, 'inventory' | 'inventoryLayout'>, item: Item): boolean {
  if (!sheet.inventory.includes(null) && sheet.inventory.length >= INVENTORY_CELLS) return false;
  const layout = resolvePackLayout(sheet);
  return !sheet.inventory.some(owned => owned && (owned.kind === 'charm') === (item.kind === 'charm') && layout[owned.id] === undefined)
    && findPackSpace(item, packOccupancy(sheet.inventory, layout)) !== null;
}

/** Level-eligible stones in the dedicated charm grid grant bonuses; overflow and stash do not. */
export function activeCharms(sheet: Pick<CharacterSheet,'inventory'|'inventoryLayout'>, level = Infinity): Item[] {
  const layout=resolvePackLayout(sheet);
  return sheet.inventory.filter((item):item is Item=>!!item && item.kind==='charm' && item.requiredLevel<=level && layout[item.id]>=PACK_CELLS);
}

/** One cell per item: a placement can only fail because its region has no free cell. */
export function packSpaceProblem(_sheet: Pick<CharacterSheet,'inventory'|'inventoryLayout'>,item:Item): string {
  return `${item.kind === 'charm' ? 'Charm grid' : 'Bag'} full. Make room for this item.`;
}
