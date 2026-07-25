import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useClickOutside } from '../hooks';
import Section from './Section';

const code = `const [open, setOpen] = useState(false);
const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

<div ref={ref}>{open && <Menu />}</div>`;

const ClickOutsideDemo = () => {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  return (
    <Section
      id="use-click-outside"
      title="useClickOutside"
      description="Fires a callback when you click or tap outside the target element. Useful for closing dropdowns, popovers, and modals."
      code={code}
    >
      <Button type="primary" onClick={() => setOpen(true)}>
        {open ? 'Box is open' : 'Open box'}
      </Button>
      {open && (
        <div ref={ref} className="demo-box">
          Click or tap outside this box to close it.
        </div>
      )}
      <div className="demo-output">open: {String(open)}</div>
    </Section>
  );
};

export default ClickOutsideDemo;
