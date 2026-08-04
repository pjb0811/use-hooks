import { useState } from 'react';

import { Button, Checkbox } from '@jbpark/ui-kit';

import { useControllableState } from '../hooks';
import Section from './Section';

const code = `const [checked, setChecked] = useControllableState({
  value: externalValue, // undefined = uncontrolled
  defaultValue: false,
  onChange: value => console.log('checked:', value),
});`;

const ControllableStateDemo = () => {
  const [externalValue, setExternalValue] = useState<boolean | undefined>(
    undefined,
  );
  const [checked, setChecked] = useControllableState({
    value: externalValue,
    defaultValue: false,
    onChange: value => console.log('checked:', value),
  });

  return (
    <Section
      id="use-controllable-state"
      title="useControllableState"
      description="Backs a controlled/uncontrolled prop pair (`value`/`defaultValue`/`onChange`) with a single hook — falls back to internal state when `value` is undefined, and always calls `onChange` on updates."
      code={code}
    >
      <div className="demo-output">
        <Checkbox checked={checked} onChange={setChecked}>
          {externalValue === undefined ? 'Uncontrolled' : 'Controlled'} checkbox
        </Checkbox>
      </div>
      <div className="demo-actions">
        <Button onClick={() => setExternalValue(undefined)}>
          Go uncontrolled
        </Button>
        <Button onClick={() => setExternalValue(true)}>Force checked</Button>
        <Button onClick={() => setExternalValue(false)}>Force unchecked</Button>
      </div>
      <p className="demo-hint">
        Toggle the checkbox freely while uncontrolled; forcing a value switches
        the hook to controlled mode, mirroring that prop instead.
      </p>
    </Section>
  );
};

export default ControllableStateDemo;
