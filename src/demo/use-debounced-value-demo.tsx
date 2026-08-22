import { useState } from 'react';

import { Input } from '@jbpark/ui-kit';

import { useDebouncedValue } from '../hooks';
import Section from './section';

const code = `const [text, setText] = useState('');
const debounced = useDebouncedValue(text, 400);`;

const DebouncedValueDemo = () => {
  const [text, setText] = useState('');
  const debounced = useDebouncedValue(text, 400);

  return (
    <Section
      description="The value-shaped counterpart to useDebouncedCallback — symmetric with useThrottledValue's (value, delay) => value signature, for when all you need is the debounced value itself."
      code={code}
    >
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type here (applied after 400ms)"
      />
      <div className="demo-output">
        <div>Live value: {text || '(none)'}</div>
        <div>Debounced value: {debounced || '(none)'}</div>
      </div>
    </Section>
  );
};

export default DebouncedValueDemo;
