import {
  calculateTotalDuration,
  getProjectDurationFromScenes,
} from '@/lib/scenes';
import type { MediaAsset, MediaAssetData } from '@/types/assets';
import type { Project, ProjectMetadata } from '@/types/project';
import { IndexedDBAdapter } from './indexeddb-adapter';
import { OPFSAdapter } from './opfs-adapter';
import type {
  SerializedProject,
  SerializedScene,
  StorageConfig,
} from './types';

/**
 * ストレージサービス
 */
class StorageService {
  /** ストレージの設定 */
  private config: StorageConfig;
  /** プロジェクトデータアダプター */
  private projectsAdapter: IndexedDBAdapter<SerializedProject>;

  /** コンストラクタ */
  constructor() {
    this.config = {
      projectDb: 'ibiscut-project',
      mediaDb: 'ibiscut-media',
      mediaDirectory: 'ibiscut-media-files',
      version: 1,
    };
    this.projectsAdapter = new IndexedDBAdapter<SerializedProject>(
      this.config.projectDb,
      'project',
      this.config.version,
    );
  }

  /**
   * プロジェクトに紐づくメディアアセットのアダプターを取得する
   * @param projectId プロジェクトID
   * @return IndexedDBアダプターとOPFSアダプターのオブジェクト
   */
  private getProjectMediaAdapters({ projectId }: { projectId: string }) {
    const mediaMetadataAdapter = new IndexedDBAdapter<MediaAssetData>(
      `${this.config.mediaDb}-${projectId}`,
      'media-metadata',
      this.config.version,
    );

    const mediaAssetsAdapter = new OPFSAdapter(
      `${this.config.mediaDirectory}-${projectId}`,
    );

    return { mediaMetadataAdapter, mediaAssetsAdapter };
  }

  /**
   * プロジェクトデータを保存する
   * @param project 保存するプロジェクトデータ
   */
  async saveProject({ project }: { project: Project }): Promise<void> {
    const serializedScenes: SerializedScene[] = project.scenes.map((scene) => ({
      id: scene.id,
      name: scene.name,
      isMain: scene.isMain,
      tracks: scene.tracks,
      createdAt: scene.createdAt.toISOString(),
      updatedAt: scene.updatedAt.toISOString(),
    }));

    const serializedProject: SerializedProject = {
      metadata: {
        id: project.metadata.id,
        name: project.metadata.name,
        thumbnail: project.metadata.thumbnail,
        duration: project.metadata.duration,
        createdAt: project.metadata.createdAt.toISOString(),
        updatedAt: project.metadata.updatedAt.toISOString(),
      },
      scenes: serializedScenes,
      currentSceneId: project.currentSceneId,
      settings: project.settings,
      version: project.version,
      timelineViewState: project.timelineViewState,
    };

    await this.projectsAdapter.set(project.metadata.id, serializedProject);
  }

  /**
   * プロジェクトデータを読み込む
   * @param id 読み込むプロジェクトのID
   * @return 読み込んだプロジェクトデータ。存在しない場合はnull。
   */
  async loadProject({
    id,
  }: {
    id: string;
  }): Promise<{ project: Project } | null> {
    const serializedProject = await this.projectsAdapter.get(id);

    if (!serializedProject) return null;

    const scenes =
      serializedProject.scenes?.map((scene) => ({
        id: scene.id,
        name: scene.name,
        isMain: scene.isMain,
        tracks: scene.tracks,
        createdAt: new Date(scene.createdAt),
        updatedAt: new Date(scene.updatedAt),
      })) ?? [];

    const project: Project = {
      metadata: {
        id: serializedProject.metadata.id,
        name: serializedProject.metadata.name,
        thumbnail: serializedProject.metadata.thumbnail,
        duration:
          serializedProject.metadata.duration ??
          getProjectDurationFromScenes({ scenes }),
        createdAt: new Date(serializedProject.metadata.createdAt),
        updatedAt: new Date(serializedProject.metadata.updatedAt),
      },
      scenes,
      currentSceneId: serializedProject.currentSceneId || scenes[0]?.id || '',
      settings: serializedProject.settings,
      version: serializedProject.version,
      timelineViewState: serializedProject.timelineViewState,
    };

    return { project };
  }

  /**
   * すべてのプロジェクトデータを読み込む
   * @return 読み込んだプロジェクトデータの配列
   */
  async loadAllProjects(): Promise<Project[]> {
    const projectIds = await this.projectsAdapter.list();
    const projects: Project[] = [];

    for (const id of projectIds) {
      const result = await this.loadProject({ id });
      if (result?.project) {
        projects.push(result.project);
      }
    }

    return projects.sort(
      (a, b) => b.metadata.updatedAt.getTime() - a.metadata.updatedAt.getTime(),
    );
  }

  /**
   * すべてのプロジェクトのメタデータを読み込む
   * @return 読み込んだプロジェクトメタデータの配列
   */
  async loadAllProjectsMetadata(): Promise<ProjectMetadata[]> {
    const serializedProjects = await this.projectsAdapter.getAll();

    const metadata = serializedProjects.map((serializedProject) => {
      const tracks =
        (serializedProject.scenes ?? []).find((s) => s.isMain)?.tracks ?? [];
      return {
        id: serializedProject.metadata.id,
        name: serializedProject.metadata.name,
        thumbnail: serializedProject.metadata.thumbnail,
        duration:
          serializedProject.metadata.duration ??
          calculateTotalDuration({ tracks }),
        createdAt: new Date(serializedProject.metadata.createdAt),
        updatedAt: new Date(serializedProject.metadata.updatedAt),
      };
    });

    return metadata.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
  }

