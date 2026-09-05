# フロントエンド全面刷新計画書 — shadcn/ui デザインシステム移行

- 作成日: 2026-09-04（v3: URL設計を追加）
- 対象: `shimano-compatibility-checker` フロントエンド（`src/` 配下）
- 対象外: `worker/`（Hono API・互換性判定ロジック）は変更しない。フロントエンドはAPIクライアント（`src/api/client.ts`）を通じて既存APIを叩くだけの立て付けを維持する。
- 参照元: https://ui.shadcn.com/ （公式ドキュメント）, https://github.com/shadcn-ui/ui （公式リポジトリ）

> **v2での方針転換**: 初版は「既存3ページ構成にshadcnコンポーネントを当てはめる」計画だったが、UXを踏襲しすぎているとの指摘を受け、**維持するのは非機能要件のみ**とし、画面レイアウト・ページ構成・ナビゲーション・情報設計を作り直した。
> **v3での追加**: 画面構成(2章・3章)に対応するURL設計(4章)を追加。

---

## 0. 維持する非機能要件（スコープの境界線）

以下は変更しない。これ以外（画面構成・ページ数・ナビゲーション・レイアウト・URL構造・UIパーツの選び方）はすべて再設計の対象。

| 区分 | 内容 |
|---|---|
| バックエンドAPI契約 | `GET /api/parts`, `GET /api/parts/:category`, `POST /api/compatibility/check`（`src/api/client.ts` のシグネチャ）は不変 |
| 判定対象パーツ | Shifter / Rear Derailleur / Cassette / Chain の4種（`CompatibilitySelection`型）。ブレーキ系判定はAPI未実装のためUIにも出さない |
| 技術スタック | React 19 + Vite 6 + TypeScript + react-router-dom（ルート構成は再設計）+ Hono on Cloudflare Workers |
| デプロイ経路 | Cloudflare Workers（Wrangler）+ GitHub Actions CI。SPA(静的ビルド)であり、SSRは行わない |
| SEO/OGP | `index.html` のメタタグ運用（サイト共通の静的な値）は不変 |
| 言語 | UIは日本語（`index.html lang="ja"`, `og:locale ja_JP` を踏襲） |
| アクセシビリティ・レスポンシブ・ダークモード対応 | 非機能要件として維持・強化する対象（形は問わない） |

---

## 1. 現状UXの何が課題か

現状は「選ぶ画面(`/`)」「一覧を見る画面(`/parts`)」「説明を読む画面(`/about`)」が**対等な3ページ**としてナビゲーションに並んでいる。しかしユーザーのゴールは実質1つ——「手持ち／検討中の4パーツが互換するか知りたい」——であり、それ以外は本来ゴールを補助する脇役でしかない。

具体的な課題:

1. **結果が選択操作から切り離されている**: 4つの`<select>`を並べたグリッドの下に結果が表示される設計のため、選び終えるまで結果が視界に入らない。
2. **「探す」と「選ぶ」が別画面**: パーツを検索・比較したい場合は`/parts`に移動する必要があり、選択のたびに画面を往復することになる。ネイティブ`<select>`はパーツ数が増えると選びにくい。
3. **一覧ページの目的が曖昧**: カードグリッドは「眺める」のには向くが「比較する」のには向かない。
4. **Aboutが常時ナビゲーションを占有**: 説明文は一度読めば十分な情報であり、毎回ヘッダーに表示する必要はない。
5. **選択結果・絞り込み状態が共有できない**: 現状は`<select>`の値がURLに反映されないため、「この組み合わせどう？」を人に共有する手段がURLではない。

これらを踏まえ、**画面をゴール中心に再構成**する。

---

## 2. 新しい画面構成（IA）

### Before → After

