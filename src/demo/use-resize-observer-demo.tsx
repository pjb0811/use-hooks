import { useResizeObserver } from '../hooks';
import Section from './Section';

const code = `const [ref, size] = useResizeObserver<HTMLDivElement>();

<div ref={ref}>{size?.width} x {size?.height}</div>`;

const ResizeObserverDemo = () => {
  const [ref, size] = useResizeObserver<HTMLDivElement>();

  return (
    <Section
      id="use-resize-observer"
      title="useResizeObserver"
      description="Reports an element's own width/height as it's resized — the unprocessed primitive behind useResponsiveSize/useElementScroll/useElementPosition, for when you just want the size."
      code={code}
    >
      <div ref={ref} className="demo-resizable">
        <div>
          Size:{' '}
          {size
            ? `${Math.round(size.width)} x ${Math.round(size.height)}`
            : '—'}
        </div>
        <p className="demo-hint">
          Drag the bottom-right corner of the box to resize it.
        </p>
      </div>
    </Section>
  );
};

export default ResizeObserverDemo;
