import { Button } from '@jbpark/ui-kit';

import { useHistoryState, useKeyPress } from '../hooks';
import Section from './Section';

const code = `const { value, setValue, undo, redo } = useHistoryState(0);

useKeyPress('mod+z', undo, { preventDefault: true });
useKeyPress('mod+shift+z', redo, { preventDefault: true });`;

const KeyPressDemo = () => {
  const { value, setValue, undo, redo, canUndo, canRedo } = useHistoryState(0);

  useKeyPress('mod+z', undo, { preventDefault: true });
  useKeyPress('mod+shift+z', redo, { preventDefault: true });

  return (
    <Section
      id="use-key-press"
      title="useKeyPress"
      description="Binds a key combo (Escape, Enter, mod+z, ...) to a handler. 'mod' normalizes to Cmd on macOS / Ctrl elsewhere. Pairs naturally with useHistoryState for undo/redo shortcuts."
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
        Try the keyboard shortcuts too: Cmd/Ctrl+Z to undo, Cmd/Ctrl+Shift+Z to
        redo.
      </p>
    </Section>
  );
};

export default KeyPressDemo;
