import { useEffect, useState } from 'react';
import type { GrammarCourse } from '../data/grammarCourses/types';
import { adminApi, Unauthorized } from './adminApi';
import { COURSE_HELP, courseToText, textToCourse } from './courseText';
import type { GrammarTopic } from '../types';
import { openPreview } from '../preview/draft';
import { go } from './useHashRoute';

const STARTER = `# First steps | প্রথম ধাপ

## {id}-01 | The idea | মূল কথা
- এখানে বাংলায় মূল কথাটা লেখো।
> An English example. | বাংলা মানে।
? কোনটা ঠিক? | She [is] happy. | is | are; am | she-এর সাথে is বসে।
`;

/** Write a topic's step-by-step course as one text document; the server checks it before saving. */
export function CourseEditor({ topicId, onUnauthorized }: { topicId: string; onUnauthorized: () => void }) {
  const [text, setText] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    adminApi<GrammarCourse>('GET', `/courses/${topicId}`)
      .then((c) => {
        setText(courseToText(c));
        setExists(true);
      })
      .catch((e: Error) => {
        if (e instanceof Unauthorized) onUnauthorized();
        else setText(STARTER.replaceAll('{id}', topicId.split('-')[0].slice(0, 8)));
      });
  }, [topicId, onUnauthorized]);

  if (text === null) return <p className="ad-muted">Loading…</p>;

  const fail = (err: unknown) => (err instanceof Unauthorized ? onUnauthorized() : setError((err as Error).message));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(null);
    try {
      const result = await adminApi<{ lessons: number }>('PUT', `/courses/${topicId}`, textToCourse(topicId, text!));
      setExists(true);
      setSaved(`Saved · ${result.lessons} lessons.`);
    } catch (err) {
      fail(err);
    }
  }

  async function preview() {
    setError(null);
    try {
      const course = textToCourse(topicId, text!);
      const topic = await adminApi<GrammarTopic>('GET', `/grammar/${topicId}`);
      openPreview({ kind: 'course', topic, course });
    } catch (err) {
      fail(err);
    }
  }

  async function remove() {
    if (!confirm('Delete this whole course? The topic page stays.')) return;
    try {
      await adminApi('DELETE', `/courses/${topicId}`);
      go('grammar');
    } catch (err) {
      fail(err);
    }
  }

  return (
    <div className="ad-page">
      <button className="ad-link" onClick={() => go('topic', topicId)}>
        ← Topic
      </button>
      <header className="ad-head">
        <h1>
          Course <span lang="bn">· কোর্স</span>
        </h1>
        <span className="ad-muted">{topicId}</span>
      </header>

      <form className="ad-card ad-form" onSubmit={save}>
        <div className="ad-field">
          <span>How to write it</span>
          <pre className="ad-help">{COURSE_HELP}</pre>
          <small>
            Questions are asked in the order written, then two from earlier lessons come back. Lesson ids can’t be reused: learners’
            progress remembers them. The parts-of-speech course also uses generated questions (focus:/kinds: lines).
          </small>
        </div>
        <label className="ad-field">
          <span>Course</span>
          <textarea
            className="ad-input ad-code"
            rows={28}
            lang="bn"
            spellCheck={false}
            value={text}
            onChange={(e) => {
              setSaved(null);
              setText(e.target.value);
            }}
          />
        </label>

        {error && <p className="ad-error">{error}</p>}
        <div className="ad-row">
          <button className="ad-btn is-primary">{exists ? 'Save' : 'Create course'}</button>
          <button type="button" className="ad-btn" onClick={preview}>
            Preview in app ↗
          </button>
          {exists && (
            <button type="button" className="ad-btn is-danger" onClick={remove}>
              Delete course
            </button>
          )}
          {saved && <span className="ad-muted">{saved}</span>}
        </div>
      </form>
    </div>
  );
}
