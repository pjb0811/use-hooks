import { Button } from '@jbpark/ui-kit';

import { useToggle } from '../hooks';
import Section from './section';

const code = `const [open, toggle, setOpen] = useToggle(false);`;

const ToggleDemo = () => {
  const [open, toggle, setOpen] = useToggle(false);

  return (
    <Section
      description="A boolean toggle with a toggle function and a direct setter — the state shape dropdowns, collapses, drawers, and modals all share."
      code={code}
    >
      <div className="demo-output">State: {open ? 'open' : 'closed'}</div>
      <div className="demo-actions">
        <Button type="primary" onClick={toggle}>
          Toggle
        </Button>
        <Button onClick={() => setOpen(true)}>Force open</Button>
        <Button onClick={() => setOpen(false)}>Force closed</Button>
      </div>
    </Section>
  );
};

export default ToggleDemo;
