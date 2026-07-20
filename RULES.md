# Halcyon プロジェクトルール

## 概要

**Halcyon** は 5Gkyu のホームページ。カスタム Web Components ベースの独自デザインシステム（Halcyon Design System）で構築されている。

- **ホスト**: GitHub Pages (`https://5gkyu.github.io/`)
- **コンポーネント定義**: `components/components.js` 1ファイルに全コンポーネントを集約

---

## ディレクトリ構造

```
/
├── index.html              # トップページ（ヒーロー画像 + ナビゲーション）
├── 404.html                # 404ページ（花びらアニメーション）
├── sitemap.xml
├── column1.html / column2.html
├── components/
│   └── components.js       #  デザインシステム本体（全CSS・全コンポーネント）
├── about/index.html
├── contact/index.html
├── gear/index.html
├── policy/index.html
├── prologue/index.html
├── hl-char/                # キャラクター素材
└── archive/                # コンテンツアーカイブ
    ├── index.html          # アーカイブトップ
    ├── data.json           #  記事・ツール一覧データ（archive-loader.js が参照）
    ├── archive-loader.js   # data.json を読み込んでカードグリッドを生成
    ├── app/                # ツール・アプリ
    │   ├── index.html
    │   ├── collage-maker/
    │   ├── color/
    │   ├── image-compression/
    │   ├── image-pdf/
    │   ├── redirect-gen/
    │   └── x/
    │       ├── dm/
    │       └── intent/
    ├── note/               # 記事ページ
    │   ├── index.html
    │   ├── color-and-design/
    │   └── typography/
    ├── play/index.html
    └── other/index.html
```

---

## コンポーネントシステム

### 基本ルール

すべてのコンポーネントは `components/components.js` 内で `HTMLElement` を継承したクラスとして定義し、`customElements.define()` で登録する。

```js
class HlExample extends HTMLElement {
  connectedCallback() {
    if (this.dataset.rendered) return;   //  必須: 二重レンダリング防止
    this.dataset.rendered = 'true';
    // ... this.innerHTML = `...`;
  }
}
customElements.define('hl-example', HlExample);
```

**レンダーガード** (`this.dataset.rendered`) は全コンポーネントに必須。

### カラーパレット

```css
--clr-cream:      #FBF6EA   /* 背景・ベース */
--clr-sage:       #9AB08F   /* アクセント・ボーダー・アクティブ */
--clr-peach:      #EEAFA1   /* サブアクセント・警告系 */
--clr-dusty-blue: #92B5BC   /* リンク・情報系 */
--clr-brown:      #6A564A   /* テキスト */
```

### フォント

```css
--font-main: 'Zen Maru Gothic', 'Hiragino Sans', sans-serif  /* 本文 */
--font-code: monospace系                                       /* コード */
```

---

## ページ構成パターン

### 全ページ共通

```html
<site-header site-name="ページ名"></site-header>
<!-- コンテンツ -->
<site-footer copy="5Gkyu"></site-footer>
<script src="/components/components.js"></script>
```

FOUC防止スタイルを `<head>` 内に配置する:
```html
<style id="fouc-prevent">body { opacity: 0 !important; visibility: hidden !important; background-color: #FBF6EA !important; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }</style>
```

### 1カラムページ（トップ・About など）

レイアウトコンポーネントは使わず、独自スタイルで構成する。

### 2カラムページ（Archive 系の一覧ページ）

```html
<hl-layout cols="2">
  <div class="hl-layout-main">
    <page-title>ページタイトル</page-title>
    <!-- section-heading を使ったセクション群 -->
  </div>
  <aside class="hl-layout-sidebar">
    <hl-profile></hl-profile>
    <hl-sidebar-box><!-- 任意のサイドバーコンテンツ --></hl-sidebar-box>
  </aside>
</hl-layout>
```

> **サイドバーには sticky を使わない**（`hl-toc` が sticky を持つ記事ページとは異なる）

### 2カラムページ（Note 記事ページ）

