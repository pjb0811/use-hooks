import { useIntersectionObserver, useMergedRef } from '../hooks';
import Section from './section';

const code = `const [liveRef, { isIntersecting: live }] = useIntersectionObserver({ threshold: 0.5 });
const [frozenRef, { isIntersecting: frozen }] = useIntersectionObserver({
  threshold: 0.5,
  freezeOnceVisible: true,
});
const targetRef = useMergedRef(liveRef, frozenRef);

<div ref={targetRef}>...target...</div>`;

const IntersectionObserverDemo = () => {
  const [liveRef, { isIntersecting: live }] =
    useIntersectionObserver<HTMLDivElement>({ threshold: 0.5 });
  const [frozenRef, { isIntersecting: frozen }] =
    useIntersectionObserver<HTMLDivElement>({
      threshold: 0.5,
      freezeOnceVisible: true,
    });
  const targetRef = useMergedRef(liveRef, frozenRef);

  return (
    <Section
      id="use-intersection-observer"
      title="useIntersectionObserver"
      description="Tracks whether an element is visible in the viewport via a callback ref, powered by the native IntersectionObserver API. Shown here side by side: the default (Live) toggles on every crossing, while freezeOnceVisible (Frozen) disconnects for good the first time it's seen — commonly used for lazy loading, entrance animations, and infinite-scroll triggers."
      code={code}
    >
      <div className="demo-output">
        <div>
          Live: <b>{live ? 'Y' : 'N'}</b>&nbsp;&nbsp;Frozen:{' '}
          <b>{frozen ? 'Y' : 'N'}</b>
        </div>
      </div>
      <p className="demo-hint">
        Scroll down — the target box becomes visible once it's 50% in view. Live
        keeps toggling as it enters/leaves the viewport; Frozen locks to Y the
        first time it's seen and stays that way.
      </p>
      <div style={{ height: 500 }} />
      <div ref={targetRef} className="demo-box">
        Target element
      </div>
    </Section>
  );
};

export default IntersectionObserverDemo;
