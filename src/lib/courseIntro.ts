// Each course is introduced once on a phone: the first-run onboarding does it for the first course, and
// switching to a course not started yet shows its short intro (features/courseIntro). Then, right after,
// its first lesson opens by itself (a request kept for this visit only).

const SEEN = 'englio-intro:';
const START = 'englio-start-lesson';

export function introSeen(course: string): boolean {
  try {
    return localStorage.getItem(SEEN + course) === '1';
  } catch {
    return true;
  }
}

export function markIntroSeen(course: string): void {
  try {
    localStorage.setItem(SEEN + course, '1');
  } catch {
    // Private mode: the intro may show again, nothing more.
  }
}

/** Ask Home to open the next lesson at once (after an onboarding or a course intro). */
export function requestFirstLesson(): void {
  try {
    sessionStorage.setItem(START, '1');
  } catch {
    // Without storage the learner just taps the lesson on Home.
  }
}

/** Whether a first lesson was asked for; asking again returns false (it's used once). */
export function takeFirstLessonRequest(): boolean {
  try {
    const asked = sessionStorage.getItem(START) === '1';
    sessionStorage.removeItem(START);
    return asked;
  } catch {
    return false;
  }
}
