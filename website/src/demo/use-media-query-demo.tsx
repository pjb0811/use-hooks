import { useState } from 'react';

import { Input } from '@jbpark/ui-kit';

import { useMediaQuery } from '../../../src/hooks';
import Section from './section';

const BUILT_IN_QUERIES = [
  '(min-width: 768px)',
  '(prefers-color-scheme: dark)',
  '(prefers-reduced-motion: reduce)',
  '(orientation: landscape)',
];

const QueryRow = ({ query }: { query: string }) => {
  const matches = useMediaQuery(query);

  return (
    <div>
      <code>{query}</code>: <b>{String(matches)}</b>
    </div>
  );
};

const MediaQueryDemo = () => {
  const [query, setQuery] = useState('(min-width: 1024px)');
  const custom = useMediaQuery(query);

  return (
    <Section description="Subscribes to a CSS media query through matchMedia and re-renders when it starts or stops matching. Useful for the conditions that element size can't express — prefers-color-scheme, prefers-reduced-motion, orientation — where useResponsiveSize's breakpoints don't apply.">
      <div className="demo-output">
        {BUILT_IN_QUERIES.map(builtIn => (
          <QueryRow key={builtIn} query={builtIn} />
        ))}
      </div>
      <Input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Type a media query, e.g. (max-width: 480px)"
      />
      <div className="demo-output">
        Custom query matches: <b>{String(custom)}</b>
      </div>
      <p className="demo-hint">
        Resize the window, rotate the device, or flip the site's dark mode
        toggle to watch the values update.
      </p>
    </Section>
  );
};

export default MediaQueryDemo;
