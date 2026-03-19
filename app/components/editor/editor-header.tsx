import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';

export function EditorHeader() {
  return (
    <header className="bg-background flex h-[3.4rem] items-center justify-between px-3 pt-0.5">
      <div className="flex items-center gap-1">
        <EditableProjectName />
      </div>
      <nav className="flex items-center gap-2">
        <ExportButton />
        <ThemeToggle />
      </nav>
    </header>
  );
}

function EditableProjectName() {
  return <div>New Project</div>;
}

function ExportButton() {
  return <Button size="lg">Export</Button>;
}
