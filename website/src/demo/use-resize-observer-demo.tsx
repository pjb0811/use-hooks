import { useResizeObserver } from '../../../src/hooks';
import Section from './section';

const ResizeObserverDemo = () => {
  const [ref, size] = useResizeObserver<HTMLDivElement>();

  return (
    <Section description="Reports an element's own width/height as it's resized — the unprocessed primitive behind useResponsiveSize/useElementScroll/useElementPosition, for when you just want the size.">
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
