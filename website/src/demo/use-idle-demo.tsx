import { Tag } from '@jbpark/ui-kit';

import { useIdle } from '../../../src/hooks';
import Section from './section';

const TIMEOUT = 3000;

const IdleDemo = () => {
  const idle = useIdle(TIMEOUT);

  return (
    <Section description="Whether the user has done nothing for a while. Stop moving the mouse and typing for 3 seconds.">
      <div className="demo-output" role="status">
        <div>
          Status:{' '}
          <Tag color={idle ? 'warning' : 'success'}>
            {idle ? 'idle' : 'active'}
          </Tag>
        </div>
      </div>
    </Section>
  );
};

export default IdleDemo;
