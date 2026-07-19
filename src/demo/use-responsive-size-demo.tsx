import { useResponsiveSize } from '../hooks';
import Section from './Section';

const code = `const { size, breakpoint, ref } = useResponsiveSize<HTMLDivElement>();

<div ref={ref}>현재 breakpoint: {breakpoint.current}</div>`;

const ResponsiveSizeDemo = () => {
  const { size, breakpoint, ref } = useResponsiveSize<HTMLDivElement>();

  return (
    <Section
      id="use-responsive-size"
      title="useResponsiveSize"
      description="엘리먼트 크기를 관찰해 현재 breakpoint(xs~2xl)를 알려줍니다. 컨테이너 쿼리 대체용으로 유용해요."
      code={code}
    >
      <div ref={ref} className="demo-resizable">
        <div>
          현재 breakpoint: <b>{breakpoint.current}</b>
        </div>
        <div>
          크기: {size.width} x {size.height}
        </div>
        <p className="demo-hint">
          박스 우측 하단을 드래그해 크기를 바꿔보세요.
        </p>
      </div>
    </Section>
  );
};

export default ResponsiveSizeDemo;
