import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setCourse } from './data/course';
import { setGrammar } from './data/grammar';
import { setCourses } from './data/grammarCourses';
import { setStories } from './data/stories';
import { loadCourse } from './lib/courseSource';
import './lib/install';
import { ProgressProvider } from './state/ProgressContext';
import './styles/index.css';

// Lessons, grammar and stories come from the server (or the copy saved last time); the built-in content is the fallback.
// The app is imported only after that, since some screens read the course when they load.
async function start() {
  const content = await loadCourse();
  if (content) setCourse(content.units);
  if (content?.grammar?.length) setGrammar(content.grammar);
  if (content?.courses) setCourses(content.courses);
  if (content?.stories) setStories(content.stories);
  const { default: App } = await import('./App');
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </StrictMode>,
  );
}

start();

// Offline support in production builds only (a dev service worker would cache stale code).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
