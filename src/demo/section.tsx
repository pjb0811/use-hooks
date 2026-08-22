import type { ReactNode } from 'react';

import { Card, Typography } from '@jbpark/ui-kit';

interface Props {
  description: string;
  code: string;
  children: ReactNode;
}

// The hook name used to be rendered here as the section's own <Typography.Title>,
// duplicating the MDX heading each demo now sits under (added so Docusaurus'
// MDX-AST-based table of contents and per-hook anchors have something to find —
// see #177). `id`/`title` moved to that heading; this component no longer
// needs either.
const Section = ({ description, code, children }: Props) => {
  return (
    <section className="demo-section">
      <Typography.Paragraph className="demo-description">
        {description}
      </Typography.Paragraph>
      <Card className="demo-live">{children}</Card>
      <pre className="demo-code">
        <code>{code}</code>
      </pre>
    </section>
  );
};

export default Section;
