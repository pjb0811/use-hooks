import { useState } from 'react';

import { Tag } from '@jbpark/ui-kit';

import { useDocumentVisibility, useInterval } from '../../../src/hooks';
import Section from './section';

const DocumentVisibilityDemo = () => {
  const visible = useDocumentVisibility();
  const [seconds, setSeconds] = useState(0);

  // A `null` delay pauses the interval while the tab is hidden.
  useInterval(() => setSeconds(s => s + 1), visible ? 1000 : null);

  return (
    <Section description="Whether the page is visible. The counter below ticks every second and pauses while this tab is hidden.">
      <div className="demo-output">
        <div>
          Page: <Tag>{visible ? 'visible' : 'hidden'}</Tag>
        </div>
        <div>
          Seconds counted while visible: <b>{seconds}</b>
        </div>
      </div>
      <p className="demo-hint">
        Switch to another tab for a few seconds and come back: the count stopped
        while you were away.
      </p>
    </Section>
  );
};

export default DocumentVisibilityDemo;