```html
<hl-layout cols="2">
  <div class="hl-layout-main">
    <hl-breadcrumb ...></hl-breadcrumb>
    <page-title>記事タイトル</page-title>
    <div class="hl-content-text">
      <!-- h2[id] / h3[id] で構成された記事本文 -->
    </div>
    <hl-share></hl-share>
  </div>
  <aside class="hl-layout-sidebar">
    <div class="sidebar-sticky">       <!--  sticky はここだけ -->
      <hl-profile></hl-profile>
      <hl-toc></hl-toc>
    </div>
  </aside>
</hl-layout>
```

```css
/* 記事ページのサイドバー sticky */
.sidebar-sticky { position: sticky; top: 100px; }
```

---

## ページ種別ごとの見出しルール

### Archive / App / Play / Other（一覧・ツールページ）

`section-heading` コンポーネントを使ってセクションを区切る。  
`hl-toc` はこれを自動検出して目次を生成する。

```html
<section>
  <section-heading>セクション名</section-heading>
  <!-- カードグリッドなど -->
</section>
```

### Note（記事ページ）

標準の `h2` / `h3` タグに `id` を付けて記事を構成する。  
`hl-toc` が `.hl-layout-main` 内の `h2[id]` / `h3[id]` を自動検出する。

```html
<h2 id="section-id">セクション見出し</h2>
<h3 id="subsection-id">サブセクション見出し</h3>
```

- h2 は主要セクション（8個以上推奨）
- h3 は各セクションの補足・詳細
- 末尾は必ず `<h2 id="references">参考文献・注記</h2>` で締める
- `#what-is-*`、`#how-to-*` のような英語 kebab-case でIDを付ける

---

## コンポーネント一覧と用途

### レイアウト系

| コンポーネント | 用途 |
|---|---|
| `<site-header site-name="...">` | 固定ヘッダー。`site-name` でページカテゴリ名を表示 |
| `<site-footer copy="5Gkyu">` | フッター |
| `<hl-layout cols="1\|2">` | メインレイアウト。`cols="2"` で `.hl-layout-main` + `.hl-layout-sidebar` の2カラム |
| `<page-title>` | ページ大見出し（`h1` 相当） |
| `<section-heading>` | セクション区切り見出し（App/一覧ページ用） |
| `<hl-breadcrumb level1-name="" level1-url="" ...>` | パンくずリスト |

### サイドバー系

| コンポーネント | 用途 |
|---|---|
| `<hl-profile>` | プロフィールカード（サイドバー上部に配置） |
| `<hl-toc>` | 目次（記事ページの `.sidebar-sticky` 内に配置） |
| `<hl-sidebar-box>` | 汎用サイドバーブロック |

### 記事コンテンツ系（Note 専用）

| コンポーネント | 用途 |
|---|---|
| `<hl-lead>` | リード文（記事冒頭の要約パラグラフ） |
| `<hl-figure caption="..." source="...">` | 図版・画像ブロック。`src` なしで子要素をビジュアルとして使用可 |
| `<hl-compare left-label="..." right-label="...">` | 左右比較ブロック。`slot="left"` / `slot="right"` で内容を指定 |
| `<hl-cite title="" author="" ...>` | 参考文献カード |
| `<hl-fn num="N">` | 脚注参照番号（本文中に inline で配置） |
| `<hl-fn-item num="N">` | 脚注本文（`hl-footnotes` 内に配置） |
| `<hl-footnotes label="注記">` | 脚注セクションコンテナ |
| `<hl-quote source="...">` | 引用ブロック |
| `<hl-chat char="A-F" align="left\|right">` | キャラクター会話ブロック（章の区切りや解説後のアクセントとして使用） |

### インタラクション系

| コンポーネント | 用途 |
|---|---|
| `<hl-accordion title="...">` | 折りたたみブロック |
| `<hl-tabs>` / `<div class="hl-tab-panel" data-label="...">` | タブパネル |
| `<hl-modal>` | モーダルダイアログ |
| `<hl-drawer>` | サイドドロワー |

