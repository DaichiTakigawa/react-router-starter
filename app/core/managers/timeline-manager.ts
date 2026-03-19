import type { EditorCore } from '@/core';
import { isMainTrack } from '@/lib/tracks';
import type { TimelineTrack } from '@/types/timeline';
import { BaseManager } from './base-manager';

export class TimelineManager extends BaseManager {
  constructor(private editor: EditorCore) {
    super();
  }

  getTracks(): TimelineTrack[] {
    return this.editor.scene.getActiveScene()?.tracks ?? [];
  }

  deleteElements({
    elements,
  }: {
    elements: { trackId: string; elementId: string }[];
  }): void {
    const updatedTracks = this.getTracks()
      .map((track) => {
        const elementsToDeleteOnTrack = elements.filter(
          (target) => target.trackId === track.id,
        );
        const hasElementsToDelete = elementsToDeleteOnTrack.length > 0;

        if (!hasElementsToDelete) {
          return track;
        }

        const updatedElements = track.elements.filter(
          (element) =>
            !elements.some(
              (target) =>
                target.trackId === track.id && target.elementId === element.id,
            ),
        );

        return { ...track, elements: updatedElements } as typeof track;
      })
      .filter((track) => track.elements.length > 0 || isMainTrack(track));

    this.updateTracks(updatedTracks);
  }

  updateTracks(newTracks: TimelineTrack[]): void {
    this.editor.scene.updateSceneTracks({ tracks: newTracks });
    this.notify();
  }
}
