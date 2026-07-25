import { useEffect } from 'react';
import {
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { Config } from '@jbpark/ui-kit';

import './App.css';

import BodyScrollLockDemo from './demo/use-body-scroll-lock-demo';
import ClickOutsideDemo from './demo/use-click-outside-demo';
import DebounceDemo from './demo/use-debounce-demo';
import ElementPositionDemo from './demo/use-element-position-demo';
import ElementScrollDemo from './demo/use-element-scroll-demo';
import ImageDemo from './demo/use-image-demo';
import LocalStorageDemo from './demo/use-local-storage-demo';
import RecursiveTimeoutDemo from './demo/use-recursive-timeout-demo';
import ResponsiveSizeDemo from './demo/use-responsive-size-demo';
import ScrollToElementsDemo from './demo/use-scroll-to-elements-demo';
import ThrottleDemo from './demo/use-throttle-demo';
import TimelineDemo from './demo/use-timeline-demo';
import ViewportDemo from './demo/use-viewport-demo';
import WindowScrollDemo from './demo/use-window-scroll-demo';
import { useLocalStorage } from './hooks';

const nav = [
  ['/use-debounce', 'useDebounce'],
  ['/use-body-scroll-lock', 'useBodyScrollLock'],
  ['/use-click-outside', 'useClickOutside'],
  ['/use-element-position', 'useElementPosition'],
  ['/use-element-scroll', 'useElementScroll'],
  ['/use-responsive-size', 'useResponsiveSize'],
  ['/use-image', 'useImage'],
  ['/use-local-storage', 'useLocalStorage'],
  ['/use-recursive-timeout', 'useRecursiveTimeout'],
  ['/use-scroll-to-elements', 'useScrollToElements'],
  ['/use-throttle', 'useThrottle'],
  ['/use-timeline', 'useTimeline'],
  ['/use-viewport', 'useViewport'],
  ['/use-window-scroll', 'useWindowScroll'],
] as const;

type Theme = 'light' | 'dark';

const Layout = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('use-hooks-theme', 'dark');
  const location = useLocation();

  useEffect(() => {
    const current = nav.find(([path]) => path === location.pathname);
    document.title = current
      ? `${current[1]} · use-hooks`
      : 'use-hooks – React Hooks Demo';
  }, [location.pathname]);

  return (
    <Config theme={{ dark: theme === 'dark' }}>
      <div className="demo-app">
        <aside className="demo-nav">
          <div className="demo-nav-header">
            <h1>use-hooks</h1>
            <button
              type="button"
              className="demo-theme-toggle"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
            >
              {theme === 'dark' ? (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              )}
            </button>
          </div>
          <p className="demo-nav-sub">Usage examples</p>
          <ul>
            {nav.map(([path, label]) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    isActive ? 'demo-nav-active' : undefined
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
          <a
            className="demo-nav-github"
            href="https://github.com/pjb0811/use-hooks"
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            GitHub
          </a>
        </aside>
        <main className="demo-main">
          <Outlet />
        </main>
      </div>
    </Config>
  );
};

const App = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/use-debounce" replace />} />
        <Route path="/use-debounce" element={<DebounceDemo />} />
        <Route path="/use-body-scroll-lock" element={<BodyScrollLockDemo />} />
        <Route path="/use-click-outside" element={<ClickOutsideDemo />} />
        <Route path="/use-element-position" element={<ElementPositionDemo />} />
        <Route path="/use-element-scroll" element={<ElementScrollDemo />} />
        <Route path="/use-responsive-size" element={<ResponsiveSizeDemo />} />
        <Route path="/use-image" element={<ImageDemo />} />
        <Route path="/use-local-storage" element={<LocalStorageDemo />} />
        <Route
          path="/use-recursive-timeout"
          element={<RecursiveTimeoutDemo />}
        />
        <Route
          path="/use-scroll-to-elements"
          element={<ScrollToElementsDemo />}
        />
        <Route path="/use-throttle" element={<ThrottleDemo />} />
        <Route path="/use-timeline" element={<TimelineDemo />} />
        <Route path="/use-viewport" element={<ViewportDemo />} />
        <Route path="/use-window-scroll" element={<WindowScrollDemo />} />
      </Route>
    </Routes>
  );
};

export default App;
