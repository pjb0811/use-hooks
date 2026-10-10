import { useState } from 'react';

import { Button, Input } from '@jbpark/ui-kit';

import { useCopyToClipboard } from '../../../src/hooks';
import Section from './section';

const CopyToClipboardDemo = () => {
  const [text, setText] = useState('pnpm add @jbpark/use-hooks');
  const { copy, copied, error } = useCopyToClipboard({ resetDelay: 1500 });

  return (
    <Section description="Copies text to the clipboard. `copied` is true for a moment after a successful copy, and a second click restarts that moment. `error` holds the last failure.">
      <Input value={text} onChange={e => setText(e.target.value)} />
      <div className="demo-actions">
        <Button type="primary" onClick={() => copy(text)}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <div className="demo-output">
        <div>Copied: {String(copied)}</div>
        <div>Error: {error ? error.message : '(none)'}</div>
      </div>
    </Section>
  );
};

export default CopyToClipboardDemo;
