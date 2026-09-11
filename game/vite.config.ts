import { defineConfig } from 'vite';
import { captureExport } from './scripts/capture-export.ts';
import { sharedSaves } from './scripts/shared-saves.ts';
export default defineConfig({ plugins: [captureExport(), sharedSaves()], server: { host: '127.0.0.1', port: 5173, strictPort: true } });