  /**
   * プロジェクトデータを削除する
   * @param id 削除するプロジェクトのID
   */
  async deleteProject({ id }: { id: string }): Promise<void> {
    await this.deleteProjectMedia({ projectId: id });
    await this.projectsAdapter.remove(id);
  }

  /**
   * メディアアセットを保存する
   * @param projectId 紐づけるプロジェクトのID
   * @param mediaAsset 保存するメディアアセット
   */
  async saveMediaAsset({
    projectId,
    mediaAsset,
  }: {
    projectId: string;
    mediaAsset: MediaAsset;
  }): Promise<void> {
    const { mediaMetadataAdapter, mediaAssetsAdapter } =
      this.getProjectMediaAdapters({ projectId });

    await mediaAssetsAdapter.set(mediaAsset.id, mediaAsset.file);

    const metadata: MediaAssetData = {
      id: mediaAsset.id,
      name: mediaAsset.name,
      type: mediaAsset.type,
      size: mediaAsset.file.size,
      lastModified: mediaAsset.file.lastModified,
      width: mediaAsset.width,
      height: mediaAsset.height,
      duration: mediaAsset.duration,
      thumbnailUrl: mediaAsset.thumbnailUrl,
      ephemeral: mediaAsset.ephemeral,
    };

    await mediaMetadataAdapter.set(mediaAsset.id, metadata);
  }

  /**
   * メディアアセットを読み込む
   *
   * WARN: 返却される `url` は `URL.createObjectURL()` で生成されるため、
   * 不要になったら呼び出し側で `URL.revokeObjectURL(asset.url)` を呼ぶこと。
   *
   * @param id 読み込むメディアアセットのID
   * @return 読み込んだメディアアセット。存在しない場合はnull。
   */
  async loadMediaAsset({
    projectId,
    id,
  }: {
    projectId: string;
    id: string;
  }): Promise<MediaAsset | null> {
    const { mediaMetadataAdapter, mediaAssetsAdapter } =
      this.getProjectMediaAdapters({ projectId });

    const [file, metadata] = await Promise.all([
      mediaAssetsAdapter.get(id),
      mediaMetadataAdapter.get(id),
    ]);

    if (!file || !metadata) {
      return null;
    }

    let url: string;
    if (metadata.type === 'image' && (!file.type || file.type === '')) {
      try {
        const text = await file.text();
        if (text.trim().startsWith('<svg')) {
          const svgBlob = new Blob([text], { type: 'image/svg+xml' });
          url = URL.createObjectURL(svgBlob);
        } else {
          url = URL.createObjectURL(file);
        }
      } catch {
        url = URL.createObjectURL(file);
      }
    } else {
      url = URL.createObjectURL(file);
    }

    return {
      id: metadata.id,
      name: metadata.name,
      type: metadata.type,
      file,
      url,
      width: metadata.width,
      height: metadata.height,
      duration: metadata.duration,
      thumbnailUrl: metadata.thumbnailUrl,
      ephemeral: metadata.ephemeral,
    };
  }

  /**
   * すべてのメディアアセットを読み込む
   *
   * WARN: 返却される各アセットの `url` は `URL.createObjectURL()` で生成されるため、
   * 不要になったら呼び出し側で `URL.revokeObjectURL(asset.url)` を呼ぶこと。
   *
   * @param projectId 読み込むメディアアセットが紐づくプロジェクトのID
   * @return 読み込んだメディアアセットの配列
   */
  async loadAllMediaAssets({
    projectId,
  }: {
    projectId: string;
  }): Promise<MediaAsset[]> {
    const { mediaMetadataAdapter } = this.getProjectMediaAdapters({
      projectId,
    });

    const mediaIds = await mediaMetadataAdapter.list();
    const mediaItems: MediaAsset[] = [];

    for (const id of mediaIds) {
      const item = await this.loadMediaAsset({ projectId, id });
      if (item) {
        mediaItems.push(item);
      }
    }

    return mediaItems;
  }

  /**
   * メディアアセットを削除する
   * @param projectId 紐づいているプロジェクトのID
   * @param id 削除するメディアアセットのID
   */
  async deleteMediaAsset({
    projectId,
    id,
  }: {
    projectId: string;
    id: string;
  }): Promise<void> {
    const { mediaMetadataAdapter, mediaAssetsAdapter } =
      this.getProjectMediaAdapters({ projectId });

    await Promise.all([
      mediaAssetsAdapter.remove(id),
      mediaMetadataAdapter.remove(id),
    ]);
  }

  /**
   * プロジェクトに紐づくすべてのメディアアセットを削除する
   * @param projectId 紐づいているプロジェクトのID
   */
  async deleteProjectMedia({
    projectId,
  }: {
    projectId: string;
  }): Promise<void> {
    const { mediaMetadataAdapter, mediaAssetsAdapter } =
      this.getProjectMediaAdapters({ projectId });

    await Promise.all([
      mediaMetadataAdapter.clear(),
      mediaAssetsAdapter.clear(),
    ]);
  }

  /**
   * すべてのデータを削除する
   */
  async clearAllData(): Promise<void> {
    for (const project of await this.loadAllProjectsMetadata()) {
      await this.deleteProjectMedia({ projectId: project.id });
    }
    await Promise.all([this.projectsAdapter.clear()]);
  }

  /** OPFSがサポートされているか */
  isOPFSSupported(): boolean {
    return OPFSAdapter.isSupported();
  }

  /** IndexedDBがサポートされているか */
  isIndexedDBSupported(): boolean {
    return IndexedDBAdapter.isSupported();
  }

  /** 必要なストレージ機能がすべてサポートされているか */
  isFullySupported(): boolean {
    return this.isIndexedDBSupported() && this.isOPFSSupported();
  }
}

export const storageService = new StorageService();
export type { StorageService };
