# 新キャラクター追加ガイドライン（Halcyon BrawlStars）

本ドキュメントは、ブロスタ（Brawl Stars）に新キャラクターが実装された際、または追加データを登録する際に**事前に用意すべき情報一覧**と**反映手順**をまとめたガイドラインです。

> **Note: データ一本化に伴う変更**
> これまで複数の JSON ファイルや `app.js` の各種マッピング辞書に二重登録する必要がありましたが、**今後は `brawlers.json` 1つへの追記と画像の配置のみ**で全ツール（評価一覧、BanPic、作戦盤）に自動反映されるようになりました。

---

## 1. 事前に用意すべき情報一覧

新キャラクターをデータベースおよびテーブルへ追加する際は、以下の各項目を準備します。

### 1.1 基本情報
| 項目名 | プロパティ名 | 形式・例 | 説明 |
| :--- | :--- | :--- | :--- |
| **キャラクター名（日本語）** | `name` | 例: `ティック`, `マンディ` | サイト内でメイン表示される名前です。 |
| **キャラクター名（英語）** | `name_en` | 例: `TICK`, `MANDY` | Fandom Wiki や公式アセットとの照合に使用します。 |
| **検索用エイリアス** | `alias` | 例: `ティック, てぃっく, Tick, TICK, ｔｉｃｋ, ﾃｨｯｸ` | 検索バーでヒットさせるための平仮名・英字・半角カナのカンマ区切りです。 |
| **レア度** | `rare`, `rarity_name` | 例: `#fff11e`（カラーコード）, `レジェンドレア` | レア度に応じた背景色・名称です。 |
| **クラス・ロール** | `class_ja`, `role` | 例: `アーティラリー`, `スナイパー`, `アサシン` | ゲーム内の公式クラス名およびサイト内の役割分類です。 |
| **実装日** | `addedDate` | 例: `2026年06月05日` | 「YYYY年MM月DD日」の形式で記述します。テーブルのソート対象です。 |
| **未実装フラグ** | `unreleased` | `true` または `false` | 先行追加（未リリース）の場合は `true` に設定します。 |

---

### 1.2 画像アセット
| 項目 | 格納先パス / 命名規則 | 形式・推奨サイズ |
| :--- | :--- | :--- |
| **キャラクターアイコン** | `image/brawl/` 配下<br>例: `BS_Portrait_Rey.png` | 透過PNG形式（正方形、128x128px 〜 256x256px 推奨） |

---

### 1.3 射程・弾幅データ
`brawlers.json` 内に直接記述することで、`app.js` のハードコードを編集することなく自動反映されます。

| 項目名 | プロパティ名 | 形式・例 | 説明 |
| :--- | :--- | :--- | :--- |
| **カタログ射程** | `range` | 例: `9.67` | 数値型。 |
| **実効射程（ソート用）** | `range_effective` | 例: `9.67` | 数値型。爆風や跳弾を含めた実効値。 |
| **射程表示リスト** | `range_items` | 例: `["9.67"]` または `["12.0 (集中)", "9.0 (移動)"]` | 配列型。2段射程キャラの場合は2要素記述。 |
| **射程解説テキスト** | `range_detail` | 例: `"通常投擲9.67マス＋三角形電撃ゾーン。ウルト最大25マス"` | 詳細モーダルに表示される解説文。 |
| **弾の太さ表示** | `bullet_width` | 例: `"0.80"` | 文字列型。 |
| **弾の太さ（ソート用）** | `bullet_width_num` | 例: `0.8` | 数値型。 |

---

## 2. 反映用コードテンプレート（コピペ用）

### `archive/play/BrawlStars/brawl-firebase/brawlers.json` の末尾に追記
```json
{
  "id": "brawler_113",
  "api_id": 16000114,
  "name": "新キャラ名",
  "name_en": "NEW_BRAWLER",
  "order": 112,
  "addedDate": "2026年12月20日",
  "unreleased": false,
  "alias": "新キャラ名, しんきゃらめい, New Brawler, NEW BRAWLER",
  "rare": "#fff11e",
  "rarity_id": 6,
  "rarity_name": "レジェンドレア",
  "class_ja": "スナイパー",
  "class_en": "MARKSMAN",
  "image": "BS_Portrait_NewChar.png",
  "image_path": "image/brawl/BS_Portrait_NewChar.png",
  "role": "スナイパー",
  "tags": ["スナイパー", "スナイパー対策"],
  "range": 10.0,
  "range_effective": 10.0,
  "range_items": ["10.0"],
  "range_detail": "通常長射程弾10.0マス。ウルト射程10.0マス",
  "bullet_width": "0.67",
  "bullet_width_num": 0.67,
  "hp_lv1": 3000,
  "hp_lv11": 6000,
  "speed": 750,
  "speed_label": "普通",
  "reload_speed": 1.5,
  "max_ammo": 3,
  "damage_lv11": 2000,
  "gender": "男性",
  "species": "人間",
  "trio": "",
  "has_hat": false,
  "weapon": "ライフル",
  "voice_actor": "Unknown",
  "tuyosa": 3,
  "difficulty": 2,
  "modes": { "gem": 2, "bounty": 3, "ball": 2, "heist": 2, "zone": 2, "knockout": 3 },
  "gears": ["ダメージ", "シールド"],
  "gadgets": [],
  "star_powers": [],
  "hypercharges": [],
  "com": "新キャラクターの解説文をここに記述します。"
}
```

---

## 3. 追加作業のチェックリスト

新キャラクターを追加する際は、以下のわずか3ステップで完了します。

1. **画像の配置**:
   - `image/brawl/` 配下にアイコン画像（PNG）を配置する。
2. **マスターデータ（brawlers.json）への追記**:
   - [brawlers.json](file:///c:/Users/yuton/OneDrive/デスクトップ/mainpage/archive/play/BrawlStars/brawl-firebase/brawlers.json) の配列末尾にキャラクター情報を追記する。
3. **キャッシュバスターの更新**:
   - [index.html](file:///c:/Users/yuton/OneDrive/デスクトップ/mainpage/archive/play/BrawlStars/brawl-firebase/index.html) の `app.js?v=...` のバージョンをインクリメントする。

---

## 4. 参考リソース・情報源URL

新キャラクターのスペック、実効射程、内部パラメータを調べる際に有用なデータベース・解析Wiki一覧です。

| サイト名 | URL | 特徴・活用方法 |
| :--- | :--- | :--- |
| **Namu.wiki（ナムウィキ）** | https://namu.wiki/w/%EB%B8%8C%EB%A1%A4%EC%8A%A4%ED%83%80%EC%A6%88/%EB%B8%8C%EB%A1%A4%EB%9F%AC | 韓国の解析コミュニティ。ゲーム内部データ（クライアントファイル）を元にした実効最大射程、爆風半径、ヒット判定の解説が最も詳細です。 |
| **Brawl Stars Fandom Wiki** | https://brawlstars.fandom.com/wiki/Brawl_Stars_Wiki | 英語圏最大の総合Wiki。各キャラクターのステータス表（カタログ射程・ウルト射程）、通常攻撃の拡散仕様・爆発半径などが網羅されています。 |
| **Brawlify（ブロリファイ）** | https://brawlify.com/brawlers/ | 公式APIと連携したスタッツ・メタ情報サイト。最新パッチのステータス変化や勝率、各マップの適性が確認できます。 |
| **BSInfo（国内データベース）** | https://bsinfo.link/ | 日本語の有志データベース。日本語版の公式テキストや実装日、基本スペックが素早く確認できます。 |
