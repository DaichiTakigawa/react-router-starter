import type { Scene, TimelineTrack } from '@/types/timeline';
import { generateUUID } from '@/utils/id';
import { ensureMainTrack } from './tracks';

/** シーンの配列からメインシーンを取得する */
export function getMainScene({ scenes }: { scenes: Scene[] }): Scene | null {
  return scenes.find((scene) => scene.isMain) || null;
}

/**
 * シーンの配列にメインシーンが存在するか確認し、存在しない場合はデフォルトのメインシーンを追加する
 */
export function ensureMainScene({ scenes }: { scenes: Scene[] }): Scene[] {
  const hasMain = scenes.some((scene) => scene.isMain);
  if (!hasMain) {
    const mainScene = buildDefaultScene({ name: 'Main scene', isMain: true });
    return [mainScene, ...scenes];
  }
  return scenes;
}

/** デフォルトのシーンを作成する */
export function buildDefaultScene({
  name,
  isMain,
}: {
  name: string;
  isMain: boolean;
}): Scene {
  const tracks = ensureMainTrack({ tracks: [] });
  return {
    id: generateUUID(),
    name,
    isMain,
    tracks,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/** トラックの配列からプロジェクト全体の再生時間を計算する */
export function calculateTotalDuration({
  tracks,
}: {
  tracks: TimelineTrack[];
}): number {
  if (tracks.length === 0) return 0;

  const trackEndTimes = tracks.map((track) =>
    track.elements.reduce((maxEnd, element) => {
      const elementEnd = element.startTime + element.duration;
      return Math.max(maxEnd, elementEnd);
    }, 0),
  );

  return Math.max(...trackEndTimes, 0);
}

/** シーンの配列からプロジェクト全体の再生時間を計算する */
export function getProjectDurationFromScenes({
  scenes,
}: {
  scenes: Scene[];
}): number {
  const mainScene = getMainScene({ scenes }) ?? scenes[0] ?? null;
  if (!mainScene?.tracks || !Array.isArray(mainScene.tracks)) {
    return 0;
  }

  return calculateTotalDuration({ tracks: mainScene.tracks });
}
