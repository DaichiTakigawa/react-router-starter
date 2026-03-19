import { toast } from 'sonner';
import {
  DEFAULT_CANVAS_SIZE,
  DEFAULT_FPS,
} from '@/constants/project-constants';
import { buildDefaultScene, getProjectDurationFromScenes } from '@/lib/scenes';
import { CURRENT_PROJECT_VERSION } from '@/services/storage/migrations';
import { storageService } from '@/services/storage/service';
import type { Project, ProjectMetadata } from '@/types/project';
import { generateUUID } from '@/utils/id';
import type { EditorCore } from '..';
import { BaseManager } from './base-manager';

export class ProjectManager extends BaseManager {
  private active: Project | null = null;
  private savedProjects: ProjectMetadata[] = [];
  private isInitialized = false;
  private isLoading = false;

  constructor(private editor: EditorCore) {
    super();
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  getSavedProjects(): ProjectMetadata[] {
    return this.savedProjects;
  }

  async createNewProject({ name }: { name: string }): Promise<string> {
    const mainScene = buildDefaultScene({ name: 'Main scene', isMain: true });
    const newProject: Project = {
      metadata: {
        id: generateUUID(),
        name,
        duration: getProjectDurationFromScenes({ scenes: [mainScene] }),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      scenes: [mainScene],
      currentSceneId: mainScene.id,
      settings: {
        fps: DEFAULT_FPS,
        canvasSize: DEFAULT_CANVAS_SIZE,
        originalCanvasSize: null,
      },
      version: CURRENT_PROJECT_VERSION,
    };

    this.active = newProject;
    this.notify();

    this.editor.media.clearAllAssets();
    this.editor.scene.initializeScenes({
      scenes: newProject.scenes,
      currentSceneId: newProject.currentSceneId,
    });

    try {
      await storageService.saveProject({ project: newProject });
      this.updateMetadata(newProject);

      return newProject.metadata.id;
    } catch (error) {
      toast.error('Failed to save new project');
      throw error;
    }
  }

  async loadProject({ id }: { id: string }): Promise<void> {
    if (!this.isInitialized) {
      this.isLoading = true;
      this.notify();
    }

    this.editor.save.pause();
    this.editor.media.clearAllAssets();
    this.editor.scene.clearScenes();

    try {
      const result = await storageService.loadProject({ id });
      if (!result) {
        throw new Error(`Project with id ${id} not found`);
      }

      const project = result.project;

      this.active = project;
      this.notify();

      if (project.scenes && project.scenes.length > 0) {
        this.editor.scene.initializeScenes({
          scenes: project.scenes,
          currentSceneId: project.currentSceneId,
        });
      }

      await this.editor.media.loadProjectMedia({ projectId: id });
    } catch (error) {
      console.error('Failed to load project:', error);
      throw error;
    } finally {
      this.isLoading = false;
      this.notify();
      this.editor.save.resume();
    }
  }

  async saveCurrentProject(): Promise<void> {
    if (!this.active) return;

    try {
      const scenes = this.editor.scene.getScenes();
      const updatedProject = {
        ...this.active,
        scenes,
        metadata: {
          ...this.active.metadata,
          duration: getProjectDurationFromScenes({ scenes }),
          updatedAt: new Date(),
        },
      };

      await storageService.saveProject({ project: updatedProject });
      this.active = updatedProject;
      this.updateMetadata(updatedProject);
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  }

  async loadAllProjects(): Promise<void> {
    if (!this.isInitialized) {
      this.isLoading = true;
      this.notify();
    }

    try {
      const metadata = await storageService.loadAllProjectsMetadata();
      this.savedProjects = metadata;
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      this.isLoading = false;
      this.isInitialized = true;
      this.notify();
    }
  }

  async deleteProjects({ ids }: { ids: string[] }): Promise<void> {
    const uniqueIds = Array.from(new Set(ids));
    if (uniqueIds.length === 0) return;

    try {
      await Promise.all(
        uniqueIds.map((id) =>
          Promise.all([
            storageService.deleteProjectMedia({ projectId: id }),
            storageService.deleteProject({ id }),
          ]),
        ),
      );

      const idSet = new Set(uniqueIds);
      this.savedProjects = this.savedProjects.filter(
        (project) => !idSet.has(project.id),
      );

      const shouldClearActive =
        this.active && idSet.has(this.active.metadata.id);

      if (shouldClearActive) {
        this.active = null;
        this.editor.media.clearAllAssets();
        this.editor.scene.clearScenes();
      }

      this.notify();
    } catch (error) {
      console.error('Failed to delete projects:', error);
    }
  }

  closeProject(): void {
    this.active = null;
    this.notify();

    this.editor.media.clearAllAssets();
    this.editor.scene.clearScenes();
  }

  async renameProject({
    id,
    name,
  }: {
    id: string;
    name: string;
  }): Promise<void> {
    try {
      const result = await storageService.loadProject({ id });
      if (!result) {
        toast.error('Project not found', {
          description: 'Please try again',
        });
        return;
      }

      const updatedProject: Project = {
        ...result.project,
        metadata: {
          ...result.project.metadata,
          name,
          updatedAt: new Date(),
        },
      };

      await storageService.saveProject({ project: updatedProject });

      if (this.active?.metadata.id === id) {
        this.active = updatedProject;
        this.notify();
      }

      this.updateMetadata(updatedProject);
    } catch (error) {
      console.error('Failed to rename project:', error);
      toast.error('Failed to rename project', {
        description:
          error instanceof Error ? error.message : 'Please try again',
      });
    }
  }

  getActive(): Project {
    if (!this.active) {
      throw new Error('No active project');
    }
    return this.active;
  }

  setActiveProject({ project }: { project: Project }): void {
    this.active = project;
    this.notify();
  }

  /**
   * for agents:
   * in most cases, the project is guaranteed to be active, in which getActive() should be used instead.
   * for very rare cases, this function may be used.
   */
  getActiveOrNull(): Project | null {
    return this.active;
  }

  private updateMetadata(project: Project): void {
    const index = this.savedProjects.findIndex(
      (p) => p.id === project.metadata.id,
    );

    if (index !== -1) {
      this.savedProjects[index] = project.metadata;
    } else {
      this.savedProjects = [project.metadata, ...this.savedProjects];
    }

    this.notify();
  }
}
