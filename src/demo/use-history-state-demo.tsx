import { Button } from '@jbpark/ui-kit';

import { useHistoryState } from '../hooks';
import Section from './section';

const code = `const { value, setValue, undo, redo, canUndo, canRedo } =
  useHistoryState(0);`;

const HistoryStateDemo = () => {
  const { value, setValue, undo, redo, canUndo, canRedo } = useHistoryState(0);

  return (
    <Section
      description="State with undo/redo support. Every setValue call snapshots the previous value; undo/redo step through that history."
      code={code}
    >
      <div className="demo-output">
        Current value: <b>{value}</b>
      </div>
      <div className="demo-actions">
        <Button type="primary" onClick={() => setValue(v => v + 1)}>
          +1
        </Button>
        <Button onClick={() => setValue(v => v - 1)}>-1</Button>
        <Button onClick={undo} disabled={!canUndo}>
          Undo
        </Button>
        <Button onClick={redo} disabled={!canRedo}>
          Redo
        </Button>
      </div>
      <p className="demo-hint">
        Change the value a few times, then use Undo/Redo to step through
        history.
      </p>
    </Section>
  );
};

export default HistoryStateDemo;
