# Halcyon Note 記事 — AI 執筆ルール（厳格版）

> このファイルは AI が `archive/note/` 配下の記事を新規作成するときに**必ず守る**ルール集です。
> 一般的なプロジェクトルールは `RULES.md` を参照してください。

---

## 0. 記事作成前チェックリスト

記事を書き始める前に、以下を全て確認・決定してください。

- [ ] スラッグ（URL）を決めた（英語 kebab-case。例: `hedgehog-dilemma`）
- [ ] 記事種別を決めた（`考察` / `ガイド` / `コラム`）
- [ ] 引用・参考文献候補を洗い出し、**実在を確認した**（後述のルール参照）
- [ ] `hl-chat` を使う箇所を 3〜5 か所ピックアップした
- [ ] `archive/data.json` に追記する内容を準備した

---

## 1. ファイル配置ルール

```
archive/note/{スラッグ}/index.html   ← ここに作成
```

作成後は `archive/data.json` の対応セクションに必ずエントリを追加すること（後述）。

---

## 2. HTML テンプレート（全記事共通）

以下をベースに記事を作成すること。**省略・変更が禁止の箇所はコメントで明記**。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{記事タイトル} | Halcyon - 5Gkyu</title>

  <meta name="description" content="{120字以内の説明}">
  <link rel="canonical" href="https://5gkyu.github.io/archive/note/{スラッグ}/">

  <!--  必須: favicon（変更しない） -->
  <link rel="apple-touch-icon" sizes="180x180" href="https://5gkyu.github.io/icon/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="https://5gkyu.github.io/icon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="https://5gkyu.github.io/icon/favicon-16x16.png">
  <link rel="manifest" href="https://5gkyu.github.io/icon/site.webmanifest">
  <meta name="theme-color" content="#FBF6EA">

  <!--  必須: OGP -->
  <meta property="og:title" content="{記事タイトル} | Halcyon - 5Gkyu">
  <meta property="og:description" content="{説明}">
  <meta property="og:image" content="https://5gkyu.github.io/icon/ogp.png">
  <meta property="og:url" content="https://5gkyu.github.io/archive/note/{スラッグ}/">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Halcyon">
  <meta name="twitter:card" content="summary_large_image">

  <!--  必須: FOUC防止（一字一句変えない） -->
  <style id="fouc-prevent">body { opacity: 0 !important; visibility: hidden !important; background-color: #FBF6EA !important; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }</style>

  <style>
    /*  必須: article-meta（変更しない） */
    .article-meta { display: flex; gap: 0.8rem; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; }
    .article-meta__date { font-size: 0.82rem; color: var(--clr-brown); opacity: 0.5; font-weight: 700; }

    /* バッジ色: 考察=sage / ガイド=dusty-blue / コラム=peach */
    .article-meta__badge--consideration {
      display: inline-block; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.75rem;
      border-radius: 50px; background: rgba(154, 176, 143, 0.15);
      color: var(--clr-sage); border: 1px solid rgba(154, 176, 143, 0.3);
    }
    .article-meta__badge--guide {
      display: inline-block; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.75rem;
      border-radius: 50px; background: rgba(146, 181, 188, 0.15);
      color: var(--clr-dusty-blue); border: 1px solid rgba(146, 181, 188, 0.3);
    }
    .article-meta__badge--column {
      display: inline-block; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.75rem;
      border-radius: 50px; background: rgba(238, 175, 161, 0.15);
      color: var(--clr-peach); border: 1px solid rgba(238, 175, 161, 0.3);
    }

    /*  必須: sticky（変更しない） */
    .sidebar-sticky { position: sticky; top: 100px; }

    /*  必須: コピーボタン（変更しない） */
    .copy-article-btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.55rem 1.2rem; border-radius: 50px;
      border: 1.5px solid rgba(106, 86, 74, 0.18); background: transparent;
      color: var(--clr-brown); font-family: var(--font-main);
      font-size: 0.8rem; font-weight: 700; cursor: pointer;
      opacity: 0.55; transition: opacity 0.2s ease, border-color 0.2s ease, background 0.2s ease;
      margin-bottom: 2rem;
    }
    .copy-article-btn:hover { opacity: 0.85; border-color: rgba(106, 86, 74, 0.35); }
    .copy-article-btn.is-copied {
      opacity: 1; border-color: var(--clr-sage);
      background: rgba(154, 176, 143, 0.1); color: var(--clr-sage);
    }

    /* 記事固有スタイルはここに追記する */
  </style>
