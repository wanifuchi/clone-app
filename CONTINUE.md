# CLONE! — 開発再開ガイド

このファイルは開発を再開する際のコンテキストです。次回セッション冒頭でこのファイルを読ませてください。

## プロジェクト概要

- **サービス名**: CLONE!（旧 open-lovable）
- **目的**: URL を入力するとそのウェブサイトを React アプリとして複製する AI ツール
- **ベース**: firecrawl/open-lovable のフォーク
- **ライセンス**: MIT（フォーク元クレジットは README 末尾）

## 主要URL・アカウント

| 項目 | 値 |
|---|---|
| 本番URL（短縮） | https://clone-now.vercel.app |
| 長い本番URL | https://clone-wanifucks.vercel.app |
| Vercel 管理画面 | https://vercel.com/wanifucks/clone |
| GitHub リポジトリ | https://github.com/wanifuchi/clone-app |
| 上流（本家） | https://github.com/firecrawl/open-lovable |
| Vercel プロジェクト名 | `clone` |
| Vercel チーム | `wanifucks` |
| GitHub アカウント | wanifuchi |
| ローカル作業ディレクトリ | `/Users/noriaki/Desktop/claude_base/clone/open-lovable` |

## 設定済み環境変数（Vercel）

すべて Production / Development に登録済み。値はチャットに出さないこと。

- `FIRECRAWL_API_KEY` — ウェブスクレイピング
- `ANTHROPIC_API_KEY` — LLM（Claude Sonnet 4 を使用）
- `E2B_API_KEY` — サンドボックス実行環境
- `SANDBOX_PROVIDER=e2b`

## 技術スタック

- Next.js 16.2.4 (Turbopack)
- React 19.1.0
- Tailwind CSS + Geist フォント
- `@ai-sdk/anthropic` + Claude Sonnet 4（唯一のモデル選択肢）
- `@e2b/code-interpreter` v2（サンドボックス）
- `@mendable/firecrawl-js`（スクレイピング）

## これまでに完了した改修

### ブランディング
- `open-lovable` → `CLONE!` へリブランド
- ダーク × エレクトリックシアン `#00E5FF` + 紫 `#7C3AED` のデザインシステム
- 新ロゴ/アイコン: [components/shared/layout/CloneLogo.tsx](components/shared/layout/CloneLogo.tsx), [components/shared/layout/CloneIcon.tsx](components/shared/layout/CloneIcon.tsx)
- 巨大 CLONE! ワードマーク（Geist Sans Bold、clamp 48→120px）

### 日本語化
- すべての UI 文言を日本語化（13ファイル）
- 例: "Glassmorphism" → 「ガラスモーフィズム」
- `CLONE!` ブランド名と `Vite`/`Firecrawl`/`E2B` 等の固有名詞は英語のまま

### UI/UX
- モデル選択肢を **Sonnet 4 のみ** に絞った（`config/app.config.ts`）
- URL 入力後の詳細オプションを折りたたみ式に変更（デフォルト表示は URL 入力だけ）
- デフォルトスタイルを空 `""` に（未指定なら素のクローン）
- "Mirror any site into code" / "View source" / "クローン時代のために作られました。" を削除

### バグ修正（本番で発生→実機テストで解決）

| バグ | 原因 | 修正 |
|---|---|---|
| Vercel がブロック | Next.js 15.4.3 に脆弱性 | 16.2.4 へアップグレード |
| デフォルトモデル失敗 | `GEMINI_API_KEY` 要求 | Anthropic をデフォルトに |
| iframe 更新されない | React state closure staleness（`sandboxData` が null） | URL パラメータから sandboxId フォールバック読み込み |
| サンドボックスが毎回新規作成される | `constructor.name === 'E2BProvider'` が production minification で常に false | duck typing（`typeof provider.reconnect === 'function'`）に変更 |
| サンドボックス重複作成 | `initializePage` と `startGeneration` が並行して createSandbox | startGeneration 側で URL 内 sandboxId もチェック |
| AI が import したコンポーネントを生成しない | AI の出力漏れ | 自動スタブ化（`apply-ai-code-stream/route.ts`内の `isLikelyTruncatedJsx` + `buildStubComponent`） |
| JSX ファイルが途中で切れて Vite 500 | maxTokens 切れ | truncation 検出＋スタブ置換 + maxTokens を 16384 に引き上げ |
| パッケージ自動インストール失敗 | `install-packages` が `global.activeSandboxProvider` 依存 | `sandboxId` を受け取り `sandboxManager.getOrCreateProvider` で reconnect |
| ZIP ダウンロード失敗 | create-zip も同上 | 同様の reconnect 方式に書き換え |
| restart-vite 失敗 | 同上 | 同様の reconnect 方式に書き換え |
| 生成結果が SaaS ランディングページ化 | プロンプトに "modern / clean" | プロンプトを "FAITHFUL VISUAL CLONE, not redesign" に全面書き換え |
| Firecrawl タイムアウト | Yahoo 等の重いサイト | timeout 30s → 60s に延長 + 軽量フォールバックリトライ |