### UI パーツ系

| コンポーネント | 用途 |
|---|---|
| `<hl-alert type="info\|warning\|success">` | アラートカード |
| `<hl-code lang="CSS\|HTML\|JS">` | シンタックスハイライト付きコードブロック |
| `<hl-step>` / `<hl-step-item num="N" title="...">` | ステップ手順 |
| `<hl-button>` | ボタン |
| `<hl-share>` | SNS シェアボタン（記事末尾に配置） |
| `<hl-card>` / `<hl-card-grid>` | カードとカードグリッド |
| `<hl-chip>` | チップ（タグ表示） |
| `<hl-avatar>` | アバター画像 |
| `<hl-divider>` | 区切り線 |
| `<hl-skeleton>` | ローディングスケルトン |

### フォーム系

`<hl-input>` / `<hl-textarea>` / `<hl-select>` / `<hl-checkbox>` / `<hl-radio>` / `<hl-toggle>` / `<hl-slider>` / `<hl-file-input>`

### App ツール専用

| コンポーネント | 用途 |
|---|---|
| `<hl-app-sheet>` | ツールページの操作パネルカード |
| `<hl-categories>` | カテゴリフィルター |

---

## archive/data.json ルール

アーカイブページで表示するコンテンツの一覧データ。`archive-loader.js` が読み込んでカードグリッドを自動生成する。

```json
{
  "セクションID": {
    "sections": [
      {
        "id": "セクションID",
        "heading": " セクション名",
        "cols": 3,
        "items": [
          {
            "title": "タイトル",
            "href": "/archive/note/slug/",
            "image": "https://5gkyu.github.io/icon/ogp.png",
            "description": "説明文"
          }
        ]
      }
    ]
  }
}
```

- `cols`: カードグリッドのカラム数（2 or 3）
- `image`: OGP画像 URL
- 新しい記事を追加したら必ずここに追記する

### note セクション構成

| セクション id | heading | 用途 |
|---|---|---|
| `consideration` | <hl-icon name="search"></hl-icon> 考察 | 考察・エッセイ系記事 |
| `guide` |  ガイド | 入門・ハウツー系記事 |
| `column` |  コラム | コラム（現在 Coming Soon） |

---

## ページ固有スタイルのルール

- ページ固有の CSS は各 HTML の `<head>` 内 `<style>` に記述する
- 全ページ共通の CSS は `components/components.js` 内のグローバル CSS に記述する
- クラス命名は BEM ライク（`hl-component__element--modifier`）

---

## アニメーション・演出ルール

- エントリーアニメーション: `class="fluffy-entry"` / `"fluffy-entry-down"` + `"delay-1"` など
- ローディングオーバーレイ: `components.js` が自動制御（FOUC防止後に `body` を表示）
- スクロール進捗バー: ヘッダー下部のラインに自動適用

---

## meta・SEO ルール

全ページに以下を記述:

```html
<meta name="description" content="...">
<link rel="canonical" href="https://5gkyu.github.io/パス/">
<meta property="og:title" content="ページタイトル | Halcyon - 5Gkyu">
<meta property="og:description" content="...">
<meta property="og:image" content="https://5gkyu.github.io/icon/ogp.png">
<meta property="og:url" content="https://5gkyu.github.io/パス/">
<meta property="og:type" content="website | article">
<meta property="og:site_name" content="Halcyon">
<meta name="twitter:card" content="summary_large_image">
```

---

## hl-chat コンポーネント 使用ガイド

記事の合間にキャラクター同士の短い会話を挿入し、読者の理解を助けたり和やかな雰囲気を作るために使う。  
**記事全体を会話形式にするのではなく**、章の区切りや難しい解説の後にアクセントとして数回（数レス程度）登場させること。

### 基本構文

```html
<hl-chat char="A" align="left">ねえねえ、これってどういうこと？</hl-chat>
<hl-chat char="C" align="right">それはね、〇〇という仕組みなのよ。</hl-chat>
```

