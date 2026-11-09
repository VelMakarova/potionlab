# Potion Lab API

Node.js 24+, Fastify, TypeScript.

## Запуск

```sh
npm install
cp .env.example .env
# Заповни .env локально перед запуском.
npm run dev
```

`.env` автоматично завантажується з поточної робочої папки під час запуску.
Змінні середовища, вже задані сервером, мають пріоритет. Запускай команди з ``.

- `GEMINI_API_KEY`: ключ із Google AI Studio, тільки для бекенда.
- `GEMINI_MODEL`: ID моделі; початково `gemini-3.1-flash-lite`. Перевір доступність і ліміти цієї моделі в AI Studio → Rate Limit.
- `AI_SERVICE_TOKEN`: окремий випадковий секрет для службової ручки, наприклад результат `openssl rand -hex 32`.

Реальні секрети не додавай у код, Git, frontend або запити через URL.

## Перевірка AI

```sh
curl -X POST http://localhost:3000/internal/ai/check \
  -H "Authorization: Bearer YOUR_AI_SERVICE_TOKEN"
```

Заміни `YOUR_AI_SERVICE_TOKEN` своїм локальним службовим токеном.
Ручка робить один реальний короткий `generateContent` запит до Gemini, тому витрачає квоту
(і може коштувати грошей, якщо для проєкту ввімкнено paid tier). Не використовуй її для регулярних liveness-перевірок.
Вона повертає доступність генерації, модель, час відповіді й токени поточного запиту.
`quotaRemaining: null` означає, що залишок квоти не визначався. Ліміти та використання
дивись у [Rate Limit](https://aistudio.google.com/rate-limit) та [Usage](https://aistudio.google.com/usage).
Перевірка списку моделей сама по собі не підтверджує доступність генерації.

Доступ вимагає Bearer-токена; без налаштованого `AI_SERVICE_TOKEN` ручка закрита.
Одночасно виконується максимум одна перевірка. Мінімальний інтервал між початками запитів
обчислюється як `ceil(60000 / GEMINI_REQUESTS_PER_MINUTE)` мс: для 15 RPM це 4 секунди.
Під час активного запиту нова перевірка теж повертає `AI_CHECK_COOLDOWN`.
Цей захист працює в межах одного процесу та лише цієї службової ручки; він не враховує інші клієнти чи репліки.
Остаточне дотримання всіх квот забезпечує Google.
Таймаут Google-запиту — 45 секунд (змінна `GEMINI_TIMEOUT_MS`, допустимо 1000–120000 мс); автоматичних повторів немає.

| HTTP | code | Значення |
| --- | --- | --- |
| 200 | — | Генерація відповіла, квота була доступна для цього запиту |
| 401 | UNAUTHORIZED | Відсутній або неправильний службовий токен |
| 503 | AI_SERVICE_TOKEN_NOT_CONFIGURED / AI_NOT_CONFIGURED | Відсутня локальна конфігурація |
| 429 | AI_CHECK_COOLDOWN | Локальна пауза, дивись `Retry-After` |
| 429 | AI_QUOTA_OR_RATE_LIMIT | Google відхилив запит через квоту або rate limit |
| 502 | AI_ACCESS_DENIED | Google відхилив ключ, доступ, billing або параметри запиту |
| 502 | AI_MODEL_NOT_FOUND | Модель недоступна або ID неправильний |
| 502 | AI_EMPTY_RESPONSE / AI_INVALID_RESPONSE / AI_NETWORK_ERROR / AI_PROVIDER_UNAVAILABLE | Немає текстової відповіді або помилка провайдера/мережі |
| 504 | AI_TIMEOUT | Google не відповів вчасно |

Free tier підходить для початкових тестів, але скріншот ключа не гарантує доступності генерації.
Службова ручка незалежна від `/brew`: варіння поки використовує текстову заглушку замість AI.

## Варіння

`POST /brew?lang=ua` приймає `{ "ingredientIds": ["dragon-scale", "moonwell-dew", "mandrake-root"] }`.
Сервіс перевіряє ID каталогу та застосовує доменні правила. Для `no_magic`, `explosion`,
`cracked`, `runaway` або `useless` повертається `{ "status": "..." }` із HTTP 200.
Для успішного варіння повертаються `status: "brewed"`, обчислені `properties` з числовими силами
та `description: "Тут буде текст від ШІ"` (для `lang=en` — англійська заглушка).
`/brew` не звертається до Gemini й не потребує AI-ключів. Некоректний вибір, повторені
або невідомі ID повертають HTTP 400. Реальна генерація опису ще не підключена.

## Перевірки і збірка

```sh
npm test
npm run typecheck
npm run build
npm run start:prod
```

Тести використовують підставлені відповіді Google та не витрачають реальну квоту.

Помилки авторизованої перевірки містять `latencyMs`, `timeoutMs`, `model`, `providerHttpStatus` (якщо Google відповів HTTP-помилкою) та `networkCode` (безпечний код мережевої помилки, якщо відомий). Ті самі поля записуються в лог без ключів і сирих повідомлень Google. `AI_NETWORK_ERROR` відрізняє мережевий збій від `AI_PROVIDER_UNAVAILABLE`, коли Google повернув HTTP-помилку. Зміни коду при `npm start` потребують перезапуску.

## Ліміти PotionsLab

Знімок із AI Studio від 25.10.2026 для `gemini-3.1-flash-lite`, Free tier:

| Змінна | Значення | Значення показника |
| --- | --- | --- |
| `GEMINI_REQUESTS_PER_MINUTE` | 15 | Запити за хвилину |
| `GEMINI_INPUT_TOKENS_PER_MINUTE` | 250000 | Вхідні токени за хвилину |
| `GEMINI_REQUESTS_PER_DAY` | 500 | Запити за добу |

Ці значення вже є типовими; додавати їх у наявний `.env` необов'язково.
Відповідь ручки містить `configuredLimits` із `source: "configuration"` — це налаштовані
межі, а не отриманий від Google залишок. `quotaRemaining` залишається `null`.
TPM та RPD зараз зберігаються як параметри конфігурації: локального обліку витрачених
токенів і добових запитів ще немає. Не використовуй ці числа як показник доступності для frontend.
Значення зліва на скріншоті AI Studio за 7 днів — пікове використання за вибраний період,
не поточний гарантований залишок; його не переносимо в код.

Денна квота скидається опівночі за `America/Los_Angeles`, з урахуванням літнього часу.
Квоти спільні для проєкту. При зміні моделі або тарифу перевір ці три значення в AI Studio
і онови `.env`. Бекенд не синхронізує їх автоматично.
Джерело: https://ai.google.dev/gemini-api/docs/rate-limits

## Swagger / OpenAPI

Після запуску API відкрий [Swagger UI](http://localhost:3000/docs/).
Специфікація: [JSON](http://localhost:3000/docs/json) або [YAML](http://localhost:3000/docs/yaml).
Документація генерується зі схем роутів: параметри шляху, `lang=en|ua` (типово `en`),
тіло `/brew`, моделі відповідей і HTTP-коди, включно з помилками валідації та провайдера AI.
Для `/internal/ai/check` натисни **Authorize** і введи `AI_SERVICE_TOKEN` без префікса `Bearer`.
**Try it out** для цієї ручки робить реальний запит до Gemini та витрачає квоту.
Swagger не виконує AI-запити під час відкриття документації.

Інтеграція: [@fastify/swagger](https://github.com/fastify/fastify-swagger),
[@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui).
