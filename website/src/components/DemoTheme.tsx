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

  return <Config theme={{ dark: colorMode }}>{children}</Config>;
}
