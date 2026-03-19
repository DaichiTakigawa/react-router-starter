import { ensureMainScene, getMainScene } from '@/lib/scenes';
import { ensureMainTrack } from '@/lib/tracks';
import type { Scene, TimelineTrack } from '@/types/timeline';
import type { EditorCore } from '..';
import { BaseManager } from './base-manager';

export class SceneManager extends BaseManager {
  private active: Scene | null = null;
  private list: Scene[] = [];

  constructor(private editor: EditorCore) {
    super();
  }

  initializeScenes({
    scenes,
    currentSceneId,
  }: {
    scenes: Scene[];
    currentSceneId?: string;
  }): void {
    const ensuredScenes = ensureMainScene({ scenes });
    const { scenes: scenesWithMainTracks, hasAddedMainTrack } =
      this.ensureScenesHaveMainTrack({ scenes: ensuredScenes });
    const currentScene = currentSceneId
      ? scenesWithMainTracks.find((s) => s.id === currentSceneId)
      : null;

    const fallbackScene = getMainScene({ scenes: scenesWithMainTracks });

    this.list = scenesWithMainTracks;
    this.active = currentScene || fallbackScene;
    this.notify();

    const hasAddedMainScene = ensuredScenes.length > scenes.length;
    if (hasAddedMainScene || hasAddedMainTrack) {
      const activeProject = this.editor.project.getActive();

      if (activeProject) {
        const updatedProject = {
          ...activeProject,
          scenes: scenesWithMainTracks,
          metadata: {
            ...activeProject.metadata,
            updatedAt: new Date(),
          },
        };

        this.editor.project.setActiveProject({ project: updatedProject });
        this.editor.save.markDirty({ force: true });
      }
    }
  }

  getActiveScene(): Scene {
    if (!this.active) {
      throw new Error('No active scene.');
    }
    return this.active;
  }

  getScenes(): Scene[] {
    return this.list;
  }

  clearScenes(): void {
    this.list = [];
    this.active = null;
    this.notify();
  }

  updateSceneTracks({ tracks }: { tracks: TimelineTrack[] }): void {
    if (!this.active) return;

    const updatedScene: Scene = {
      ...this.active,
      tracks,
      updatedAt: new Date(),
    };

    this.list = this.list.map((s) =>
      s.id === this.active?.id ? updatedScene : s,
    );
    this.active = updatedScene;
    this.notify();

    const activeProject = this.editor.project.getActive();
    if (activeProject) {
      const updatedProject = {
        ...activeProject,
        scenes: this.list,
        metadata: {
          ...activeProject.metadata,
          updatedAt: new Date(),
        },
      };
      this.editor.project.setActiveProject({ project: updatedProject });
    }
  }

  private ensureScenesHaveMainTrack({ scenes }: { scenes: Scene[] }): {
    scenes: Scene[];
    hasAddedMainTrack: boolean;
  } {
    let hasAddedMainTrack = false;
    const ensuredScenes: Scene[] = [];

    for (const scene of scenes) {
      const existingTracks = scene.tracks ?? [];
      const updatedTracks = ensureMainTrack({ tracks: existingTracks });
      if (updatedTracks !== existingTracks) {
        hasAddedMainTrack = true;
        ensuredScenes.push({
          ...scene,
          tracks: updatedTracks,
          updatedAt: new Date(),
        });
      } else {
        ensuredScenes.push(scene);
      }
    }

    return { scenes: ensuredScenes, hasAddedMainTrack };
  }
}
