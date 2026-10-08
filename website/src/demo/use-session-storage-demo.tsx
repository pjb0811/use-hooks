import { Button } from '@jbpark/ui-kit';

import { useLocalStorage, useSessionStorage } from '../../../src/hooks';
import Section from './section';

const SessionStorageDemo = () => {
  const [sessionCount, setSessionCount] = useSessionStorage(
    'use-hooks-demo-session-count',
    0,
  );
  const [localCount, setLocalCount] = useLocalStorage(
    'use-hooks-demo-session-vs-local-count',
    0,
  );

  return (
    <Section description="State synced with sessionStorage, shown next to useLocalStorage. The session value survives reloads but not a closed tab.">
      <div className="demo-output">
        <div>
          sessionStorage: <b>{sessionCount}</b>
        </div>
        <div>
          localStorage: <b>{localCount}</b>
        </div>
      </div>
      <div className="demo-actions">
        <Button type="primary" onClick={() => setSessionCount(c => c + 1)}>
          +1 session
        </Button>
        <Button type="primary" onClick={() => setLocalCount(c => c + 1)}>
          +1 local
        </Button>
        <Button
          onClick={() => {
            setSessionCount(0);
            setLocalCount(0);
          }}
        >
          Reset
        </Button>
      </div>
      <p className="demo-hint">
        Reload the page: both values stay. Open the page in a new tab: only the
        localStorage value carries over.
      </p>
    </Section>
  );
};

export default SessionStorageDemo;
