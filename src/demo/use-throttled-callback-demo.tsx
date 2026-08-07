import { useState } from 'react';

import { useThrottledCallback } from '../hooks';
import Section from './Section';

const code = `const onMouseMove = useThrottledCallback(
  (x: number, y: number) => setPosition({ x, y }),
  200,
);

<div onMouseMove={e => onMouseMove(e.clientX, e.clientY)} />`;

const ThrottledCallbackDemo = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [calls, setCalls] = useState(0);

  const onMouseMove = useThrottledCallback((x: number, y: number) => {
    setPosition({ x, y });
    setCalls(c => c + 1);
  }, 200);

  return (
    <Section
      id="use-throttled-callback"
      title="useThrottledCallback"
      description="Throttles a callback directly (unlike useThrottle, which throttles a value) — the natural fit for scroll/mousemove/resize handlers. Supports leading/trailing options."
      code={code}
    >
      <div
        className="demo-box"
        onMouseMove={e => onMouseMove(e.clientX, e.clientY)}
      >
        Move your mouse over this box
      </div>
      <div className="demo-output">
        <div>
          Position: {position.x}, {position.y}
        </div>
        <div>Handler calls (throttled to 200ms): {calls}</div>
      </div>
    </Section>
  );
};

export default ThrottledCallbackDemo;