```
[Before] ヘッダーに3ページを横並びナビゲーション
  / (Compatibility)  … 4×<select> → 下にResultPanel
  /parts             … 検索+2フィルタ → カードグリッド全件
  /about             … 静的な説明文ページ

[After] ゴールは1つ、補助機能は本編に統合
  / (診断ビュー)       … 4スロットのビルダー + 常時表示の結果パネル(2カラム)
                         スロットをタップ→検索可能なパーツピッカー(Command)がその場で開く
                         選択状態はURLクエリに反映(共有・復元可能、4章)
  /catalog (カタログ)  … 全パーツを比較しやすい表形式(Table)で閲覧する専用ビュー
                         検索・フィルタ状態もURLクエリに反映
  Aboutはヘッダー常設ナビから除外 → フッターの「このツールについて」から起動
                         URL(`/about`)自体は維持し、直接アクセス時は独立ページ、
                         アプリ内遷移時はDialogとして重ねる（モーダルルート、4章）
```

ヘッダー常設ナビゲーションは`/`・`/catalog`の2項目のみ。Aboutと各パーツ詳細はURLとしては存在するが、通常のナビゲーション項目としては露出しない「モーダルルート」として扱う（4章）。

### 再設計の狙い

| 課題 | 対応 |
|---|---|
| 結果が選択と切り離されている | 結果パネルをデスクトップでは右カラムに**常時sticky表示**、モバイルでは下部固定バーに変更。選ぶそばから結果が更新される |
| 探す/選ぶが別画面 | `/parts`の検索機能を廃止せず、選択導線そのものに統合。各スロットをクリックすると検索可能な**Commandパレット**（検索欄+候補リスト）が開き、その場で選べる |
| 一覧ページが比較に向かない | カードグリッドを**Table**（列: ID / シリーズ / 速度段数 / アクチュエーション/ブレーキ種別 等）に変更し、スペックの横比較を主目的化 |
| Aboutが常時ナビを占有 | ヘッダーから除外しフッターへ格下げ。ただしURL(`/about`)自体は残し、ブックマーク・クローラー対応は維持（4章） |
| 状態が共有できない | 選択パーツ・検索/フィルタ条件をURLクエリに正規化。リンクをコピーするだけで同じ画面状態を再現できる（4章） |

---

## 3. 画面詳細設計

### 3.1 診断ビュー（`/`）— アプリの主画面

デスクトップ（`lg:`以上）は2カラム、モバイルは1カラム+下部固定サマリー。

```
┌───────────────────────────────────────────────┐
│ AppShell Header（sticky・スリム）                  │
├─────────────────────────────┬─────────────────┤
│ スロットグリッド（2×2）            │ 結果レール(sticky) │
│ ┌───────────┐ ┌───────────┐ │ ┌─────────────┐ │
│ │ Shifter   │ │ Rear Der. │ │ │ 進捗 Progress │ │
│ └───────────┘ └───────────┘ │ │ 2/4 選択済み  │ │
│ ┌───────────┐ ┌───────────┐ │ ├─────────────┤ │
│ │ Cassette  │ │ Chain     │ │ │ OK/NG カード  │ │
│ └───────────┘ └───────────┘ │ │ 理由リスト    │ │
└─────────────────────────────┴─────────────────┘
```

- **SlotCard（新規コンポーネント）**: カテゴリごとの選択枠。
  - 未選択時: 破線ボーダーの`Card`、カテゴリ名+アイコン(`lucide-react`)、「タップして選択」の弱調テキスト
  - 選択済み: 実線`Card`、`CardTitle`にパーツID、`Badge`群でスペック要約（speed/actuation/freehub等）、右上に「変更」ボタン(`Button variant="ghost" size="sm"`)
  - カード全体がクリック領域。クリックで**PartPicker**を開く
