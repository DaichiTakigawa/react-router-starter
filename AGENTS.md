# ibisCut

## 技術スタック

- **React 19** + **React Router v7**（SSR有効）+ **Vite 7**
- **Tailwind CSS v4** — `oklch()` ベースのセマンティックカラートークン（`app/assets/app.css` で定義）
- **shadcn/ui**（radix-mira スタイル、HugeIcons）— コンポーネント追加: `pnpm dlx shadcn@latest add <component>`
- **ESLint v9**（flat config）+ **oxfmt**（全ファイル対象、Tailwind CSS クラスソート対応）
- **Remotion** — ブラウザ内動画プレビュー
- **Zustand** — 状態管理（immer, devtools ミドルウェア）
- **TanStack Query** — データフェッチ/キャッシュ
- **Vitest** + **Playwright** — テスト
- **Storybook 10** — コンポーネントカタログ/テスト
- **pnpm 10**（必須 — npm/yarn は `engines` でブロック）
- **Node.js 24**（`.node-version`、`.nvmrc`、`volta` で固定）

## コマンド

```sh
pnpm dev              # 開発サーバー起動
pnpm build            # プロダクションビルド
pnpm start            # プロダクションビルドの配信
pnpm lint             # ESLint（キャッシュ有効）
pnpm lint:fix         # ESLint（自動修正）
pnpm fmt              # oxfmt（全ファイル）
pnpm typecheck        # React Router 型生成 → tsc 実行
pnpm test             # Vitest 実行
pnpm storybook        # Storybook 開発サーバー（port 6006）
pnpm build-storybook  # Storybook 静的ビルド
```

## アーキテクチャ

- `app/routes.ts` — React Router の `RouteConfig` API によるルート定義（ファイルシステムルーティングではない）
- `app/routes/` — ルートモジュールは `meta()`、`loader()`、`action()`、デフォルトコンポーネントをエクスポート
- `app/root.tsx` — HTML シェル、グローバル CSS 読み込み、エラーバウンダリ
- `app/components/ui/` — shadcn/ui プリミティブ（Button 等）
- `app/components/editor/` — マルチパネルリサイズ可能エディタ（`react-resizable-panels`）
- `app/components/remotion/` — Remotion 動画コンポジション
- `app/services/storage/` — IndexedDB + OPFS デュアルアダプタストレージ
- `app/stores/` — Zustand ストア
- `app/types/` — 型定義
- `app/constants/` — 定数
- `app/lib/utils/` — 共有ユーティリティ。`cn()` は `clsx` + `tailwind-merge` による Tailwind クラスのマージ
- パスエイリアス: `@/*` → `./app/*`

## コード規約

### フォーマット（ESLint + oxfmt + pre-commit フックで強制）

- シングルクォート、2スペースインデント、LF 改行、トレーリングカンマ（ES5）、セミコロン必須
- 型のみのインポートには `import type` を使用（`@typescript-eslint/consistent-type-imports`）
- 未使用の変数・インポート・関数パラメータはエラー（`^_` プレフィックスで許容）

### スタイリング

- Tailwind ユーティリティクラスとセマンティックカラートークン（`bg-primary`、`text-muted-foreground` 等）を使用 — 生のカラー値は使わない
- ダークモード: `.dark` クラス戦略（`@custom-variant dark (&:is(.dark *))`）
- `space-y-*` より `gap-*` を優先、幅と高さが同じ場合は `size-*` を使用

### コンポーネント

- UI プリミティブは **CVA**（`class-variance-authority`）で variant/size props を管理
- クラスのマージには `@/lib/utils` の `cn()` を使用
- Radix UI プリミティブは `radix-ui` パッケージ経由。合成には `asChild` / `Slot` を使用
- アイコン: **HugeIcons** — オブジェクトとして渡し、`data-icon` 属性を付与、アイコン要素にサイズクラスを付けない

### Git

- pre-commit フックが `lint-staged` を実行 → `*.{js,mjs,cjs,ts,jsx,tsx}` に oxfmt + ESLint、`*.{css,json,md,yaml}` に oxfmt
- lint が通らないとコミットがブロックされる
