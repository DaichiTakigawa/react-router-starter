import type { MediaAsset } from '@/types/assets';
import type { Project } from '@/types/project';
import type { SerializedProject } from './types';

// --- vi.hoisted() でモック状態を先に定義（vi.mock ホイスティング対応） ---

const mocks = vi.hoisted(() => {
  const createMockAdapter = () => ({
    get: vi.fn(),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue([]),
    getAll: vi.fn().mockResolvedValue([]),
    clear: vi.fn().mockResolvedValue(undefined),
  });

  return {
    createMockAdapter,
    projectsAdapter: createMockAdapter(),
    mediaMetadataAdapter: createMockAdapter(),
    mediaAssetsAdapter: createMockAdapter(),
  };
});

vi.mock('./indexeddb-adapter', () => {
  class MockIndexedDBAdapter {
    static isSupported = vi.fn().mockReturnValue(true);
    constructor(dbName: string) {
      if (dbName === 'ibiscut-project') return mocks.projectsAdapter;
      return mocks.mediaMetadataAdapter;
    }
  }
  return { IndexedDBAdapter: MockIndexedDBAdapter };
});

vi.mock('./opfs-adapter', () => {
  class MockOPFSAdapter {
    static isSupported = vi.fn().mockReturnValue(true);
    constructor() {
      return mocks.mediaAssetsAdapter;
    }
  }
  return { OPFSAdapter: MockOPFSAdapter };
});

vi.mock('@/lib/scenes', () => ({
  calculateTotalDuration: vi.fn().mockReturnValue(0),
  getProjectDurationFromScenes: vi.fn().mockReturnValue(0),
}));

// storageService は vi.mock() ホイスト後にインポートされる
const { storageService } = await import('./service');
const { getProjectDurationFromScenes, calculateTotalDuration } =
  await import('@/lib/scenes');
const { IndexedDBAdapter } = await import('./indexeddb-adapter');
const { OPFSAdapter } = await import('./opfs-adapter');

// --- テストフィクスチャ ---

const NOW = new Date('2025-01-15T10:00:00.000Z');
const EARLIER = new Date('2025-01-10T10:00:00.000Z');

function createTestProject(overrides?: Partial<Project>): Project {
  return {
    metadata: {
      id: 'project-1',
      name: 'Test Project',
      duration: 30,
      createdAt: NOW,
      updatedAt: NOW,
    },
    scenes: [
      {
        id: 'scene-1',
        name: 'Main Scene',
        isMain: true,
        tracks: [],
        createdAt: NOW,
        updatedAt: NOW,
      },
    ],
    currentSceneId: 'scene-1',
    settings: { fps: 30, canvasSize: { width: 1920, height: 1080 } },
    version: 1,
    ...overrides,
  };
}

function createSerializedProject(
  overrides?: Partial<SerializedProject>,
): SerializedProject {
  return {
    metadata: {
      id: 'project-1',
      name: 'Test Project',
      duration: 30,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    },
    scenes: [
      {
        id: 'scene-1',
        name: 'Main Scene',
        isMain: true,
        tracks: [],
        createdAt: NOW.toISOString(),
        updatedAt: NOW.toISOString(),
      },
    ],
    currentSceneId: 'scene-1',
    settings: { fps: 30, canvasSize: { width: 1920, height: 1080 } },
    version: 1,
    ...overrides,
  };
}

function createTestMediaAsset(overrides?: Partial<MediaAsset>): MediaAsset {
  return {
    id: 'media-1',
    name: 'test-image.png',
    type: 'image',
    file: new File(['content'], 'test-image.png', { type: 'image/png' }),
    width: 800,
    height: 600,
    ...overrides,
  };
}

// --- セットアップ ---

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- テスト ---

