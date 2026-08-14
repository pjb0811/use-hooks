import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useInterval } from '../hooks';
import Section from './section';

const code = `const [running, setRunning] = useState(false);
const [count, setCount] = useState(0);

useInterval(() => setCount(c => c + 1), running ? 1000 : null);`;

const IntervalDemo = () => {
  const [running, setRunning] = useState(false);
  const [count, setCount] = useState(0);

  useInterval(() => setCount(c => c + 1), running ? 1000 : null);

  return (
    <Section
      id="use-interval"
      title="useInterval"
      description="Dan Abramov's useInterval pattern — the callback is read from a ref so a fresh function every render doesn't reset the interval, only delay === null (pause) vs a number (running) does."
      code={code}
    >
      <div className="demo-output">Count: {count}</div>
      <div className="demo-actions">
        <Button onClick={() => setRunning(r => !r)}>
          {running ? 'Pause' : 'Start'}
        </Button>
        <Button onClick={() => setCount(0)}>Reset</Button>
      </div>
    </Section>
  );
};

export default IntervalDemo;
