# Long Text Column Table Test

テーブル1列目に長いテキストを含む場合のレイアウト検証用サンプル。

## E2Eテスト結果レポート

| テストシナリオ名（詳細説明付き） | ステータス | フロー概要 | 動画 |
|--------------------------------|:----------:|-----------|------|
| ユーザー登録フローの完全なE2Eテスト（メール認証・SMS認証含む） | ✅ Pass | 登録画面 → 入力 → 確認 → 認証 → 完了 | ![動画](videos/video-landscape.mp4) |
| 複雑なフォームバリデーションと送信処理の検証（全フィールド必須チェック） | ✅ Pass | フォーム → 各種バリデーション → エラー表示 → 修正 → 送信 | ![動画](videos/video-portrait.mp4) |
| 管理者ダッシュボードのアクセス権限チェックとロールベース表示切替 | ⚠️ Flaky | ログイン → 権限確認 → ダッシュボード → 各メニュー確認 | ![動画](videos/video-square.mp4) |
| 決済処理フロー（Stripe連携・3Dセキュア対応・エラーハンドリング） | ✅ Pass | カート → 決済入力 → 3DS認証 → 完了 → 確認メール | ![動画](videos/video-landscape.mp4) |
| マルチステップウィザードの状態保持と途中離脱からの復帰テスト | ❌ Fail | Step1 → Step2 → 離脱 → 復帰 → Step3 → 完了 | ![動画](videos/video-portrait.mp4) |

## API統合テスト結果

| エンドポイント・メソッド・パラメータ詳細 | レスポンス | 備考 |
|----------------------------------------|:----------:|------|
| `POST /api/v1/users/register` - email, password, name, phone 必須 | 201 | 正常系 |
| `GET /api/v1/users/:id/profile` - Authorization Bearer token 必須 | 200 | キャッシュ対応 |
| `PUT /api/v1/settings/notifications` - push, email, sms フラグ | 200 | 部分更新可 |
| `DELETE /api/v1/sessions/current` - セッション無効化・全デバイスログアウト | 204 | Rate limit: 10/min |

## コンポーネント単体テスト

| コンポーネント名・Props・テスト観点 | カバレッジ | 結果 |
|-----------------------------------|:----------:|:----:|
| `UserProfileCard` - avatar, name, bio, socialLinks, onEdit callback | 95.2% | ✅ |
| `DataTable` - columns, data, sortable, filterable, pagination, onRowClick | 87.4% | ✅ |
| `MultiSelectDropdown` - options, selected, onChange, searchable, maxHeight | 92.1% | ✅ |
| `FileUploader` - accept, maxSize, multiple, onUpload, onError, progress | 78.3% | ⚠️ |
