import { DB_PATH, openDb } from './db.ts';
import { seedCourse, seedCourses, seedGrammar, seedStories, seedUsers } from './seed.ts';

// `npm run seed`: fills the database with the built-in course, grammar topics and courses, stories and 30 demo learners.
// Content is replaced; real learners are kept (only the demo-* ones are recreated).
const db = openDb();
seedCourse(db);
seedGrammar(db);
seedCourses(db);
seedStories(db);
db.prepare(`DELETE FROM users WHERE id LIKE 'demo-%'`).run();
seedUsers(db);

const count = (table: string) => (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
console.log(`Seeded ${DB_PATH}: ${count('units')} units, ${count('lessons')} lessons, ${count('items')} items, ${count('grammar')} grammar topics, ${count('grammar_courses')} grammar courses, ${count('stories')} stories, ${count('users')} users.`);
