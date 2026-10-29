import useEventListener from './use-event-listener';

// Asks the browser to confirm before the page unloads (closing the tab,
// reloading, following a link out of the app) while `enabled` is true, e.g.
// while there are unsaved changes. The browser shows its own message; a
// custom one is ignored. No listener is attached while `enabled` is false,
// since a `beforeunload` listener can keep the page out of the back/forward
// cache. In-app navigation is left to the router's own blocker.
const useBeforeUnload = (enabled: boolean) => {
  useEventListener(
    'beforeunload',
    event => {
      event.preventDefault();
      // Older browsers show the prompt only when `returnValue` is set.
      event.returnValue = '';
    },
    { enabled },
  );
};

export default useBeforeUnload;
