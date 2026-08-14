import { Progress } from '@jbpark/ui-kit';

import { useElementScroll } from '../hooks';
import Section from './section';

const code = `const { setRef, scrollPercentage, isAtTop, isAtBottom } = useElementScroll();

<div ref={setRef}>...scrollable content...</div>`;

const ElementScrollDemo = () => {
  const { setRef, scrollPercentage, isAtTop, isAtBottom } = useElementScroll();

  return (
    <Section
      id="use-element-scroll"
      title="useElementScroll"
      description="Tracks a scroll container's position, percentage, and whether it's at the top or bottom."
      code={code}
    >
      <div ref={setRef} className="demo-scroll-box">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="demo-scroll-item">
            Item {i + 1}
          </div>
        ))}
      </div>
      <Progress value={scrollPercentage} />
      <div className="demo-output">
        <div>Scroll progress: {scrollPercentage.toFixed(0)}%</div>
        <div>
          At top: {isAtTop ? 'Y' : 'N'} / At bottom: {isAtBottom ? 'Y' : 'N'}
        </div>
      </div>
    </Section>
  );
};

export default ElementScrollDemo;
