import { IDBFactory } from 'fake-indexeddb';
import { IndexedDBAdapter } from './indexeddb-adapter';

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('IndexedDBAdapter', () => {
  describe('set / get', () => {
    it('値を保存して取得できる', async () => {
      const adapter = new IndexedDBAdapter<string>('test-db', 'test-store');
      await adapter.set('key1', 'value1');
      expect(await adapter.get('key1')).toBe('value1');
    });

    it('存在しないキーで null を返す', async () => {
      const adapter = new IndexedDBAdapter<string>('test-db', 'test-store');
      expect(await adapter.get('nonexistent')).toBeNull();
    });

    it('既存キーの値を上書きする', async () => {
      const adapter = new IndexedDBAdapter<string>('test-db', 'test-store');
      await adapter.set('key1', 'value1');
      await adapter.set('key1', 'updated');
      expect(await adapter.get('key1')).toBe('updated');
    });

    it('ネストしたオブジェクトを保存・取得できる', async () => {
      const adapter = new IndexedDBAdapter<{ nested: { value: number } }>(
        'test-db',
        'test-store',
      );
      const data = { nested: { value: 42 } };
      await adapter.set('key1', data);
      expect(await adapter.get('key1')).toEqual(data);
    });
  });

  describe('remove', () => {
    it('既存キーを削除する', async () => {
      const adapter = new IndexedDBAdapter<string>('test-db', 'test-store');
      await adapter.set('key1', 'value1');
      await adapter.remove('key1');
      expect(await adapter.get('key1')).toBeNull();
    });

    it('存在しないキーの削除でもエラーにならない', async () => {
      const adapter = new IndexedDBAdapter<string>('test-db', 'test-store');
      await expect(adapter.remove('nonexistent')).resolves.toBeUndefined();
    });
  });

  describe('list', () => {
    it('データがない場合は空配列を返す', async () => {
      const adapter = new IndexedDBAdapter<string>('test-db', 'test-store');
      expect(await adapter.list()).toEqual([]);
    });

    it('保存済みキーの一覧を返す', async () => {
      const adapter = new IndexedDBAdapter<string>('test-db', 'test-store');
      await adapter.set('key1', 'v1');
      await adapter.set('key2', 'v2');
      const keys = await adapter.list();
      expect(keys).toHaveLength(2);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });
  });

  describe('getAll', () => {
    it('データがない場合は空配列を返す', async () => {
      const adapter = new IndexedDBAdapter<string>('test-db', 'test-store');
      expect(await adapter.getAll()).toEqual([]);
    });

    it('保存済みの全値を返す', async () => {
      const adapter = new IndexedDBAdapter<string>('test-db', 'test-store');
      await adapter.set('key1', 'v1');
      await adapter.set('key2', 'v2');
      const values = await adapter.getAll();
      expect(values).toHaveLength(2);
      expect(values).toContain('v1');
      expect(values).toContain('v2');
    });
  });

  describe('clear', () => {
    it('全エントリを削除する', async () => {
      const adapter = new IndexedDBAdapter<string>('test-db', 'test-store');
      await adapter.set('key1', 'v1');
      await adapter.set('key2', 'v2');
      await adapter.clear();
      expect(await adapter.list()).toEqual([]);
      expect(await adapter.getAll()).toEqual([]);
    });

    it('空のストアでもエラーにならない', async () => {
      const adapter = new IndexedDBAdapter<string>('test-db', 'test-store');
      await expect(adapter.clear()).resolves.toBeUndefined();
    });
  });

  describe('isSupported', () => {
    it('window.indexedDB が存在する場合 true を返す', () => {
      expect(IndexedDBAdapter.isSupported()).toBe(true);
    });

    it('window.indexedDB が存在しない場合 false を返す', () => {
      const original = globalThis.indexedDB;
      // @ts-expect-error -- テスト用に一時的に削除
      delete globalThis.indexedDB;
      try {
        expect(IndexedDBAdapter.isSupported()).toBe(false);
      } finally {
        globalThis.indexedDB = original;
      }
    });
  });
});
