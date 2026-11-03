import type { ReactNode } from 'react';

import { useColorMode } from '@docusaurus/theme-common';
import { Config } from '@jbpark/ui-kit';

// Bridges Docusaurus' color mode into ui-kit's own dark-mode mechanism (a
// `.dark` class ancestor, toggled via Config's `theme.dark`) so the demo
// components on doc pages — built with ui-kit's Button/Card/etc — follow
// the site's light/dark toggle instead of defaulting to light.
//
// Must be used from inside doc/page content, not from `@theme/Root`: Root
// renders above Docusaurus' ColorModeProvider, so useColorMode() throws
// there.
export default function DemoTheme({ children }: { children: ReactNode }) {
  const { colorMode } = useColorMode();

  // The class is a styling hook, not a layout box: Config renders its wrapper
  // with `display: contents`, which keeps it out of the layout tree but *not*
  // out of the DOM — so Infima's `.markdown > h2` rules stop reaching the
  // headings nested inside it. `custom.css` re-states them through this class.
  return (
    <Config className="demo-theme" theme={{ dark: colorMode }}>
      {children}
    </Config>
  );
}
