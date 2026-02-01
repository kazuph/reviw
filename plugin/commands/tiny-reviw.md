# /reviw-plugin:tiny-reviw

<command-name>tiny-reviw</command-name>

報告書なしで、スクリーンショットと動画だけを確認する軽量レビューモードです。

## 用途

- ちょっとした修正の確認
- 細かいUI調整の確認
- REPORT.mdを作るほどではない軽微な変更

## 実行内容

1. **webapp-testing skill でスクショ撮影**
   - 実装した画面をPlaywrightで開く
   - スクリーンショットを撮影
   - 必要に応じてGIF動画も撮影

2. **撮影したファイルを開く**
   ```bash
   open /path/to/screenshot.png
   open /path/to/recording.gif
   ```

3. **ユーザーに確認を求める**
   - 「この内容でOKですか？」と聞く

## 出力先

- `/tmp/tiny-reviw/` に一時保存
- REPORT.mdは作成しない
- .artifacts/への保存もしない

## 禁止事項

- ❌ REPORT.mdを作成する
- ❌ artifact-proof skillを使う
- ❌ 長い報告書を書く

## 完了条件

- スクショまたは動画がユーザーに表示されること
- ユーザーがOKと言うこと