</head>
<body>

  <site-header site-name="Note"></site-header>

  <hl-layout cols="2" class="fluffy-entry delay-1">
    <div class="hl-layout-main">

      <hl-breadcrumb
        level1-name="Archive" level1-url="/archive/"
        level2-name="Note" level2-url="/archive/note/"
        current="{記事タイトル}">
      </hl-breadcrumb>

      <page-title>{記事タイトル}</page-title>

      <div class="article-meta">
        <span class="article-meta__date">YYYY.MM.DD</span>
        <!-- 種別に応じたバッジクラスを選ぶ -->
        <span class="article-meta__badge--consideration">考察</span>
        <!-- <span class="article-meta__badge--guide">ガイド</span> -->
        <!-- <span class="article-meta__badge--column">コラム</span> -->
      </div>

      <div class="hl-content-text">

        <hl-lead>
          <p>{リード文: 記事の要旨を2〜3文で。読者が「読む価値がある」と感じる入口を作る}</p>
        </hl-lead>

        <!-- === 本文 ここから === -->
        <!-- h2[id] / h3[id] で構成。末尾は必ず #references -->

        <h2 id="...">...</h2>

        <!-- === 本文 ここまで === -->

        <h2 id="references">参考文献・注記</h2>

        <!-- hl-cite は実在確認済みのものだけ。不確かなら省略する -->

      </div>

      <!--  必須: コピーボタン（hl-share の直前に配置） -->
      <button id="copy-article-btn" class="copy-article-btn" onclick="copyArticleText()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true"><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>
        <span class="copy-btn-label">全文をコピー</span>
      </button>

      <hl-share></hl-share>

    </div>

    <aside class="hl-layout-sidebar">
      <hl-profile></hl-profile>
      <div class="sidebar-sticky">
        <hl-toc></hl-toc>
      </div>
    </aside>
  </hl-layout>

  <site-footer copy="5Gkyu"></site-footer>
  <script src="/components/components.js"></script>

  <!--  必須: コピー機能スクリプト（一字一句変えない） -->
  <script>
    function copyArticleText() {
      const charNames = { A: 'Akari', B: 'Becky', C: 'Charlotte', D: 'Dulcie', E: 'Esmé', F: 'Fūka' };
      const container = document.querySelector('.hl-layout-main .hl-content-text');
      if (!container) return;
      const parts = [];
      function processEl(el) {
        const tag = el.tagName ? el.tagName.toLowerCase() : '';
        if (tag === 'h2' || tag === 'h3') {
          const text = el.textContent.trim();
          if (text) parts.push('・' + text);
          return;
        }
        if (tag === 'hl-chat') {
          const char = el.getAttribute('char');
          const name = charNames[char] || char || '?';
          const bubble = el.querySelector('.hl-chat-bubble');
          const text = (bubble || el).textContent.trim();
          if (text) parts.push(name + '：' + text);
          return;
        }
        if (tag === 'hl-lead') {
          el.querySelectorAll('p').forEach(p => { const t = p.textContent.trim(); if (t) parts.push(t); });
          return;
        }
        if (tag === 'hl-quote') {
          const source = el.getAttribute('source') || '';
          const body = el.querySelector('.hl-quote__body');
          const text = (body || el).textContent.trim();
          if (text) parts.push(source ? '「' + text + '」\n── ' + source : '「' + text + '」');
          return;
        }
        if (tag === 'hl-alert') {
          const inner = el.querySelector('p');
          const text = (inner || el).textContent.trim();
          if (text) parts.push('[注] ' + text);
          return;
        }
        if (tag === 'p') { const t = el.textContent.trim(); if (t) parts.push(t); return; }
        if (tag === 'ul') {
          el.querySelectorAll(':scope > li').forEach(li => { parts.push('  ・' + li.textContent.trim()); });
          return;
        }
        if (tag === 'hl-cite') {
          const t = el.getAttribute('title') || '';
          const author = el.getAttribute('author') || '';
          const publisher = el.getAttribute('publisher') || '';
          const year = el.getAttribute('year') || '';
          const url = el.getAttribute('url') || '';
          const accessed = el.getAttribute('accessed') || '';
          const meta = [author, publisher, year].filter(Boolean).join(' / ');
          const urlPart = url ? (accessed ? url + '（' + accessed + ' 参照）' : url) : '';
          const line = [t, meta, urlPart].filter(Boolean).join('\n    ');
          if (line) parts.push('[参考] ' + line);
          return;
        }
        if (tag === 'hl-footnotes') {
          const label = el.getAttribute('label') || '注記';
          const items = el.querySelectorAll('hl-fn-item');
          if (items.length > 0) {
            parts.push('── ' + label + ' ──');
            items.forEach(item => {
              const num = item.getAttribute('num') || '';
              const text = item.textContent.trim();
              if (text) parts.push('[' + num + '] ' + text);
            });
          }
          return;
        }
        if (['hl-figure','hl-compare','hl-code','hl-step','hl-accordion'].includes(tag)) return;
        for (const child of el.children) processEl(child);
      }
      for (const child of container.children) processEl(child);
      const text = parts.join('\n\n');
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copy-article-btn');
        const label = btn.querySelector('.copy-btn-label');
        if (label) label.textContent = 'コピーしました ';
        btn.classList.add('is-copied');
        setTimeout(() => { if (label) label.textContent = '全文をコピー'; btn.classList.remove('is-copied'); }, 2500);
      }).catch(() => { alert('コピーに失敗しました。'); });
    }
  </script>

