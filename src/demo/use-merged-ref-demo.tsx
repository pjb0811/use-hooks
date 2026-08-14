import { useRef, useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useMergedRef } from '../hooks';
import Section from './section';

const code = `const mergedRef = useMergedRef(forwardedRef, internalRef);

<div ref={mergedRef} />`;

interface MeasuredBoxProps {
  ref?: React.Ref<HTMLDivElement>;
}

const MeasuredBox = ({ ref }: MeasuredBoxProps) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMergedRef(ref, internalRef);
  const [width, setWidth] = useState<number | null>(null);

  return (
    <div ref={mergedRef} className="demo-box">
      Resizable box
      <div className="demo-actions">
        <Button
          onClick={() => setWidth(internalRef.current?.offsetWidth ?? null)}
        >
          Measure via internal ref
        </Button>
      </div>
      {width != null && <p className="demo-hint">Width: {width}px</p>}
    </div>
  );
};

const MergedRefDemo = () => {
  const forwardedRef = useRef<HTMLDivElement>(null);

  return (
    <Section
      id="use-merged-ref"
      title="useMergedRef"
      description="Merges a forwarded ref with a component's own internal ref into one callback ref, so a component can keep an internal ref to the same DOM node its parent also has a ref to."
      code={code}
    >
      <MeasuredBox ref={forwardedRef} />
      <div className="demo-actions">
        <Button
          onClick={() =>
            forwardedRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }
        >
          Scroll to box via forwarded ref
        </Button>
      </div>
      <p className="demo-hint">
        Both refs point at the same node — the parent's forwardedRef scrolls to
        it, the component's own internalRef measures it.
      </p>
    </Section>
  );
};

export default MergedRefDemo;
