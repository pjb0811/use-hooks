import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useTimeout } from '../hooks';
import Section from './Section';

const code = `const [open, setOpen] = useState(false);
const { reset, clear } = useTimeout(() => setOpen(false), open ? 2000 : null);

// Pause the auto-dismiss while hovered, restart it on mouse leave
<div onMouseEnter={clear} onMouseLeave={reset}>Toast</div>`;

const TimeoutDemo = () => {
  const [open, setOpen] = useState(false);

  const { reset, clear } = useTimeout(() => setOpen(false), open ? 2000 : null);

  return (
    <Section
      id="use-timeout"
      title="useTimeout"
      description="A setTimeout that doesn't go stale — the callback is read from a ref, delay === null pauses it (0 is a valid delay), and reset/clear let you restart or cancel imperatively."
      code={code}
    >
      <div className="demo-actions">
        <Button
          onClick={() => {
            setOpen(true);
            reset();
          }}
        >
          Show toast (auto-closes in 2s)
        </Button>
      </div>
      {open && (
        <div className="demo-box" onMouseEnter={clear} onMouseLeave={reset}>
          Toast — hover to pause the auto-dismiss timer.
        </div>
      )}
    </Section>
  );
};

export default TimeoutDemo;
