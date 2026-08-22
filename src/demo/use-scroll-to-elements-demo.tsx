import { Button } from '@jbpark/ui-kit';

import { useScrollToElements } from '../hooks';
import Section from './section';

const code = `const { register, scrollTo } = useScrollToElements({ offset: 16 });

<div ref={register('section-1')}>...</div>
<button onClick={() => scrollTo('section-1')}>Go</button>`;

const sections = ['section-1', 'section-2', 'section-3'];

const ScrollToElementsDemo = () => {
  const { register, scrollTo } = useScrollToElements({
    offset: 16,
  });

  return (
    <Section
      description="Smoothly scrolls to elements registered by key."
      code={code}
    >
      <div className="demo-actions">
        {sections.map((key, i) => (
          <Button key={key} onClick={() => scrollTo(key)}>
            Go to section {i + 1}
          </Button>
        ))}
      </div>
      <div className="demo-scroll-box">
        {sections.map((key, i) => (
          <div key={key} ref={register(key)} className="demo-scroll-target">
            Section {i + 1} content
          </div>
        ))}
      </div>
    </Section>
  );
};

export default ScrollToElementsDemo;
