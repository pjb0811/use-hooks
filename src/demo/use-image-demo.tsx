import { useState } from 'react';

import { Button, Skeleton, Spin, Tag } from '@jbpark/ui-kit';

import { useImage } from '../hooks';
import Section from './section';

const GOOD_SRC = 'https://picsum.photos/seed/use-hooks/320/200';
const BAD_SRC = 'https://this-domain-does-not-exist-123456.invalid/broken.png';

const code = `const { loading, error, loaded, retry, attemptCount } =
  useImage(src, { retryCount: 1 });`;

const ImageDemo = () => {
  const [src, setSrc] = useState(GOOD_SRC);
  const { loading, error, loaded, retry, attemptCount } = useImage(src, {
    retryCount: 1,
  });

  const status = loading
    ? 'loading'
    : error
      ? 'error'
      : loaded
        ? 'loaded'
        : 'idle';
  const statusColor =
    status === 'loading'
      ? 'primary'
      : status === 'error'
        ? 'danger'
        : status === 'loaded'
          ? 'success'
          : 'default';

  return (
    <Section
      id="use-image"
      title="useImage"
      description="Tracks image loading state (loading/loaded/error) and provides a retry. error is a real Error (with the original event as its cause), and attemptCount is exposed for building retry UI."
      code={code}
    >
      <div className="demo-output">
        <div>
          Status: <Tag color={statusColor}>{status}</Tag>
        </div>
        {error && <div>Error: {error.message}</div>}
        <div>Attempt count: {attemptCount}</div>
      </div>
      <Spin spinning={loading}>
        <Skeleton loading={!loaded} width={320} height={200}>
          {loaded && <img src={src} alt="demo" className="demo-image" />}
        </Skeleton>
      </Spin>
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
