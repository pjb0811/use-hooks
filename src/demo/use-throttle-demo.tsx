import { useState } from 'react';

import { Progress } from '@jbpark/ui-kit';

import { useThrottle } from '../hooks';
import Section from './section';

const code = `const [value, setValue] = useState(0);
const throttled = useThrottle(value, 500);`;

const ThrottleDemo = () => {
  const [value, setValue] = useState(0);
  const throttled = useThrottle(value, 500);

  return (
    <Section
      id="use-throttle"
      title="useThrottle"
      description="Applies the latest value only at delay(ms) intervals, even if it changes rapidly. Useful for scroll/resize handling."
      code={code}
    >
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={e => setValue(Number(e.target.value))}
      />
      <Progress value={throttled} />
      <div className="demo-output">
        <div>Live value: {value}</div>
        <div>Throttled value (500ms): {throttled}</div>
      </div>
    </Section>
  );
};

export default ThrottleDemo;
