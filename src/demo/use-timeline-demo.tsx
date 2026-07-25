import { useTimeline } from '../hooks';
import type { TimelineStep } from '../hooks/use-timeline';
import Section from './Section';

const steps: TimelineStep[] = [
  {
    selector: '.timeline-box',
    position: { x: 120, y: 0 },
    scale: 1.2,
    backgroundColor: '#7c8cff',
    transition: { duration: 800, delay: 0 },
  },
  {
    selector: '.timeline-box',
    position: { x: 0, y: 0 },
    scale: 1,
    backgroundColor: '#4b5563',
    transition: { duration: 800, delay: 400 },
  },
];

const code = `const steps: TimelineStep[] = [
  { selector: '.box', position: { x: 120, y: 0 }, scale: 1.2, transition: { duration: 800, delay: 0 } },
  { selector: '.box', position: { x: 0, y: 0 }, scale: 1, transition: { duration: 800, delay: 400 } },
];

const { ref, completed } = useTimeline({ steps, loop: true });

<div ref={ref}><div className="box" /></div>`;

const TimelineDemo = () => {
  const { ref, completed } = useTimeline({ steps, loop: true });

  return (
    <Section
      id="use-timeline"
      title="useTimeline"
      description="Runs a sequential style-transition timeline based on CSS selectors. Useful for lightweight sequence animations."
      code={code}
    >
      <div ref={ref} className="demo-timeline-container">
        <div className="timeline-box" />
      </div>
      <div className="demo-output">
        Completed: {completed ? 'Y' : 'N'} (loops continuously in loop mode)
      </div>
    </Section>
  );
};

export default TimelineDemo;
