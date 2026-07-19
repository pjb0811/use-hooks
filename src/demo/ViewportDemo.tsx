import { useViewport } from '../hooks';
import Section from './Section';

const code = `const viewport = useViewport();`;

const ViewportDemo = () => {
  const viewport = useViewport();

  return (
    <Section
      id="use-viewport"
      title="useViewport"
      description="visualViewport 기준으로 실제 보여지는 뷰포트 크기/오프셋/배율을 추적합니다. 모바일 키보드/핀치줌 대응에 유용해요."
      code={code}
    >
      <div className="demo-output">
        <div>
          width: {viewport.width.toFixed(0)} / height:{' '}
          {viewport.height.toFixed(0)}
        </div>
        <div>scale: {viewport.scale.toFixed(2)}</div>
      </div>
      <p className="demo-hint">
        모바일에서 핀치줌하거나 키보드를 열어보면 값이 바뀝니다.
      </p>
    </Section>
  );
};

export default ViewportDemo;
