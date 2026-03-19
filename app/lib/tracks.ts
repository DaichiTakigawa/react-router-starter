import type { TimelineTrack, VideoTrack } from '@/types/timeline';
import { generateUUID } from '@/utils/id';

/** トラックがメイントラックかどうか判定する */
export function isMainTrack(track: TimelineTrack): track is VideoTrack {
  return track.type === 'video' && track.isMain === true;
}

/**
 * トラックの配列にメイントラックが存在しない場合、デフォルトのメイントラックを追加する
 */
export function ensureMainTrack({
  tracks,
}: {
  tracks: TimelineTrack[];
}): TimelineTrack[] {
  const hasMainTrack = tracks.some((track) => isMainTrack(track));

  if (!hasMainTrack) {
    const mainTrack: TimelineTrack = {
      id: generateUUID(),
      name: 'Main Track',
      type: 'video',
      elements: [],
      muted: false,
      isMain: true,
      hidden: false,
    };
    return [mainTrack, ...tracks];
  }

  return tracks;
}
