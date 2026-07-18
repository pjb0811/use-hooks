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
      description="이미지 로딩 상태(loading/loaded/error)를 추적하고 재시도 기능을 제공합니다."
      code={code}
    >
      <div className="demo-output">
        상태:{' '}
        {loading ? '로딩중' : error ? '에러' : loaded ? '로드완료' : '대기'}
      </div>
      {loaded && <img src={src} alt="demo" className="demo-image" />}
      <div className="demo-actions">
        <Button type="primary" onClick={retry}>
          다시 시도
        </Button>
        <Button danger onClick={() => setSrc(BAD_SRC)}>
          깨진 이미지로 테스트
        </Button>
        <Button onClick={() => setSrc(GOOD_SRC)}>정상 이미지로 복구</Button>
      </div>
    </Section>
  );
};

export default ImageDemo;
