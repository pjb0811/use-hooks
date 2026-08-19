import type { ReactNode } from 'react';

import Heading from '@theme/Heading';
import clsx from 'clsx';

import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Zero Dependencies',
    icon: '📦',
    description: (
      <>
        The published package has no runtime dependencies of its own — just
        plain hooks built on React 19's own APIs.
      </>
    ),
  },
  {
    title: 'Live Demos',
    icon: '🪝',
    description: (
      <>
        Every hook ships with a working, interactive example right on its docs
        page — no separate playground to keep in sync.
      </>
    ),
  },
  {
    title: 'Typed & Tree-shakeable',
    icon: '🌲',
    description: (
      <>
        Full TypeScript types and per-hook named exports, so bundlers only pull
        in what a project actually imports.
      </>
    ),
  },
];

function Feature({ title, icon, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <div className={styles.featureIcon} role="img" aria-label={title}>
          {icon}
        </div>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
