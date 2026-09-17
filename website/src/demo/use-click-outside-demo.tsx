import { useRef, useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useClickOutside } from '../../../src/hooks';
import Section from './section';

const ClickOutsideDemo = () => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useClickOutside([triggerRef, panelRef], () => setOpen(false), {
    enabled: open,
    escape: true,
  });

  return (
    <Section description="Fires a callback on a click/tap outside every ref passed in, or on Escape. Passing both a trigger and a portaled panel as separate refs avoids the classic toggle bug where clicking the trigger to close it re-opens it.">
      <Button ref={triggerRef} type="primary" onClick={() => setOpen(v => !v)}>
        {open ? 'Close panel' : 'Open panel'}
      </Button>
      {open && (
        <div ref={panelRef} className="demo-box">
          Click outside (or press Escape) to close.
        </div>
      )}
      <div className="demo-output">open: {String(open)}</div>
    </Section>
  );
};

export default ClickOutsideDemo;
