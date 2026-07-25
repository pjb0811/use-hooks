import { Progress } from '@jbpark/ui-kit';

import { useWindowScroll } from '../hooks';
import Section from './Section';

const code = `const { x, y, percent } = useWindowScroll();`;

const WindowScrollDemo = () => {
  const { x, y, percent } = useWindowScroll();

  return (
    <Section
      id="use-window-scroll"
      title="useWindowScroll"
      description="Tracks the window scroll position (x/y) and progress (%) in real time. Try scrolling this page!"
      code={code}
    >
      <Progress value={percent.y} />
      <div className="demo-output">
        <div>
          scrollY: {y}px ({percent.y}%)
        </div>
        <div>
          scrollX: {x}px ({percent.x}%)
        </div>
      </div>
      <p className="demo-hint">
        Extra content below so you can see the values actually move as you
        scroll.
      </p>
      <div style={{ height: 800 }} />
    </Section>
  );
};

export default WindowScrollDemo;
