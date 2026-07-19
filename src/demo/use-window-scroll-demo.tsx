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
      description="윈도우 스크롤 위치(x/y)와 진행률(%)을 실시간으로 추적합니다. 이 페이지를 스크롤해보세요!"
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
        아래로 스크롤할 내용을 조금 더 채워서 실제로 움직이는 값을 확인해보세요.
      </p>
      <div style={{ height: 800 }} />
    </Section>
  );
};

export default WindowScrollDemo;
