import { APP_VERSION } from './version';

/** Headers for the app's JSON requests: the server keeps the app version next to the learner and their reports. */
export const appHeaders = (): Record<string, string> => ({ 'content-type': 'application/json', 'x-app-version': APP_VERSION });
