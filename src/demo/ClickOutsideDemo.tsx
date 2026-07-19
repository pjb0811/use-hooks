import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useClickOutside } from '../hooks';
import Section from './Section';

const code = `const [open, setOpen] = useState(false);
const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

<div ref={ref}>{open && <Menu />}</div>`;

const ClickOutsideDemo = () => {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false), open);

  return (
    <Section
      id="use-click-outside"
      title="useClickOutside"
      description="지정한 엘리먼트 바깥을 클릭/터치하면 콜백을 실행합니다. 드롭다운, 팝오버, 모달 닫기에 유용해요."
      code={code}
    >
      <Button type="primary" onClick={() => setOpen(true)}>
        {open ? '박스가 열려 있어요' : '박스 열기'}
      </Button>
      {open && (
        <div ref={ref} className="demo-box">
          이 박스 바깥을 클릭하거나 터치하면 닫혀요.
        </div>
      )}
      <div className="demo-output">open: {String(open)}</div>
    </Section>
  );
};

export default ClickOutsideDemo;
