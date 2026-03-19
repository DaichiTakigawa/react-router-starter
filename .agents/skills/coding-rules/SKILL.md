---
name: coding-rules
description: ibisCut-specific coding patterns for components, stores, services, types, and routes. Referenced automatically when writing or modifying code.
user-invocable: false
---

# ibisCut コーディングパターン

CLAUDE.md で定義済みのフォーマット・スタイリング・Git 規約はここでは扱わない。
本スキルはコードベース固有の構造パターンを補完する。

---

## コンポーネント構造

- **名前付き関数エクスポート**を使う。`export default` はルートモジュールのみ
- ファイル内の補助コンポーネントは非エクスポート関数として定義する
- `data-slot` 属性でコンポーネントを識別する
- variant/size の状態追跡には `data-variant`、`data-size` 属性を付与する

```tsx
// app/components/ui/button.tsx
function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

**ポイント:**

- Props は `React.ComponentProps<'element'>` と `VariantProps` の交差型で定義する
- `asChild` パターンでは `Slot.Root`（`radix-ui` パッケージ）を使う
- デフォルト値はデストラクチャリングで指定する
- CVA の variants 定義は `<Component>Variants` の命名で、コンポーネントと一緒にエクスポートする

---

## Zustand ストア

ミドルウェアは外側から `devtools` → `persist` → `immer` の順でラップする。
State インターフェースはストア定義の直前に宣言する。

```ts
// app/stores/panel-store.ts
interface PanelState {
  panels: PanelSizes;
  setPanel: (panel: PanelId, size: number) => void;
  resetPanels: () => void;
}

export const usePanelStore = create<PanelState>()(
  devtools(
    persist(
      immer((set) => ({
        panels: {
          /* ... */
        },
        setPanel: (panel, size) =>
          set((state) => {
            state.panels[panel] = size; // immer で直接 mutation
          }),
        resetPanels: () => {
          set(() => ({ ...PANEL_CONFIG }));
        },
      })),
      { name: 'panel-sizes' }, // localStorage キー
    ),
    {
      name: 'PanelStore', // DevTools 表示名
      enabled: import.meta.env.MODE === 'development',
    },
  ),
);
```

**命名規則:**

- フック名: `use<Domain>Store`
- アクション名: `set<Entity>` / `reset<Entity>` / `toggle<Entity>`
- persist の `name` はケバブケース、devtools の `name` はパスカルケース

---

## サービス / アダプターパターン

ストレージなどの永続化層はアダプターパターンで抽象化する。

```ts
// インターフェース（app/services/storage/types.ts）
export interface StorageAdapter<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  list(): Promise<string[]>;
  clear(): Promise<void>;
}
```

**パターン:**

- ジェネリック型パラメータでアダプターを汎用化する
- 実装はクラスベース。内部メソッドは `private` にする
- 機能検出には `static isSupported()` メソッドを用意する
- モジュール末尾でシングルトンをエクスポートする:
  ```ts
  export const storageService = new StorageService();
  export type { StorageService };
  ```
- 構成はコンストラクタで注入する（グローバル状態に依存しない）
- すべての public メソッドに JSDoc コメントを付ける（`@param`、`@returns`）
- リソース解放が必要な場合は `WARN:` で呼び出し側に注記する

---

## 型定義

ドメインごとに `app/types/` に分離ファイルを作る。

```ts
// app/types/project.ts
/** プロジェクトデータ */
export interface Project {
  /** プロジェクト名 */
  name: string;
  /** プロジェクトの総再生時間（秒） */
  duration: number;
  /** プロジェクトの作成日時 */
  createdAt: Date;
  /** プロジェクトの最終更新日時 */
  updatedAt: Date;
}
```

**パターン:**

- すべてのインターフェースとフィールドに JSDoc を付ける
- ランタイム型（`Date`）とシリアライズ型（`string`）を分離する:
  ```ts
  export type SerializedProject = Omit<Project, 'createdAt' | 'updatedAt'> & {
    createdAt: string;
    updatedAt: string;
  };
  ```
- 派生型は `Omit` + 交差型で定義する。手動で全フィールドを再記述しない

---

## ルートモジュール

`meta()` を名前付きエクスポート、ページコンポーネントを `export default` する。
ルートコンポーネントは薄いレイアウトシェルとし、ロジックは子コンポーネントに委譲する。

```tsx
// app/routes/home.tsx
export function meta() {
  return [
    { title: 'ibisCut' },
    { name: 'description', content: 'powerful video editor.' },
  ];
}

export default function Home() {
  return (
    <div className="bg-background flex h-screen w-screen flex-col overflow-hidden">
      <EditorHeader />
      <div className="min-h-0 min-w-0 flex-1">
        <EditorLayout />
      </div>
    </div>
  );
}
```

---

## インポート順序

グループ間は空行で区切る。各グループ内では `import type` を先頭にまとめる。

1. React 本体（`import type * as React from 'react'`）
2. サードパーティライブラリ（`zustand`、`class-variance-authority` 等）
3. 内部ユーティリティ（`@/utils/`、`@/lib/`）
4. コンポーネント（`@/components/`）
5. ストア / サービス（`@/stores/`、`@/services/`）
6. 型（`@/types/`）
7. 定数（`@/constants/`）

---

## 定数

- `app/constants/` に機能別ファイルで配置する
- `UPPER_SNAKE_CASE` で名前付きエクスポートする
- 例: `export const PANEL_CONFIG = { ... }`

---

## エラーハンドリング

- コールバック API（IndexedDB 等）は `new Promise()` でラップする
- データ不在時は例外を投げず `T | null` を返す
- 配列フィルタには型ガードを使う:
  ```ts
  results.filter((item): item is MediaAsset => item !== null);
  ```
- 並行処理には `Promise.all()` を活用する
