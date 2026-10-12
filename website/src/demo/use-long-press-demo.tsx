import { useState } from 'react';

import { Button } from '@jbpark/ui-kit';

import { useLongPress } from '../../../src/hooks';
import Section from './section';

const THRESHOLD = 800;

const LongPressDemo = () => {
  const [holding, setHolding] = useState(false);
  const [message, setMessage] = useState('Hold the button to confirm.');

  const { handlers, isLongPressed } = useLongPress(
    () => {
      setHolding(false);
      setMessage('Confirmed.');
    },
    {
      threshold: THRESHOLD,
      keyboard: true,
      onStart: () => setHolding(true),
      onCancel: () => {
        setHolding(false);
        setMessage('Released too early. Keep holding.');
      },
    },
  );

  return (
    <Section description="Calls a callback once a press lasts long enough, with mouse, touch, pen or by holding Space. Releasing, leaving the button or dragging away cancels it.">
      <div className="demo-actions">
        <Button
          type="primary"
          danger
          {...handlers}
          onClick={() => {
            if (!isLongPressed()) {
              setMessage('That was a click. Hold instead.');
            }
          }}
        >
          Hold to delete
        </Button>
      </div>
      <div
        aria-hidden
        style={{
          height: 4,
          borderRadius: 2,
          background: 'var(--ifm-color-emphasis-200)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: holding ? '100%' : '0%',
            background: 'var(--ifm-color-danger)',
            transition: holding ? `width ${THRESHOLD}ms linear` : 'none',
          }}
        />
      </div>
      <div className="demo-output" role="status">
        <div>{message}</div>
      </div>
    </Section>
  );
};

export default LongPressDemo;
