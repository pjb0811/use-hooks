import { Radio } from '@jbpark/ui-kit';

import { useHash } from '../../../src/hooks';
import Section from './section';

const FRUITS = [
  { label: 'Apple', value: 'demo-apple' },
  { label: 'Banana', value: 'demo-banana' },
  { label: 'Cherry', value: 'demo-cherry' },
];

const HashDemo = () => {
  const [hash, setHash] = useHash();
  const selected = FRUITS.some(fruit => fruit.value === hash)
    ? hash
    : FRUITS[0].value;

  return (
    <Section description="Reads and writes the URL hash. Pick a fruit, then reload or press Back: the selection comes from the URL.">
      <Radio.Group
        value={selected}
        options={FRUITS}
        optionType="button"
        buttonStyle="solid"
        onChange={value => setHash(String(value))}
      />
      <div className="demo-output">
        <div>Hash: {hash ? `#${hash}` : '(none)'}</div>
      </div>
    </Section>
  );
};

export default HashDemo;
