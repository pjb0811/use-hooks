import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import './App.css';

import BodyScrollLockDemo from './demo/BodyScrollLockDemo';
import DebounceDemo from './demo/DebounceDemo';
import ElementPositionDemo from './demo/ElementPositionDemo';
import ElementScrollDemo from './demo/ElementScrollDemo';
import ImageDemo from './demo/ImageDemo';
import LocalStorageDemo from './demo/LocalStorageDemo';
import RecursiveTimeoutDemo from './demo/RecursiveTimeoutDemo';
import ResponsiveSizeDemo from './demo/ResponsiveSizeDemo';
import ScrollToElementsDemo from './demo/ScrollToElementsDemo';
import ThrottleDemo from './demo/ThrottleDemo';
import TimelineDemo from './demo/TimelineDemo';
import ViewportDemo from './demo/ViewportDemo';
import WindowScrollDemo from './demo/WindowScrollDemo';

const nav = [
  ['/use-debounce', 'useDebounce'],
  ['/use-body-scroll-lock', 'useBodyScrollLock'],
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
        <p className="demo-nav-sub">사용법 데모</p>
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