- **PartPicker（新規コンポーネント）**: `Dialog`内に`Command`（`CommandInput`+`CommandList`+`CommandItem`）を配置した検索型ピッカー。`CommandItem`にID・シリーズ・主要スペックを2行で表示し、絞り込みながら選べる。旧`/parts`の検索体験をここに統合する
- **結果レール**: `Card`ベース。
  - 4スロットのうち未選択がある間は`Progress`（例: 2/4）+「あと2つ選択してください」の案内を表示
  - 4つ揃うとAPIを叩き、結果を大きめの状態表示に切替: OK→`CheckCircle2`アイコン+緑系トーン、NG→`XCircle`+`destructive`トーン。NG時は理由(`reasons[]`)を箇条書き
  - 判定中は`Skeleton`
  - API失敗時はエラー内容をこのカード内に表示（+ 任意で`Sonner`トースト）
- **モバイル**: スロットグリッドは1カラム（またはコンパクト2カラム）。結果レールは`fixed bottom-0`の要約バー（OK/NGの色+アイコンのみ）に折りたたみ、タップで`Drawer`（下からせり上がるシート）が全文を表示
- **選択状態はURLに同期**（4章）。ページを開いた瞬間にクエリから選択状態を復元する

### 3.2 カタログビュー（`/catalog`）— 参照・比較用

- 上部ツールバー: `Input`（フリーテキスト検索）+ `Select`（カテゴリ）+ `Select`（速度段数）— 既存のフィルタリングロジック（クライアント側filter）はそのまま流用
- メイン: `Table`。列はカテゴリ横断の共通列（ID / カテゴリ / シリーズ・ブランド / 速度段数）+ カテゴリ固有情報は`Badge`でセル内に補助表示（例: RDなら`max_sprocket`、カセットなら`range`）
- 0件時: 既存同様、`text-muted-foreground text-sm`のメッセージ
- 行クリックで`/catalog/:partId`へ遷移し、該当パーツの詳細を`Sheet`（画面右からのスライドパネル）に表示する（4章のモーダルルートパターン）。診断ビューへの値の受け渡しは行わず、**読む・比較するための独立した画面**と位置づける（診断は`/`のPartPickerで完結させ、責務を分離する）
- 検索・フィルタ状態はURLクエリに同期（4章）

### 3.3 About（モーダルルート）

- ヘッダーの常設ナビからは除外。`AppShell`のフッターに「このツールについて」リンクを常設する
- URL自体は`/about`として維持する。アプリ内クリックで開いた場合は現在の画面(`/`または`/catalog`)を背景に保ったまま`Dialog`として重ねる。直接アクセス・リロード・外部リンク・クローラーからのアクセス時は独立したページとして全文表示する（4章のモーダルルートパターン、bookmark/SEO互換のため）
- 免責文（「本アプリはShimano社と提携していません」）のみ、フッターに常時薄く表示し続ける（法的表示は毎回目に入る場所に置く）

### 3.4 AppShell（共通レイアウト）

- ヘッダー: 左にプロダクト名（アイコン+テキスト、コンパクト）、右に「カタログ」リンク(`buttonVariants({variant:"ghost"})`)+`ModeToggle`のみ。常設ナビゲーション項目は2つに削減
- フッター: About起動リンク + 免責文 + （任意）GitHubリンク
- `parts`データ（`getParts()`）は`/`と`/catalog`の両方で必要なため、AppShell層で一度だけ取得し、`usePartsContext`のような軽量Contextで共有する（React Queryのような外部ライブラリは導入しない。単一の小さなGETエンドポイントに対してオーバースペックなため）

---

## 4. URL設計

### 設計方針

- 常設ナビゲーションのルートは`/`・`/catalog`の2つ（2章）。これに加えて、**選択状態・フィルタ状態・詳細表示状態はURLに正規化して持たせる**。これにより「いま見ている画面」をそのままリンクとして共有・ブックマーク・ブラウザの戻る/進むで復元できる
- 一時的なUIアニメーション状態（Dialog/Sheet/Drawerの開閉トランジション等）はURLに持たせない。ただし「どのパーツの詳細を開いているか」「Aboutを開いているか」という**表示状態そのもの**はURLに反映する
- Aboutとパーツ詳細は、react-router-dom 7標準機能のみで実現できる**モーダルルート（background location）パターン**を採用する。追加ライブラリは不要。直接アクセス/リロード/クローラーには単独ページとして描画し、アプリ内遷移時のみ現在画面の上にオーバーレイとして描画する