</body>
</html>
```

---

## 3. 見出し構成ルール

### 必須事項

- `h2` / `h3` には必ず `id` 属性を付ける（`hl-toc` が自動検出するため）
- `id` は英語 **kebab-case**（例: `what-is`, `how-it-works`, `summary`）
- **最後の h2 は必ず `id="references"` で締める**（本文がなくても配置する）

### 推奨構成

| 項目 | 推奨値 |
|---|---|
| h2 の数 | 8〜12 個（少なすぎると TOC が寂しくなる） |
| h3 の数 | 各 h2 に 0〜2 個（多すぎると階層が深くなりすぎる） |
| 1 h2 あたりの本文量 | 200〜600 字（ページが軽すぎても重すぎてもいけない） |

### id 命名パターン例

```
#what-is       → 「〇〇とは」
#origin        → 「起源」「由来」
#how-it-works  → 「仕組み」
#why-matters   → 「なぜ重要か」
#modern        → 「現代における〜」
#summary       → 「まとめ」
#references    → 「参考文献・注記」（必須・固定）
```

---

## 4. 引用・参考文献の厳格ルール 

> **この章は最も厳守すべきルールです。**  
> AI は「それっぽい書誌情報」を非常に自然に生成するが、それは多くの場合 **フィクション**（Hallucination）です。

### 4-1. `hl-cite` を書く前の確認事項

`hl-cite` を 1 件追加するたびに、以下を全て確認すること。

| 確認項目 | OK の基準 |
|---|---|
| **著者名** | その著者が実在し、この分野の著者として妥当か |
| **書名（title）** | 他のソース（Wikipedia 等）でこの書名を確認できるか |
| **出版社（publisher）** | その出版社がこの書籍を出版したと確認できるか |
| **刊行年（year）** | 初版年が正しいか。版違いで年が異なる場合は注記する |
| **URL（url）** | 記載する場合はリンク切れでないか確認する |

**1 項目でも確認できなければ、その `hl-cite` ごと省略する。**  
不確かな文献を "あると思われる" 状態で書かない。

### 4-1b. ウェブ記事・サイトを参照する場合

`url`（リンク）と `accessed`（参照日）属性を追加する。

```html
<hl-cite
  title="ページタイトル"
  author="著者名（ない場合は省略）"
  publisher="サイト名"
  year="公開年または最終更新年"
  url="https://example.com/..."
  accessed="YYYY.MM.DD">
