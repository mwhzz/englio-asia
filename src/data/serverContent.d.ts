import type { GrammarCourse } from './grammarCourses/types';
import type { GrammarTopic, Story } from '../types';

declare global {
  /**
   * Content the server sent at startup (set in main.tsx). It's a global rather than a module so the big
   * built-in grammar, courses and stories aren't bundled into startup just to be replaced: each data
   * module reads its part when it first loads (with the grammar page, the stories card, …).
   */
  var englioServerContent: { grammar?: GrammarTopic[]; courses?: Record<string, GrammarCourse>; stories?: Story[] } | undefined;
}
