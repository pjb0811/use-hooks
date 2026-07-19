import { Progress } from '@jbpark/ui-kit';

import { useElementScroll } from '../hooks';
import Section from './Section';

const code = `const { setRef, scrollPercentage, isAtTop, isAtBottom } = useElementScroll();

<div ref={setRef}>...스크롤 가능한 내용...</div>`;

const ElementScrollDemo = () => {
  const { setRef, scrollPercentage, isAtTop, isAtBottom } = useElementScroll();

  return (
    <Section
      id="use-element-scroll"
      title="useElementScroll"
      description="특정 스크롤 컨테이너의 위치/퍼센트/상단·하단 도달 여부를 추적합니다."
      code={code}
    >
      <div ref={setRef} className="demo-scroll-box">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="demo-scroll-item">
            항목 {i + 1}
          </div>
        ))}
      </div>
      <Progress value={scrollPercentage} />
      <div className="demo-output">
        <div>스크롤 진행률: {scrollPercentage.toFixed(0)}%</div>
        <div>
          맨 위: {isAtTop ? 'Y' : 'N'} / 맨 아래: {isAtBottom ? 'Y' : 'N'}
        </div>
      </div>
    </Section>
  );
};

export default ElementScrollDemo;