</hl-cite>
```

- `url` を記載する場合はリンク切れを必ず確認する
- `accessed`（参照日）は必須。ウェブページは内容が変わるため
- 御中山など大型サイトや Wikipedia は信頼性レベルに注意（二次情報源として扱う）

### 4-2. `hl-quote` の source 属性

```html
<!-- NG: AIが生成した「それっぽい」言葉を実在の人物に帰属させる -->
<hl-quote source="〇〇, 『著書名』（1900）">
  <p>AIが生成した文章</p>
</hl-quote>

<!-- OK: 実在が確認できる引用 -->
<hl-quote source="著者名, 『書名』（出版年）">
  <p>実際の書籍や文書から引用した文章</p>
</hl-quote>

<!-- OK: AI による言い換えであることを明示 -->
<hl-quote source="著者名（意訳）">
  <p>原著の趣旨を踏まえた意訳文。原文と一致しない場合は（意訳）を必ず付ける。</p>
</hl-quote>
```

### 4-3. 参考文献が不要な場合

- 記事内で具体的な文献を参照していない → `#references` セクション自体を省略してよい  
- 「一般的に知られている知識」を解説するだけなら、無理に出典を作らなくてよい

### 4-4. NG パターン一覧

```
 AIが生成した日本語書名を実在の著者に帰属させる
 実在の著者の書籍のタイトルを「それっぽく」創作する
 正確な刊行年を知らないまま年数を書く
 実在しない出版社名を書く
 確認していない URL を url 属性に書く
 参考にしていない文献を「見栄え」のために追加する
```

### 4-5. 「実際に使った情報源のみ」の原則

> **参考文献には、执筆中に実際に参照した情具源のみを記載する。**

- 「この内容に関連する文献」であっても、実際に文章を書く際に参照していなければ省略する
- 「信頼性のため」「見栄えのため」に追加しない
- 文献数より正確さを優先する。参考文献なしでも書ける内容なら、`#references` セクションごと省略してよい
- 「文献を知っている」ことと「実際に使った」は別物。执筆中に開いて内容を確認したものだけを掲載する

---

## 5. `hl-chat` 使用ルール（考察・解説記事版）

> 詳細なキャラクター設定は `RULES.md` の「hl-chat コンポーネント 使用ガイド」を参照。
> ここでは記事執筆時の**配置設計**に絞って補足する。

### 5-1. 対話モジュール（組み合わせの引き出し）

#### パターンA：【直感と解説】 Akari × Charlotte
* **用途**: 記事の導入や、新しい概念を提示する時。
* **展開**: Akariが「孤独への恐れ」や「寂しさ」を起点とした直感的な疑問を投げかけ、Charlotteがそれに優しく共鳴しながら知識で補足する。

#### パターンB：【直感と常識のズレ】 Akari × Becky
* **用途**: 哲学的な問い（クオリアなど）や、当たり前を疑う時。
* **展開**: Akariが突拍子もない疑問や哲学的な問いを投げ、Beckyが「え、普通に〇〇でしょ？」と読者目線の常識で返し、そこから認識のズレ（棘）が浮き彫りになる。

#### パターンC：【自己防衛の吐露】 Becky × Akari 
* **用途**: 読者に「あるある」と共感させたい時。心理的テーマの中盤。
* **展開**: Beckyが「嫌われたくなくて空回りしてしまう（自己防衛）」エピソードを自己開示し、Akariが「こっち見てほしい衝動」でそれに強く共感する。

#### パターンD：【弱音の受容】 Charlotte × Dulcie
* **用途**: 逆説や矛盾、深い痛みを扱う章の締めくくり。
* **展開**: Charlotteが「他者の感情を受信しすぎて疲弊する」弱音をこぼし、Dulcieがリーダーとして正論を言うのではなく、「今は保留していい」と前向きな逃げ道（許し）を用意する。

#### パターンE：【温かい沈黙】 Esmé × Fūka (または Esmé × 単体)
* **用途**: 記事の最後。深い考察のあとの余韻。
* **展開**: Esméが「深く入り込まず、ただそこにいるだけでいい」という安心感を提示し、Fūkaが「……うん」と一言だけ肯定する。

