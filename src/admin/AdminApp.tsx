import { useCallback, useEffect, useState } from 'react';
import { Logo } from '../components/Logo';
import { ActivityPage } from './ActivityPage';
import { BoardAdmin } from './BoardAdmin';
import { BoardEditor } from './BoardEditor';
import { ErrorsPage } from './ErrorsPage';
import { ReportsPage } from './ReportsPage';
import { adminApi, clearToken, getToken } from './adminApi';
import { ContentPage } from './ContentPage';
import { CourseEditor } from './CourseEditor';
import { Dashboard } from './Dashboard';
import { GrammarAdmin } from './GrammarAdmin';
import { LessonPage } from './LessonPage';
import { Login } from './Login';
import { StoriesAdmin } from './StoriesAdmin';
import { StoryEditor } from './StoryEditor';
import { TeamPage } from './TeamPage';
import { TopicEditor } from './TopicEditor';
import { UserPage } from './UserPage';
import { UsersPage } from './UsersPage';
import { go, useHashRoute } from './useHashRoute';

/** The menu; the last three are for owners only (editors work on content). */
const NAV = [
  ['dashboard', 'Dashboard', false],
  ['content', 'Lessons', false],
  ['grammar', 'Grammar', false],
  ['stories', 'Stories', false],
  ['board', 'Board prep', false],
  ['reports', 'Reports', false],
  ['errors', 'Errors', false],
  ['users', 'Learners', true],
  ['team', 'Team', true],
  ['activity', 'Activity', true],
] as const;

/** The admin panel: sign in with the token, then dashboard, lessons, grammar, stories and learners. */
export function AdminApp() {
  const [signedIn, setSignedIn] = useState(() => !!getToken());
  const [page = 'dashboard', id = ''] = useHashRoute();
  const [me, setMe] = useState<{ name: string; role: 'owner' | 'editor' } | null>(null);
  const signOut = useCallback(() => {
    clearToken();
    setSignedIn(false);
    setMe(null);
  }, []);

  useEffect(() => {
    if (signedIn) adminApi<{ name: string; role: 'owner' | 'editor' }>('GET', '/me').then(setMe, signOut);
  }, [signedIn, signOut]);

  if (!signedIn) return <Login onDone={() => setSignedIn(true)} />;

  const section = page === 'lesson' ? 'content' : page === 'user' ? 'users' : page === 'topic' || page === 'course' ? 'grammar' : page === 'story' ? 'stories' : page === 'board-topic' ? 'board' : page;
  return (
    <div className="ad-shell">
      <nav className="ad-nav">
        <span className="ad-brand">
          <Logo size={30} /> <small>Admin</small>
        </span>
        {NAV.filter(([, , ownerOnly]) => !ownerOnly || me?.role === 'owner').map(([key, label]) => (
          <button key={key} className={`ad-nav-item${section === key ? ' is-on' : ''}`} onClick={() => go(key)}>
            {label}
          </button>
        ))}
        <span className="ad-nav-gap" />
        {me && (
          <span className="ad-nav-me">
            {me.name} · {me.role}
          </span>
        )}
        <a className="ad-nav-item" href="./" target="_blank" rel="noreferrer">
          Open app ↗
        </a>
        <button className="ad-nav-item" onClick={signOut}>
          Sign out
        </button>
      </nav>
      <main className="ad-main">
        {page === 'content' ? (
          <ContentPage onUnauthorized={signOut} />
        ) : page === 'lesson' ? (
          <LessonPage key={id} id={id} onUnauthorized={signOut} />
        ) : page === 'grammar' ? (
          <GrammarAdmin onUnauthorized={signOut} />
        ) : page === 'topic' ? (
          <TopicEditor key={id} id={id} onUnauthorized={signOut} />
        ) : page === 'course' ? (
          <CourseEditor key={id} topicId={id} onUnauthorized={signOut} />
        ) : page === 'stories' ? (
          <StoriesAdmin onUnauthorized={signOut} />
        ) : page === 'story' ? (
          <StoryEditor key={id} id={id} onUnauthorized={signOut} />
        ) : page === 'board' ? (
          <BoardAdmin onUnauthorized={signOut} />
        ) : page === 'board-topic' ? (
          <BoardEditor key={id} id={id} onUnauthorized={signOut} />
        ) : page === 'reports' ? (
          <ReportsPage onUnauthorized={signOut} />
        ) : page === 'errors' ? (
          <ErrorsPage onUnauthorized={signOut} />
        ) : page === 'team' ? (
          <TeamPage onUnauthorized={signOut} />
        ) : page === 'activity' ? (
          <ActivityPage onUnauthorized={signOut} />
        ) : page === 'users' ? (
          <UsersPage onUnauthorized={signOut} />
        ) : page === 'user' ? (
          <UserPage key={id} id={id} onUnauthorized={signOut} />
        ) : (
          <Dashboard onUnauthorized={signOut} />
        )}
      </main>
    </div>
  );
}
