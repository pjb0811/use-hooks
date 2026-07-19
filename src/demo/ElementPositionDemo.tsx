import { useRef } from 'react';

import { useElementPosition } from '../hooks';
import Section from './Section';

const code = `const ref = useRef<HTMLDivElement>(null);
const rect = useElementPosition(ref);`;

const ElementPositionDemo = () => {
  const ref = useRef<HTMLDivElement>(null);
  const rect = useElementPosition(ref);

  return (
    <Section
      id="use-element-position"
      title="useElementPosition"
      description="엘리먼트의 getBoundingClientRect 값을 스크롤/리사이즈에 반응해 실시간으로 추적합니다."
      code={code}
    >
      <div ref={ref} className="demo-box">
        추적 대상 박스
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
      <p className="demo-hint">페이지를 스크롤하거나 창 크기를 바꿔보세요.</p>
    </Section>
  );
};

export default ElementPositionDemo;
