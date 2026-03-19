import * as React from 'react';
import { ProjectsHeader } from '@/components/projects/projects-header';
import { ProjectsLayout } from '@/components/projects/projects-layout';
import { useEditor } from '@/hooks/use-editor';

export default function Home() {
  const editor = useEditor();

  React.useEffect(() => {
    if (!editor.project.getIsInitialized()) {
      // TODO: 本当にこのやり方がベストか調べる
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      editor.project.loadAllProjects();
    }
  }, [editor.project]);

  return (
    <div className="bg-background flex h-screen w-screen flex-col overflow-hidden">
      <ProjectsHeader />
      <div className="min-h-0 min-w-0 flex-1">
        <ProjectsLayout />
      </div>
    </div>
  );
}