## 重要な既知の制約

### サンドボックス再接続の仕組み
Vercel サーバーレスは関数ごとに別インスタンスなので、`global.activeSandbox` に依存すると動かない。**新しい API ルートを追加する時も、必ず以下パターンで書くこと**:

```ts
import { sandboxManager } from '@/lib/sandbox/sandbox-manager';

let provider: any = sandboxId ? sandboxManager.getProvider(sandboxId) : sandboxManager.getActiveProvider();
if (!provider) provider = global.activeSandboxProvider;
if (!provider && sandboxId) {
  provider = await sandboxManager.getOrCreateProvider(sandboxId);
  if (!provider?.getSandboxInfo()) provider = null;
  else sandboxManager.registerSandbox(sandboxId, provider);
}
```

クライアント側は URL パラメータから sandboxId を拾ってリクエストに含めること（Reactのstate closure 問題を避けるため）:

```ts
const urlSandboxId = new URLSearchParams(window.location.search).get('sandbox');
const resolvedSandboxId = effectiveSandboxData?.sandboxId || urlSandboxId || undefined;
```

### 完全ピクセル一致は未実装
現状は Firecrawl の markdown だけを AI に渡しているため、100% のビジュアル再現はできない。改善したい場合は：

1. スクリーンショット URL を Vision 対応モデル (Claude Sonnet 4 Vision) に渡す
2. スクレイピング時に `html` format も取得して AI に渡す
3. `extract-brand-styles` エンドポイントを活用して色・フォント抽出

### sandboxId の URL パラメータは最優先で信頼する
React state は staleness で信用できない。URL を真実の source にしている。

## 次にやるかもしれない候補

- [ ] Vision モデル経由でスクリーンショットから構造把握して完全クローン寄りに
- [ ] `extract-brand-styles` で自動抽出した色を優先適用
- [ ] `sandbox-manager` を Redis / KV に置き換えて真のサーバーレス対応
- [ ] `components/FirecrawlIcon.tsx` などの孤立ファイル削除（今は未使用だが残してある）
- [ ] `styles/design-system/typography.css` と `colors.json` の `heat-*` ハードコード残りをクレンジング
- [ ] ZIP ダウンロードの UX を Toast で通知
- [ ] Firecrawl MCP スキルのローカル設定（`/discord:access` 不要、`npx firecrawl-cli init --browser` でブラウザ認証）

## 開発再開時のコマンド

```bash
cd /Users/noriaki/Desktop/claude_base/clone/open-lovable

# 最新状態確認
git status
git log --oneline -10

# 上流を取り込む場合
git fetch upstream
git merge upstream/main  # コンフリクト要注意

# ローカル開発
pnpm install
pnpm dev     # http://localhost:3000

# 本番確認
vercel logs clone-now.vercel.app --no-follow
```

## テスト方法（E2E）

```bash
# 1. サンドボックス作成
CREATE=$(curl -s -X POST "https://clone-now.vercel.app/api/create-ai-sandbox-v2" -H "Content-Type: application/json" -d '{}')
SID=$(echo "$CREATE" | python3 -c "import sys,json; print(json.load(sys.stdin)['sandboxId'])")

# 2. スクレイプ → 生成 → 適用（詳細は app/generation/page.tsx の startGeneration 参照）

# 3. 確認
curl -s -o /dev/null -w "%{http_code}\n" "https://5173-$SID.e2b.app/src/App.jsx"

# 4. 片付け
curl -s -X POST "https://clone-now.vercel.app/api/kill-sandbox" -H "Content-Type: application/json" -d "{\"sandboxId\":\"$SID\"}"
```

## 最終コミット

`289ecf6 fix: prompt AI for faithful site clone, not modern reinterpretation`

本番 https://clone-now.vercel.app で動作確認済み。Yahoo! JAPAN クローン時に実ニュース記事タイトルと multi-column レイアウトが再現されることを curl で検証済み。
