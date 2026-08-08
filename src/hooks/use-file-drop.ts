import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  onDrop?: (files: File[]) => void;
  // Comma-separated list, same format as the native <input accept>
  // attribute: extensions ('.png'), MIME types ('image/png'), or
  // wildcard subtypes ('image/*'). Unset accepts everything.
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}

const matchesAccept = (file: File, accept?: string): boolean => {
  if (!accept) {
    return true;
  }

  const patterns = accept
    .split(',')
    .map(pattern => pattern.trim())
    .filter(Boolean);

  if (patterns.length === 0) {
    return true;
  }

  return patterns.some(pattern => {
    if (pattern.startsWith('.')) {
      return file.name.toLowerCase().endsWith(pattern.toLowerCase());
    }

    if (pattern.endsWith('/*')) {
      return file.type.startsWith(pattern.slice(0, -1));
    }

    return file.type === pattern;
  });
};

// Pairs with useFileToDataUrl to cover a drag-and-drop upload area
// end to end: this gets from "user dropped something" to a filtered
// File[], useFileToDataUrl takes it from there to a data URL.
const useFileDrop = <T extends HTMLElement = HTMLElement>(
  options: Options = {},
) => {
  const { onDrop, accept, multiple = true, disabled = false } = options;

  const [isDragging, setIsDragging] = useState(false);
  // `dragleave` also fires when the pointer moves onto a child element
  // (which re-fires `dragenter` on the way back out), not just when it
  // truly leaves the drop target — an enter/leave counter (rather than a
  // plain boolean) is what avoids `isDragging` flickering off and back on
  // as the pointer crosses child element boundaries.
  const dragCounterRef = useRef(0);

  const onDropRef = useRef(onDrop);
  const acceptRef = useRef(accept);
  const multipleRef = useRef(multiple);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    onDropRef.current = onDrop;
    acceptRef.current = accept;
    multipleRef.current = multiple;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (disabled) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  }, [disabled]);

  const cleanupRef = useRef<(() => void) | null>(null);

  const dropRef = useCallback((node: T | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;

    if (!node) {
      return;
    }

    const onDragEnter = (event: DragEvent) => {
      if (disabledRef.current) {
        return;
      }
      event.preventDefault();
      dragCounterRef.current += 1;
      if (dragCounterRef.current === 1) {
        setIsDragging(true);
      }
    };

    const onDragLeave = (event: DragEvent) => {
      if (disabledRef.current) {
        return;
      }
      event.preventDefault();
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    };

    // `preventDefault` here is what tells the browser this is a valid
    // drop target at all — without it, `drop` never fires.
    const onDragOver = (event: DragEvent) => {
      if (disabledRef.current) {
        return;
      }
      event.preventDefault();
    };

    const onDrop = (event: DragEvent) => {
      if (disabledRef.current) {
        return;
      }
      event.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);

      const fileList = event.dataTransfer?.files;

      if (!fileList || fileList.length === 0) {
        return;
      }

      let files = Array.from(fileList).filter(file =>
        matchesAccept(file, acceptRef.current),
      );

      if (!multipleRef.current) {
        files = files.slice(0, 1);
      }

      if (files.length > 0) {
        onDropRef.current?.(files);
      }
    };

    node.addEventListener('dragenter', onDragEnter);
    node.addEventListener('dragleave', onDragLeave);
    node.addEventListener('dragover', onDragOver);
    node.addEventListener('drop', onDrop);

    cleanupRef.current = () => {
      node.removeEventListener('dragenter', onDragEnter);
      node.removeEventListener('dragleave', onDragLeave);
      node.removeEventListener('dragover', onDragOver);
      node.removeEventListener('drop', onDrop);
      dragCounterRef.current = 0;
    };
  }, []);

  return { dropRef, isDragging };
};

export default useFileDrop;
