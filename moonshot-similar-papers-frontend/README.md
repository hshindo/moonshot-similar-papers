# moonshot-similar-papers-frontend

- Backendから、`xxx.pdf`, `xxx.pdf.anno`, `xxx.pdf.json` をダウンロードして、それを表示する。

## 構成

- Sveltekit

## 実行

`.env.example` をコピーして、`.env`ファイルを作成し、サーバーのURLを記入する。

```
vite dev
```

- `http://localhost:<port>/<paperId>` にアクセス
  - 例えば、`http://localhost:5173/2106.08322.pdf`
  -
