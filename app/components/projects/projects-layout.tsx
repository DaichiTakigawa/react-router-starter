import * as React from 'react';
import { Calendar04Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link } from 'react-router';
import { useEditor } from '@/hooks/use-editor';
import type { ProjectMetadata } from '@/types/project';
import { formatDate } from '@/utils/date';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

function ProjectsSkeleton() {
  const skeletonIds = React.useMemo(
    () => Array.from({ length: 24 }, (_, index) => `skeleton-${index}`),
    [],
  );

  return (
    <div className="xs:grid-cols-2 grid grid-cols-1 gap-6 px-4 sm:grid-cols-3 lg:grid-cols-4">
      {skeletonIds.map((skeletonId) => (
        <Card
          key={skeletonId}
          className="bg-background overflow-hidden border-none p-0"
        >
          <div className="bg-muted relative aspect-video">
            <div className="absolute inset-0">
              <Skeleton className="bg-muted/50 size-full" />
            </div>
          </div>
          <CardContent className="flex flex-col gap-2 px-0 pt-4">
            <Skeleton className="bg-muted/50 h-4 w-3/4" />
            <div className="text-muted-foreground flex items-center gap-1.5">
              <Skeleton className="bg-muted/50 size-4" />
              <Skeleton className="bg-muted/50 h-4 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="text-xl">No projects found.</div>
      <div className="text-sm font-light">
        Create a new project to get started.
      </div>
    </div>
  );
}

function ProjectItem({
  project,
  allProjectIds: _allProjectIds,
}: {
  project: ProjectMetadata;
  allProjectIds: string[];
}) {
  return (
    <Card className="bg-background cursor-pointer overflow-hidden border-none p-0">
      <Link to={`/editor/${project.id}`}>
        <div className="bg-muted relative aspect-video">
          <div className="absolute inset-0">
            <Skeleton className="bg-muted/50 size-full" />
          </div>
        </div>
        <CardContent className="flex flex-col gap-2 px-1 pt-2 pb-1">
          <h3 className="group-hover:text-foreground/90 line-clamp-2 text-sm leading-snug font-medium">
            {project.name}
          </h3>
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <HugeiconsIcon icon={Calendar04Icon} className="size-4" />
            <span>Created {formatDate({ date: project.createdAt })}</span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

export function ProjectsLayout() {
  const editor = useEditor();

  const isLoading = editor.project.getIsLoading();
  const isInitialized = editor.project.getIsInitialized();
  const projects = editor.project.getSavedProjects();

  return (
    <main className="mx-auto flex h-full flex-col gap-4 px-4 pt-2 pb-6">
      {isLoading || !isInitialized ? (
        <ProjectsSkeleton />
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="xs:grid-cols-2 grid grid-cols-1 gap-6 px-4 sm:grid-cols-3 lg:grid-cols-4">
          {projects.map((project) => (
            <ProjectItem
              key={project.id}
              project={project}
              allProjectIds={projects.map((p) => p.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
