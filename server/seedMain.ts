import { DB_PATH, openDb } from './db.ts';
import { seedBoard, seedCourse, seedCourses, seedGrammar, seedStories, seedUsers, seedWriting } from './seed.ts';

// `npm run seed`: fills the database with the built-in course, grammar topics and courses, stories, board topics, writing tasks and 30 demo learners.
// Content is replaced; real learners are kept (only the demo-* ones are recreated).
// `--no-demo` (used on the real server) skips the demo learners, so they don't show up in the league.
const demo = !process.argv.includes('--no-demo');
const db = openDb();
seedCourse(db);
seedGrammar(db);
seedCourses(db);
seedStories(db);
seedBoard(db);
seedWriting(db);
db.prepare(`DELETE FROM users WHERE id LIKE 'demo-%'`).run();
if (demo) seedUsers(db);

const count = (table: string) => (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
console.log(`Seeded ${DB_PATH}: ${count('units')} units, ${count('lessons')} lessons, ${count('items')} items, ${count('grammar')} grammar topics, ${count('grammar_courses')} grammar courses, ${count('stories')} stories, ${count('board_topics')} board topics, ${count('writing_tasks')} writing tasks, ${count('users')} users.`);
