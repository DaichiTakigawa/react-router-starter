import { OPFSAdapter } from './opfs-adapter';

// --- OPFS モックヘルパー ---

function createMockDirectoryHandle() {
  const files = new Map<string, File>();

  const handle = {
    getFileHandle: vi.fn((name: string, options?: FileSystemGetFileOptions) => {
      if (options?.create && !files.has(name)) {
        files.set(name, new File([], name));
      }
      if (!files.has(name)) {
        throw new DOMException('Not found', 'NotFoundError');
      }
      return Promise.resolve({
        getFile: () => Promise.resolve(files.get(name)!),
        createWritable: () =>
          Promise.resolve({
            write: (data: File) => {
              files.set(name, data);
              return Promise.resolve();
            },
            close: () => Promise.resolve(),
          }),
      });
    }),
    removeEntry: vi.fn((name: string) => {
      if (!files.has(name)) {
        throw new DOMException('Not found', 'NotFoundError');
      }
      files.delete(name);
      return Promise.resolve();
    }),
    keys: vi.fn(function* () {
      yield* files.keys();
    }),
  } as unknown as FileSystemDirectoryHandle;

  return { handle: handle as FileSystemDirectoryHandle, files };
}

let mockSubDirectory: ReturnType<typeof createMockDirectoryHandle>;

beforeEach(() => {
  mockSubDirectory = createMockDirectoryHandle();

  const mockRootHandle = {
    getDirectoryHandle: vi.fn(() => Promise.resolve(mockSubDirectory.handle)),
  } as unknown as FileSystemDirectoryHandle;

  Object.defineProperty(navigator, 'storage', {
    value: {
      getDirectory: vi.fn(() => Promise.resolve(mockRootHandle)),
    },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('OPFSAdapter', () => {
  describe('set / get', () => {
    it('File を保存して取得できる', async () => {
      const adapter = new OPFSAdapter('test-dir');
      const file = new File(['hello'], 'test.txt', { type: 'text/plain' });
      await adapter.set('file1', file);
      const result = await adapter.get('file1');
      expect(result).not.toBeNull();
      expect(await result!.text()).toBe('hello');
    });

    it('存在しないキーで null を返す', async () => {
      const adapter = new OPFSAdapter('test-dir');
      expect(await adapter.get('nonexistent')).toBeNull();
    });

    it('既存ファイルを上書きする', async () => {
      const adapter = new OPFSAdapter('test-dir');
      await adapter.set('file1', new File(['old'], 'f.txt'));
      await adapter.set('file1', new File(['new'], 'f.txt'));
      const result = await adapter.get('file1');
      expect(await result!.text()).toBe('new');
    });

    it('NotFoundError 以外の DOMException は re-throw する', async () => {
      const adapter = new OPFSAdapter('test-dir');
      vi.mocked(mockSubDirectory.handle.getFileHandle).mockRejectedValueOnce(
        new DOMException('Security error', 'SecurityError'),
      );
      await expect(adapter.get('file1')).rejects.toThrow('Security error');
    });

    it('DOMException 以外のエラーは re-throw する', async () => {
      const adapter = new OPFSAdapter('test-dir');
      vi.mocked(mockSubDirectory.handle.getFileHandle).mockRejectedValueOnce(
        new Error('unexpected'),
      );
      await expect(adapter.get('file1')).rejects.toThrow('unexpected');
    });
  });

  describe('remove', () => {
    it('既存ファイルを削除する', async () => {
      const adapter = new OPFSAdapter('test-dir');
      await adapter.set('file1', new File(['data'], 'f.txt'));
      await adapter.remove('file1');
      expect(await adapter.get('file1')).toBeNull();
    });

    it('存在しないキーの削除は無視する', async () => {
      const adapter = new OPFSAdapter('test-dir');
      await expect(adapter.remove('nonexistent')).resolves.toBeUndefined();
    });

    it('NotFoundError 以外の DOMException は re-throw する', async () => {
      const adapter = new OPFSAdapter('test-dir');
      vi.mocked(mockSubDirectory.handle.removeEntry).mockRejectedValueOnce(
        new DOMException('Security error', 'SecurityError'),
      );
      await expect(adapter.remove('file1')).rejects.toThrow('Security error');
    });
  });

  describe('list', () => {
    it('空ディレクトリで空配列を返す', async () => {
      const adapter = new OPFSAdapter('test-dir');
      expect(await adapter.list()).toEqual([]);
    });

    it('ファイル名の一覧を返す', async () => {
      const adapter = new OPFSAdapter('test-dir');
      await adapter.set('file1', new File(['a'], 'a.txt'));
      await adapter.set('file2', new File(['b'], 'b.txt'));
      const keys = await adapter.list();
      expect(keys).toHaveLength(2);
      expect(keys).toContain('file1');
      expect(keys).toContain('file2');
    });
  });

  describe('clear', () => {
    it('全ファイルを削除する', async () => {
      const adapter = new OPFSAdapter('test-dir');
      await adapter.set('file1', new File(['a'], 'a.txt'));
      await adapter.set('file2', new File(['b'], 'b.txt'));
      await adapter.clear();
      expect(await adapter.list()).toEqual([]);
    });

    it('空ディレクトリでもエラーにならない', async () => {
      const adapter = new OPFSAdapter('test-dir');
      await expect(adapter.clear()).resolves.toBeUndefined();
    });
  });

  describe('isSupported', () => {
    it('storage と getDirectory が存在する場合 true を返す', () => {
      expect(OPFSAdapter.isSupported()).toBe(true);
    });

    it('navigator.storage が存在しない場合 false を返す', () => {
      const descriptor = Object.getOwnPropertyDescriptor(navigator, 'storage');
      // @ts-expect-error -- テスト用に一時的に削除
      delete navigator.storage;
      try {
        expect(OPFSAdapter.isSupported()).toBe(false);
      } finally {
        if (descriptor) {
          Object.defineProperty(navigator, 'storage', descriptor);
        }
      }
    });

    it('getDirectory が存在しない場合 false を返す', () => {
      const original = navigator.storage;
      Object.defineProperty(navigator, 'storage', {
        value: {},
        writable: true,
        configurable: true,
      });
      try {
        expect(OPFSAdapter.isSupported()).toBe(false);
      } finally {
        Object.defineProperty(navigator, 'storage', {
          value: original,
          writable: true,
          configurable: true,
        });
      }
    });
  });
});
