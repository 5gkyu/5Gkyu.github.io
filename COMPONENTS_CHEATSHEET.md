# Halcyon コンポーネント完全チートシート & 実装リファレンス

本ドキュメントは、**Halcyon Design System** の全 Web Components に関する属性・スロット・使用例・仕様をまとめた完全リファレンスです。
`components/src/` 配下の実コードを検査・検証した最新の仕様に基づいており、開発時のコピペ用だけでなく、AIエージェントが正確なコードを生成するための仕様書として機能します。

---

## 目次

1. [共通ルール & クイックスタート](#共通ルール--クイックスタート)
2. [基本テンプレート](#基本テンプレート)
   - [テンプレートA: ツール・Webアプリ用](#テンプレートa-ツールwebアプリ用)
   - [テンプレートB: Note記事用（hl-article）](#テンプレートb-note記事用hl-article)
   - [テンプレートC: 一般・一覧ページ用（hl-layout）](#テンプレートc-一般一覧ページ用hl-layout)
3. [1. レイアウト系 (layout)](#1-レイアウト系-layout)
4. [2. サイドバー系 (sidebar)](#2-サイドバー系-sidebar)
5. [3. 記事・コンテンツ系 (content)](#3-記事コンテンツ系-content)
6. [4. 基本UIパーツ (ui)](#4-基本uiパーツ-ui)
7. [5. インタラクション系 (interactive)](#5-インタラクション系-interactive)
8. [6. フォーム部品群 (forms)](#6-フォーム部品群-forms)
9. [7. 拡張・便利ツール系 (extensions)](#7-拡張便利ツール系-extensions)

---

## 共通ルール & クイックスタート

全ページ共通で、`<head>` 内にチラつき（FOUC）防止スタイルを配置し、`</body>` 直前で `components.js` を読み込みます。

> **デザイン・アイコン原則（絵文字の絶対禁止）**:
> UI、ボタン、見出し、説明文、ラベル等において **Unicode絵文字（⚡, 📋, 📦, 💡, 🚀など）の使用は厳禁** です。
> アイコンが必要な場合は、`<hl-icon name="...">`、インライン `<svg>` タグ（`fill="currentColor"` や `stroke="currentColor"` を使用）、またはSVG画像を使用してください。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ページタイトル | Halcyon - 5Gkyu</title>
  
  <!-- チラつき（FOUC）防止スタイル -->
  <style id="fouc-prevent">
    body { opacity: 0 !important; visibility: hidden !important; background-color: #FBF6EA !important; }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  </style>
</head>
<body>

  <!-- コンテンツ（テンプレートを参照） -->

  <!-- 全コンポーネントを自動ロードするエントリポイント -->
  <script src="/components/components.js"></script>
</body>
</html>
```

---

## 基本テンプレート

### テンプレートA: ツール・Webアプリ用
ツール本体を1カラム（または2カラム）で中央配置する標準的な構成です。

```html
<site-header site-name="App"></site-header>

<hl-layout cols="1">
  <hl-breadcrumb
    level1-name="Archive" level1-url="/archive/"
    level2-name="App" level2-url="/archive/app/"
    current="ツール名">
  </hl-breadcrumb>

  <page-title>ツール名</page-title>
  <p class="hl-content-text">ツールの概要や使い方の説明文をここに記載します。</p>

  <hl-card style="margin-top: 1.5rem;">
    <!-- ツール本体UI -->
  </hl-card>
</hl-layout>

<site-footer copy="5Gkyu"></site-footer>
```

### テンプレートB: Note記事用（hl-article）
Note（考察・コラム・解説）記事では、`<hl-article>` を使用します。
ヘッダー、フッター、パンくず、目次、著者情報、Markdownパース処理がすべて自動で内包・展開されます。

```html
<hl-article
  title="記事タイトル"
  date="2026.09.22"
  badge="考察"
  category="Note"
  category-url="/archive/note/"
  description="1〜2文程度の魅力的な要約文。">

<!-- 本文（Markdown記法とHTMLタグをそのまま記述可能） -->

## 第1章 見出し
本文テキスト。**太字**や `コード`、[リンク](url) がそのまま使えます。

<hl-chat char="A">素朴な疑問を投げるセリフ</hl-chat>
<hl-chat char="B">共感やツッコミを返すセリフ</hl-chat>

<hl-alert type="info">補足情報やワンポイント豆知識</hl-alert>

## 参考文献・注記
<hl-cite title="文献タイトル" author="著者名" year="2026" url="https://example.com/"></hl-cite>

</hl-article>
```

### テンプレートC: 一般・一覧ページ用（hl-layout）
サイドバー付きの2カラムレイアウトで、カードグリッドやセクション見出しを並べる構成です。

```html
<site-header site-name="Archive"></site-header>

<hl-layout cols="2">
  <div class="hl-layout-main">
    <hl-breadcrumb level1-name="Home" level1-url="/" current="Archive"></hl-breadcrumb>
    <page-title>コンテンツ一覧</page-title>

    <section>
      <section-heading>Webツール</section-heading>
      <hl-card-grid cols="2">
        <hl-card clickable href="/archive/app/color/">カラーパレット</hl-card>
        <hl-card clickable href="/archive/app/image-compression/">画像圧縮</hl-card>
      </hl-card-grid>
    </section>
  </div>

  <aside class="hl-layout-sidebar">
    <hl-profile></hl-profile>
    <hl-sidebar-box title="ご案内">
      <p>サイドバーの補足テキスト</p>
    </hl-sidebar-box>
  </aside>
</hl-layout>

<site-footer copy="5Gkyu"></site-footer>
```

---

## 1. レイアウト系 (layout)

### `<site-header>`
固定ヘッダーを表示します。ロゴ、ナビゲーションリンク、読了プログレスバーを含みます。
- **属性**:
  - `site-name`: 右側に小さく表示される現在カテゴリ・サイト名（例: `App`, `Note`, `Archive`）
- **使用例**:
  ```html
  <site-header site-name="App"></site-header>
  ```

### `<site-footer>`
サイト全体の共通フッターを表示します。著作権表記、ページトップへのスムーススクロールボタンが含まれます。
- **属性**:
  - `copy`: コピーライト表記の名前（デフォルト: `5Gkyu`）
- **使用例**:
  ```html
  <site-footer copy="5Gkyu"></site-footer>
  ```

### `<hl-layout>`
コンテンツ全体の横幅とカラム構造（1カラム / 2カラム）を規定するレイアウトコンテナです。
- **属性**:
  - `cols`: カラム数。`"1"`（メイン幅 1000px）または `"2"`（メイン + サイドバー 1100px）
  - `size`: 横幅のバリエーション。
    - `narrow`: 最大 720px
    - `wide`: 最大 1280px
    - `full`: 最大 min(1440px, 95vw)
- **スロット構造 (cols="2" 時)**:
  - `<div class="hl-layout-main">`: メインコンテンツ領域
  - `<aside class="hl-layout-sidebar">`: サイドバー領域
- **使用例**:
  ```html
  <hl-layout cols="2">
    <div class="hl-layout-main">メインコンテンツ</div>
    <aside class="hl-layout-sidebar">サイドバー</aside>
  </hl-layout>
  ```

### `<page-title>`
ページの大見出し（`<h1>` 相当）を表示します。左端にデザインアクセントのボーダーが付きます。
- **使用例**:
  ```html
  <page-title>ページ大見出しタイトル</page-title>
  ```

### `<section-heading>`
一覧ページやアプリ内のセクション区切り見出し（`<h2>` 相当）を表示します。`hl-toc` によって目次項目として自動認識されます。
- **使用例**:
  ```html
  <section-heading>セクション見出し</section-heading>
  ```

### `<hl-breadcrumb>`
現在ページの階層構造を示すパンくずナビゲーションです。
- **属性**:
  - `level1-name`, `level1-url`: 第1階層
  - `level2-name`, `level2-url`: 第2階層
  - `level3-name`, `level3-url`: 第3階層（任意）
  - `current`: 現在のページ名
- **使用例**:
  ```html
  <hl-breadcrumb
    level1-name="Archive" level1-url="/archive/"
    level2-name="App" level2-url="/archive/app/"
    current="画像圧縮ツール">
  </hl-breadcrumb>
  ```

---

## 2. サイドバー系 (sidebar)

### `<hl-profile>`
5Gkyuのプロフィールカード（アイコン、名前、自己紹介、主要SNSリンク）を表示します。
- **使用例**:
  ```html
  <hl-profile></hl-profile>
  ```

### `<hl-toc>`
ページ内の見出し（`h2`, `h3`, `section-heading`）を自動検出し、スクロール連動ハイライト付きの目次リストを自動生成します。
- **属性**:
  - `label`: 目次タイトル（デフォルト: `目次`）
- **使用例**:
  ```html
  <hl-toc></hl-toc>
  ```

### `<hl-sidebar-box>`
サイドバー内に任意のウィジェットや案内文を配置するためのカードブロックです。
- **属性**:
  - `title`: ブロックの見出しタイトル
- **使用例**:
  ```html
  <hl-sidebar-box title="関連リンク">
    <p>サイドバー内に自由に配置できます。</p>
  </hl-sidebar-box>
  ```

### `<hl-app-sheet>`
モバイル画面（幅 860px 以下）において、画面下部からスライドアップする設定・操作用ボトムシートを提供します。ヘッダー内に自動で展開ボタン（歯車アイコン）を注入します。
- **属性**:
  - `label`: ボタンのアクセシビリティラベル（デフォルト: `設定`）
- **使用例**:
  ```html
  <hl-app-sheet label="ツール設定">
    <h3>設定パネル</h3>
    <!-- モバイル用設定UI -->
  </hl-app-sheet>
  ```

---

## 3. 記事・コンテンツ系 (content)

### `<hl-article>`
Note記事用の統合ラッパーコンポーネントです。ヘッダー、フッター、パンくず、目次、著者情報、記事メタデータをすべて内包し、子要素のMarkdown記法を自動解析・描画します。
- **属性**:
  - `title`: 記事タイトル（ブラウザの `<title>` にも自動反映）
  - `date`: 公開日（例: `2026.09.22`）
  - `badge`: カテゴリバッジ（例: `考察`, `ガイド`, `コラム`, `雑学`）
  - `category`: パンくず・ヘッダー用カテゴリ名（デフォルト: `Note`）
  - `category-url`: カテゴリリンク先（デフォルト: `/archive/note/`）
  - `description`: 記事要約（`meta[name="description"]` に自動反映）
- **使用例**: [テンプレートB: Note記事用](#テンプレートb-note記事用hl-article) を参照。

### `<hl-lead>`
記事冒頭の要約や導入パラグラフを強調表示します。
- **使用例**:
  ```html
  <hl-lead>
    この記事では、デザインシステムにおけるコンポーネント設計の要点を解説します。
  </hl-lead>
  ```

### `<hl-chat>`
会話吹き出しを表示します。
- **属性**:
  - `char`: キャラクターID（`A`〜`F`）
  - `align`: 配置位置（`left` または `right`。未指定時は自動配置）
- **使用例**:
  ```html
  <hl-chat char="A">素朴な疑問やコメント</hl-chat>
  <hl-chat char="B">回答や解説</hl-chat>
  ```
> ※各キャラクターの設定や会話文の作成ガイドラインは、専用スキル [note-writer](file:///c:/Users/yuton/OneDrive/デスクトップ/mainpage/.agents/skills/note-writer/SKILL.md) を参照してください。

### `<hl-figure>`
キャプションや出典元（クレジット）付きの図版・画像ブロックです。
- **属性**:
  - `src`: 画像URL（指定時は `<img>` を自動生成）
  - `alt`: 代替テキスト
  - `caption`: 図版の説明文（キャプション）
  - `source`: 出典元クレジット（例: `Wikimedia Commons`）
- **使用例**:
  ```html
  <hl-figure src="/path/to/image.png" alt="図解" caption="アーキテクチャ概要図" source="公式ドキュメント">
  </hl-figure>
  ```

### `<hl-image>`
角丸や影の付いた記事用画像ブロックです。
- **属性**:
  - `src`: 画像URL
  - `alt`: 代替テキスト
  - `caption`: キャプション（任意）
  - `aspect-ratio`: アスペクト比（例: `16/9`, `4/3`, `1/1`）
  - `max-width`: 最大幅（例: `600px`）
  - `border`: `true` で枠線を表示
- **使用例**:
  ```html
  <hl-image src="/path/to/photo.jpg" alt="風景写真" caption="夕暮れの街並み" aspect-ratio="16/9"></hl-image>
  ```

### `<hl-quote>`
出典元の明記が可能な引用ブロックです。
- **属性**:
  - `source`: 引用元の著者・文献名
  - `url`: 引用元へのリンクURL（任意）
- **使用例**:
  ```html
  <hl-quote source="ショーペンハウアー, 『読書について』" url="https://example.com/">
    読書とは、他人にものを考えてもらうことである。
  </hl-quote>
  ```

### `<hl-compare>`
2つの概念や選択肢を左右2カラムで分かりやすく対比表示するブロックです。
- **属性**:
  - `left-label`: 左カラムの見出しタイトル
  - `right-label`: 右カラムの見出しタイトル
- **スロット**:
  - `slot="left"`: 左側のコンテンツ
  - `slot="right"`: 右側のコンテンツ
- **使用例**:
  ```html
  <hl-compare left-label="静的サイト" right-label="動的サイト">
    <div slot="left">
      <ul>
        <li>高速な表示</li>
        <li>サーバー保守が不要</li>
      </ul>
    </div>
    <div slot="right">
      <ul>
        <li>リアルタイム更新が可能</li>
        <li>データベースが必要</li>
      </ul>
    </div>
  </hl-compare>
  ```

### `<hl-cite>`
記事末尾の参考文献カードです。実在する書籍や文献・Webリンクを明記します。
- **属性**:
  - `title`: 論文・書籍・記事のタイトル
  - `author`: 著者名
  - `publisher`: 出版社・メディア名
  - `year`: 発行年
  - `url`: リンク先URL
  - `accessed`: 閲覧日（例: `2026.09.22`）
- **使用例**:
  ```html
  <hl-cite title="デザインの心理学" author="D. A. ノーマン" publisher="新曜社" year="1990"></hl-cite>
  ```

### 脚注コンポーネント (`<hl-fn>`, `<hl-fn-item>`, `<hl-footnotes>`)
本文中の注釈番号と、末尾の注釈一覧を連携させます。
- **使用例**:
  ```html
  <!-- 本文中の注釈番号 -->
  <p>最新のWeb標準仕様<hl-fn num="1"></hl-fn>に準拠しています。</p>

  <!-- 記事末尾の注釈ブロック -->
  <hl-footnotes label="注記">
    <hl-fn-item num="1">W3C Recommendation 2026年版仕様書を参照。</hl-fn-item>
  </hl-footnotes>
  ```

### `<hl-embed>`
YouTubeやニコニコ動画の動画埋め込みコンポーネントです。通常URLを指定するだけで自動的に埋め込みプレイヤーURLへ変換されます。
- **属性**:
  - `url`: 動画視聴URL（YouTube: `watch?v=...` や `youtu.be/...`、ニコニコ: `nicovideo.jp/watch/...`）
  - `src`: 埋め込みURLを直接指定する場合
  - `caption`: キャプション（任意）
  - `autoplay`, `loop`, `muted`: 再生オプション
- **使用例**:
  ```html
  <hl-embed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" caption="デモ動画"></hl-embed>
  ```

### `<hl-share>`
X (Twitter) へのポスト、およびURLクリップボードコピーボタンを横並びで表示します。記事末尾に配置します。
- **属性**:
  - `text`: シェア時のポスト文言（任意）
- **使用例**:
  ```html
  <hl-share text="Halcyonデザインシステムについて"></hl-share>
  ```

---

## 4. 基本UIパーツ (ui)

### `<hl-icon>`
組み込みSVGアイコンを表示します。
- **属性**:
  - `name`: アイコン名（下記定義済みアイコンから選択）
- **利用可能なアイコン名**:
  `gear` (歯車), `lightbulb` (電球), `trash` (ゴミ箱), `image` (画像), `ruler` (定規), `layout` (レイアウト), `floppy-disk` (保存), `search` (虫眼鏡), `palette` (パレット), `pdf` (PDF), `check` (チェック), `file` (ファイル)
- **使用例**:
  ```html
  <hl-icon name="search"></hl-icon>
  ```

### `<hl-button>`
統一デザインのボタンプラグインです。リンク（`<a>`）またはボタン（`<button>`）として自動判定されます。
- **属性**:
  - `variant` (または `type`): `primary` (標準), `secondary` (枠線), `danger` (警告赤), `ghost` (背景透明)
  - `size`: `sm` (小), `lg` (大), 未指定で通常サイズ
  - `icon`: アイコン名（`HL_ICONS` の名前を指定）
  - `href`: 指定すると `<a>` タグとして動作
  - `target`: リンクターゲット（例: `_blank`）
  - `block`: 100%幅で表示
  - `loading`: ローディングスピナー表示（クリック無効）
  - `disabled`: ボタン無効化
  - `selected`: 選択アクティブ状態
- **使用例**:
  ```html
  <hl-button variant="primary" icon="search">検索する</hl-button>
  <hl-button variant="secondary" href="/archive/" size="sm">一覧に戻る</hl-button>
  ```

### `<hl-card>` / `<hl-card-grid>`
柔らかい角丸と境界線を持つカードと、それを均等に並べるグリッドコンテナです。
- **`<hl-card-grid>` 属性**:
  - `cols`: カラム数（`"1"`, `"2"`, `"3"`, `"4"`。デフォルト: `"2"`）
- **`<hl-card>` 属性**:
  - `clickable`: `true` でホバー時に浮き上がるインタラクションを付与
  - `href`: リンクカードとして機能させるURL
- **使用例**:
  ```html
  <hl-card-grid cols="2">
    <hl-card clickable href="/page1/">
      <h3>カードタイトル 1</h3>
      <p>カードの内容テキストです。</p>
    </hl-card>
    <hl-card clickable href="/page2/">
      <h3>カードタイトル 2</h3>
      <p>カードの内容テキストです。</p>
    </hl-card>
  </hl-card-grid>
  ```

### `<hl-alert>`
視覚的な注意喚起やコールアウトを表示します。
- **属性**:
  - `type`: `info` (水色・情報), `warning` (オレンジ・注意), `success` (緑・成功), `danger` (赤・危険)
- **使用例**:
  ```html
  <hl-alert type="warning">入力したデータは自動的に保存されません。</hl-alert>
  ```

### `<hl-code>`
シンタックスハイライト風の装飾とワンクリックコピーボタンを備えたコードブロックです。
- **属性**:
  - `lang`: 言語バッジ表記（例: `HTML`, `CSS`, `JS`, `JSON`, `Bash`）
- **使用例**:
  ```html
  <hl-code lang="JS">
  const greeting = "Hello, Halcyon!";
  console.log(greeting);
  </hl-code>
  ```

### `<hl-step>` / `<hl-step-item>`
番号付きの手順やチュートリアルを順番に分かりやすく表示します。
- **使用例**:
  ```html
  <hl-step>
    <hl-step-item num="1" title="画像の選択">変換したい画像ファイルをドラッグ＆ドロップします。</hl-step-item>
    <hl-step-item num="2" title="設定の調整">スライダーで圧縮率を調整します。</hl-step-item>
    <hl-step-item num="3" title="ダウンロード">保存ボタンを押して保存します。</hl-step-item>
  </hl-step>
  ```

### `<hl-stepper>` / `<hl-stepper-item>`
マルチステップフォームや進捗状況を示すステップバーです。
- **使用例**:
  ```html
  <hl-stepper current="2">
    <hl-stepper-item step="1" label="入力"></hl-stepper-item>
    <hl-stepper-item step="2" label="確認"></hl-stepper-item>
    <hl-stepper-item step="3" label="完了"></hl-stepper-item>
  </hl-stepper>
  ```

### `<hl-table>`
横スクロール対応のレスポンシブなデータテーブルラッパーです。内部に通常の `<table>` を配置します。
- **使用例**:
  ```html
  <hl-table>
    <table>
      <thead><tr><th>項目</th><th>値</th></tr></thead>
      <tbody><tr><td>フォント</td><td>Zen Maru Gothic</td></tr></tbody>
    </table>
  </hl-table>
  ```

### `<hl-pagination>`
ページネーションUIです。
- **属性**:
  - `current`: 現在ページ番号
  - `total`: 総ページ数
  - `per-page`: 1ページあたりの件数

### `<hl-skeleton>`
データ読み込み中のスケルトンスクリーン（プレースホルダーアニメーション）です。
- **属性**:
  - `type`: `text` (テキスト行), `circle` (丸型アバター), `rect` (矩形カード)
  - `width`, `height`: CSSサイズ（例: `100%`, `40px`）

### `<hl-divider>`
セクション間の区切り線です。
- **属性**:
  - `label`: 中央に表示する文字ラベル（任意）
  - `dashed`: 破線にする場合

### `<hl-avatar>`
ユーザーやキャラクターのアバター丸型画像です。
- **属性**:
  - `src`: 画像URL
  - `size`: `sm` (28px), `md` (40px), `lg` (56px)

### `<hl-chip>`
タグや選択バッジを表示します。
- **属性**:
  - `color`: `sage`, `peach`, `blue`, `brown`
  - `selected`: 選択状態

---

## 5. インタラクション系 (interactive)

### `<hl-accordion>`
クリックで開閉する折りたたみアコーディオンブロックです。
- **属性**:
  - `title`: アコーディオンの見出し
  - `open`: 最初から開いた状態にする場合
- **使用例**:
  ```html
  <hl-accordion title="詳しい技術仕様を見る">
    <p>ここに折りたたまれていた詳細な内容を記述します。</p>
  </hl-accordion>
  ```

### `<hl-tabs>`
複数のタブを切り替えて表示するタブパネルです。
- **子要素仕様**: 各タブの内容を `<div class="hl-tab-panel" data-label="タブ名">` で記述します。
- **使用例**:
  ```html
  <hl-tabs>
    <div class="hl-tab-panel" data-label="HTML">
      <p>HTMLの解説</p>
    </div>
    <div class="hl-tab-panel" data-label="CSS">
      <p>CSSの解説</p>
    </div>
  </hl-tabs>
  ```

### `<hl-modal>`
ダイアログモーダルです。
- **属性**:
  - `title`: モーダル見出し
  - `open`: 開閉状態（JSから属性付与またはクラス操作）
- **イベント**: `open-modal`, `close-modal`

### `<hl-tooltip>`
ホバー時にツールチップテキストを表示します。
- **属性**:
  - `text`: 表示するツールチップメッセージ
  - `position`: `top`, `bottom`, `left`, `right`

### `<hl-drawer>`
画面端からスライドインするサイドドロワーです。
- **属性**:
  - `position`: `left` または `right`

---

## 6. フォーム部品群 (forms)

フォーム系コンポーネントは、Halcyonの温かみのあるアースカラーに統一された入力部品です。

### `<hl-input>`
1行テキスト入力欄です。
- **属性**:
  - `label`: 項目ラベル
  - `name`: フォーム送信用の名前
  - `type`: `text`, `email`, `password`, `number`, `url` 等
  - `placeholder`: プレースホルダー
  - `value`: 初期値
  - `helper`: 入力補助テキスト
  - `error`: エラーメッセージ（指定時に枠線が警告色に変化）
- **使用例**:
  ```html
  <hl-input label="お名前" name="username" placeholder="例: 5Gkyu"></hl-input>
  ```

### `<hl-textarea>`
複数行テキスト入力欄です。
- **属性**: `label`, `name`, `rows`, `placeholder`, `value`, `error`

### `<hl-select>`
ドロップダウン選択メニューです。
- **属性**: `label`, `name`
- **子要素**: 通常の `<option value="...">ラベル</option>` を配置します。

### `<hl-checkbox>` / `<hl-radio>`
チェックボックスおよびラジオボタンです。
- **属性**: `label`, `name`, `value`, `checked`, `disabled`

### `<hl-toggle>`
ON/OFFを切り替えるスライダースイッチです。
- **属性**: `label`, `name`, `checked`, `disabled`

### `<hl-slider>`
数値調整用のスライダーバーです。
- **属性**:
  - `label`: 項目ラベル
  - `min`, `max`, `step`: 範囲と刻み幅
  - `value`: 現在値
  - `unit`: 単位表記（例: `%`, `px`）
- **使用例**:
  ```html
  <hl-slider label="圧縮品質" min="10" max="100" step="5" value="80" unit="%"></hl-slider>
  ```

### `<hl-file-input>`
ドラッグ＆ドロップ対応のモダンなファイルアップローダーです。
- **属性**:
  - `label`: アップロードエリアのタイトル
  - `accept`: 許可する拡張子・MIMEタイプ（例: `image/*`, `.png,.jpg`）
  - `multiple`: 複数ファイル選択を許可する場合
- **使用例**:
  ```html
  <hl-file-input label="画像ファイルをドロップ" accept="image/*"></hl-file-input>
  ```

---

## 7. 拡張・便利ツール系 (extensions)

### `<hl-copy-box>`
ワンクリックで文字列をクリップボードにコピーできる専用ボックスです。
- **属性**:
  - `value`: コピー対象の文字列
  - `label`: ボックスのラベル見出し
  - `button-text`: ボタンのテキスト（デフォルト: `コピー`）
- **使用例**:
  ```html
  <hl-copy-box value="https://5gkyu.github.io/" label="サイトURL"></hl-copy-box>
  ```

### `<hl-gauge>`
パーセンテージや達成率を円形プログレスメーターで美しく可視化します。
- **属性**:
  - `value`: 現在値（0〜100）
  - `max`: 最大値（デフォルト: `100`）
  - `label`: ゲージ中央のラベルテキスト
  - `unit`: 単位（デフォルト: `%`）
  - `color`: ゲージ色（例: `var(--clr-sage)`）
- **使用例**:
  ```html
  <hl-gauge value="85" label="完成度" unit="%"></hl-gauge>
  ```

### `<hl-before-after>`
ドラッグで前後の違いを視覚的に比較できるビフォーアフター画像スライダーです。
- **属性**:
  - `before`: 変化前の画像URL
  - `after`: 変化後の画像URL
  - `label-before`: 左側ラベル（デフォルト: `Before`）
  - `label-after`: 右側ラベル（デフォルト: `After`）
- **使用例**:
  ```html
  <hl-before-after
    before="/images/original.jpg"
    after="/images/compressed.jpg"
    label-before="圧縮前 (2.4MB)"
    label-after="圧縮後 (320KB)">
  </hl-before-after>
  ```

### `<hl-tag-filter>`
ボタンクリックで対象要素をリアルタイムに絞り込むタグバーです。
- **属性**:
  - `target`: 絞り込み対象要素のCSSセレクタ
- **使用例**:
  ```html
  <hl-tag-filter target=".article-card"></hl-tag-filter>
  ```

### `<hl-archive-search>`
コンテンツの検索キーワード入力・タグ絞り込みを行う検索バーです。
