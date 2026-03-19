import type { EditorCore } from '..';
import { BaseManager } from './base-manager';

type SaveManagerOptions = {
  debounceMs?: number;
};

export class SaveManager extends BaseManager {
  private debounceMs: number;
  private isPaused = false;
  private isSaving = false;
  private hasPendingSave = false;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private cleanupHandlers: Array<() => void> = [];

  constructor(
    private editor: EditorCore,
    { debounceMs = 800 }: SaveManagerOptions = {},
  ) {
    super();
    this.debounceMs = debounceMs;
  }

  start(): void {
    if (this.cleanupHandlers.length > 0) return;

    this.cleanupHandlers = [
      this.editor.scene.addListener(() => {
        this.markDirty();
      }),
      this.editor.timeline.addListener(() => {
        this.markDirty();
      }),
    ];
  }

  stop(): void {
    for (const cleanup of this.cleanupHandlers) {
      cleanup();
    }
    this.cleanupHandlers = [];
    this.clearTimer();
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    if (this.hasPendingSave) {
      this.queueSave();
    }
  }

  markDirty({ force = false }: { force?: boolean } = {}): void {
    if (this.isPaused && !force) return;
    this.hasPendingSave = true;
    this.queueSave();
  }

  async flush(): Promise<void> {
    this.hasPendingSave = true;
    await this.saveNow();
  }

  getIsDirty(): boolean {
    return this.hasPendingSave || this.isSaving;
  }

  private queueSave(): void {
    if (this.isSaving) return;
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    this.saveTimer = setTimeout(() => {
      void this.saveNow();
    }, this.debounceMs);
  }

  private async saveNow(): Promise<void> {
    if (this.isSaving) return;
    if (!this.hasPendingSave) return;

    const activeProject = this.editor.project.getActive();
    if (!activeProject) return;
    if (this.editor.project.getIsLoading()) return;

    this.isSaving = true;
    this.hasPendingSave = false;
    this.clearTimer();

    try {
      await this.editor.project.saveCurrentProject();
    } finally {
      this.isSaving = false;
      if (this.hasPendingSave) {
        this.queueSave();
      }
    }
  }

  private clearTimer(): void {
    if (!this.saveTimer) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = null;
  }
}
