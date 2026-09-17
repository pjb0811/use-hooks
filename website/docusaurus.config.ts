import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// The demos live in this site's own `src/demo` (they used to sit in the
// library project one directory up, which installs a separate
// `node_modules` — that made `@jbpark/ui-kit` resolve to two physically
// distinct copies, two `createContext` calls, and a `Config` context that
// `CodeEditor` never saw; see #196). They import the hooks from
// `../../../src/hooks` as plain source, which pulls in no packages of its
// own, so every dependency now resolves through this site alone.
const config: Config = {
  title: 'use-hooks',
  tagline:
    'A collection of reusable React 19 hooks for common UI and interaction patterns',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // Vercel is the deploy target (see vercel.json). `url` + `baseUrl` must
  // match it, since canonical <link> tags, sitemap.xml, and Open Graph URLs
  // are all derived from them.
  url: 'https://use-hooks-lab.vercel.app',
  baseUrl: '/',

  organizationName: 'pjb0811',
  projectName: 'use-hooks',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/pjb0811/use-hooks/tree/main/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'use-hooks',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Hooks',
        },
        {
          href: 'https://github.com/pjb0811/use-hooks',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/@jbpark/use-hooks',
          label: 'npm',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Hooks',
          items: [
            { label: 'Overview', to: '/docs/intro' },
            { label: 'State', to: '/docs/hooks/state' },
            { label: 'Timing', to: '/docs/hooks/timing' },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/pjb0811/use-hooks',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/@jbpark/use-hooks',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} jbpark · use-hooks`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
