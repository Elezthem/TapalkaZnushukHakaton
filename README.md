# Tapalka Znyzhok x Silpo MCP

Промо-сайт для хакатону `AI Factory` від «Сільпо»: користувач тапає, накопичує прогрес і запускає агентний сценарій пошуку максимальної вигоди на бажаний товар через офіційний MCP «Сільпо».

## Що є в проєкті

- motion UI з tap-механікою, quest-треком і логом подій
- MCP-first флоу навколо `tools/list`, кошика, слотів, промо, купонів і бонусів
- Cloudflare Worker для server-side proxy до `https://mcp.silpo.ua/mcp`
- GitHub Pages workflow для статичної версії фронтенду
- локальний Node proxy-шаблон у [server/silpo-mcp-proxy.js](./server/silpo-mcp-proxy.js)

## Структура

- [index.html](./index.html) - сторінка
- [styles.css](./styles.css) - стилі й анімації
- [app.js](./app.js) - UI, tap logic, MCP orchestration
- [worker/index.js](./worker/index.js) - Cloudflare Worker proxy + static asset serving
- [wrangler.jsonc](./wrangler.jsonc) - конфіг Cloudflare Workers
- [.github/workflows/pages.yml](./.github/workflows/pages.yml) - автодеплой на GitHub Pages

## Як запускати локально

### Варіант 1: Cloudflare Worker dev

```powershell
npm install
$env:SILPO_MCP_TOKEN="your_mcp_token"
npm run dev
```

Після цього:

- сайт буде доступний через локальний dev server Wrangler
- proxy endpoint буде `/api/mcp`
- health check буде на `/health`

### Варіант 2: старий локальний Node proxy

```powershell
$env:SILPO_MCP_TOKEN="your_mcp_token"
node .\server\silpo-mcp-proxy.js
```

## Деплой

### GitHub

Після пушу в `main`:

- код зберігається в репозиторії
- GitHub Actions викладає статичну версію на GitHub Pages

Важливо: GitHub Pages не може безпечно тримати `SILPO_MCP_TOKEN`, тому live MCP там має ходити в окремий Cloudflare Worker URL.

### Cloudflare

```powershell
npm install
npx wrangler login
npx wrangler secret put SILPO_MCP_TOKEN
npx wrangler deploy
```

Опційно можна додати:

```powershell
npx wrangler secret put SILPO_MCP_ENDPOINT
```

Якщо секрет не заданий, використовується `https://mcp.silpo.ua/mcp`.

## Що важливо по Silpo MCP

За docs `https://ai-factory.silpo.ua/docs/mcp`:

- токен треба тримати server-side
- live schema краще завжди брати з `tools/list`
- cart-first флоу стартує з:
  - `silpo_get_my_shopping_cart`
  - `silpo_get_shopping_cart_by_id`
  - `silpo_get_time_slots`

Тому GitHub Pages тут лише для фронтенду, а робочий live MCP краще запускати через Cloudflare Worker.