describe('StorageService', () => {
  describe('saveProject', () => {
    it('Date フィールドを ISO 文字列にシリアライズして保存する', async () => {
      const project = createTestProject();
      await storageService.saveProject({ project });

      expect(mocks.projectsAdapter.set).toHaveBeenCalledWith(
        'project-1',
        expect.objectContaining({
          metadata: expect.objectContaining({
            createdAt: NOW.toISOString(),
            updatedAt: NOW.toISOString(),
          }),
          scenes: [
            expect.objectContaining({
              createdAt: NOW.toISOString(),
              updatedAt: NOW.toISOString(),
            }),
          ],
        }),
      );
    });

    it('全フィールドを保持する', async () => {
      const project = createTestProject({
        timelineViewState: { zoomLevel: 2, scrollLeft: 100, playheadTime: 5 },
      });
      await storageService.saveProject({ project });

      const saved = mocks.projectsAdapter.set.mock
        .calls[0][1] as SerializedProject;
      expect(saved.settings).toEqual(project.settings);
      expect(saved.version).toBe(project.version);
      expect(saved.currentSceneId).toBe('scene-1');
      expect(saved.timelineViewState).toEqual(project.timelineViewState);
    });
  });

  describe('loadProject', () => {
    it('存在しないプロジェクトで null を返す', async () => {
      mocks.projectsAdapter.get.mockResolvedValue(null);
      expect(await storageService.loadProject({ id: 'none' })).toBeNull();
    });

    it('ISO 文字列を Date オブジェクトにデシリアライズする', async () => {
      mocks.projectsAdapter.get.mockResolvedValue(createSerializedProject());
      const result = await storageService.loadProject({ id: 'project-1' });

      expect(result!.project.metadata.createdAt).toBeInstanceOf(Date);
      expect(result!.project.metadata.createdAt.getTime()).toBe(NOW.getTime());
      expect(result!.project.scenes[0].createdAt).toBeInstanceOf(Date);
    });

    it('metadata.duration が欠落している場合 getProjectDurationFromScenes を使う', async () => {
      vi.mocked(getProjectDurationFromScenes).mockReturnValue(42);
      const serialized = createSerializedProject();
      serialized.metadata.duration = undefined as unknown as number;
      mocks.projectsAdapter.get.mockResolvedValue(serialized);

      const result = await storageService.loadProject({ id: 'project-1' });
      expect(result!.project.metadata.duration).toBe(42);
      expect(getProjectDurationFromScenes).toHaveBeenCalled();
    });

    it('metadata.duration が存在する場合そのまま使う', async () => {
      mocks.projectsAdapter.get.mockResolvedValue(createSerializedProject());
      const result = await storageService.loadProject({ id: 'project-1' });
      expect(result!.project.metadata.duration).toBe(30);
    });

    it('currentSceneId が空文字の場合、最初のシーン ID をデフォルトにする', async () => {
      const serialized = createSerializedProject({ currentSceneId: '' });
      mocks.projectsAdapter.get.mockResolvedValue(serialized);

      const result = await storageService.loadProject({ id: 'project-1' });
      expect(result!.project.currentSceneId).toBe('scene-1');
    });

    it('シーンが空の場合、currentSceneId は空文字になる', async () => {
      const serialized = createSerializedProject({
        scenes: [],
        currentSceneId: '',
      });
      mocks.projectsAdapter.get.mockResolvedValue(serialized);

      const result = await storageService.loadProject({ id: 'project-1' });
      expect(result!.project.currentSceneId).toBe('');
    });

    it('scenes が undefined の場合、空配列として処理する', async () => {
      const serialized = createSerializedProject();
      (serialized as Record<string, unknown>).scenes = undefined;
      mocks.projectsAdapter.get.mockResolvedValue(serialized);

      const result = await storageService.loadProject({ id: 'project-1' });
      expect(result!.project.scenes).toEqual([]);
    });
  });

  describe('loadAllProjects', () => {
    it('プロジェクトがない場合は空配列を返す', async () => {
      mocks.projectsAdapter.list.mockResolvedValue([]);
      expect(await storageService.loadAllProjects()).toEqual([]);
    });

    it('updatedAt の降順でソートして返す', async () => {
      mocks.projectsAdapter.list.mockResolvedValue(['p1', 'p2']);
      mocks.projectsAdapter.get
        .mockResolvedValueOnce(
          createSerializedProject({
            metadata: {
              id: 'p1',
              name: 'Older',
              duration: 10,
              createdAt: EARLIER.toISOString(),
              updatedAt: EARLIER.toISOString(),
            },
          }),
        )
        .mockResolvedValueOnce(
          createSerializedProject({
            metadata: {
              id: 'p2',
              name: 'Newer',
              duration: 20,
              createdAt: NOW.toISOString(),
              updatedAt: NOW.toISOString(),
            },
          }),
        );

      const projects = await storageService.loadAllProjects();
      expect(projects[0].metadata.name).toBe('Newer');
      expect(projects[1].metadata.name).toBe('Older');
    });
  });

  describe('loadAllProjectsMetadata', () => {
    it('プロジェクトがない場合は空配列を返す', async () => {
      mocks.projectsAdapter.getAll.mockResolvedValue([]);
      expect(await storageService.loadAllProjectsMetadata()).toEqual([]);
    });

    it('updatedAt の降順でソートして返す', async () => {
      mocks.projectsAdapter.getAll.mockResolvedValue([
        createSerializedProject({
          metadata: {
            id: 'p1',
            name: 'Older',
            duration: 10,
            createdAt: EARLIER.toISOString(),
            updatedAt: EARLIER.toISOString(),
          },
        }),
        createSerializedProject({
          metadata: {
            id: 'p2',
            name: 'Newer',
            duration: 20,
            createdAt: NOW.toISOString(),
            updatedAt: NOW.toISOString(),
          },
        }),
      ]);

      const metadata = await storageService.loadAllProjectsMetadata();
      expect(metadata[0].name).toBe('Newer');
      expect(metadata[1].name).toBe('Older');
    });

    it('duration が欠落している場合 calculateTotalDuration を使う', async () => {
      vi.mocked(calculateTotalDuration).mockReturnValue(99);
      const serialized = createSerializedProject();
      serialized.metadata.duration = undefined as unknown as number;
      mocks.projectsAdapter.getAll.mockResolvedValue([serialized]);

      const metadata = await storageService.loadAllProjectsMetadata();
      expect(metadata[0].duration).toBe(99);
      expect(calculateTotalDuration).toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('メディア削除後にプロジェクトを削除する', async () => {
      await storageService.deleteProject({ id: 'project-1' });
      expect(mocks.mediaMetadataAdapter.clear).toHaveBeenCalled();
      expect(mocks.mediaAssetsAdapter.clear).toHaveBeenCalled();
      expect(mocks.projectsAdapter.remove).toHaveBeenCalledWith('project-1');
    });
  });

  describe('saveMediaAsset', () => {
    it('OPFS にファイル、IndexedDB にメタデータを保存する', async () => {
      const asset = createTestMediaAsset();
      await storageService.saveMediaAsset({
        projectId: 'project-1',
        mediaAsset: asset,
      });

      expect(mocks.mediaAssetsAdapter.set).toHaveBeenCalledWith(
        'media-1',
        asset.file,
      );
      expect(mocks.mediaMetadataAdapter.set).toHaveBeenCalledWith(
        'media-1',
        expect.objectContaining({
          id: 'media-1',
          name: 'test-image.png',
          type: 'image',
          width: 800,
          height: 600,
        }),
      );
    });

    it('オプションフィールドを含むメタデータを保存する', async () => {
      const asset = createTestMediaAsset({
        duration: 10,
        thumbnailUrl: 'thumb.png',
        ephemeral: true,
      });
      await storageService.saveMediaAsset({
        projectId: 'project-1',
        mediaAsset: asset,
      });

      expect(mocks.mediaMetadataAdapter.set).toHaveBeenCalledWith(
        'media-1',
        expect.objectContaining({
          duration: 10,
          thumbnailUrl: 'thumb.png',
          ephemeral: true,
        }),
      );
    });
  });

  describe('loadMediaAsset', () => {
    it('ファイルが存在しない場合 null を返す', async () => {
      mocks.mediaAssetsAdapter.get.mockResolvedValue(null);
      mocks.mediaMetadataAdapter.get.mockResolvedValue({ id: 'media-1' });

      const result = await storageService.loadMediaAsset({
        projectId: 'project-1',
        id: 'media-1',
      });
      expect(result).toBeNull();
    });

    it('メタデータが存在しない場合 null を返す', async () => {
      mocks.mediaAssetsAdapter.get.mockResolvedValue(
        new File(['x'], 'f.png', { type: 'image/png' }),
      );
      mocks.mediaMetadataAdapter.get.mockResolvedValue(null);

      const result = await storageService.loadMediaAsset({
        projectId: 'project-1',
        id: 'media-1',
      });
      expect(result).toBeNull();
    });

    it('通常のファイルに対して ObjectURL を生成する', async () => {
      const file = new File(['data'], 'test.png', { type: 'image/png' });
      mocks.mediaAssetsAdapter.get.mockResolvedValue(file);
      mocks.mediaMetadataAdapter.get.mockResolvedValue({
        id: 'media-1',
        name: 'test.png',
        type: 'image',
      });

      const result = await storageService.loadMediaAsset({
        projectId: 'project-1',
        id: 'media-1',
      });
      expect(result).not.toBeNull();
      expect(result!.url).toBe('blob:mock-url');
      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it('空 MIME の SVG ファイルを検出し正しい Blob を生成する', async () => {
      const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
      const file = new File([svgContent], 'icon.svg', { type: '' });
      mocks.mediaAssetsAdapter.get.mockResolvedValue(file);
      mocks.mediaMetadataAdapter.get.mockResolvedValue({
        id: 'media-1',
        name: 'icon.svg',
        type: 'image',
      });

      await storageService.loadMediaAsset({
        projectId: 'project-1',
        id: 'media-1',
      });

      const blobArg = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
      expect(blobArg).toBeInstanceOf(Blob);
      expect(blobArg.type).toBe('image/svg+xml');
    });

    it('空 MIME の非 SVG ファイルはそのまま ObjectURL を生成する', async () => {
      const file = new File(['binary data'], 'image.bin', { type: '' });
      mocks.mediaAssetsAdapter.get.mockResolvedValue(file);
      mocks.mediaMetadataAdapter.get.mockResolvedValue({
        id: 'media-1',
        name: 'image.bin',
        type: 'image',
      });

      await storageService.loadMediaAsset({
        projectId: 'project-1',
        id: 'media-1',
      });

      expect(URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    it('全メタデータフィールドを MediaAsset にマッピングする', async () => {
      const file = new File(['data'], 'vid.mp4', { type: 'video/mp4' });
      mocks.mediaAssetsAdapter.get.mockResolvedValue(file);
      mocks.mediaMetadataAdapter.get.mockResolvedValue({
        id: 'media-1',
        name: 'vid.mp4',
        type: 'video',
        width: 1920,
        height: 1080,
        duration: 60,
        thumbnailUrl: 'thumb.jpg',
        ephemeral: false,
      });

      const result = await storageService.loadMediaAsset({
        projectId: 'project-1',
        id: 'media-1',
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: 'media-1',
          name: 'vid.mp4',
          type: 'video',
          file,
          width: 1920,
          height: 1080,
          duration: 60,
          thumbnailUrl: 'thumb.jpg',
          ephemeral: false,
        }),
      );
    });
  });

  describe('loadAllMediaAssets', () => {
    it('メディアがない場合は空配列を返す', async () => {
      mocks.mediaMetadataAdapter.list.mockResolvedValue([]);
      const result = await storageService.loadAllMediaAssets({
        projectId: 'project-1',
      });
      expect(result).toEqual([]);
    });

    it('複数メディアを読み込んで返す', async () => {
      mocks.mediaMetadataAdapter.list.mockResolvedValue(['m1', 'm2']);
      mocks.mediaAssetsAdapter.get.mockResolvedValue(
        new File(['data'], 'f.png', { type: 'image/png' }),
      );
      mocks.mediaMetadataAdapter.get
        .mockResolvedValueOnce({
          id: 'm1',
          name: 'a.png',
          type: 'image',
        })
        .mockResolvedValueOnce({
          id: 'm2',
          name: 'b.png',
          type: 'image',
        });

      const result = await storageService.loadAllMediaAssets({
        projectId: 'project-1',
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('m1');
      expect(result[1].id).toBe('m2');
    });
  });

  describe('deleteMediaAsset', () => {
    it('ファイルとメタデータを並列で削除する', async () => {
      await storageService.deleteMediaAsset({
        projectId: 'project-1',
        id: 'media-1',
      });
      expect(mocks.mediaAssetsAdapter.remove).toHaveBeenCalledWith('media-1');
      expect(mocks.mediaMetadataAdapter.remove).toHaveBeenCalledWith('media-1');
    });
  });

  describe('deleteProjectMedia', () => {
    it('両アダプタの clear を呼ぶ', async () => {
      await storageService.deleteProjectMedia({ projectId: 'project-1' });
      expect(mocks.mediaMetadataAdapter.clear).toHaveBeenCalled();
      expect(mocks.mediaAssetsAdapter.clear).toHaveBeenCalled();
    });
  });

  describe('clearAllData', () => {
    it('全プロジェクトのメディアを削除後、プロジェクトストアをクリアする', async () => {
      mocks.projectsAdapter.getAll.mockResolvedValue([
        createSerializedProject({
          metadata: {
            id: 'p1',
            name: 'P1',
            duration: 10,
            createdAt: NOW.toISOString(),
            updatedAt: NOW.toISOString(),
          },
        }),
      ]);

      await storageService.clearAllData();
      expect(mocks.mediaMetadataAdapter.clear).toHaveBeenCalled();
      expect(mocks.mediaAssetsAdapter.clear).toHaveBeenCalled();
      expect(mocks.projectsAdapter.clear).toHaveBeenCalled();
    });
  });

  describe('isOPFSSupported / isIndexedDBSupported / isFullySupported', () => {
    it('isOPFSSupported は OPFSAdapter.isSupported() に委譲する', () => {
      vi.mocked(OPFSAdapter.isSupported).mockReturnValue(true);
      expect(storageService.isOPFSSupported()).toBe(true);
      expect(OPFSAdapter.isSupported).toHaveBeenCalled();
    });

    it('isIndexedDBSupported は IndexedDBAdapter.isSupported() に委譲する', () => {
      vi.mocked(IndexedDBAdapter.isSupported).mockReturnValue(true);
      expect(storageService.isIndexedDBSupported()).toBe(true);
      expect(IndexedDBAdapter.isSupported).toHaveBeenCalled();
    });

    it('isFullySupported は両方サポートされている場合のみ true を返す', () => {
      vi.mocked(OPFSAdapter.isSupported).mockReturnValue(true);
      vi.mocked(IndexedDBAdapter.isSupported).mockReturnValue(true);
      expect(storageService.isFullySupported()).toBe(true);
    });

    it('isFullySupported はどちらかがサポートされていない場合 false を返す', () => {
      vi.mocked(OPFSAdapter.isSupported).mockReturnValue(true);
      vi.mocked(IndexedDBAdapter.isSupported).mockReturnValue(false);
      expect(storageService.isFullySupported()).toBe(false);
    });
  });
});
