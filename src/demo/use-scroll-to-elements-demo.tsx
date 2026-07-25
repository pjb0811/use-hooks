import { Button } from '@jbpark/ui-kit';

import { useScrollToElements } from '../hooks';
import Section from './Section';

const code = `const { setElementRef, scrollToElement } = useScrollToElements({ offset: 16 });

<div ref={(el) => setElementRef(el, index)}>...</div>
<button onClick={() => scrollToElement(index)}>Go</button>`;

const ScrollToElementsDemo = () => {
  const { setElementRef, scrollToElement } = useScrollToElements({
    offset: 16,
  });

  return (
    <Section
      id="use-scroll-to-elements"
      title="useScrollToElements"
      description="Smoothly scrolls to elements managed by index."
      code={code}
    >
      <div className="demo-actions">
        {[0, 1, 2].map(i => (
          <Button key={i} onClick={() => scrollToElement(i)}>
            Go to section {i + 1}
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
            Section {i + 1} content
          </div>
        ))}
      </div>
    </Section>
  );
};

export default ScrollToElementsDemo;
