import type { ReactNode } from 'react';

import { Card, Typography } from '@jbpark/ui-kit';

interface Props {
  id: string;
  title: string;
  description: string;
  code: string;
  children: ReactNode;
}

const Section = ({ id, title, description, code, children }: Props) => {
  return (
    <section id={id} className="demo-section">
      <Typography.Title level={2} className="demo-title">
        {title}
      </Typography.Title>
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
