import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useImage } from '../hooks';
import Section from './Section';

const GOOD_SRC = 'https://picsum.photos/seed/use-hooks/320/200';
const BAD_SRC = 'https://this-domain-does-not-exist-123456.invalid/broken.png';

const code = `const { loading, error, loaded, retry } = useImage(src, { retryCount: 1 });`;

const ImageDemo = () => {
  const [src, setSrc] = useState(GOOD_SRC);
  const { loading, error, loaded, retry } = useImage(src, { retryCount: 1 });

  return (
    <Section
      id="use-image"
      title="useImage"
      description="Tracks image loading state (loading/loaded/error) and provides a retry."
      code={code}
    >
      <div className="demo-output">
        Status:{' '}
        {loading ? 'loading' : error ? 'error' : loaded ? 'loaded' : 'idle'}
      </div>
      {loaded && <img src={src} alt="demo" className="demo-image" />}
      <div className="demo-actions">
        <Button type="primary" onClick={retry}>
          Retry
        </Button>
        <Button danger onClick={() => setSrc(BAD_SRC)}>
          Test broken image
        </Button>
        <Button onClick={() => setSrc(GOOD_SRC)}>Restore good image</Button>
      </div>
    </Section>
  );
};

export default ImageDemo;
