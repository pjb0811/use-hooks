import { Button } from '@jbpark/ui-kit';

import { useScrollToElements } from '../hooks';
import Section from './Section';

const code = `const { setElementRef, scrollToElement } = useScrollToElements({ offset: 16 });

<div ref={(el) => setElementRef(el, index)}>...</div>
<button onClick={() => scrollToElement(index)}>이동</button>`;

const ScrollToElementsDemo = () => {
  const { setElementRef, scrollToElement } = useScrollToElements({
    offset: 16,
  });

  return (
    <Section
      id="use-scroll-to-elements"
      title="useScrollToElements"
      description="인덱스로 관리되는 여러 엘리먼트로 부드럽게 스크롤 이동시킵니다."
      code={code}
    >
      <div className="demo-actions">
        {[0, 1, 2].map(i => (
          <Button key={i} onClick={() => scrollToElement(i)}>
            섹션 {i + 1}로 이동
          </Button>
        ))}
      </div>
      <div className="demo-scroll-box">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            ref={el => setElementRef(el, i)}
            className="demo-scroll-target"
          >
            섹션 {i + 1} 내용
          </div>
        ))}
      </div>
    </Section>
  );
};

export default ScrollToElementsDemo;
