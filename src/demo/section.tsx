import { type ReactNode, useSyncExternalStore } from 'react';

import { Card, Typography } from '@jbpark/ui-kit';
import CodeEditor from '@jbpark/ui-kit/CodeEditor';

interface Props {
  description: string;
  code: string;
  children: ReactNode;
}

// The store never changes — `getSnapshot` and `getServerSnapshot` returning
// different values is the whole mechanism, and it reads "has this hydrated
// yet" without a setState-in-effect (which `react-hooks` rejects outright).
const subscribe = () => () => {};

// A display surface, not an editing one. `editable={false}` keeps the snippet
// selectable and copyable while dropping the cursor, and the rest of these
// strip the gutters, autocomplete, and active-line affordances a docs snippet
// has no use for.
const READ_ONLY_SETUP = {
  lineNumbers: false,
  foldGutter: false,
  highlightActiveLine: false,
  highlightActiveLineGutter: false,
  autocompletion: false,
  searchKeymap: false,
};

// The hook name used to be rendered here as the section's own <Typography.Title>,
// duplicating the MDX heading each demo now sits under (added so Docusaurus'
// MDX-AST-based table of contents and per-hook anchors have something to find —
// see #177). `id`/`title` moved to that heading; this component no longer
// needs either.
const Section = ({ description, code, children }: Props) => {
  // CodeMirror builds its document in an effect, so it server-renders to an
  // empty box — the snippet would be missing from the static HTML Docusaurus
  // emits, and from anything that reads the page without running JS. The <pre>
  // below keeps the text in that markup and is swapped for the editor once
  // hydration lands.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <section className="demo-section">
      <Typography.Paragraph className="demo-description">
        {description}
      </Typography.Paragraph>
      <Card className="demo-live">{children}</Card>
      {hydrated ? (
        // `height="auto"` because CodeEditor's own default is '100%', which
        // collapses inside a content-sized wrapper. `theme` is left at its
        // 'auto' default — DemoTheme already wraps doc pages in <Config
        // theme={{ dark }}>, so the editor follows the site's color toggle.
        <CodeEditor
          className="demo-code"
          value={code}
          height="auto"
          editable={false}
          basicSetup={READ_ONLY_SETUP}
        />
      ) : (
        <pre className="demo-code demo-code-static">
          <code>{code}</code>
        </pre>
      )}
    </section>
  );
};

export default Section;
