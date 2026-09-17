import type { ReactNode } from 'react';

import { Card, Typography } from '@jbpark/ui-kit';

interface Props {
  description: string;
  children: ReactNode;
}

// The hook name used to be rendered here as the section's own <Typography.Title>,
// duplicating the MDX heading each demo now sits under (added so Docusaurus'
// MDX-AST-based table of contents and per-hook anchors have something to find —
// see #177). `id`/`title` moved to that heading; this component no longer
// needs either.
//
// The usage snippet used to live here too, as a `code` prop rendered through
// ui-kit's CodeEditor. It is a plain ```tsx fence in the MDX now: the editor
// was read-only, so none of its interactivity was in use, while CodeMirror
// cost ~176 KB gzipped and had to be swapped in after hydration because it
// builds its document in an effect (leaving the snippet out of the static
// HTML). Docusaurus' own code blocks are highlighted at build time and bring
// a copy button along.
const Section = ({ description, children }: Props) => (
  <section className="demo-section">
    <Typography.Paragraph className="demo-description">
      {description}
    </Typography.Paragraph>
    <Card className="demo-live">{children}</Card>
  </section>
);

export default Section;
