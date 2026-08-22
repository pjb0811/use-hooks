import { useEffect, useState } from 'react';

import { useEventListener } from '../hooks';
import Section from './section';

const code = `const [width, setWidth] = useState(window.innerWidth);

useEventListener('resize', () => setWidth(window.innerWidth));`;

const EventListenerDemo = () => {
  // Starts at 0 to match SSR (no `window` there) rather than branching on
  // `typeof window` — reading the real width up front made the client's
  // first render disagree with the server-rendered markup, which is a
  // hydration mismatch (React error #418), not a fix for one. The real
  // value gets filled in immediately after mount instead.
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Not synchronizing with an external store's ongoing changes (that's
    // the resize listener below) — this is a one-time correction so the
    // client's post-mount render picks up the real value SSR could never
    // know, which is the standard fix for this exact mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWidth(window.innerWidth);
  }, []);

  useEventListener('resize', () => setWidth(window.innerWidth));

  return (
    <Section
      id="use-event-listener"
      title="useEventListener"
      description="Registers/unregisters an event listener on window (default), document, or a ref'd element, with the handler read from a ref so a fresh function every render doesn't tear down and re-add it."
      code={code}
    >
      <div className="demo-output">Window width: {width}px</div>
      <p className="demo-hint">Resize your browser window to see it update.</p>
    </Section>
  );
};

export default EventListenerDemo;
