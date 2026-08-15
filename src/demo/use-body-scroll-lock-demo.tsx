import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useBodyScrollLock, useKeyPress } from '../hooks';
import Section from './section';

const code = `const [open, setOpen] = useState(false);

useBodyScrollLock(open);
useKeyPress('esc', () => setOpen(false), { enabled: open });`;

// NOTE: ui-kit's Modal (Radix Dialog) locks body scroll on its own, which
// would mask what this hook does — the demo deliberately uses a plain
// overlay so the lock visibly comes from useBodyScrollLock.
const BodyScrollLockDemo = () => {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);
  useKeyPress('esc', () => setOpen(false), { enabled: open });

  return (
    <Section
      id="use-body-scroll-lock"
      title="useBodyScrollLock"
      description="Locks the body scroll behind a modal or drawer while it's open."
      code={code}
    >
      <Button type="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      {open && (
        <div className="demo-modal-overlay" onClick={() => setOpen(false)}>
          <div
            className="demo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="scroll-lock-modal-title"
            onClick={e => e.stopPropagation()}
          >
            <p id="scroll-lock-modal-title">
              The page behind this modal is scroll-locked while it's open.
            </p>
            <div className="demo-modal-actions">
              <Button onClick={() => setOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
};

export default BodyScrollLockDemo;
