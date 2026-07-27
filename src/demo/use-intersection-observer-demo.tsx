import { useIntersectionObserver } from '../hooks';
import Section from './Section';

const code = `const [ref, entry] = useIntersectionObserver({ threshold: 0.5 });

<div ref={ref}>...target...</div>`;

const IntersectionObserverDemo = () => {
  const [ref, entry] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.5,
  });

  return (
    <Section
      id="use-intersection-observer"
      title="useIntersectionObserver"
      description="Tracks whether an element is visible in the viewport via a callback ref, powered by the native IntersectionObserver API. Commonly used to trigger infinite-scroll loading."
      code={code}
    >
      <div className="demo-output">
        Intersecting: <b>{entry?.isIntersecting ? 'Y' : 'N'}</b>
      </div>
      <p className="demo-hint">
        Scroll down — the target box becomes visible once it's 50% in view.
      </p>
      <div style={{ height: 500 }} />
      <div ref={ref} className="demo-box">
        Target element
      </div>
    </Section>
  );
};

export default IntersectionObserverDemo;
