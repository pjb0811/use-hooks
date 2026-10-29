import { useState } from 'react';

import { Input, Tag } from '@jbpark/ui-kit';

import { useAsync } from '../../../src/hooks';
import Section from './section';

// Stands in for a request: answers after a delay that grows with the query's
// length, so a short query typed later can finish before a longer earlier
// one. A query containing "x" fails. The timer stops when `signal` aborts.
const search = (query: string, signal: AbortSignal) =>
  new Promise<string>((resolve, reject) => {
    const id = setTimeout(
      () => {
        if (query.includes('x')) {
          reject(new Error(`No results for "${query}"`));
        } else {
          resolve(`${query.length * 3} results for "${query}"`);
        }
      },
      300 + query.length * 150,
    );

    signal.addEventListener('abort', () => clearTimeout(id));
  });

const AsyncDemo = () => {
  const [query, setQuery] = useState('react');

  const { value, error, status } = useAsync(
    signal => search(query, signal),
    [query],
    { enabled: query !== '' },
  );

  return (
    <Section description="Runs an async task whenever its inputs change and keeps the outcome in state. A run whose inputs changed before it finished is aborted and ignored, so the latest query always wins. Clear the input to disable it; type an x to make it fail.">
      <Input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Type a query"
      />
      <div className="demo-output" role="status">
        <div>
          Status: <Tag>{status}</Tag>
        </div>
        <div>Value: {value ?? '(none)'}</div>
        <div>Error: {error ? error.message : '(none)'}</div>
      </div>
    </Section>
  );
};

export default AsyncDemo;
