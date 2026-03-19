import type { BlendMode, Transform } from './rendering';

/**
 * タイムライン要素の共通プロパティ
 */
interface BaseTimelineElement {
  /** 要素ID */
  id: string;
  /** 要素の表示名 */
  name: string;
  /** タイムライン上の表示時間（秒） */
  duration: number;
  /** タイムライン上の開始時間（秒） */
  startTime: number;
  /** ソースメディアの先頭からのトリム量（秒） */
  trimStart: number;
  /** ソースメディアの末尾からのトリム量（秒） */
  trimEnd: number;
  /** ソースメディアの元の再生時間（秒） */
  sourceDuration?: number;
}

/**
 * 動画タイムライン要素
 */
export interface VideoElement extends BaseTimelineElement {
  /** 要素タイプ */
  type: 'video';
  /** 参照するメディアアセットのID */
  mediaId: string;
  /** 音声をミュートするかどうか */
  muted?: boolean;
  /** 要素を非表示にするかどうか */
  hidden?: boolean;
  /** トランスフォーム情報 */
  transform: Transform;
  /** 不透明度（0.0〜1.0） */
  opacity: number;
  /** ブレンドモード */
  blendMode?: BlendMode;
}

/**
 * 画像タイムライン要素
 */
export interface ImageElement extends BaseTimelineElement {
  /** 要素タイプ */
  type: 'image';
  /** 参照するメディアアセットのID */
  mediaId: string;
  /** 要素を非表示にするかどうか */
  hidden?: boolean;
  /** トランスフォーム情報 */
  transform: Transform;
  /** 不透明度（0.0〜1.0） */
  opacity: number;
  /** ブレンドモード */
  blendMode?: BlendMode;
}

/**
 * テキスト要素の背景設定
 */
export interface TextBackground {
  /** 背景の有効/無効 */
  enabled: boolean;
  /** 背景色（CSS カラー値） */
  color: string;
  /** 角丸の半径（ピクセル） */
  cornerRadius?: number;
  /** 水平方向のパディング（ピクセル） */
  paddingX?: number;
  /** 垂直方向のパディング（ピクセル） */
  paddingY?: number;
  /** 水平方向のオフセット（ピクセル） */
  offsetX?: number;
  /** 垂直方向のオフセット（ピクセル） */
  offsetY?: number;
}

/**
 * テキストタイムライン要素
 */
export interface TextElement extends BaseTimelineElement {
  /** 要素タイプ */
  type: 'text';
  /** テキスト内容 */
  content: string;
  /** フォントサイズ（ピクセル） */
  fontSize: number;
  /** フォントファミリー名 */
  fontFamily: string;
  /** テキスト色（CSS カラー値） */
  color: string;
  /** テキスト背景の設定 */
  background: TextBackground;
  /** テキストの水平揃え */
  textAlign: 'left' | 'center' | 'right';
  /** フォントウェイト */
  fontWeight: 'normal' | 'bold';
  /** フォントスタイル */
  fontStyle: 'normal' | 'italic';
  /** テキストの装飾 */
  textDecoration: 'none' | 'underline' | 'line-through';
  /** 文字間隔（ピクセル） */
  letterSpacing?: number;
  /** 行の高さ（倍率） */
  lineHeight?: number;
  /** 要素を非表示にするかどうか */
  hidden?: boolean;
  /** トランスフォーム情報 */
  transform: Transform;
  /** 不透明度（0.0〜1.0） */
  opacity: number;
  /** ブレンドモード */
  blendMode?: BlendMode;
}

/** タイムライン要素の総称 */
export type TimelineElement = VideoElement | ImageElement | TextElement;

/**
 * トラックの共通プロパティ
 */
interface BaseTrack {
  /** トラックID */
  id: string;
  /** トラックの表示名 */
  name: string;
}

/**
 * 動画・画像トラック
 */
export interface VideoTrack extends BaseTrack {
  /** トラックタイプ */
  type: 'video';
  /** トラック内の動画・画像要素 */
  elements: (VideoElement | ImageElement)[];
  /** メイントラックかどうか */
  isMain: boolean;
  /** トラック全体のミュート状態 */
  muted: boolean;
  /** トラック全体の表示/非表示 */
  hidden: boolean;
}

/**
 * テキストトラック
 */
export interface TextTrack extends BaseTrack {
  /** トラックタイプ */
  type: 'text';
  /** トラック内のテキスト要素 */
  elements: TextElement[];
  /** トラック全体の表示/非表示 */
  hidden: boolean;
}

/** タイムラインのトラック */
export type TimelineTrack = VideoTrack | TextTrack;

/**
 * シーン
 */
export interface Scene {
  /** シーンID */
  id: string;
  /** シーンの表示名 */
  name: string;
  /** メインシーンかどうか */
  isMain: boolean;
  /** シーンに含まれるトラックの配列 */
  tracks: TimelineTrack[];
  /** 作成日時 */
  createdAt: Date;
  /** 最終更新日時 */
  updatedAt: Date;
}