### 属性

| 属性 | 値 | 説明 |
|---|---|---|
| `char` | `A` ～ `F`（大文字） | キャラクター指定（必須） |
| `align` | `left` / `right` | 吹き出しの向き。対話感が出るよう左右に振ること（省略時は `left`） |

### グループコンセプト

**Halcyon**（寛容な共鳴）。誰も他者を強く否定せず、互いの違いを受け入れる優しい世界観。

### キャラクター設定

| char | 名前 | イメージカラー | 性格・文体 |
|---|---|---|---|
| `A` | Akari | ピンク | 起爆剤。直感的な疑問を投げて気を引く |
| `B` | Becky | 水色 | 共感者。明るく反応し、読者目線で話を広げる |
| `C` | Charlotte | 紫 | 知識人。優しく的確に要約・解説をする |
| `D` | Dulcie | オレンジ | まとめ役。場を気遣い整える |
| `E` | Esmé | 黄色 | 見守り。少し距離を置いて温かく相槌を打つ |
| `F` | Fūka | 緑 | レアキャラ。「……うん」など一言のみ。長台詞・仕切り役は絶対NG |

### キャラクターの心理的バックグラウンド（深みの核）

表面的な役割だけをなぞると「説明用の代弁者」になってしまう。セリフの根底に**各キャラクターの弱さ・痛み**をトッピングすることで、記事テーマとキャラクターが強くリンクする。

| char | 表面の役割 | 根底にある痛み・弱さ | NG パターン |
|---|---|---|---|
| `A` | 疑問を投げる起爆剤 | 孤独への恐れ。「こっち見て！」という衝動が先走る寂しがり屋 | ただの優秀な聞き手にしてはいけない。Akariの「エゴ」を入れること |
| `B` | 共感・読者目線 | 嫌われたくないから沈黙を埋めようと話しすぎる。後で「言い過ぎたかな」と一人で落ち込む不安型 | 分析的な締め言葉はNG（それはCharlotte向き）。空回りする自分を見せること |
| `C` | 知識で解説する | 他者の棘を深く受信しすぎて疲れてしまう。争いを避ける控えめなシェルター | 自ら「面白いのよね」と切り出す哲学的分析はNG。他者の痛みへの共鳴から発言させること |
| `D` | 場をまとめる | 特になし。前向きな読み替えで包み込む潤滑油 | 急ぎすぎるとまとめが空回りする |
| `E` | 温かく見守る | 特になし。深く入り込みすぎない「温かい沈黙の提供者」 | 分析や仕切りに入ってはいけない |
| `F` | 一言で締める | 特になし。Esméの温もりに安心して一言だけ肯定する存在 | 2言以上は絶対NG |

### 会話作成ルール

1. **登場人物は 2〜4 名**に絞る。記事の文脈に合ったキャラクターをピックアップすること。
2. **キャラクターの性格を守る**。他者を攻撃するような強い言葉は絶対に使わない。
3. **IT・哲学などの難しいテーマ**を扱う場合は、Akari が日常的な疑問として投げ → Charlotte が優しく解説 → Becky が読者目線で驚く、という役割分担を基本とする。
4. **Fūka（F）は頻繁に登場させない**。一言だけで場を締めるレアな出番に限定する。
5. `halcyon_lore.md` を参照し、キャラクターの深層心理を考慮すること。
6. **「説明用の代弁者」にしてはいけない**。各キャラクターの弱さ・痛みをセリフの根底に忍ばせること。「この子はなぜこの発言をしたのか」を常に問いながら書く。

### 配置の目安

- 1 記事につき 1〜5 セット（多くても 6 セット）まで
- 章の導入（フック）として:　難しい解説の直後の「緩和剤」として:　記事の締めくくり（余韻）として:使うといいかも。もちろんほかの場所に使ってもいい。
- 会話は 2〜10 行程度に収める（長い独白は NG）
