import { readFile, writeFile } from 'node:fs/promises';
import type { Plugin } from 'vite';

/** Dev-only shared character store so every browser on the LAN plays the same characters off one
 *  dev server. Never built into the game: `apply: 'serve'` keeps it out of production bundles. */
const STORE = new URL('../../.evergrow-shared-saves.json', import.meta.url);
const LIMIT = 8 * 1024 * 1024;

type Store = { version: number; values: Record<string, string> };

async function load(): Promise<Store> {
  try {
    const store = JSON.parse(await readFile(STORE, 'utf8'));
    if (typeof store?.version === 'number' && store.values && typeof store.values === 'object') return store;
  } catch { /* A missing or corrupt store starts empty; the browser still holds its own copy. */ }
  return { version: 0, values: {} };
}

export function sharedSaves(): Plugin {
  // One writer at a time: the file is the whole store, so overlapping writes would lose a slot.
  let queue = Promise.resolve();
  const serial = <T>(work: () => Promise<T>): Promise<T> => {
    const result = queue.then(work);
    queue = result.then(() => {}, () => {});
    return result;
  };
  return { name: 'evergrow-shared-saves', apply: 'serve', configureServer(server) {
    server.middlewares.use('/__shared-saves', (request, response) => {
      const send = (status: number, body: unknown) => {
        response.statusCode = status; response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(body));
      };
      if (request.method === 'GET') { void serial(load).then(store => send(200, store)); return; }
      if (request.method !== 'POST') { send(405, { error: 'Unsupported.' }); return; }
      const chunks: Buffer[] = []; let length = 0;
      request.on('data', (chunk: Buffer) => { length += chunk.length; if (length <= LIMIT) chunks.push(chunk); });
      request.on('end', () => {
        if (length > LIMIT) { send(413, { error: 'Shared save store is full.' }); return; }
        void serial(async () => {
          const current = await load();
          let next: Store;
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
            if (body?.version !== current.version) { send(409, current); return; }
            next = { version: current.version + 1, values: {} };
            for (const [key, value] of Object.entries(body.values as Record<string, unknown>)) {
              if (typeof value !== 'string') { send(400, { error: 'Shared saves take strings only.' }); return; }
              next.values[key] = value;
            }
          } catch { send(400, { error: 'Malformed shared save write.' }); return; }
          try { await writeFile(STORE, JSON.stringify(next)); send(200, { version: next.version }); }
          catch { send(500, { error: 'Shared saves could not be written.' }); }
        });
      });
    });
  } };
}
