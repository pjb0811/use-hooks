import { Button } from '@jbpark/ui-kit';

import { useSet } from '../../../src/hooks';
import Section from './section';

const ROWS = [
  { id: 'install', title: 'Install', body: 'pnpm add @jbpark/use-hooks' },
  {
    id: 'import',
    title: 'Import',
    body: "import { useSet } from '@jbpark/use-hooks';",
  },
  {
    id: 'use',
    title: 'Use',
    body: 'const [collapsed, actions] = useSet<string>();',
  },
];

const SetDemo = () => {
  // Collapsed rather than expanded ids, so every row starts expanded.
  const [collapsed, actions] = useSet<string>();

  return (
    <Section description="A Set of keys held in state, with add, delete, toggle, set and clear. Each row's collapsed state is one key in the set.">
      <div style={{ display: 'grid', gap: 8 }}>
        {ROWS.map(row => {
          const expanded = !collapsed.has(row.id);

          return (
            <div key={row.id}>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`use-set-demo-${row.id}`}
                onClick={() => actions.toggle(row.id)}
                style={{
                  all: 'unset',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {expanded ? '▾' : '▸'} {row.title}
              </button>
              {expanded && (
                <div id={`use-set-demo-${row.id}`}>
                  <code>{row.body}</code>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="demo-output">
        <div>
          Collapsed: {collapsed.size > 0 ? [...collapsed].join(', ') : '(none)'}
        </div>
      </div>
      <div className="demo-actions">
        <Button onClick={() => actions.clear()}>Expand all</Button>
        <Button onClick={() => actions.set(ROWS.map(row => row.id))}>
          Collapse all
        </Button>
      </div>
    </Section>
  );
};

export default SetDemo;
