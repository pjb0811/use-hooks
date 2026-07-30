import { Button, Checkbox } from '@jbpark/ui-kit';

import { useMultiSelect } from '../hooks';
import Section from './Section';

const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig'];

const code = `const { selected, isSelected, toggle, clear } = useMultiSelect(items.length);

// checkbox click
<div onClick={e => toggle(index, e.shiftKey)}>
  <Checkbox checked={isSelected(index)} onChange={() => {}} />
</div>`;

const MultiSelectDemo = () => {
  const { selected, isSelected, toggle, clear } = useMultiSelect(items.length);

  return (
    <Section
      id="use-multi-select"
      title="useMultiSelect"
      description="Checkbox-style multi-select for a list, with shift-click range selection. Selection is clamped against the current item count, so it stays valid if the list shrinks."
      code={code}
    >
      <ul className="demo-output" style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item, index) => (
          <li
            key={item}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 0',
            }}
          >
            <div onClick={e => toggle(index, e.shiftKey)}>
              <Checkbox checked={isSelected(index)} onChange={() => {}} />
            </div>
            {item}
          </li>
        ))}
      </ul>
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
