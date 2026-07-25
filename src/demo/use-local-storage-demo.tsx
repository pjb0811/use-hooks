import { Button } from '@jbpark/ui-kit';

import { useLocalStorage } from '../hooks';
import Section from './Section';

const code = `const [count, setCount] = useLocalStorage('demo-count', 0);`;

const LocalStorageDemo = () => {
  const [count, setCount] = useLocalStorage('use-hooks-demo-count', 0);

  return (
    <Section
      id="use-local-storage"
      title="useLocalStorage"
      description="State synced with localStorage. The value survives reloads and updates across tabs."
      code={code}
    >
      <div className="demo-output">
        Stored value: <b>{count}</b>
      </div>
      <div className="demo-actions">
        <Button type="primary" onClick={() => setCount(c => c + 1)}>
          +1
        </Button>
        <Button onClick={() => setCount(0)}>Reset</Button>
      </div>
      <p className="demo-hint">The value persists across page reloads.</p>
    </Section>
  );
};

export default LocalStorageDemo;
