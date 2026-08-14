import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { usePrevious } from '../hooks';
import Section from './section';

const code = `const [count, setCount] = useState(0);
const previous = usePrevious(count);`;

const PreviousDemo = () => {
  const [count, setCount] = useState(0);
  const previous = usePrevious(count);

  return (
    <Section
      id="use-previous"
      title="usePrevious"
      description="Returns the value from the previous render — useful for comparing against the current value, e.g. to detect a false-to-true transition."
      code={code}
    >
      <div className="demo-output">
        <div>Current: {count}</div>
        <div>Previous: {previous ?? '(none yet)'}</div>
      </div>
      <div className="demo-actions">
        <Button type="primary" onClick={() => setCount(c => c + 1)}>
          +1
        </Button>
        <Button onClick={() => setCount(c => c - 1)}>-1</Button>
      </div>
    </Section>
  );
};

export default PreviousDemo;
