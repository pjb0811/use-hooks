import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useTimeout } from '../../../src/hooks';
import Section from './section';

const TimeoutDemo = () => {
  const [open, setOpen] = useState(false);

  const { reset, clear } = useTimeout(() => setOpen(false), open ? 2000 : null);

  return (
    <Section description="A setTimeout that doesn't go stale — the callback is read from a ref, delay === null pauses it (0 is a valid delay), and reset/clear let you restart or cancel imperatively.">
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
