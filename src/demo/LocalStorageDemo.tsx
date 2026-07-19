import { Button } from '@jbpark/ui-kit';

import { useLocalStorage } from '../hooks';
import Section from './Section';

const code = `const [count, setCount] = useLocalStorage('demo-count', 0);`;

const LocalStorageDemo = () => {
  const [count, setCount] = useLocalStorage('use-hooks-demo-count', 0);

  return (
    <Section
      id="use-local-storage"
      title="useLocalStorage"
      description="localStorage와 동기화되는 state입니다. 새로고침해도 값이 유지되고, 다른 탭에서 변경해도 반영돼요."
      code={code}
    >
      <div className="demo-output">
        저장된 값: <b>{count}</b>
      </div>
      <div className="demo-actions">
        <Button type="primary" onClick={() => setCount(c => c + 1)}>
          +1
        </Button>
        <Button onClick={() => setCount(0)}>초기화</Button>
      </div>
      <p className="demo-hint">새로고침해도 값이 유지됩니다.</p>
    </Section>
  );
};

export default LocalStorageDemo;
