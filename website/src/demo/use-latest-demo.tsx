import { useEffect, useState } from 'react';

import { Input } from '@jbpark/ui-kit';

import { useLatest } from '../../../src/hooks';
import Section from './section';

const LatestDemo = () => {
  const [text, setText] = useState('');
  const [tick, setTick] = useState({ count: 0, seen: '' });
  const textRef = useLatest(text);

  // The interval is created once. Its callback reads the newest text through
  // the ref, so typing never tears the interval down.
  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => ({ count: t.count + 1, seen: textRef.current }));
    }, 1000);

    return () => clearInterval(id);
  }, [textRef]);

  return (
    <Section description="A ref that always holds the value from the latest render. The interval below is created once, yet each tick still reads the text you typed last.">
      <Input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type while the interval ticks"
      />
      <div className="demo-output">
        <div>Typed now: {text || '(none)'}</div>
        <div>
          Tick #{tick.count} saw: {tick.seen || '(none)'}
        </div>
      </div>
    </Section>
  );
};

export default LatestDemo;
