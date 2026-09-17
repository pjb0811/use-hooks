import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { createRequire } from 'node:module';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// The doc pages import their demos from `../../src/demo`, which belongs to the
// library project one directory up — and that project installs its own
// `node_modules`, separate from this site's. So `@jbpark/ui-kit` resolves to two
// physically distinct copies: the site's for `src/components/DemoTheme.tsx`, the
// library's for every demo file. Two copies means two `createContext` calls, so
// `DemoTheme`'s `<Config>` publishes to a context that `CodeEditor` — which
// reads `theme.dark` in JS rather than through the `.dark` class every other
// component follows — never sees, and it was pinned to the light VSCode theme.
//
// Docusaurus hits the same problem with React and solves it the same way (see
// `getReactAliases` in @docusaurus/core's webpack/base.js), which is exactly why
// React survives this layout and ui-kit did not. Aliasing per subpath rather
// than at the package root because the published `exports` map points these at
// `dist/*.mjs` — a directory alias would bypass it. Add an entry here when a
// demo starts using a new subpath.
const requireFromSite = createRequire(import.meta.url);

const uiKitAliases = {
  '@jbpark/ui-kit$': requireFromSite.resolve('@jbpark/ui-kit'),
  '@jbpark/ui-kit/CodeEditor$': requireFromSite.resolve(
    '@jbpark/ui-kit/CodeEditor',
  ),
  '@jbpark/ui-kit/style.css$': requireFromSite.resolve(
    '@jbpark/ui-kit/style.css',
  ),
};

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

  plugins: [
    () => ({
      name: 'dedupe-ui-kit',
      configureWebpack: () => ({ resolve: { alias: uiKitAliases } }),
    }),
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
