import { useEffect, useState } from 'react';
import { CoursePage } from '../features/grammar/course/CoursePage';
import { TopicPage } from '../features/grammar/TopicPage';
import { LessonRunner } from '../features/lesson/LessonRunner';
import { StoryReader } from '../features/stories/StoryReader';
import { DRAFT_KEY, readDraft, type Draft } from './draft';

const noop = () => undefined;

/** One draft from the admin, shown with the app's own screens. Nothing is saved or sent from here. */
function Screen({ draft }: { draft: Draft }) {
  switch (draft.kind) {
    case 'story':
      return <StoryReader story={draft.story} onClose={noop} />;
    case 'topic':
      return <TopicPage topic={draft.topic} learned={false} saved={false} onLearned={noop} onSaved={noop} onGo={noop} onClose={noop} />;
    case 'course':
      return <CoursePage topic={draft.topic} course={draft.course} onClose={noop} />;
    case 'lesson':
      return <LessonRunner lessonId={draft.lessonId} onExit={noop} onPractice={noop} />;
  }
}

/** The preview tab: the latest draft, reloaded whenever the admin sends another. */
export default function PreviewApp() {
  const [draft, setDraft] = useState(readDraft);
  const [run, setRun] = useState(0);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== DRAFT_KEY) return;
      setDraft(readDraft());
      setRun((n) => n + 1);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <>
      <div className="pv-banner" lang="bn">
        প্রিভিউ · কিছুই সেভ হবে না
        <button className="pv-restart" onClick={() => setRun((n) => n + 1)}>
          আবার শুরু
        </button>
      </div>
      {draft ? <Screen key={run} draft={draft} /> : <p className="pv-empty">Nothing to preview. Open a preview from the admin panel.</p>}
    </>
  );
}
