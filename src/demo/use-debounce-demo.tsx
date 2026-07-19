import { useState } from 'react';

import { Input } from '@jbpark/ui-kit';

import { useDebounce } from '../hooks';
import Section from './Section';

const code = `const [text, setText] = useState('');
const [debounced, setDebounced] = useState('');

useDebounce(
  () => setDebounced(text),
  { delay: 400 },
  [text],
);`;

const DebounceDemo = () => {
  const [text, setText] = useState('');
  const [debounced, setDebounced] = useState('');
  const [count, setCount] = useState(0);

  useDebounce(
    () => {
      setDebounced(text);
      setCount(c => c + 1);
    },
    { delay: 400 },
    [text],
  );

  return (
    <Section
      id="use-debounce"
      title="useDebounce"
      description="값이 바뀐 뒤 delay(ms) 동안 추가 변경이 없을 때만 콜백을 실행합니다. 검색어 입력, 자동저장 등에 사용해요."
      code={code}
    >
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="입력해보세요 (400ms 후 반영)"
      />
      <div className="demo-output">
        <div>
          debounced 값: <b>{debounced || '(없음)'}</b>
        </div>
        <div>
          콜백 실행 횟수: <b>{count}</b>
        </div>
      </div>
    </Section>
  );
};

export default DebounceDemo;
