import { useState } from 'react';

import { useFileDrop, useFileToDataUrl } from '../../../src/hooks';
import Section from './section';

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
    <Section description="Handles drag-and-drop file input — pairs with useFileToDataUrl to cover an upload area end to end. isDragging is tracked with an enter/leave counter so it doesn't flicker as the pointer crosses child elements.">
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
