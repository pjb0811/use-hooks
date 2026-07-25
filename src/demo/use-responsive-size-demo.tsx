import { useResponsiveSize } from '../hooks';
import Section from './Section';

const code = `const { size, breakpoint, ref } = useResponsiveSize<HTMLDivElement>();

<div ref={ref}>Current breakpoint: {breakpoint.current}</div>`;

const ResponsiveSizeDemo = () => {
  const { size, breakpoint, ref } = useResponsiveSize<HTMLDivElement>();

  return (
    <Section
      id="use-responsive-size"
      title="useResponsiveSize"
      description="Observes an element's size and reports the current breakpoint (xs–2xl). Useful as a container-query alternative."
      code={code}
    >
      <div ref={ref} className="demo-resizable">
        <div>
          Current breakpoint: <b>{breakpoint.current}</b>
        </div>
        <div>
          Size: {size.width} x {size.height}
        </div>
        <p className="demo-hint">
          Drag the bottom-right corner of the box to resize it.
        </p>
      </div>
    </Section>
  );
};

export default ResponsiveSizeDemo;
