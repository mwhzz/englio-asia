import { useCallback, useEffect, useState } from 'react';
import { Glyph } from '../components/Glyph';
import { Logo } from '../components/Logo';
import { navFor, type Role } from './adminNav';
import { AdminTabBar } from './AdminTabBar';
import { ActivityPage } from './ActivityPage';
import { BoardAdmin } from './BoardAdmin';
import { BoardEditor } from './BoardEditor';
import { ErrorsPage } from './ErrorsPage';
import { ReportsPage } from './ReportsPage';
import { SettingsPage } from './SettingsPage';
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
import { LanguagesPage } from './LanguagesPage';
import { WordsPage } from './WordsPage';
import { AudioPage } from './AudioPage';
import { WritingAdmin } from './WritingAdmin';
import { HistoryPage } from './HistoryPage';
import { UiTextPage } from './UiTextPage';
import { WritingEditor } from './WritingEditor';

/** The admin panel: sign in with the token, then dashboard, lessons, grammar, stories and learners. */
export function AdminApp() {
  const [signedIn, setSignedIn] = useState(() => !!getToken());
  const [page = 'dashboard', id = ''] = useHashRoute();
  const [me, setMe] = useState<{ name: string; role: Role } | null>(null);
  const signOut = useCallback(() => {
    // Ends the session on the server too (a stolen copy of it stops working).
    adminApi('POST', '/logout').catch(() => undefined);
    clearToken();
    setSignedIn(false);
    setMe(null);
  }, []);

  useEffect(() => {
    if (signedIn) adminApi<{ name: string; role: Role }>('GET', '/me').then(setMe, signOut);
  }, [signedIn, signOut]);

  if (!signedIn) return <Login onDone={() => setSignedIn(true)} />;

  const section = page === 'lesson' ? 'content' : page === 'user' ? 'users' : page === 'topic' || page === 'course' ? 'grammar' : page === 'story' ? 'stories' : page === 'board-topic' ? 'board' : page === 'writing-task' ? 'writing' : page;
  return (
    <div className="ad-shell">
      <nav className="ad-nav">
        <span className="ad-brand">
          <Logo size={30} /> <small>Admin</small>
        </span>
        {navFor(me?.role ?? 'editor').map(({ group, items }) => (
          <div key={group ?? 'top'} className="ad-nav-section" lang="bn">
            {group && <div className="ad-nav-group">{group}</div>}
            {items.map((i) => (
              <button key={i.page} className={`ad-nav-item${section === i.page ? ' is-on' : ''}`} onClick={() => go(i.page)}>
                <Glyph name={i.icon} size={19} filled={section === i.page && ['path', 'chat', 'letters', 'person'].includes(i.icon)} />
                {i.label}
              </button>
            ))}
          </div>
        ))}
        <span className="ad-nav-gap" />
        {me && (
          <span className="ad-nav-me">
            {me.name} · {me.role}
          </span>
        )}
        <a className="ad-nav-item" href="./" target="_blank" rel="noreferrer" lang="bn">
          <Glyph name="play" size={19} />
          অ্যাপ খোলো ↗
        </a>
        <button className="ad-nav-item" onClick={signOut} lang="bn">
          <Glyph name="back" size={19} />
          সাইন আউট
        </button>
      </nav>
      <AdminTabBar section={section} role={me?.role ?? 'editor'} onSignOut={signOut} />
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
        ) : page === 'ui-text' ? (
          <UiTextPage onUnauthorized={signOut} />
        ) : page === 'history' ? (
          <HistoryPage onUnauthorized={signOut} />
        ) : page === 'writing' ? (
          <WritingAdmin onUnauthorized={signOut} />
        ) : page === 'writing-task' ? (
          <WritingEditor key={id} id={id} onUnauthorized={signOut} />
        ) : page === 'reports' ? (
          <ReportsPage onUnauthorized={signOut} people={me?.role !== 'editor'} />
        ) : page === 'errors' ? (
          <ErrorsPage onUnauthorized={signOut} />
        ) : page === 'words' ? (
          <WordsPage onUnauthorized={signOut} />
        ) : page === 'audio' ? (
          <AudioPage onUnauthorized={signOut} />
        ) : page === 'languages' ? (
          <LanguagesPage owner={me?.role === 'owner'} />
        ) : page === 'settings' ? (
          <SettingsPage onUnauthorized={signOut} />
        ) : page === 'team' ? (
          <TeamPage onUnauthorized={signOut} />
        ) : page === 'activity' ? (
          <ActivityPage onUnauthorized={signOut} />
        ) : page === 'users' ? (
          <UsersPage onUnauthorized={signOut} />
        ) : page === 'user' ? (
          <UserPage key={id} id={id} onUnauthorized={signOut} />
        ) : (
          <Dashboard onUnauthorized={signOut} owner={me?.role !== 'editor'} />
        )}
      </main>
    </div>
  );
}
