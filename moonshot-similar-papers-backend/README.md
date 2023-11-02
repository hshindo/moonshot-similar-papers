# moonshot-similar-papers-backend

## 構成
* Python 3.x + FastAPI
* `app/static/` 以下のファイルを配信しているだけ。以下のように３種類のファイルをセットで置く。（関連論文も同様）
  * `app/static/2106.08322.pdf`
  * `app/static/2106.08322.pdf.anno`
  * `app/static/2106.08322.pdf.json`

## 開発
### 実行
```
docker compose build
docker compose up
```
