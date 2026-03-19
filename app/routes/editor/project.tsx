import { EditorHeader } from '@/components/editor/editor-header';
import { EditorLayout } from '@/components/editor/editor-layout';
import type { Route } from './+types/project';

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const projectId = params.projectId;
  return { projectId };
}

export default function EditorProjectPage({
  loaderData: _loaderData,
}: Route.ComponentProps) {
  return (
    <div className="bg-background flex h-screen w-screen flex-col overflow-hidden">
      <EditorHeader />
      <div className="min-h-0 min-w-0 flex-1">
        <EditorLayout />
      </div>
    </div>
  );
}
