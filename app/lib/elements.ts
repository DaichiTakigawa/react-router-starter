import type {
  ImageElement,
  TimelineElement,
  VideoElement,
} from '@/types/timeline';

export function hasMediaId(
  element: TimelineElement,
): element is VideoElement | ImageElement {
  return 'mediaId' in element;
}
