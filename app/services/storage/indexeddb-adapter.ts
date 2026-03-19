import type { StorageAdapter } from './types';

/**
 * IndexedDBを使用したストレージアダプター
 */
export class IndexedDBAdapter<T> implements StorageAdapter<T> {
  /** IndexedDBのデータベース名 */
  private dbName: string;
  /** IndexedDBのオブジェクトストア名 */
  private storeName: string;
  /** バージョン番号 */
  private version: number;

  /**
   * コンストラクタ
   * @param dbName データベース名
   * @param storeName オブジェクトストア名
   * @param version バージョン番号 デフォルトは1
   */
  constructor(dbName: string, storeName: string, version = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
  }

  /**
   * IndexedDBのデータベースを取得する
   * @return データベースのインスタンス
   */
  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  /**
   * 指定したキーに対応する値を取得する
   * @param key - 取得するデータのキー
   * @returns 値が存在する場合はその値、存在しない場合はnull
   */
  async get(key: string): Promise<T | null> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result ?? null);
    });
  }

  /**
   * 指定したキーに値を保存する
   * @param key - 保存するデータのキー
   * @param value - 保存する値
   */
  async set(key: string, value: T): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.put(value, key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * 指定したキーのデータを削除する
   * @param key - 削除するデータのキー
   */
  async remove(key: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * 保存されているすべてのキーを取得する
   * @returns キーの配列
   */
  async list(): Promise<string[]> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string[]);
    });
  }

  /**
   * 保存されているすべての値を取得する
   * @return 値の配列
   */
  async getAll(): Promise<T[]> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  }

  /**
   * すべてのデータを削除する
   */
  async clear(): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /** IndexedDBがサポートされているか */
  static isSupported(): boolean {
    return 'indexedDB' in window;
  }
}
