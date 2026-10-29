import { useState } from 'react';

import { Button, Input } from '@jbpark/ui-kit';

import { useBeforeUnload } from '../../../src/hooks';
import Section from './section';

const BeforeUnloadDemo = () => {
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState('');

  const isDirty = draft !== saved;

  useBeforeUnload(isDirty);

  return (
    <Section description="Asks before the tab closes or reloads while there are unsaved changes. Type something, then reload the page: the browser shows its own prompt. Save, and the reload goes through.">
      <Input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="Type to make an unsaved change"
      />
      <div className="demo-output" role="status">
        <div>{isDirty ? 'Unsaved changes: reload asks first' : 'Saved'}</div>
      </div>
      <div className="demo-actions">
        <Button
          type="primary"
          disabled={!isDirty}
          onClick={() => setSaved(draft)}
        >
          Save
        </Button>
        <Button disabled={!isDirty} onClick={() => setDraft(saved)}>
          Discard
        </Button>
      </div>
      <p className="demo-hint">
        Browsers show the prompt only after you have interacted with the page,
        and ignore any custom message.
      </p>
    </Section>
  );
};

export default BeforeUnloadDemo;
