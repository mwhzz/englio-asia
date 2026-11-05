import { readFileSync } from 'node:fs';

/** The running code's version (package.json), read once at start; /api/health reports it so a deploy can be checked. */
export const SERVER_VERSION: string = (JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string }).version;
