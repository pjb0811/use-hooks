import { useState } from 'react';

import { useFileDrop, useFileToDataUrl } from '../hooks';
import Section from './section';

const code = `const readAsDataUrl = useFileToDataUrl();
const { dropRef, isDragging } = useFileDrop({
  accept: 'image/*',
  multiple: false,
  onDrop: async ([file]) => setDataUrl(await readAsDataUrl(file)),
});

<div ref={dropRef}>{isDragging ? 'Drop it!' : 'Drag an image here'}</div>`;

const FileDropDemo = () => {
  const readAsDataUrl = useFileToDataUrl();
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  const { dropRef, isDragging } = useFileDrop<HTMLDivElement>({
    accept: 'image/*',
    multiple: false,
    onDrop: async ([file]) => {
      if (file) {
        setDataUrl(await readAsDataUrl(file));
      }
    },
  });

  return (
    <Section
      id="use-file-drop"
      title="useFileDrop"
      description="Handles drag-and-drop file input — pairs with useFileToDataUrl to cover an upload area end to end. isDragging is tracked with an enter/leave counter so it doesn't flicker as the pointer crosses child elements."
      code={code}
    >
      <div
        ref={dropRef}
        className="demo-box"
        style={isDragging ? { outline: '2px dashed var(--primary)' } : {}}
      >
        {isDragging ? 'Drop it!' : 'Drag an image file here'}
      </div>
      <div className="demo-output">
        {dataUrl && (
          <img
            src={dataUrl}
            alt="preview"
            style={{ maxWidth: 160, marginTop: 8 }}
          />
        )}
      </div>
    </Section>
  );
};

export default FileDropDemo;
