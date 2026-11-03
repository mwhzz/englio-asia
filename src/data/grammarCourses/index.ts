import { PARTS_OF_SPEECH } from './partsOfSpeech.ts';
import type { CourseLesson, GrammarCourse } from './types.ts';

/** The built-in courses (the server's copy replaces them once loaded, like the course). */
export const BUNDLED_COURSES: Record<string, GrammarCourse> = {
  [PARTS_OF_SPEECH.topicId]: PARTS_OF_SPEECH,
};

/** Step-by-step courses, by grammar topic id. Topics without one show only their topic page. */
export let COURSES: Record<string, GrammarCourse> = BUNDLED_COURSES;

export function setCourses(courses: Record<string, GrammarCourse>): void {
  COURSES = courses;
}

export const lessonsOf = (course: GrammarCourse): CourseLesson[] => course.units.flatMap((u) => u.lessons);
