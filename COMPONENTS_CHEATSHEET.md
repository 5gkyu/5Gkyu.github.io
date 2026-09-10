# Halcyon コンポーネント チートシート & AI開発リファレンス

本ドキュメントは、Halcyon Design System の全Web Componentsに関する属性・スロット・使用例をまとめたチートシートです。
人間がページを作成する際のコピペ用リファレンスとしてだけでなく、**AIが正確なHTMLコードを生成するための仕様書**としても機能します。

---

## 目次

1. [クイックスタート（全ページ共通）](#クイックスタート全ページ共通)
2. [ページ全体のボイラープレート（テンプレート）](#ページ全体のボイラープレートテンプレート)
3. [レイアウト系コンポーネント](#1-レイアウト系)
4. [サイドバー系コンポーネント](#2-サイドバー系)
5. [記事・Note系コンポーネント](#3-記事note系)
6. [基本UIパーツ](#4-基本uiパーツ)
7. [インタラクション系コンポーネント](#5-インタラクション系)
8. [フォーム系コンポーネント](#6-フォーム系)
9. [拡張・便利ツール系コンポーネント](#7-拡張便利ツール系)

---

## クイックスタート（全ページ共通）

すべてのページで `<head>` 内にチラつき防止スタイルを配置し、`</body>` 直前で `components.js` を1行読み込みます。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ページタイトル - Halcyon</title>
  <!-- チラつき（FOUC）防止スタイル -->
  <style id="fouc-prevent">body { opacity: 0 !important; visibility: hidden !important; background-color: #FBF6EA !important; } *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }</style>
</head>
<body>
  <site-header site-name="カテゴリ名"></site-header>

  <!-- ページコンテンツ -->

  <site-footer copy="5Gkyu"></site-footer>
  <script src="/components/components.js"></script>
</body>
</html>
```

---

## ページ全体のボイラープレート（テンプレート）

### テンプレートA: ツール・App用（1カラム / 2カラム）

```html
<hl-layout cols="1">
  <hl-breadcrumb 
    level1-name="Archive" level1-url="/archive/" 
    level2-name="App" level2-url="/archive/app/" 
    current="ツール名">
  </hl-breadcrumb>

  <page-title>ツール名</page-title>
  <p class="hl-content-text">ツールの説明文をここに記載します。</p>

  <hl-card style="margin-top: 1.5rem;">
    <!-- ツール本体UI -->
  </hl-card>
</hl-layout>
```

### テンプレートB: Note記事用（目次連動 2カラム）

```html
<hl-layout cols="2">
  <div class="hl-layout-main">
    <hl-breadcrumb 
      level1-name="Archive" level1-url="/archive/" 
      level2-name="Note" level2-url="/archive/note/" 
      current="記事タイトル">
    </hl-breadcrumb>

    <page-title>記事タイトル</page-title>

    <hl-lead>
      記事の要約や導入文をここに記載します。
    </hl-lead>

    <div class="hl-content-text">
      <h2 id="section-1">第1章 見出し</h2>
      <p>本文テキスト...</p>

      <h3 id="section-1-1">詳細項目</h3>
      <p>補足説明...</p>

      <h2 id="references">参考文献・注記</h2>
      <hl-cite title="参考資料名" author="著者名" year="2026" url="https://example.com/"></hl-cite>
    </div>

    <hl-share text="記事をシェア"></hl-share>
  </div>

  <aside class="hl-layout-sidebar">
    <div class="sidebar-sticky">
      <hl-profile></hl-profile>
      <hl-toc></hl-toc>
    </div>
  </aside>
</hl-layout>
```

---

## 1. レイアウト系

### `<site-header>`
固定ヘッダーを表示します。ロゴ、ナビゲーション、プログレスバーが含まれます。
- **属性**:
  - `site-name` (string): ヘッダー右上に表示するカテゴリバッジ名（例: `"App"`, `"Note"`, `"Entrance"`）
- **使用例**:
  ```html
  <site-header site-name="App"></site-header>
  ```

### `<site-footer>`
サイト共通のフッターを表示します。
- **属性**:
  - `copy` (string): コピーライト表記名（通常は `"5Gkyu"`）
- **使用例**:
  ```html
  <site-footer copy="5Gkyu"></site-footer>
  ```

### `<hl-layout>`
メインコンテナの横幅とカラム数を制御します。
- **属性**:
  - `cols` (`"1"` | `"2"`): カラム数。単一カラムは `"1"`（標準720px）、サイドバー付きは `"2"`（標準1100px）を指定。
  - `size` (`"wide"` | `"full"`): 横幅の拡張（省略時は標準）。
    - `size="wide"`: 横幅を **1280px** に拡張（カードの多い一覧やダッシュボード等）。
    - `size="full"`: 横幅を **min(1440px, 95vw)** に拡張（エディタ等の作業領域用）。
- **使用例**:
  ```html
  <!-- 標準2カラム -->
  <hl-layout cols="2">
    <div class="hl-layout-main">メインコンテンツ</div>
    <aside class="hl-layout-sidebar">サイドバー</aside>
  </hl-layout>

  <!-- ワイド2カラム -->
  <hl-layout cols="2" size="wide">
    <div class="hl-layout-main">メインコンテンツ</div>
    <aside class="hl-layout-sidebar">サイドバー</aside>
  </hl-layout>
  ```

### `<page-title>`
ページの大見出し（H1相当）と装飾アンダーラインを表示します。
- **使用例**:
  ```html
  <page-title>画像圧縮ツール</page-title>
  ```

### `<section-heading>`
セクションの区切り見出しを表示します（App一覧やツール内で使用）。
- **使用例**:
  ```html
  <section-heading>設定オプション</section-heading>
  ```

### `<hl-breadcrumb>`
パンくずリストを表示します。
- **属性**:
  - `level1-name`, `level1-url`: 第1階層
  - `level2-name`, `level2-url`: 第2階層（省略可）
  - `current`: 現在のページ名
- **使用例**:
  ```html
  <hl-breadcrumb 
    level1-name="Archive" level1-url="/archive/" 
    level2-name="App" level2-url="/archive/app/" 
    current="画像圧縮">
  </hl-breadcrumb>
  ```

---

## 2. サイドバー系

### `<hl-profile>`
プロフィールカード（アイコン、名前、SNSリンク、紹介文）を表示します。
- **使用例**:
  ```html
  <hl-profile></hl-profile>
  ```

### `<hl-toc>`
記事内の `h2[id]` および `h3[id]` を自動検出して、スクロール追従目次を生成します。
- **使用例**:
  ```html
  <div class="sidebar-sticky">
    <hl-toc></hl-toc>
  </div>
  ```

### `<hl-sidebar-box>`
サイドバー内に配置する汎用装飾ボックスです。
- **使用例**:
  ```html
  <hl-sidebar-box>
    <div class="hl-sidebar-title">Information</div>
    <p class="hl-content-text">サイドバーの補足情報...</p>
  </hl-sidebar-box>
  ```

---

## 3. 記事・Note系

### `<hl-lead>`
記事冒頭のリード文（要約パラグラフ）を装飾枠で表示します。
- **使用例**:
  ```html
  <hl-lead>
    この記事では、Web ComponentsとLitを活用したモダンなフロントエンド設計について解説します。
  </hl-lead>
  ```

### `<hl-figure>`
図版・画像をキャプションおよび出典リンク付きで美しく表示します。
- **属性**:
  - `src` (string): 画像URL
  - `alt` (string): 代替テキスト
  - `caption` (string): 画像下の説明
  - `source` (string, optional): 出典名
- **使用例**:
  ```html
  <hl-figure 
    src="/image/diagram.png" 
    alt="構成図" 
    caption="システムアーキテクチャ概要" 
    source="公式ドキュメント">
  </hl-figure>
  ```

### `<hl-quote>`
引用文を大きなクォーテーションアイコンとともにおしゃれに表示します。
- **属性**:
  - `source` (string): 引用元名
  - `href` (string, optional): 引用元のリンクURL
- **使用例**:
  ```html
  <hl-quote source="Steve Jobs" href="https://example.com">
    Stay hungry, stay foolish.
  </hl-quote>
  ```

### `<hl-chat>`
キャラクターによる会話吹き出しブロックを表示します。
- **属性**:
  - `char` (`"A"`〜`"F"`): キャラクターID（A: Akari, B: Becky, C: Charlotte, D: Dulcie, E: Esmé, F: Fūka）
  - `align` (`"left"` | `"right"`): 吹き出しの位置（default: `"left"`）
- **使用例**:
  ```html
  <hl-chat char="B" align="left">
    コンポーネントを分割したから、とっても修正しやすくなったね！
  </hl-chat>
  <hl-chat char="F" align="right">
    うん、AIも迷わずコードを書けるよ。
  </hl-chat>
  ```

### `<hl-compare>`
左右比較ブロックを表示します（Before/Afterや2つの概念の比較）。
- **属性**:
  - `left-label`: 左側のラベル
  - `right-label`: 右側のラベル
- **使用例**:
  ```html
  <hl-compare left-label="従来の書き方" right-label="Litでの書き方">
    <div slot="left">手動でDOMを更新する必要がある</div>
    <div slot="right">プロパティ変更で自動更新される</div>
  </hl-compare>
  ```

### `<hl-cite>`
参考文献カードを表示します。
- **属性**:
  - `title`, `author`, `publisher`, `year`, `url`, `accessed`
- **使用例**:
  ```html
  <hl-cite 
    title="Web Components入門" 
    author="山田太郎" 
    publisher="技術書出版" 
    year="2026" 
    url="https://example.com/">
  </hl-cite>
  ```

### 脚注（`<hl-fn>`, `<hl-fn-item>`, `<hl-footnotes>`）
本文中の参照番号と末尾の注記一覧を作成します。
- **使用例**:
  ```html
  <p>Web Componentsはブラウザ標準規格です<hl-fn num="1"></hl-fn>。</p>

  <!-- 記事末尾 -->
  <hl-footnotes label="注記・解説">
    <hl-fn-item num="1">W3Cで策定されたCustom Elements等の総称。</hl-fn-item>
  </hl-footnotes>
  ```

### `<hl-share>`
X（Twitter）シェアボタン、OS標準シェアボタン、全文コピーボタンを表示します。
- **使用例**:
  ```html
  <hl-share text="記事を共有する"></hl-share>
  ```

---

## 4. 基本UIパーツ

### `<hl-button>`
統一感のあるモダンなボタンを表示します。
- **属性**:
  - `variant` (`"primary"` | `"secondary"` | `"danger"` | `"ghost"`): 配色スタイル
  - `size` (`"sm"` | `"md"` | `"lg"`): ボタンサイズ
  - `icon` (string, optional): アイコン名
  - `href` (string, optional): リンクボタンにする場合のURL
- **使用例**:
  ```html
  <hl-button variant="primary" size="md">決定する</hl-button>
  <hl-button variant="secondary" size="sm" icon="copy">コピー</hl-button>
  ```

### `<hl-card>` & `<hl-card-grid>`
白基調の美しいカードとグリッドレイアウトです。
- **使用例**:
  ```html
  <hl-card-grid>
    <hl-card>
      <h3>カードタイトル</h3>
      <p class="hl-content-text">カードの内容...</p>
    </hl-card>
    <hl-card>
      <h3>カード2</h3>
      <p class="hl-content-text">カードの内容...</p>
    </hl-card>
  </hl-card-grid>
  ```

### `<hl-alert>`
注意書きやインフォメーションコールアウトを表示します。
- **属性**:
  - `type` (`"info"` | `"warning"` | `"success"` | `"danger"`)
- **使用例**:
  ```html
  <hl-alert type="warning">
    ブラウザのローカル環境でのみ動作し、サーバーにはデータは送信されません。
  </hl-alert>
  ```

### `<hl-code>`
シンタックスハイライト風のコード表示ブロックです。
- **属性**:
  - `lang` (`"HTML"` | `"CSS"` | `"JS"` | `"JSON"` など)
- **使用例**:
  ```html
  <hl-code lang="HTML">
&lt;script src="/components/components.js"&gt;&lt;/script&gt;
  </hl-code>
  ```

---

## 5. インタラクション系

### `<hl-accordion>`（★Lit製）
クリックで滑らかに開閉するアコーディオンです。
- **属性**:
  - `title` (string): ヘッダータイトル
- **使用例**:
  ```html
  <hl-accordion title="詳しい使い方を見る">
    <p>1. ファイルを選択します。<br>2. 変換ボタンを押します。</p>
  </hl-accordion>
  ```

### `<hl-tabs>`
複数パネルを切り替えるタブコンポーネントです。
- **使用例**:
  ```html
  <hl-tabs>
    <div class="hl-tab-panel" data-label="基本設定">
      <p>基本設定の内容...</p>
    </div>
    <div class="hl-tab-panel" data-label="詳細設定">
      <p>詳細設定の内容...</p>
    </div>
  </hl-tabs>
  ```

### `<hl-modal>`
ポップアップモーダルダイアログを表示します。
- **使用例**:
  ```html
  <hl-modal id="my-modal">
    <h3 slot="header">確認</h3>
    <p>本当に実行しますか？</p>
    <div slot="footer">
      <hl-button variant="primary">はい</hl-button>
    </div>
  </hl-modal>
  ```

---

## 6. フォーム系

### `<hl-input>`
ラベルとフォーカスアニメーション付きテキスト入力です。
- **属性**:
  - `label`, `type`, `placeholder`, `value`, `name`
- **使用例**:
  ```html
  <hl-input label="お名前" placeholder="山田 太郎"></hl-input>
  ```

### `<hl-toggle>`
トグルスイッチです。
- **属性**:
  - `label`, `checked` (boolean)
- **使用例**:
  ```html
  <hl-toggle label="ダークモード" checked></hl-toggle>
  ```

### `<hl-slider>`
数値スライダーです。
- **属性**:
  - `label`, `min`, `max`, `value`, `step`, `unit`
- **使用例**:
  ```html
  <hl-slider label="圧縮品質" min="1" max="100" value="80" unit="%"></hl-slider>
  ```

---

## 7. 拡張・便利ツール系

### `<hl-copy-box>`（★Lit製）
ワンクリックでクリップボードにコピーできるコード・文字列表示ボックスです。
- **属性**:
  - `value`: コピーする文字列
  - `label` (optional): 見出しラベル
  - `button-text` (optional): ボタンの文字（default: `"コピー"`）
- **使用例**:
  ```html
  <hl-copy-box label="インストールコマンド" value="npm install halcyon-ui"></hl-copy-box>
  ```

### `<hl-gauge>`（★Lit製）
パーセンテージや数値を円形のアニメーショングラフで表示します。
- **属性**:
  - `value`: 現在値（動的に変更可能）
  - `max`: 最大値（default: `100`）
  - `label`: ゲージ下のラベル
  - `unit`: 単位（default: `"%"`）
  - `color`: ゲージの色（default: `"#2d6c66"`）
- **使用例**:
  ```html
  <hl-gauge value="85" max="100" label="達成率" color="#9AB08F"></hl-gauge>
  ```

### `<hl-before-after>`（★Lit製）
スライダーで2枚の画像を直感的に比較できるコンポーネントです。
- **属性**:
  - `before`: 変更前の画像URL
  - `after`: 変更後の画像URL
  - `label-before`: 左側ラベル（default: `"Before"`）
  - `label-after`: 右側ラベル（default: `"After"`）
- **使用例**:
  ```html
  <hl-before-after 
    before="/image/original.jpg" 
    after="/image/compressed.jpg" 
    label-before="圧縮前 (2.4MB)" 
    label-after="圧縮後 (320KB)">
  </hl-before-after>
  ```

### `<hl-tag-filter>`（★Lit製）
タグボタンで特定エリア内のアイテムを絞り込み表示するバーです。
- **属性**:
  - `target`: 絞り込み対象のコンテナ要素のID
- **使用例**:
  ```html
  <hl-tag-filter target="item-list"></hl-tag-filter>
  <div id="item-list">
    <div data-tag="network">ネットワーク記事</div>
    <div data-tag="device">デバイス記事</div>
  </div>
  ```
