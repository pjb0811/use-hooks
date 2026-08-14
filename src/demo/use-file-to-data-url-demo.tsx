import { useState } from 'react';

import { useFileToDataUrl } from '../hooks';
import Section from './section';

const code = `const readAsDataUrl = useFileToDataUrl();
const dataUrl = await readAsDataUrl(file);`;

const FileToDataUrlDemo = () => {
  const readAsDataUrl = useFileToDataUrl();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <Section
      id="use-file-to-data-url"
      title="useFileToDataUrl"
      description="Reads a File as a data URL via FileReader, wrapped in a Promise-returning function."
      code={code}
    >
      <div className="demo-actions">
        <input
          type="file"
          accept="image/*"
          onChange={async e => {
            const file = e.target.files?.[0];

            if (!file) {
              return;
            }

            try {
              setError(null);
              const url = await readAsDataUrl(file);
              setDataUrl(url);
            } catch (err) {
              setError(
                err instanceof Error ? err.message : 'Failed to read file.',
              );
            }
          }}
        />
      </div>
      <div className="demo-output">
        {error && <span style={{ color: 'red' }}>{error}</span>}
        {dataUrl && (
          <img
            src={dataUrl}
            alt="preview"
            style={{ maxWidth: 160, marginTop: 8 }}
          />
        )}
      </div>
      <p className="demo-hint">
        Pick an image file to see it read as a data URL.
      </p>
    </Section>
  );
};

export default FileToDataUrlDemo;
