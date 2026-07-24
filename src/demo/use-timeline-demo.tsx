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
      description="CSS selector 기반으로 순차적인 스타일 트랜지션 타임라인을 실행합니다. 가벼운 시퀀스 애니메이션을 만들 때 사용해요."
      code={code}
    >
      <div ref={ref} className="demo-timeline-container">
        <div className="timeline-box" />
      </div>
      <div className="demo-output">
        완료 여부: {completed ? 'Y' : 'N'} (loop 모드라 계속 반복돼요)
      </div>
    </Section>
  );
};

export default TimelineDemo;
