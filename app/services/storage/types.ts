import type { Project, ProjectMetadata } from '@/types/project';
import type { Scene } from '@/types/timeline';

/**
 * ストレージアダプターのインターフェース
 */
export interface StorageAdapter<T> {
  /**
   * 指定したキーに対応する値を取得する
   * @param key - 取得するデータのキー
   * @returns 値が存在する場合はその値、存在しない場合はnull
   */
  get(key: string): Promise<T | null>;
  /**
   * 指定したキーに値を保存する
   * @param key - 保存するデータのキー
   * @param value - 保存する値
   */
  set(key: string, value: T): Promise<void>;
  /**
   * 指定したキーのデータを削除する
   * @param key - 削除するデータのキー
   */
  remove(key: string): Promise<void>;
  /**
   * 保存されているすべてのキーを取得する
   * @returns キーの配列
   */
  list(): Promise<string[]>;
  /**
   * すべてのデータを削除する
   */
  clear(): Promise<void>;
}

/**
 * ストレージの設定
 */
export interface StorageConfig {
  /** プロジェクトデータを保存するIndexedDBの名前 */
  projectDb: string;
  /** メディアアセットのメタデータを保存するIndexedDBの名前 */
  mediaDb: string;
  /** メディアアセットを保存するディレクトリの名前 */
  mediaDirectory: string;
  /** バージョン番号 */
  version: number;
}

/**
 * シリアライズ済みシーンデータ
 */
export type SerializedScene = Omit<Scene, 'createdAt' | 'updatedAt'> & {
  /** 作成日時（ISO文字列） */
  createdAt: string;
  /** 最終更新日時（ISO文字列） */
  updatedAt: string;
};

/**
 * シリアライズ済みプロジェクトのメタデータ
 */
export type SerializedProjectMetadata = Omit<
  ProjectMetadata,
  'createdAt' | 'updatedAt'
> & {
  /** 作成日時（ISO文字列） */
  createdAt: string;
  /** 最終更新日時（ISO文字列） */
  updatedAt: string;
};

/**
 * シリアライズ済みプロジェクトデータ
 */
export type SerializedProject = Omit<Project, 'metadata' | 'scenes'> & {
  /** シリアライズ済みプロジェクトのメタデータ */
  metadata: SerializedProjectMetadata;
  /** シリアライズ済みシーンの配列 */
  scenes: SerializedScene[];
};

// File System Access APIの型定義を拡張
// NOTE: TypeScriptのlib.dom.d.tsでFileSystemDirectoryHandleのkeys(), values(), entries()が定義されていないため拡張。
declare global {
  interface FileSystemDirectoryHandle {
    keys(): AsyncIterableIterator<string>;
    values(): AsyncIterableIterator<FileSystemHandle>;
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  }
}
