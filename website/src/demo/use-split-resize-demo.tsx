import { useState } from 'react';

import { Radio } from '@jbpark/ui-kit';

import { useSplitResize } from '../../../src/hooks';
import Section from './section';

const LAYOUTS = [
  { label: 'Side by side', value: 'horizontal' },
  { label: 'Stacked', value: 'vertical' },
];

const SplitResizeDemo = () => {
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>(
    'horizontal',
  );
  const [savedSize, setSavedSize] = useState<number>();

  const { size, isResizing, containerRef, separatorProps } = useSplitResize({
    defaultSize: 30,
    minSize: 20,
    maxSize: 70,
    orientation,
    onResizeEnd: setSavedSize,
  });

  const isVertical = orientation === 'vertical';

  return (
    <Section description="Resizes the first of two panes with a separator. Drag it with a mouse, touch or pen, or focus it and use the arrow keys, Home and End.">
      <Radio.Group
        value={orientation}
        options={LAYOUTS}
        optionType="button"
        buttonStyle="solid"
        onChange={value => setOrientation(value as typeof orientation)}
      />
      <div
        ref={containerRef}
        className="demo-split"
        data-orientation={orientation}
      >
        <div
          id="split-resize-demo-pane"
          className="demo-box"
          style={{ flexBasis: `${size}%` }}
        >
          {size}%
        </div>
        <div
          {...separatorProps}
          aria-label="Resize the first pane"
          aria-controls="split-resize-demo-pane"
          className="demo-split-handle"
          data-resizing={isResizing || undefined}
          // Without it, a touch drag scrolls the page instead of resizing.
          style={{ touchAction: 'none' }}
        />
        <div className="demo-box" style={{ flex: 1 }}>
          {isVertical ? 'Bottom' : 'Right'}
        </div>
      </div>
      <div className="demo-output" role="status">
        <div>
          Saved on resize end: {savedSize === undefined ? '—' : `${savedSize}%`}
        </div>
      </div>
    </Section>
  );
};

export default SplitResizeDemo;
