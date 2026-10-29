import { type KeyboardEvent, useState } from 'react';

import { useRovingFocus } from '../../../src/hooks';
import Section from './section';

const TOOLS = ['Bold', 'Italic', 'Underline', 'Link', 'Code'];
// "Link" is disabled, so the arrow keys skip it.
const DISABLED_TOOL = 3;

const COMMANDS = ['New file', 'Open…', 'Save', 'Save as…', 'Close'];

const RovingFocusDemo = () => {
  const [lastAction, setLastAction] = useState<string>();

  const toolbar = useRovingFocus({
    count: TOOLS.length,
    orientation: 'horizontal',
    isDisabled: index => index === DISABLED_TOOL,
  });
  const menu = useRovingFocus({ count: COMMANDS.length, loop: false });

  return (
    <Section description="One Tab stop per group, with the arrow keys moving focus inside it. Tab into the toolbar, use Left and Right (the disabled Link is skipped), Home and End, then Tab to the menu and use Up and Down. Tab back: focus returns to the item you left.">
      <div
        role="toolbar"
        aria-label="Formatting"
        className="demo-roving demo-roving-toolbar"
      >
        {TOOLS.map((tool, index) => (
          <button
            key={tool}
            type="button"
            aria-disabled={index === DISABLED_TOOL || undefined}
            onClick={() => {
              if (index !== DISABLED_TOOL) {
                setLastAction(tool);
              }
            }}
            {...toolbar.getItemProps(index)}
          >
            {tool}
          </button>
        ))}
      </div>
      <div
        role="menu"
        aria-label="File"
        className="demo-roving demo-roving-menu"
      >
        {COMMANDS.map((command, index) => {
          const itemProps = menu.getItemProps(index);

          return (
            <div
              key={command}
              role="menuitem"
              {...itemProps}
              onClick={() => setLastAction(command)}
              // Enter and Space are the caller's, composed with the hook's
              // arrow keys.
              onKeyDown={(event: KeyboardEvent<HTMLElement>) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setLastAction(command);

                  return;
                }

                itemProps.onKeyDown(event);
              }}
            >
              {command}
            </div>
          );
        })}
      </div>
      <div className="demo-output" role="status">
        <div>Last action: {lastAction ?? '(none)'}</div>
        <div>
          Tab stops: toolbar → {TOOLS[toolbar.activeIndex]}, menu →{' '}
          {COMMANDS[menu.activeIndex]}
        </div>
      </div>
    </Section>
  );
};

export default RovingFocusDemo;
