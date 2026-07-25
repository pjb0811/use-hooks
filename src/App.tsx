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
import { GitHubLogoIcon, MoonIcon, SunIcon } from '@radix-ui/react-icons';

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
                <MoonIcon width={16} height={16} />
              ) : (
                <SunIcon width={16} height={16} />
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
            <GitHubLogoIcon width={16} height={16} />
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