### ルート一覧

| パス | 画面 | 備考 |
|---|---|---|
| `/` | 診断ビュー（未選択） | 初期表示 |
| `/?shifter=<id>&rd=<id>&cassette=<id>&chain=<id>` | 診断ビュー（選択状態を復元） | 4つ全て揃っていなくてもよい（部分復元）。キー名は`CompatibilitySelection`のフィールドに準拠した短縮形 |
| `/catalog` | カタログ（絞り込みなし） | |
| `/catalog?q=<text>&category=<cat>&speed=<n>` | カタログ（絞り込み状態を保持） | 既存`PartsPage`の`q`/`category`/`speed`ステート名をそのまま踏襲 |
| `/catalog/:partId` | カタログ + 該当パーツの詳細`Sheet` | アプリ内遷移時はbackgroundLocationで`/catalog`を背景に維持したままSheetのみ重ねる。直接アクセス時はカタログ全体+詳細表示状態を初期描画 |
| `/about` | About | アプリ内遷移時はbackgroundLocationで現在画面を背景に`Dialog`表示。直接アクセス/リロード時は独立ページとして全文表示（クローラー・旧URL互換のため） |
| 上記以外 | `/`へリダイレクト、またはシンプルな404表示 | |

### 実装メモ

- **選択状態の同期**: 診断ビューは`useSearchParams`（react-router-dom）でクエリを読み書きする。スロット変更のたびに`setSearchParams(next, { replace: true })`で**履歴を汚さず**現在のURLを更新する（選択1回ごとに「戻る」履歴が積まれるのを防ぐ）
- **不正なID**: クエリの`shifter`等が実在しないIDの場合は無視してそのスロットを未選択のまま扱う（エラーにしない）。任意で`Sonner`トーストで「指定されたパーツが見つかりませんでした」と知らせる
- **カタログ検索の同期**: `q`はデバウンス（例: 300ms）してからURLへ反映。`category`/`speed`は即時反映で問題ない
- **本文の共通化**: `/about`の`Dialog`表示と独立ページ表示は中身（`AboutContent`）を共通化し、外枠（`Dialog`か通常のページレイアウトか）だけを出し分ける。`/catalog/:partId`の`Sheet`表示と直接アクセス時の詳細表示も同様に`PartDetailContent`を共通化し、重複実装を避ける
- **モーダルルートの実装パターン**（react-router-dom 7標準機能のみ、追加ライブラリ不要）:

  ```tsx
  function App() {
    const location = useLocation();
    const state = location.state as { backgroundLocation?: Location } | null;

    return (
      <>
        <Routes location={state?.backgroundLocation ?? location}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DiagnosisPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:partId" element={<CatalogPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Routes>

        {state?.backgroundLocation && (
          <Routes>
            <Route path="/catalog/:partId" element={<PartDetailSheet />} />
            <Route path="/about" element={<AboutDialogOverlay />} />
          </Routes>
        )}
      </>
    );
  }
  ```

  アプリ内リンクは `<Link to="/about" state={{ backgroundLocation: location }}>` のように遷移する。これにより直接URLを開いた場合は`AboutPage`（全文ページ）がそのまま描画され、アプリ内クリックの場合は現在画面を保ったまま`AboutDialogOverlay`が重なる
- **OGP/SEOの限界（意図的なスコープ外）**: 本アプリはCloudflare Workers上でHono APIを配信する構成であり、`index.html`はビルド時に生成された静的ファイルを配信するSPAで、SSRは行わない。そのため`/?shifter=...`のような選択状態付きURLを共有しても、SNS等のリンクプレビュー(OGP)は`index.html`に埋め込まれた**サイト共通の**タイトル・説明のままになる（「この組み合わせは互換NGでした」のような動的プレビューは出せない）。URL自体は正しく状態を復元するため機能的な共有は成立するが、OGPを組み合わせ単位で動的化するにはHono側で`/`宛リクエストのHTMLを都度生成する対応が別途必要になる。**今回のスコープ外**（0章でOGP運用を現状維持と明記している通り）

