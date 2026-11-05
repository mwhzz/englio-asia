import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setCourse } from './data/course';
import { loadCourse } from './lib/courseSource';
import { registerRecordings } from './lib/media';
import { isPreview } from './preview/draft';
import { ErrorBoundary } from './components/ErrorBoundary';
import { watchErrors } from './lib/reportError';
import './lib/install';
import { ProgressProvider } from './state/ProgressContext';
import './styles/index.css';
import { setAppSettings } from './lib/appSettings';

// Lessons, grammar and stories come from the server (or the copy saved last time); the built-in content is the fallback.
// The app is imported only after that, since some screens read the course when they load.
async function start() {
  watchErrors();
  const content = await loadCourse();
  if (content) {
    setCourse(content.units);
    registerRecordings(content.units);
  }
  setAppSettings(content?.settings);
  // Read later by the grammar, course and story modules (see data/serverContent.d.ts).
  globalThis.englioServerContent = {
    grammar: content?.grammar?.length ? content.grammar : undefined,
    courses: content?.courses,
    stories: content?.stories,
    board: content?.board?.length ? content.board : undefined,
    writing: content?.writing,
  };
  // The admin's preview tab shows a draft with the app's screens, on throwaway progress (see preview/).
  const preview = isPreview();
  const { default: App } = preview ? await import('./preview/PreviewApp') : await import('./App');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary where="app">
        <ProgressProvider memoryOnly={preview}>
          <App />
        </ProgressProvider>
      </ErrorBoundary>
    </StrictMode>,
  );
}

start();

// Offline support in production builds only (a dev service worker would cache stale code).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
