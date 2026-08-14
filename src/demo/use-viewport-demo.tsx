import { useViewport } from '../hooks';
import Section from './section';

const code = `const viewport = useViewport();`;

const ViewportDemo = () => {
  const viewport = useViewport();

  return (
    <Section
      id="use-viewport"
      title="useViewport"
      description="Tracks the actual visible viewport size, offset, and scale via visualViewport. Useful for handling mobile keyboards and pinch-zoom."
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
        Pinch-zoom or open the keyboard on mobile to see the values change.
      </p>
    </Section>
  );
};

export default ViewportDemo;
