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

  // Box C is shown and hidden through its `hidden` attribute, which only the
  // `mutation` option makes the hook notice. `measure` returns `null` while
  // it's hidden, so `element` is `null` too.
  const [isCHidden, setIsCHidden] = useState(true);
  const boxC = useElementPosition(
    () => document.getElementById('position-target-c'),
    {
      withElement: true,
      measure: element =>
        element.getClientRects().length > 0
          ? element.getBoundingClientRect()
          : null,
      mutation: { attributes: true, attributeFilter: ['hidden'] },
    },
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
      <div className="demo-actions">
        <Button onClick={() => setIsCHidden(hidden => !hidden)}>
          {isCHidden ? 'Show' : 'Hide'} box C
        </Button>
        <div id="position-target-c" className="demo-box" hidden={isCHidden}>
          Box C
        </div>
      </div>
      <div className="demo-output">
        <div>
          Box C element: {boxC.element ? `#${boxC.element.id}` : 'null'} / top:{' '}
          {boxC.rect?.top.toFixed(0) ?? '-'}
        </div>
      </div>
    </Section>
  );
};

export default ElementPositionDemo;
