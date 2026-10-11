import { useRef, useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useElementPosition } from '../../../src/hooks';
import Section from './section';

const ElementPositionDemo = () => {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useElementPosition(ref);

  const [target, setTarget] = useState<'a' | 'b'>('a');
  // A getter is re-evaluated on every measurement and after every render, so
  // switching `target` moves the tracking to the other box.
  const targetRect = useElementPosition(() =>
    document.getElementById(`position-target-${target}`),
  );

  return (
    <Section description="Tracks an element's getBoundingClientRect in real time as you scroll or resize.">
      <div ref={ref} className="demo-box">
        Tracked box
      </div>
      <div className="demo-output">
        <div>
          top: {rect?.top.toFixed(0) ?? '-'} / left:{' '}
          {rect?.left.toFixed(0) ?? '-'}
        </div>
        <div>
          width: {rect?.width.toFixed(0) ?? '-'} / height:{' '}
          {rect?.height.toFixed(0) ?? '-'}
        </div>
      </div>
      <p className="demo-hint">
        Try scrolling the page or resizing the window.
      </p>
      <div className="demo-actions">
        <div id="position-target-a" className="demo-box">
          Box A
        </div>
        <div id="position-target-b" className="demo-box">
          Box B
        </div>
      </div>
      <div className="demo-actions">
        <Button
          type={target === 'a' ? 'primary' : 'default'}
          onClick={() => setTarget('a')}
        >
          Track A
        </Button>
        <Button
          type={target === 'b' ? 'primary' : 'default'}
          onClick={() => setTarget('b')}
        >
          Track B
        </Button>
      </div>
      <div className="demo-output">
        <div>
          Box {target.toUpperCase()} left: {targetRect?.left.toFixed(0) ?? '-'}
        </div>
      </div>
    </Section>
  );
};

export default ElementPositionDemo;
