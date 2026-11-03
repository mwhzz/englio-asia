import { useCallback, useState } from 'react';
import { Logo } from '../components/Logo';
import { clearToken, getToken } from './adminApi';
import { ContentPage } from './ContentPage';
import { CourseEditor } from './CourseEditor';
import { Dashboard } from './Dashboard';
import { GrammarAdmin } from './GrammarAdmin';
import { LessonPage } from './LessonPage';
import { Login } from './Login';
import { StoriesAdmin } from './StoriesAdmin';
import { StoryEditor } from './StoryEditor';
import { TopicEditor } from './TopicEditor';
import { UserPage } from './UserPage';
import { UsersPage } from './UsersPage';
import { go, useHashRoute } from './useHashRoute';

const NAV = [
  ['dashboard', 'Dashboard'],
  ['content', 'Lessons'],
  ['grammar', 'Grammar'],
  ['stories', 'Stories'],
  ['users', 'Learners'],
] as const;

/** The admin panel: sign in with the token, then dashboard, lessons, grammar, stories and learners. */
export function AdminApp() {
  const [signedIn, setSignedIn] = useState(() => !!getToken());
  const [page = 'dashboard', id = ''] = useHashRoute();
  const signOut = useCallback(() => {
    clearToken();
    setSignedIn(false);
  }, []);

  if (!signedIn) return <Login onDone={() => setSignedIn(true)} />;

  const section = page === 'lesson' ? 'content' : page === 'user' ? 'users' : page === 'topic' || page === 'course' ? 'grammar' : page === 'story' ? 'stories' : page;
  return (
    <div className="ad-shell">
      <nav className="ad-nav">
        <span className="ad-brand">
          <Logo size={30} /> <small>Admin</small>
        </span>
        {NAV.map(([key, label]) => (
          <button key={key} className={`ad-nav-item${section === key ? ' is-on' : ''}`} onClick={() => go(key)}>
            {label}
          </button>
        ))}
        <span className="ad-nav-gap" />
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
