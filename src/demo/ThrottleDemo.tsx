import { useState } from 'react';

import { Progress } from '@jbpark/ui-kit';

import { useThrottle } from '../hooks';
import Section from './Section';

const code = `const [value, setValue] = useState(0);
const throttled = useThrottle(value, 500);`;

const ThrottleDemo = () => {
  const [value, setValue] = useState(0);
  const throttled = useThrottle(value, 500);

  return (
    <Section
      id="use-throttle"
      title="useThrottle"
      description="값이 빠르게 바뀌어도 delay(ms) 간격으로만 최신값을 반영합니다. 스크롤/리사이즈 값 처리에 유용해요."
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
        <div>실시간 값: {value}</div>
        <div>throttled 값 (500ms): {throttled}</div>
      </div>
    </Section>
  );
};

export default ThrottleDemo;
