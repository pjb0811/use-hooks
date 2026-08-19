import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// Hooks are grouped by what they're for, not one page per hook — each
// category page renders that group's live demos directly.
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Hooks',
      collapsed: false,
      items: [
        'hooks/state',
        'hooks/scroll-and-position',
        'hooks/observers',
        'hooks/events-and-interaction',
        'hooks/timing',
        'hooks/utility',
      ],
    },
  ],
};

export default sidebars;
