import { BUNDLED_WRITING } from './tasks.ts';
import type { WritingTask } from './types.ts';

/** The tasks the app shows: the server's copy (set at startup, see data/serverContent.d.ts), else the built-in ones. */
export const WRITING: WritingTask[] = globalThis.englioServerContent?.writing ?? BUNDLED_WRITING;
