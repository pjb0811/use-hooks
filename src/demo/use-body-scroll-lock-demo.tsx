import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useBodyScrollLock } from '../hooks';
import Section from './Section';

const code = `const [open, setOpen] = useState(false);

useBodyScrollLock(open);`;

const BodyScrollLockDemo = () => {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);

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
          <div className="demo-modal" onClick={e => e.stopPropagation()}>
            <p>The page behind this modal is scroll-locked while it's open.</p>
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </Section>
  );
};

export default BodyScrollLockDemo;
