# Tapalka Znyzhok x Silpo MCP

Промо-сайт для хакатону `AI Factory` від «Сільпо»: користувач тапає, накопичує прогрес і запускає агентний сценарій пошуку максимальної вигоди на бажаний товар через офіційний MCP «Сільпо».

## Що оновлено

- сильніший motion UI: floating orbs, reveal-анімації, glow ring, event log, quest track
- MCP-first архітектура замість простої локальної симуляції
- сценарій побудований навколо офіційного флоу з docs:
  - `tools/list`
  - `silpo_get_my_shopping_cart`
  - `silpo_get_shopping_cart_by_id`
  - `silpo_get_time_slots`
  - далі `silpo_get_products`, `silpo_get_promotions`, купони, бонуси, оновлення кошика
- доданий server-side proxy-шаблон [server/silpo-mcp-proxy.js](./server/silpo-mcp-proxy.js), бо документація вимагає не зберігати MCP token у фронтенді

## Структура

- [index.html](./index.html) — сторінка
- [styles.css](./styles.css) — візуал і анімації
- [app.js](./app.js) — tap logic, event log, MCP orchestration
- [server/silpo-mcp-proxy.js](./server/silpo-mcp-proxy.js) — proxy до `https://mcp.silpo.ua/mcp`

## Як це відповідає docs

За документацією `https://ai-factory.silpo.ua/docs/mcp`:

- потрібно використовувати саме `https://mcp.silpo.ua/mcp`
- авторизація працює через `OAuth 2.1 + PKCE`
- токен треба тримати server-side
- актуальні назви й схеми tools слід брати з `tools/list`
- cart-first сценарій стартує з:
  - `silpo_get_my_shopping_cart`
  - `silpo_get_shopping_cart_by_id`
  - `silpo_get_time_slots`

У цьому проєкті саме так і закладено архітектуру.

## Як запускати

Статичну частину можна відкрити просто через браузер.

Для live demo потрібен Node.js, щоб підняти proxy:

```powershell
$env:SILPO_MCP_TOKEN="your_mcp_token"
node .\server\silpo-mcp-proxy.js
```

Після цього:

- proxy буде на `http://localhost:8787/api/mcp`
- у сайті в полі `Proxy endpoint` вкажіть `http://localhost:8787/api/mcp`
- натисніть `Завантажити tools/list`
- потім `Запустити MCP-сценарій`

## Що ще варто доробити

- повний OAuth 2.1 + PKCE login flow замість ручного підкладання server token
- мапінг реальних аргументів для кожного `tools/call` після отримання live schema з `tools/list`
- безпечне збереження refresh token
- нормальний backend state для cart context, branchId, deliveryType, timeslot
