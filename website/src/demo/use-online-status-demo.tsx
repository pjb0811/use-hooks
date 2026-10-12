import { useOnlineStatus } from '../../../src/hooks';
import Section from './section';

const OnlineStatusDemo = () => {
  const online = useOnlineStatus();

  return (
    <Section description="Whether the browser has a network connection. Switch DevTools' network throttling to Offline and back to see it change.">
      <div className="demo-output" role="status">
        <div>Status: {online ? 'online' : 'offline'}</div>
      </div>
    </Section>
  );
};

export default OnlineStatusDemo;
