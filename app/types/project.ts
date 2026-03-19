import type { Scene } from './timeline';

/**
 * キャンバスサイズ
 */
export interface CanvasSize {
  /** 幅（ピクセル） */
  width: number;
  /** 高さ（ピクセル） */
  height: number;
}

/**
 * プロジェクトのメタデータ
 */
export interface ProjectMetadata {
  /** プロジェクトID */
  id: string;
  /** プロジェクト名 */
  name: string;
  /** サムネイル画像のURL */
  thumbnail?: string;
  /** プロジェクトの総再生時間（秒） */
  duration: number;
  /** 作成日時 */
  createdAt: Date;
  /** 最終更新日時 */
  updatedAt: Date;
}

/**
 * プロジェクトの設定
 */
export interface ProjectSettings {
  /** フレームレート（fps） */
  fps: number;
  /** 現在のキャンバスサイズ */
  canvasSize: CanvasSize;
  /** 元のキャンバスサイズ（リサイズ前の値を保持） */
  originalCanvasSize?: CanvasSize | null;
}

/**
 * タイムラインの表示状態
 */
export interface TimelineViewState {
  /** ズームレベル */
  zoomLevel: number;
  /** 水平スクロール位置（ピクセル） */
  scrollLeft: number;
  /** 再生ヘッドの位置（秒） */
  playheadTime: number;
}

/**
 * プロジェクトデータ
 */
export interface Project {
  /** プロジェクトのメタデータ */
  metadata: ProjectMetadata;
  /** シーンの配列 */
  scenes: Scene[];
  /** 現在選択中のシーンID */
  currentSceneId: string;
  /** プロジェクト設定 */
  settings: ProjectSettings;
  /** データフォーマットのバージョン */
  version: number;
  /** タイムラインの表示状態 */
  timelineViewState?: TimelineViewState;
}
