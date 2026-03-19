import { useNavigate } from 'react-router';
import { useEditor } from '@/hooks/use-editor';
import { Button } from '../ui/button';

function NewProjectButton() {
  const editor = useEditor();
  const navigate = useNavigate();

  const handleCreateProject = async () => {
    const projectId = await editor.project.createNewProject({
      name: 'New project',
    });
    // TODO: これも本当にこのやり方がベストか調べる
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigate(`/editor/${projectId}`);
  };

  const isLoading = editor.project.getIsLoading();

  return (
    <Button
      variant={isLoading ? 'skeleton' : 'default'}
      size="xl"
      className="flex"
      onClick={handleCreateProject}
      disabled={isLoading}
    >
      <span className="hidden text-sm font-medium md:block">New project</span>
      <span className="block text-sm font-medium md:hidden">New</span>
    </Button>
  );
}

export function ProjectsHeader() {
  return (
    <header className="bg-background sticky top-0 z-20 flex flex-col gap-2 px-8">
      <div className="flex h-16 items-center justify-between pt-2">
        <div className="flex items-center gap-5">
          <div>Projects</div>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <NewProjectButton />
        </div>
      </div>
    </header>
  );
}