#### パターンF：【トリオ展開（直感・解説・読者目線）】 Akari × Charlotte × Becky
* **用途**: 難しめの解説を、日常的な感覚に落とし込みたい時。
* **展開**: Akariが「これってどういうこと？」と直感的な問いを投げ（起爆剤）、Charlotteが優しく解説し、そこにBeckyが「なるほど、要するに〇〇ってことだね！」と即座に乗っかって読者目線で話を広げる。

#### パターンG：【トリオ展開（葛藤と受容）】 任意の2名 × Dulcie
* **用途**: 議論が深まった後や、弱音が出たあとの着地点。
* **展開**: 誰か2人が話し合って少し行き詰まったり、深い感情（棘）を吐露したところに、Dulcieが「じゃあ、こう考えてみない？」と前向きな視点を提供して、場全体を優しく包み込む。

### 5-2. 記事への組み込みルール
1. **多様性の確保**: 前回の記事で「A×C → B×A」の順で使ったなら、今回は「A×B → C×D → E×F」のようにモジュールの選択と順番を変えること。
```

### 5-3. 記事種別ごとの調整

| 記事種別 | 調整ポイント |
|---|---|
| **考察（哲学・心理）** | 全 4 段階を使うと効果的。Charlotte が主役になりやすい |
| **ガイド（技術・ハウツー）** | ① と ③ を中心に。Akari の「なんでこうなるの？」疑問で技術を分かりやすくする |
| **コラム（エッセイ）** | ④ の余韻を最後に置き、文章のトーンを和らげる使い方が効果的 |

### 5-4. 禁止事項（再掲）

```
 Becky に分析的な締め言葉を言わせる（→ Charlotte の役割）
 Charlotte が自ら「面白いのよね」と哲学的分析を切り出す（→ 他者の痛みへの共鳴から始める）
 Fūka を 2 回以上登場させる、または 2 語以上話させる
 キャラクター全員を同じ会話に登場させる
 会話のセリフを「説明の代弁」だけに使う（→ 弱さ・痛みの痕跡を必ず入れる）
```

---

## 6. コピーボタンの必須配置ルール

**すべての Note 記事に、以下 3 点が揃っていることを確認すること。**

### <hl-icon name="check"></hl-icon> チェック項目

| 項目 | 確認方法 |
|---|---|
| `<style>` に `.copy-article-btn` のスタイルが入っている | `style` タグ内を検索 |
| `<button id="copy-article-btn">` が `<hl-share>` の直前にある | `hl-share` の上を確認 |
| `copyArticleText()` 関数が `</body>` 直前の `<script>` にある | 最終 script タグを確認 |

コピー機能の JS は**変更しない**。関数内の処理は確立されているため、触る必要はない。

---

## 7. `archive/data.json` 追記ルール

記事を作成したら**必ず**追記する。追記しないとアーカイブページに表示されない。

```json
{
  "title": "記事タイトル",
  "href": "/archive/note/{スラッグ}/",
  "image": "https://5gkyu.github.io/icon/ogp.png",
  "description": "50〜80字程度の説明文。検索やカードに表示される。"
}
```

追加先セクション:

| 記事種別 | セクション id | heading |
|---|---|---|
| 考察 | `consideration` | <hl-icon name="search"></hl-icon> 考察 |
| ガイド | `guide` |  ガイド |
| コラム | `column` |  コラム |

---

## 8. 記事完成後の最終確認チェックリスト

```
[ ] hl-cite の書誌情報を全て実在確認した（不確かなものは削除した）
[ ] hl-quote の source= が「意訳」の場合は（意訳）と明記している
[ ] コピーボタンが hl-share の直前に配置されている
[ ] copyArticleText() が </body> 直前の <script> に入っている
[ ] 全 h2/h3 に id= が付いている
[ ] 最後の h2 が id="references" になっている（または参考文献なしで省略）
[ ] archive/data.json に追記した
[ ] canonical URL が正しい
[ ] meta description が 120 字以内である
[ ] article-meta の日付が正しい（YYYY.MM.DD 形式）
[ ] バッジクラスが記事種別と一致している
```
