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
import { learnerLang, setLiveLanguages, uiLang } from './lib/learnerLang';
import { setTarget, target } from './lib/target';
import { addTextSwap, wordSwap } from './lib/textSwap';
import { applyUiText, setUiText } from './lib/uiText';
import { detectAndroidApp } from './lib/playApp';
import { captureSource } from './lib/source';
import { AppGate } from './features/notice/AppGate';

// Lessons, grammar and stories come from the server (or the copy saved last time); the built-in content is the fallback.
// The app is imported only after that, since some screens read the course when they load.
async function start() {
  watchErrors();
  detectAndroidApp();
  captureSource();
  const content = await loadCourse();
  if (content) {
    setCourse(content.units);
    registerRecordings(content.units, content.audio);
  }
  setAppSettings(content?.settings);
  // Another learner language: the app's text swapped into it, right-to-left when it's written that way.
  const lang = learnerLang();
  const ui = uiLang();
  setLiveLanguages(content?.languages);
  // What the course teaches (English, or Arabic in a course like "bn-ar"): voice, answers, writing direction.
  setTarget(content?.lang === lang ? content?.target : 'en');
  if (target() !== 'en') {
    document.documentElement.dataset.target = target();
    // The app's Bangla says "English" where it means what's being learned.
    if (target() === 'ar') addTextSwap(wordSwap({ ইংরেজি: 'আরবি', ইংরেজিতে: 'আরবিতে', ইংরেজির: 'আরবির' }));
  }
  if (ui !== 'bn' && content?.lang === lang) {
    setUiText(content.ui ?? {});
    applyUiText(ui, content.languages?.find((l) => l.code === ui)?.dir ?? 'ltr');
  }
  try {
    if (localStorage.getItem('englio-ar-font') === 'naskh') document.documentElement.dataset.arFont = 'naskh';
  } catch {
    // Default font.
  }
  // Read later by the grammar, course and story modules (see data/serverContent.d.ts).
  // A course teaching another language has only its own grammar and stories, never the built-in English ones.
  const english = target() === 'en';
  globalThis.englioServerContent = {
    grammar: content?.grammar?.length || !english ? (content?.grammar ?? []) : undefined,
    courses: english ? content?.courses : (content?.courses ?? {}),
    stories: english ? content?.stories : (content?.stories ?? []),
    board: content?.board?.length || !english ? (content?.board ?? []) : undefined,
    writing: english ? content?.writing : (content?.writing ?? []),
  };
  // The admin's preview tab shows a draft with the app's screens, on throwaway progress (see preview/).
  const preview = isPreview();
  const { default: App } = preview ? await import('./preview/PreviewApp') : await import('./App');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary where="app">
        <ProgressProvider memoryOnly={preview}>
          {preview ? (
            <App />
          ) : (
            <AppGate>
              <App />
            </AppGate>
          )}
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
