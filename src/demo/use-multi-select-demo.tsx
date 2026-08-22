import { useRef } from 'react';

import { Button, Checkbox, List } from '@jbpark/ui-kit';

import { useMultiSelect } from '../hooks';
import Section from './section';

const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig'];

const code = `const { selected, isSelected, toggle, clear } = useMultiSelect(items.length);
// shift-click range-select is mouse-only, so the modifier is captured on
// the CAPTURE phase (before Checkbox's own click-driven onChange fires)
// and read back in onChange, which fires exactly once per real toggle
// (mouse click or keyboard Space).
const shiftHeldRef = useRef(false);

<div onClickCapture={e => { shiftHeldRef.current = e.shiftKey; }}>
  <Checkbox checked={isSelected(index)} onChange={() => toggle(index, shiftHeldRef.current)}>
    {item}
  </Checkbox>
</div>`;

const MultiSelectDemo = () => {
  const { selected, isSelected, toggle, clear } = useMultiSelect(items.length);
  const shiftHeldRef = useRef(false);

  return (
    <Section
      description="Checkbox-style multi-select for a list, with shift-click range selection. Selection is clamped against the current item count, so it stays valid if the list shrinks."
      code={code}
    >
      <List
        className="demo-output"
        data={items}
        itemKey={item => item}
        renderItem={(item, index) => (
          <div
            onClickCapture={e => {
              shiftHeldRef.current = e.shiftKey;
            }}
          >
            <Checkbox
              checked={isSelected(index)}
              onChange={() => toggle(index, shiftHeldRef.current)}
            >
              {item}
            </Checkbox>
          </div>
        )}
      />
      <div className="demo-actions">
        <Button onClick={clear} disabled={selected.size === 0}>
          Clear
        </Button>
      </div>
      <p className="demo-hint">
        {selected.size} selected. Click to toggle, shift-click to select a
        range.
      </p>
    </Section>
  );
};

export default MultiSelectDemo;
