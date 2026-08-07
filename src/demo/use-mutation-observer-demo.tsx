import { useRef, useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useMutationObserver } from '../hooks';
import Section from './Section';

const code = `const listRef = useRef<HTMLUListElement>(null);
const [count, setCount] = useState(0);

useMutationObserver(listRef, () => setCount(c => c + 1), { childList: true });

<ul ref={listRef}>{items.map(...)}</ul>`;

const MutationObserverDemo = () => {
  const listRef = useRef<HTMLUListElement>(null);
  const [items, setItems] = useState(['Item 1']);
  const [mutations, setMutations] = useState(0);

  useMutationObserver(listRef, () => setMutations(c => c + 1), {
    childList: true,
  });

  return (
    <Section
      id="use-mutation-observer"
      title="useMutationObserver"
      description="Watches a target (a ref, or a plain Node like document.head) for DOM mutations. The callback is read from a ref, so passing a fresh inline function every render doesn't tear down and resubscribe the observer."
      code={code}
    >
      <div className="demo-actions">
        <Button
          onClick={() => setItems(prev => [...prev, `Item ${prev.length + 1}`])}
        >
          Add item
        </Button>
        <Button
          onClick={() => setItems(prev => prev.slice(0, -1))}
          disabled={items.length === 0}
        >
          Remove last
        </Button>
      </div>
      <ul ref={listRef} className="demo-scroll-box">
        {items.map(item => (
          <li key={item} className="demo-scroll-item">
            {item}
          </li>
        ))}
      </ul>
      <div className="demo-output">
        childList mutations observed: {mutations}
      </div>
    </Section>
  );
};

export default MutationObserverDemo;
