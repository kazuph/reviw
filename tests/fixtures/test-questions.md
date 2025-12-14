---
title: "\u30c6\u30b9\u30c8\u30c9\u30ad\u30e5\u30e1\u30f3\u30c8"
author: "Test User"
date: "2025-12-14"
reviw:
  questions:
    - id: auth-method
      question: "認証方式はOAuthとJWTどちらを使用しますか？"
      resolved: false
      answer: ""
      options:
        - "OAuth 2.0"
        - "JWT"
        - "セッションベース"
    - id: cache-duration
      question: "キャッシュ期間は何分が適切ですか？"
      resolved: true
      answer: "30分でお願いします"
    - id: confirm-deploy
      question: "ステージング環境へのデプロイを実行してよいですか？"
      resolved: false
      answer: ""
      options:
        - "OK"
---

# テストドキュメント

## 概要

これはYAML質問機能のテスト用ドキュメントです。

## 機能

- 認証システムの実装
- キャッシュ機能の最適化
- デプロイパイプラインの構築

## コード例

```javascript
const auth = new AuthService({
  method: 'OAuth', // or 'JWT'
  cache: 30 // minutes
});
```

## まとめ

上記の質問に回答をお願いします。
