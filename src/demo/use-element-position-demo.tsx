import { useRef } from 'react';

import { useElementPosition } from '../hooks';
import Section from './section';

const code = `const ref = useRef<HTMLDivElement>(null);
const rect = useElementPosition(ref);`;

const ElementPositionDemo = () => {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useElementPosition(ref);

  return (
    <Section
      description="Tracks an element's getBoundingClientRect in real time as you scroll or resize."
      code={code}
    >
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
    </Section>
  );
};

export default ElementPositionDemo;
