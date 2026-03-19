import type { StorageAdapter } from './types';

/**
 * File System Access APIを使用したストレージアダプター
 */
export class OPFSAdapter implements StorageAdapter<File> {
  private directoryName: string;

  /**
   * コンストラクタ
   * @param directoryName メディアアセットを保存するディレクトリの名前 デフォルトは'media'
   */
  constructor(directoryName = 'media') {
    this.directoryName = directoryName;
  }

  /**
   * 指定したディレクトリを取得する
   * @return ディレクトリのハンドル
   */
  private async getDirectory(): Promise<FileSystemDirectoryHandle> {
    const opfsRoot = await navigator.storage.getDirectory();
    return await opfsRoot.getDirectoryHandle(this.directoryName, {
      create: true,
    });
  }

  /**
   * 指定したキーに対応する値を取得する
   * @param key - 取得するデータのキー
   * @returns 値が存在する場合はその値、存在しない場合はnull
   */
  async get(key: string): Promise<File | null> {
    try {
      const directory = await this.getDirectory();
      const fileHandle = await directory.getFileHandle(key);
      return await fileHandle.getFile();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        return null;
      }
      throw error;
    }
  }

  /**
   * 指定したキーに値を保存する
   * @param key - 保存するデータのキー
   * @param value - 保存する値
   */
  async set(key: string, value: File): Promise<void> {
    const directory = await this.getDirectory();
    const fileHandle = await directory.getFileHandle(key, { create: true });
    const writable = await fileHandle.createWritable();

    await writable.write(value);
    await writable.close();
  }

  /**
   * 指定したキーのデータを削除する
   * @param key - 削除するデータのキー
   */
  async remove(key: string): Promise<void> {
    try {
      const directory = await this.getDirectory();
      await directory.removeEntry(key);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        return;
      }
      throw error;
    }
  }

  /**
   * 保存されているすべてのキーを取得する
   * @returns キーの配列
   */
  async list(): Promise<string[]> {
    const directory = await this.getDirectory();
    const keys: string[] = [];
    for await (const name of directory.keys()) {
      keys.push(name);
    }
    return keys;
  }

  /**
   * すべてのデータを削除する
   */
  async clear(): Promise<void> {
    const directory = await this.getDirectory();
    for await (const name of directory.keys()) {
      await directory.removeEntry(name);
    }
  }

  /** OPFSがサポートされているか */
  static isSupported(): boolean {
    return 'storage' in navigator && 'getDirectory' in navigator.storage;
  }
}
