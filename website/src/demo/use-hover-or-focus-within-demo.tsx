import { useState } from 'react';

import { Button, Tag } from '@jbpark/ui-kit';

import { useHoverOrFocusWithin } from '../../../src/hooks';
import Section from './section';

const HoverOrFocusWithinDemo = () => {
  const [changes, setChanges] = useState(0);
  const { active, hovered, focusWithin, handlers } = useHoverOrFocusWithin({
    onActiveChange: () => setChanges(count => count + 1),
  });

  return (
    <Section description="Tracks hover and focus-within as two separate flags. `active` is true while either one is, so leaving with the pointer does not end it while focus is still inside, and the reverse.">
      <div
        {...handlers}
        className="demo-output"
        style={{ outline: active ? '2px solid currentColor' : undefined }}
      >
        <div>
          Hovered: <Tag>{String(hovered)}</Tag>
        </div>
        <div>
          Focus within: <Tag>{String(focusWithin)}</Tag>
        </div>
        <div>
          Active: <Tag>{String(active)}</Tag>
        </div>
        <div className="demo-actions">
          <Button>First</Button>
          <Button>Second</Button>
        </div>
      </div>
      <p className="demo-hint">
        Active changed {changes} time(s). Tab into a button, then move the mouse
        across the box and away: it stays active until focus leaves too. Tabbing
        from First to Second does not change it.
      </p>
    </Section>
  );
};

export default HoverOrFocusWithinDemo;
