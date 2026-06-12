# tts-reading-lexicon

技術文書を TTS に渡す前に、読み間違えやすい語と数式を読み上げ向けの英文に正規化するための辞書です。
数学・物理・化学の辞書を分けて管理し、まとめた辞書を自動生成できます。

## 使い方

```bash
npm install
npm run build
npm test
```

テキストを正規化する例:

```bash
node bin/tts-reading-lexicon.js 'Grothendieck宇宙 と Fiber層: I ∈ U ⇒ x ∈ U'
```

出力例:

```text
Grothendieck universe と fiber sheaf: I is in U implies x is in U
```

標準入力からも使えます。

```bash
echo 'H2O と Hilbert空間' | node bin/tts-reading-lexicon.js
```

## 辞書ファイル

- `data/math.json`
- `data/physics.json`
- `data/chemistry.json`

全辞書をマージしたものは `npm run build` で `dist/merged.json` に生成されます。

## 方針

- 数式・記号は英語読みへ寄せます。
- TTS モデル固有の音声データや実データは含めません。
- テストは正規化ロジックだけを検証します。
