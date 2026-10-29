import { Button } from '@jbpark/ui-kit';

import { useFullscreen } from '../../../src/hooks';
import Section from './section';

const FullscreenDemo = () => {
  const { ref, isFullscreen, isSupported, toggle, error } =
    useFullscreen<HTMLDivElement>();

  return (
    <Section description="Shows an element full screen. The button inside it enters and leaves; Esc also leaves, and the state follows either way.">
      <div ref={ref} className="demo-box demo-fullscreen">
        <div>{isFullscreen ? 'Full screen' : 'In the page'}</div>
        <div className="demo-actions">
          <Button type="primary" disabled={!isSupported} onClick={toggle}>
            {isFullscreen ? 'Exit full screen' : 'Full screen'}
          </Button>
        </div>
      </div>
      <div className="demo-output" role="status">
        <div>Supported: {String(isSupported)}</div>
        <div>Error: {error ? error.message : '(none)'}</div>
      </div>
    </Section>
  );
};

export default FullscreenDemo;
