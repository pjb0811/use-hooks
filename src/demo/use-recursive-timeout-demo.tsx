import { useState } from 'react';

import { Switch } from '@jbpark/ui-kit';

import { useRecursiveTimeout } from '../hooks';
import Section from './section';

const code = `const [tick, setTick] = useState(0);

useRecursiveTimeout(() => {
  setTick((t) => t + 1);
}, running ? 1000 : null);`;

const RecursiveTimeoutDemo = () => {
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(true);

  useRecursiveTimeout(
    () => {
      setTick(t => t + 1);
    },
    running ? 1000 : null,
  );

  return (
    <Section
      id="use-recursive-timeout"
      title="useRecursiveTimeout"
      description="Repeats a callback using recursive setTimeout instead of setInterval. Pass null as delay to stop."
      code={code}
    >
      <div className="demo-output">
        <div>
          Elapsed ticks: <b>{tick}</b>s
        </div>
      </div>
      <div className="demo-actions">
        <Switch
          checked={running}
          onChange={setRunning}
          checkedChildren="Running"
          unCheckedChildren="Paused"
        />
      </div>
    </Section>
  );
};

export default RecursiveTimeoutDemo;
