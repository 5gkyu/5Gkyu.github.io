# Mobile ディレクトリ仕様書

このディレクトリは、**モバイルゲーム用リンク集（lit.link）**へのリダイレクト専用エンドポイントです。

## 概要
- **目的**: 外部（SNSやゲーム内プロフィール等）からアクセスしたユーザーを、5Gkyuのモバイルゲーム関連リンク集（lit.link）へ自動転送する。
- **転送先URL**: `https://lit.link/5GKyu`
- **対象URLパス**: `https://5gkyu.github.io/mobile/`

## ファイル構成
- `index.html`: 即時リダイレクトページ
  - `<meta http-equiv="refresh" content="0; url=https://lit.link/5GKyu">` によるブラウザ転送
  - `window.location.replace("https://lit.link/5GKyu")` によるJavaScript転送
  - 手動クリック用フォールバックリンク
- `README.md`: 本仕様書

