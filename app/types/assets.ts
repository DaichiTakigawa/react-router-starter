/** メディアタイプ */
export type MediaType = 'image' | 'video' | 'audio';

/**
 * メディアアセットのメタデータ
 */
export interface MediaAssetData {
  /** メディアアセットID */
  id: string;
  /** メディアアセットのファイル名 */
  name: string;
  /** メディアアセットのタイプ */
  type: MediaType;
  /** メディアアセットのファイルサイズ（バイト） */
  size: number;
  /** メディアアセットの最終更新日時（Unixタイムスタンプ） */
  lastModified: number;
  /** メディアアセットの幅（ピクセル） */
  width?: number;
  /** メディアアセットの高さ（ピクセル） */
  height?: number;
  /** メディアアセットの再生時間（秒） */
  duration?: number;
  /** メディアアセットのフレームレート */
  fps?: number;
  /** メディアアセットが一時的なものであるかどうか */
  ephemeral?: boolean;
  /** メディアアセットのサムネイルURL */
  thumbnailUrl?: string;
}

/**
 * メディアアセット
 */
export interface MediaAsset extends Omit<
  MediaAssetData,
  'size' | 'lastModified'
> {
  /** メディアアセットのファイルオブジェクト */
  file: File;
  /** メディアアセットのURL */
  url?: string;
}
