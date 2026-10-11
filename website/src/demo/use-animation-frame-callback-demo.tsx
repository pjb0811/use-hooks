import { useState } from 'react';

import { useAnimationFrameCallback } from '../../../src/hooks';
import Section from './section';

const AnimationFrameCallbackDemo = () => {
  const [events, setEvents] = useState(0);
  const [frames, setFrames] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Runs at most once per frame, with the position of the last mousemove.
  const [schedule] = useAnimationFrameCallback((x: number, y: number) => {
    setFrames(count => count + 1);
    setPosition({ x, y });
  });

  return (
    <Section description="Coalesces repeated calls into one run per animation frame, with the arguments of the last call. Move the pointer over the box: events arrive faster than frames.">
      <div
        className="demo-output"
        style={{ minHeight: 120, cursor: 'crosshair' }}
        onMouseMove={event => {
          setEvents(count => count + 1);
          schedule(event.clientX, event.clientY);
        }}
      >
        <div>Mouse move events: {events}</div>
        <div>Callback runs (one per frame at most): {frames}</div>
        <div>
          Last position: {position.x}, {position.y}
        </div>
      </div>
    </Section>
  );
};

export default AnimationFrameCallbackDemo;
