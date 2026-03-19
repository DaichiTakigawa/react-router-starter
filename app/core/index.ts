import { MediaManager } from './managers/media-manager';
import { ProjectManager } from './managers/project-manager';
import { SaveManager } from './managers/save-manager';
import { SceneManager } from './managers/scene-manager';
import { TimelineManager } from './managers/timeline-manager';

export class EditorCore {
  private static instance: EditorCore | null = null;

  public readonly project: ProjectManager;
  public readonly scene: SceneManager;
  public readonly media: MediaManager;
  public readonly timeline: TimelineManager;
  public readonly save: SaveManager;

  private constructor() {
    this.project = new ProjectManager(this);
    this.scene = new SceneManager(this);
    this.media = new MediaManager(this);
    this.timeline = new TimelineManager(this);
    this.save = new SaveManager(this);
    this.save.start();
  }

  static getInstance(): EditorCore {
    if (!EditorCore.instance) {
      EditorCore.instance = new EditorCore();
    }
    return EditorCore.instance;
  }

  static reset(): void {
    EditorCore.instance = null;
  }
}
