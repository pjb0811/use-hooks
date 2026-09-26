import { useState } from 'react';

import { Input } from '@jbpark/ui-kit';

import { useDebouncedCallback } from '../../../src/hooks';
import Section from './section';

const DebouncedCallbackDemo = () => {
  const [text, setText] = useState('');
  const [debounced, setDebounced] = useState('');
  const [count, setCount] = useState(0);

  const apply = useDebouncedCallback(
    () => {
      setDebounced(text);
      setCount(c => c + 1);
    },
    { delay: 400 },
    [text],
  );

  return (
    <Section description="Fires a callback only after the value stops changing for delay(ms). Useful for search inputs, autosave, etc. Leaving the field applies a waiting value at once (flush); Escape drops it (cancel).">
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        onBlur={apply.flush}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            apply.cancel();
          }
        }}
        placeholder="Type here (applied after 400ms, or on blur)"
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
