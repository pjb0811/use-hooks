import { memo, useEffect, useRef, useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useStableValue } from '../../../src/hooks';
import Section from './section';

interface Options {
  color: string;
  size: number;
}

// Counts how many times an effect keyed on `options` has run. The count is
// written to the DOM from the effect, so counting doesn't render again.
const EffectCounter = memo(
  ({ label, options }: { label: string; options: Options }) => {
    const countRef = useRef(0);
    const outputRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      countRef.current += 1;

      if (outputRef.current) {
        outputRef.current.textContent = String(countRef.current);
      }
    }, [options]);

    return (
      <div>
        {label}: effect on <code>options</code> ran <span ref={outputRef} />{' '}
        times
      </div>
    );
  },
);

const StableValueDemo = () => {
  const [, setRenders] = useState(0);
  const [size, setSize] = useState(12);

  // A new object every render, as an inline prop would be.
  const options = { color: 'tomato', size };
  const stableOptions = useStableValue(options);

  return (
    <Section description="Keeps the previous reference while an object or array is shallowly equal, so an effect or memo keyed on an inline prop reruns only when its contents change.">
      <div className="demo-output">
        <EffectCounter label="Inline object" options={options} />
        <EffectCounter label="useStableValue" options={stableOptions} />
      </div>
      <div className="demo-actions">
        <Button onClick={() => setRenders(r => r + 1)}>Rerender parent</Button>
        <Button type="primary" onClick={() => setSize(s => s + 1)}>
          Change size ({size})
        </Button>
      </div>
    </Section>
  );
};

export default StableValueDemo;
