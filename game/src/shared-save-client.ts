import { CharacterRepository, type CharacterRepositoryPort, type SaveSlot, type SaveResult } from './character-storage.ts';
import { parseChronicleLedger, recordChronicle, forkChronicle, type ChronicleLedger } from './chronicle.ts';
import { decodeSaveBundle, makeSaveBundle, bundleChart, chartKey } from './save-bundle.ts';
import type { CharacterSave } from './character-save.ts';
import type { SaveClient } from './save-client.ts';
import { randomId } from './random-id.ts';

const ENDPOINT = '/__shared-saves';
const BUSY = 'Another browser is saving this character. Return to the character hall and reload it.';
const CHANGED = 'This character changed in another tab. Return to the character hall and reload it before saving.';

/** Character records held by the dev server so every browser on the LAN plays the same characters.
 *  The whole store is read, mutated by the same validator the local worker uses, and written back
 *  under a compare-and-swap on its version, so two browsers can never lose each other's slot.
 *  ponytail: explored maps stay in each browser's IndexedDB, so fog and world-version chart
 *  upgrades remain per machine. Move charts into the store if that starts to matter. */
export class SharedSaveClient implements CharacterRepositoryPort {
  private charts: SaveClient;
  constructor(charts: SaveClient) { this.charts = charts; }

  private async load(): Promise<{ version: number; values: Map<string, string> }> {
    const response = await fetch(ENDPOINT, { cache: 'no-store' });
    if (!response.ok) throw new Error('Shared saves are unavailable.');
    const store = await response.json();
    return { version: store.version, values: new Map(Object.entries(store.values as Record<string, string>)) };
  }

  /** False when another browser wrote first; the caller reloads the store and retries. */
  private async store(version: number, values: Map<string, string>): Promise<boolean> {
    const response = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version, values: Object.fromEntries(values) }) });
    if (response.status === 409) return false;
    if (!response.ok) throw new Error('Shared saves are unavailable.');
    return true;
  }

  private repository(values: Map<string, string>) {
    return new CharacterRepository({ getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); } });
  }

  // The game compares a tiny revision counter, never the serialized character.
  private slot(values: Map<string, string>, slot: SaveSlot): SaveSlot {
    return { ...slot, token: values.get(`revision:${slot.index}`) ?? null };
  }

  async chronicle(): Promise<ChronicleLedger> {
    const { values } = await this.load();
    let ledger = parseChronicleLedger(values.get('chronicle'));
    for (const slot of this.repository(values).list()) if (slot.record) ledger = recordChronicle(ledger, slot.record);
    return ledger;
  }

  async read(index: number): Promise<SaveSlot> {
    try { const { values } = await this.load(); return this.slot(values, this.repository(values).read(index)); }
    catch { return { index, record: null, token: null, state: 'unavailable' }; }
  }

  async list(): Promise<SaveSlot[]> {
    try { const { values } = await this.load(); return this.repository(values).list().map(slot => this.slot(values, slot)); }
    catch { return Array.from({ length: 8 }, (_, index) => ({ index, state: 'unavailable' as const, record: null, token: null })); }
  }

  write(index: number, record: CharacterSave, expected: string | null) { return this.apply(index, expected, record, false); }
  remove(index: number, expected: string | null) { return this.apply(index, expected, null, false); }

  private async apply(index: number, expected: string | null, record: CharacterSave | null, importing: boolean): Promise<SaveResult> {
    for (let attempt = 0; attempt < 3; attempt++) {
      let version: number, values: Map<string, string>;
      try { ({ version, values } = await this.load()); }
      catch (error) { return { ok: false, message: (error as Error).message }; }
      const repository = this.repository(values), current = values.get(`revision:${index}`) ?? null;
      if (importing && repository.read(index).state !== 'empty') return { ok: false, message: 'Choose an empty slot.' };
      if ((expected ?? null) !== current) return { ok: false, message: CHANGED };
      const slot = repository.read(index);
      const saved = record ? repository.write(index, record, slot.token) : repository.remove(index, slot.token);
      if (!saved.ok) return saved;
      let ledger = parseChronicleLedger(values.get('chronicle'));
      if (slot.record) ledger = recordChronicle(ledger, slot.record, !record);
      if (record) ledger = recordChronicle(ledger, record);
      values.set('chronicle', JSON.stringify(ledger));
      const token = String(Number(current ?? 0) + 1);
      values.set(`revision:${index}`, token);
      try { if (await this.store(version, values)) return { ok: true, token }; }
      catch (error) { return { ok: false, message: (error as Error).message }; }
    }
    return { ok: false, message: BUSY };
  }

  async export(index: number): Promise<string> {
    const { values } = await this.load();
    const record = this.repository(values).read(index).record;
    if (!record) throw new Error('Select a character first.');
    const chart = await this.charts.readChart(chartKey(record), record.worldSeed, String(record.worldVersion));
    return JSON.stringify(makeSaveBundle(record, chart.data));
  }

  async import(index: number, raw: string): Promise<SaveResult> {
    const bundle = decodeSaveBundle(raw);
    if (!bundle) return { ok: false, message: 'Invalid or incompatible save file.' };
    const id = randomId();
    const record = { ...bundle.character, id, updatedAt: Date.now(),
      checkpoint: { ...bundle.character.checkpoint, chronicle: forkChronicle(bundle.character, id) } };
    const slot = await this.read(index);
    const result = await this.apply(index, slot.token, record, true);
    if (result.ok) await this.charts.writeChart(chartKey(record), record.worldSeed, String(record.worldVersion), bundleChart(bundle));
    return result;
  }
}
