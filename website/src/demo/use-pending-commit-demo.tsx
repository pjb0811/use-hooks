import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { usePendingCommit } from '../../../src/hooks';
import Section from './section';

interface TagsProps {
  value: string[];
  onChange: (next: string[]) => void;
}

// Both editors commit twice from one click. The parent passes the new list
// back only on the next render, so the second commit sees the old `value`.
const NaiveTags = ({ value, onChange }: TagsProps) => {
  const add = (tag: string) => onChange([...value, tag]);

  return (
    <Button
      onClick={() => {
        add('red');
        add('blue');
      }}
    >
      Add red + blue (plain)
    </Button>
  );
};

const PendingTags = ({ value, onChange }: TagsProps) => {
  const pending = usePendingCommit<string[], string[]>(value);

  const add = (tag: string) => {
    const next = [...(pending.read() ?? value), tag];

    pending.write(next);
    onChange(next);
  };

  return (
    <Button
      type="primary"
      onClick={() => {
        add('red');
        add('blue');
      }}
    >
      Add red + blue (usePendingCommit)
    </Button>
  );
};

const PendingCommitDemo = () => {
  const [tags, setTags] = useState<string[]>([]);

  return (
    <Section description="Keeps a controlled component's last commit until the parent renders again, so two commits in the same tick build on each other. Each button adds two tags in one click; the plain one loses the first.">
      <div className="demo-output">
        <div>Tags: {tags.length > 0 ? tags.join(', ') : '(none)'}</div>
      </div>
      <div className="demo-actions">
        <NaiveTags value={tags} onChange={setTags} />
        <PendingTags value={tags} onChange={setTags} />
        <Button onClick={() => setTags([])}>Clear</Button>
      </div>
    </Section>
  );
};

export default PendingCommitDemo;
