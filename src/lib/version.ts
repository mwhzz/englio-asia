// The app's version from package.json, put in at build time by vite.config.ts (see `npm run release`).
declare const __APP_VERSION__: string | undefined;

export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : 'dev';
