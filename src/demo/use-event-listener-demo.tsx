import { useState } from 'react';

import { useEventListener } from '../hooks';
import Section from './Section';

const code = `const [width, setWidth] = useState(window.innerWidth);

useEventListener('resize', () => setWidth(window.innerWidth));`;

const EventListenerDemo = () => {
  const [width, setWidth] = useState(
    typeof window === 'undefined' ? 0 : window.innerWidth,
  );

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
