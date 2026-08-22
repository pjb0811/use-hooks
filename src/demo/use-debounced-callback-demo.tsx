import { useState } from 'react';

import { Input } from '@jbpark/ui-kit';

import { useDebouncedCallback } from '../hooks';
import Section from './section';

const code = `const [text, setText] = useState('');
const [debounced, setDebounced] = useState('');

useDebouncedCallback(
  () => setDebounced(text),
  { delay: 400 },
  [text],
);`;

const DebouncedCallbackDemo = () => {
  const [text, setText] = useState('');
  const [debounced, setDebounced] = useState('');
  const [count, setCount] = useState(0);

  useDebouncedCallback(
    () => {
      setDebounced(text);
      setCount(c => c + 1);
    },
    { delay: 400 },
    [text],
  );

  return (
    <Section
      description="Fires a callback only after the value stops changing for delay(ms). Useful for search inputs, autosave, etc."
      code={code}
    >
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type here (applied after 400ms)"
      />
      <div className="demo-output">
        <div>
          Debounced value: <b>{debounced || '(none)'}</b>
        </div>
        <div>
          Callback runs: <b>{count}</b>
        </div>
      </div>
    </Section>
  );
};

export default DebouncedCallbackDemo;
