import { Button, Progress } from '@jbpark/ui-kit';

import { useMap } from '../../../src/hooks';
import Section from './section';

const FILES = [
  { id: 'cover', name: 'cover.png' },
  { id: 'notes', name: 'notes.md' },
  { id: 'video', name: 'intro.mp4' },
];

const STEP = 25;

const MapDemo = () => {
  // Upload progress by file id. A file without an entry hasn't started.
  const [progress, { update, delete: remove, clear }] = useMap<
    string,
    number
  >();

  return (
    <Section description="A Map of key-value pairs held in state, with set, update, delete, setAll and clear. Each file's upload progress is one entry, keyed by its id.">
      <div style={{ display: 'grid', gap: 12 }}>
        {FILES.map(file => {
          const value = progress.get(file.id);

          return (
            <div key={file.id} style={{ display: 'grid', gap: 4 }}>
              <div>
                <code>{file.name}</code>{' '}
                {value === undefined ? '(not started)' : `${value}%`}
              </div>
              <Progress value={value ?? 0} />
              <div className="demo-actions">
                <Button
                  disabled={value === 100}
                  onClick={() =>
                    update(file.id, previous =>
                      Math.min(100, (previous ?? 0) + STEP),
                    )
                  }
                >
                  Advance {STEP}%
                </Button>
                <Button
                  disabled={value === undefined}
                  onClick={() => remove(file.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      <div className="demo-output" role="status">
        <div>Entries: {progress.size}</div>
      </div>
      <div className="demo-actions">
        <Button
          onClick={() => {
            // Several updates in one event build on each other.
            FILES.forEach(file =>
              update(file.id, previous =>
                Math.min(100, (previous ?? 0) + STEP),
              ),
            );
          }}
        >
          Advance all
        </Button>
        <Button onClick={() => clear()}>Clear</Button>
      </div>
    </Section>
  );
};

export default MapDemo;
