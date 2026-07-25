import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';

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

const Layout = () => {
  return (
    <div className="demo-app">
      <aside className="demo-nav">
        <h1>use-hooks</h1>
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
      </aside>
      <main className="demo-main">
        <Outlet />
      </main>
    </div>
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