---

## 5. shadcn/ui の設計思想（要点・不変）

- **配布モデル**: `pnpm dlx shadcn@latest add button` のようにCLIを実行すると、`button.tsx`等のソースファイルがそのまま`src/components/ui/`にコピーされる。npm依存としてインストールされる「ブラックボックスなライブラリ」ではない。MITライセンスで改変自由
- **スタイリング基盤**: Tailwind CSS v4（CSS-firstコンフィグ、`tailwind.config.js`不要、`@theme`ディレクティブでトークン定義）
- **アクセシビリティ基盤**: 各コンポーネントは`class-variance-authority`(cva)でバリアント管理し、内部的に**Base UI**（Radix UIの後継として現行ドキュメントが既定採用しているヘッドレスUIプリミティブ）でキーボード操作・フォーカストラップ・ARIA属性を実装
- **アイコン**: `lucide-react`
- **クラス結合ユーティリティ**: `cn()`（`clsx`+`tailwind-merge`）を`src/lib/utils.ts`に配置
- **スタイル系統**: `"new-york"`を採用（`"default"`は非推奨）

---

## 6. セットアップ手順

### 6.1 Tailwind CSS v4 の導入

```bash
pnpm add tailwindcss @tailwindcss/vite
```

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), cloudflare(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### 6.2 パスエイリアス `@/*`

`tsconfig.json`（ルート）と`tsconfig.app.json`の両方に追記:

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

`tsconfig.worker.json`は対象外。

### 6.3 CSSエントリの統合

`src/styles/base.css` + `src/styles/layout.css`の個別importを廃し、単一エントリ`src/index.css`に統合:

```css
@import "tailwindcss";

:root { /* 7章のトークン定義 */ }
.dark { /* ダークモード用トークン */ }
@theme inline { /* CSS変数 → Tailwindユーティリティのブリッジ */ }

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

`main.tsx`のimportを`import "./index.css";`に一本化。旧`*.module.css`群はフェーズ4で全廃（9章）。

### 6.4 shadcn CLI 初期化

```bash
pnpm add -D @types/node
pnpm dlx shadcn@latest init
```

| 質問 | 回答 |
|---|---|
| Style | `new-york` |
| Base color | `neutral` |
| CSS variables | Yes |
| Base primitive | Base UI（既定） |

想定`components.json`:

```jsonc
{
  "style": "new-york",
  "tsx": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### 6.5 コンポーネント追加

新IAで実際に使うものだけを追加する（`--all`は使わない）:

```bash
pnpm dlx shadcn@latest add button card badge separator skeleton \
  command dialog sheet drawer table select input progress \
  dropdown-menu tooltip sonner
```

| コンポーネント | 用途 |
|---|---|
| `command` | PartPicker（パーツ検索・選択） |
| `dialog` | PartPickerの外枠、Aboutオーバーレイ |
| `sheet` | カタログの行詳細スライドパネル |
| `drawer` | モバイル結果レールの展開シート（vaulベース） |
| `table` | カタログビューのスペック比較表 |
| `select` / `input` | カタログの検索・フィルタツールバー |
| `progress` | 診断ビューの「n/4選択済み」表示 |
| `card` / `badge` / `separator` / `skeleton` | SlotCard・結果レール共通 |
| `dropdown-menu` | ModeToggle |
| `tooltip` | スペック略語の補足（任意） |
| `sonner` | API失敗時のトースト、不正なパーツID通知（任意） |

旧計画にあった`navigation-menu`は不要（常設ナビが2リンクのみのため`buttonVariants`で十分）。

---

## 7. デザイントークン / ダークモード（不変）

| トークン | 役割 |
|---|---|
| `background` / `foreground` | ページ全体の背景・既定テキスト |
| `card` / `card-foreground` | SlotCard・結果レール・Table行など一段浮いた面 |
| `popover` / `popover-foreground` | Command・DropdownMenu・Tooltip等の浮遊要素 |
| `primary` / `primary-foreground` | 主要アクション、選択済みスロットの強調 |
| `secondary` / `secondary-foreground` | 低強調の塗り・バッジ |
| `muted` / `muted-foreground` | 補足説明・プレースホルダー・免責文 |
| `accent` / `accent-foreground` | hover/focus/active時のハイライト |
| `destructive` | NG判定・エラー |
| `border` / `input` / `ring` | 境界線・フォーム枠・フォーカスリング |
| `radius` | 角丸基準値 |

ダークモード実装（Vite SPA向け・`next-themes`不使用）:

1. `src/components/theme-provider.tsx` — `theme: "light"|"dark"|"system"`を保持するContext。`localStorage`（キー`shimano-ui-theme`）に永続化、`document.documentElement`に`.light`/`.dark`クラス付与、`"system"`は`matchMedia`で解決
2. `AppShell`ルートを`<ThemeProvider defaultTheme="system">`でラップ
3. ヘッダーに`ModeToggle`（`Sun`/`Moon`アイコン+`DropdownMenu`）を設置

---

## 8. ディレクトリ構成

```
src/
├── app/
│   ├── app-shell.tsx             # header + footer + <Outlet/>、PartsProvider設置
│   ├── theme-provider.tsx
│   └── mode-toggle.tsx
├── components/
│   ├── ui/                       # shadcn CLI生成物（button, card, badge, command, dialog, sheet, drawer, table, ...）
│   ├── slot-card.tsx
│   ├── part-picker.tsx           # Command + Dialogベースの検索型ピッカー
│   ├── result-rail.tsx           # 常時表示の結果パネル(+モバイル用Drawer)
│   ├── parts-table.tsx
│   ├── about-content.tsx         # About本文（Dialog/独立ページ共通）
│   ├── about-dialog-overlay.tsx  # モーダルルート用オーバーレイ外枠
│   ├── part-detail-content.tsx   # パーツ詳細本文（Sheet/独立ページ共通）
│   └── part-detail-sheet.tsx     # モーダルルート用オーバーレイ外枠
├── hooks/
│   └── use-parts.ts              # PartsContextの参照フック
├── pages/
│   ├── diagnosis-page.tsx        # "/" 診断ビュー（selectionはuseSearchParamsで同期）
│   ├── catalog-page.tsx          # "/catalog" と "/catalog/:partId" 共用
│   └── about-page.tsx            # "/about" 直接アクセス時の独立ページ
├── lib/
│   └── utils.ts                  # cn()
├── api/
│   └── client.ts                  # 変更なし
├── types.ts                        # 変更なし
├── index.css
├── App.tsx                          # ルーティング定義（4章のbackgroundLocationパターン）+ AppShell
└── main.tsx
```

`src/styles/`配下と旧`pages/{Compatibility,Parts,About}Page.tsx`・旧`components/{PartSelector,PartCard,ResultPanel,RuleBadge}.tsx`は新構成へ置き換え後に削除する。

---

## 9. 段階的移行プラン

| フェーズ | 内容 | 完了条件 |
|---|---|---|
| **Phase 0** | Tailwind v4 + パスエイリアス導入、`shadcn init`実行 | `pnpm dev`起動、Tailwindクラスが反映される |
| **Phase 1** | 6.5節のコンポーネント一式を`shadcn add`で導入 | `src/components/ui/`が揃い`pnpm typecheck`が通る |
| **Phase 2** | `AppShell`（ヘッダー/フッター/ThemeProvider/PartsContext）構築。ルーティングを`/`・`/catalog`・`/catalog/:partId`・`/about`の4ルート＋backgroundLocationパターンで再定義、旧`/parts`ルート廃止 | ダークモード切替が動作。`/about`への直接アクセスと、アプリ内リンクからの遷移(オーバーレイ表示)の両方が機能する |
| **Phase 3** | 診断ビュー実装（SlotCard・PartPicker・結果レール、進捗表示、モバイルDrawer、選択状態のURLクエリ同期） | 4パーツ選択→既存APIと同じレスポンスで結果表示。選択操作から結果までのスクロール往復が発生しない。選択状態付きURLを開くと同じ選択が復元される |
| **Phase 4** | カタログビュー実装（Table化、検索/フィルタのURLクエリ同期、行クリック→`/catalog/:partId`のSheet表示）。旧`src/styles/*`・旧pages/componentsを削除 | `grep -r "module.css" src`が0件、旧3ページのファイルが残っていない。フィルタ付きURL・詳細付きURLがそれぞれ復元可能 |
| **Phase 5（任意）** | カタログのソート強化（`@tanstack/react-table`導入検討）、Sonnerトースト、Tooltip、詳細Sheet/ページの充実等の磨き込み | プロダクトオーナー判断で取捨選択 |

各フェーズ終了時に`pnpm typecheck`・`pnpm build`を実行し、Cloudflare Workers向けビルドが壊れていないことを確認する。

---

## 10. 注意点・リスク

- **Tailwind v4の破壊的変更**: `tailwind.config.js`を書く旧来のワークフローは通用しない（CSS内`@theme`記法必須）
- **Base UI vs Radix UI**: 公式ドキュメントは現在Base UIを既定にしているが、本家GitHubレジストリの一部実装は過渡的に`radix-ui`パッケージを直接importしている箇所も残る。`shadcn add`が解決する実装をそのまま採用し、独自に混在させない
- **Drawer(`vaul`)の追加依存**: モバイル結果レール等でDrawerを使う場合、`vaul`パッケージがCLI経由で追加される。バンドルサイズへの影響は軽微だが把握しておく
- **Worker側は無関係**: `worker/`配下・`src/api/client.ts`のインターフェースは変更しない
- **状態管理**: `/`と`/catalog`が同じ`parts`データを必要とするため、二重フェッチを避ける軽量Context（`PartsProvider`）を`AppShell`に置く。react-query等の外部データフェッチライブラリは、単一の小さなGET APIに対してはオーバースペックなため導入しない
- **URL状態とhistoryの肥大化**: `useSearchParams`更新は基本`{ replace: true }`とし、選択・入力のたびに戻る履歴が積まれないようにする（4章）
- **カタログのソート機能**: Phase 4時点では静的な`Table`表示に留め、本格的なソート・ページネーションが必要になった場合のみPhase 5で`@tanstack/react-table`を検討する（未使用の抽象化を先取りしない）
- **OGPの動的化はスコープ外**: 選択状態付きURLのSNSリンクプレビューはサイト共通のOGPのままになる（4章で明記の既知の制約）
- **バンドルサイズ**: shadcn/uiは「使うコンポーネントだけコピーする」方式のため、未使用コンポーネントのコードは持ち込まれない。`--all`は使わない

---

## 11. 参考リンク

- shadcn/ui 公式ドキュメント: https://ui.shadcn.com/
  - Installation (Vite): https://ui.shadcn.com/docs/installation/vite
  - components.json: https://ui.shadcn.com/docs/components-json
  - Theming: https://ui.shadcn.com/docs/theming
  - Dark Mode (Vite): https://ui.shadcn.com/docs/dark-mode/vite
  - CLI: https://ui.shadcn.com/docs/cli
  - Command / Combobox: https://ui.shadcn.com/docs/components/command
  - Table: https://ui.shadcn.com/docs/components/table
- shadcn/ui 公式リポジトリ: https://github.com/shadcn-ui/ui （MIT License）
- React Router — Modal Route (background location) パターン参考実装: react-router-dom公式の "Image Gallery" example と同等の手法
