import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useBodyScrollLock } from '../hooks';
import Section from './Section';

const code = `const [open, setOpen] = useState(false);

useBodyScrollLock(open);`;

const BodyScrollLockDemo = () => {
  const [open, setOpen] = useState(false);
  useBodyScrollLock(open);

  return (
    <Section
      id="use-body-scroll-lock"
      title="useBodyScrollLock"
      description="모달/드로어가 열려 있는 동안 뒤쪽 body 스크롤을 막습니다."
      code={code}
    >
      <Button type="primary" onClick={() => setOpen(true)}>
        모달 열기
      </Button>
      {open && (
        <div className="demo-modal-overlay" onClick={() => setOpen(false)}>
          <div className="demo-modal" onClick={e => e.stopPropagation()}>
            <p>이 모달이 열려 있는 동안 뒤쪽 페이지 스크롤이 잠깁니다.</p>
            <Button onClick={() => setOpen(false)}>닫기</Button>
          </div>
        </div>
      )}
    </Section>
  );
};

export default BodyScrollLockDemo;
