import { useIntersectionObserver } from '../hooks';
import Section from './Section';

const code = `const [ref, { isIntersecting }] = useIntersectionObserver({
  threshold: 0.5,
  freezeOnceVisible: true,
});

<div ref={ref}>...target...</div>`;

const IntersectionObserverDemo = () => {
  const [ref, { isIntersecting }] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.5,
    freezeOnceVisible: true,
  });

  return (
    <Section
      id="use-intersection-observer"
      title="useIntersectionObserver"
      description="Tracks whether an element is visible in the viewport via a callback ref, powered by the native IntersectionObserver API. freezeOnceVisible (used here) disconnects for good the first time it's seen — commonly used for lazy loading, entrance animations, and infinite-scroll triggers."
      code={code}
    >
      <div className="demo-output">
        Intersecting: <b>{isIntersecting ? 'Y' : 'N'}</b>
      </div>
      <p className="demo-hint">
        Scroll down — the target box becomes visible once it's 50% in view, and
        stays reported as visible from then on (freezeOnceVisible).
      </p>
      <div style={{ height: 500 }} />
      <div ref={ref} className="demo-box">
        Target element
      </div>
    </Section>
  );
};

export default IntersectionObserverDemo;
