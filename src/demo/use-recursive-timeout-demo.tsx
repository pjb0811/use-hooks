import { useState } from 'react';

import { Switch } from '@jbpark/ui-kit';

import { useRecursiveTimeout } from '../hooks';
import Section from './Section';

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
      return () => {};
    },
    running ? 1000 : null,
  );

  return (
    <Section
      id="use-recursive-timeout"
      title="useRecursiveTimeout"
      description="setInterval 대신 재귀적 setTimeout으로 콜백을 반복 실행합니다. delay가 null이면 멈춥니다."
      code={code}
    >
      <div className="demo-output">
        경과 틱: <b>{tick}</b>초
      </div>
      <div className="demo-actions">
        <Switch
          checked={running}
          onChange={setRunning}
          checkedChildren="실행중"
          unCheckedChildren="정지"
        />
      </div>
    </Section>
  );
};

export default RecursiveTimeoutDemo;
