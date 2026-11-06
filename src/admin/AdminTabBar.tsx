import { useState } from 'react';
import { Glyph } from '../components/Glyph';
import { Modal } from '../components/Modal';
import { navFor, TAB_PAGES, type Role } from './adminNav';
import { go } from './useHashRoute';

/**
 * On a phone, the admin moves around like the app: the same floating glass tab bar at the bottom with the
 * main pages, and "আরও" opening a sheet with every page, the app link and sign out.
 */
export function AdminTabBar({ section, role, onSignOut }: { section: string; role: Role; onSignOut: () => void }) {
  const [more, setMore] = useState(false);
  const groups = navFor(role);
  const tabs = groups.flatMap((g) => g.items).filter((i) => TAB_PAGES.includes(i.page));
  const inMore = !tabs.some((t) => t.page === section);
  const open = (page: string) => {
    setMore(false);
    go(page);
  };

  return (
    <>
      <nav className="tabbar ad-tabbar" aria-label="Admin">
        <div className="tabbar-glass">
          {tabs.map((t) => (
            <button key={t.page} className={`tabbar-item${section === t.page ? ' is-on' : ''}`} onClick={() => open(t.page)}>
              <Glyph name={t.icon} size={22} filled={section === t.page} />
              <span lang="bn">{t.label}</span>
            </button>
          ))}
          <button className={`tabbar-item${inMore ? ' is-on' : ''}`} onClick={() => setMore(true)}>
            <Glyph name="more" size={22} />
            <span lang="bn">আরও</span>
          </button>
        </div>
      </nav>

      {more && (
        <Modal onClose={() => setMore(false)}>
          <div className="ad-more" lang="bn">
            {groups.map((g) => (
              <div key={g.group ?? 'top'} className="ad-more-group">
                {g.group && <div className="ad-nav-group">{g.group}</div>}
                {g.items.map((i) => (
                  <button key={i.page} className={`ad-nav-item${section === i.page ? ' is-on' : ''}`} onClick={() => open(i.page)}>
                    <Glyph name={i.icon} size={20} />
                    {i.label}
                  </button>
                ))}
              </div>
            ))}
            <div className="ad-more-group">
              <a className="ad-nav-item" href="./" target="_blank" rel="noreferrer">
                <Glyph name="play" size={20} />
                অ্যাপ খোলো ↗
              </a>
              <button className="ad-nav-item" onClick={onSignOut}>
                <Glyph name="back" size={20} />
                সাইন আউট
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
