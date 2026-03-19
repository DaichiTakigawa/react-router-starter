import * as React from 'react';
import { EditorCore } from '@/core';

export function useEditor(): EditorCore {
  const editor = React.useMemo(() => EditorCore.getInstance(), []);
  const versionRef = React.useRef(0);

  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const handleStoreChange = () => {
        versionRef.current += 1;
        onStoreChange();
      };

      const cleanups = [
        editor.project.addListener(handleStoreChange),
        editor.scene.addListener(handleStoreChange),
        editor.media.addListener(handleStoreChange),
        editor.timeline.addListener(handleStoreChange),
      ];

      return () => {
        for (const cleanup of cleanups) {
          cleanup();
        }
      };
    },
    [editor],
  );

  const getSnapshot = React.useCallback(() => versionRef.current, []);

  React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return editor;
}
