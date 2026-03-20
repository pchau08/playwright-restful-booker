# 🎭 Playwright Unified Test Framework — Restful Booker

![Playwright](https://img.shields.io/badge/Playwright-1.50.x-45ba4b?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088ff?logo=github-actions&logoColor=white)
![Allure](https://img.shields.io/badge/Allure-2.x-orange)
![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white)
![axe-core](https://img.shields.io/badge/Accessibility-axe--core-663399)
![License](https://img.shields.io/badge/license-MIT-blue)

A production-grade unified API and UI test automation framework built with Playwright and TypeScript. Targets [Restful Booker](https://restful-booker.herokuapp.com) — a public hotel booking application with both a documented REST API and a full web UI, purpose-built for testers.

---

## The Unified Testing Philosophy

Most frameworks treat API tests and UI tests as separate concerns. This framework treats them as **two layers of the same truth**.

| Pattern | What it does | Why it matters |
|---|---|---|
| **API Setup → UI Verify** | Create a booking via API, then assert it renders correctly in the UI | Skips slow UI setup steps. Tests only what the UI is responsible for. |
| **UI Action → API Verify** | Complete a booking flow in the browser, then call the API to confirm the data was saved | Proves the frontend and backend are in sync. Catches contract bugs. |
| **API Auth Injection** | Obtain auth tokens via API and inject them into browser context | Eliminates redundant login flows. Every test starts in the right state instantly. |
| **API Teardown** | Delete test data via API after every test | Guarantees clean state. No test pollution. Runs reliably in parallel. |

This is how QA teams at scale actually work. The framework demonstrates all four patterns with working, production-quality code.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Test Runner | Playwright 1.50.x |
| Language | TypeScript 5.x |
| Architecture | Unified API + UI, Page Object Model |
| API Testing | Playwright APIRequestContext + schema validation |
| Accessibility | axe-core via @axe-core/playwright |
| Visual Regression | Playwright built-in snapshots |
| Reporting | Allure 2.x + Custom Reporter |
| CI/CD | GitHub Actions with sharded parallel execution |
| Containerization | Docker + docker-compose |
| Node Version | 20.x LTS |

---

## Project Structure

```
playwright-restful-booker/
├── .github/
│   └── workflows/
│       └── ci.yml                      # Sharded parallel CI pipeline
├── src/
│   ├── fixtures/
│   │   └── base.fixture.ts             # Extended fixtures: API client + pages + auth
│   ├── helpers/
│   │   ├── api-client.ts               # Typed REST client wrapping APIRequestContext
│   │   ├── auth-manager.ts             # Token lifecycle management
│   │   ├── schema-validator.ts         # JSON schema validation
│   │   ├── accessibility-helper.ts     # axe-core integration
│   │   └── custom-reporter.ts          # Timestamped console + JSON reporter
│   ├── pages/
│   │   ├── login.page.ts
│   │   ├── booking-list.page.ts
│   │   └── booking-detail.page.ts
│   ├── test-data/
│   │   ├── booking.factory.ts          # Builder pattern for test data generation
│   │   └── credentials.ts
│   └── types/
│       └── booking.types.ts            # TypeScript interfaces for API contracts
├── tests/
│   ├── api/
│   │   ├── auth.api.spec.ts            # Token creation and validation
│   │   ├── booking-crud.api.spec.ts    # Full CRUD with schema validation
│   │   └── booking-filters.api.spec.ts # Query parameter filtering
│   ├── ui/
│   │   ├── login.ui.spec.ts
│   │   ├── booking-list.ui.spec.ts
│   │   └── accessibility.ui.spec.ts    # axe-core a11y tests
│   └── unified/
│       ├── api-setup-ui-verify.spec.ts  # API creates → UI asserts
│       └── ui-action-api-verify.spec.ts # UI acts → API asserts
├── docker-compose.yml
├── Dockerfile
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── .gitignore
```

---

## Getting Started

### Option 1: Local

```bash
git clone https://github.com/yourusername/playwright-restful-booker.git
cd playwright-restful-booker
npm ci
npx playwright install --with-deps
cp .env.example .env
npm test
```

### Option 2: Docker (zero local setup required)

```bash
git clone https://github.com/yourusername/playwright-restful-booker.git
cd playwright-restful-booker
docker-compose up --build
```

---

## Running Tests

```bash
npm test                  # Full suite
npm run test:api          # API tests only
npm run test:ui           # UI tests only
npm run test:unified      # Cross-layer unified tests
npm run test:a11y         # Accessibility tests only
npm run test:smoke        # Smoke gate (fast)
npm run test:headed       # Watch the browser
npm run test:ui-mode      # Playwright interactive UI
npm run allure:generate   # Build Allure report
npm run allure:open       # Open Allure report
```

---

## The Unified Patterns in Practice

### Pattern 1: API Setup → UI Verify

```typescript
test('booking created via API renders correctly in UI', async ({
  apiClient, bookingListPage
}) => {
  // Arrange — fast API setup, no UI clicks
  const booking = BookingFactory.create({ firstname: 'Jane', lastname: 'Tester' });
  const { bookingid } = await apiClient.createBooking(booking);

  // Act — navigate to UI
  await bookingListPage.navigate();

  // Assert — UI reflects the API-created data
  await bookingListPage.expectBookingVisible(bookingid);

  // Cleanup — guaranteed via API
  await apiClient.deleteBooking(bookingid);
});
```

### Pattern 2: UI Action → API Verify

```typescript
test('booking submitted in UI is persisted in the API', async ({
  bookingListPage, apiClient
}) => {
  // Act — user completes the booking form
  const bookingData = BookingFactory.create();
  const bookingId = await bookingListPage.createBookingViaUI(bookingData);

  // Assert — API confirms correct persistence
  const saved = await apiClient.getBooking(bookingId);
  expect(saved.firstname).toBe(bookingData.firstname);
  expect(saved.totalprice).toBe(bookingData.totalprice);
});
```

### Pattern 3: API Auth Injection

```typescript
// base.fixture.ts — runs before every authenticated test
authenticatedPage: async ({ page, authManager }, use) => {
  const token = await authManager.getToken(); // cached across tests
  await page.context().addCookies([
    { name: 'token', value: token, url: BASE_URL }
  ]);
  await use(page);
},
```

---

## CI/CD Pipeline

The workflow uses **sharded parallel execution** — the full suite is split across 4 concurrent runners, cutting total runtime by ~75%.

```
Smoke (40s) → Shard 1 | Shard 2 | Shard 3 | Shard 4 → Merge Allure → Publish Report
```

Artifacts retained per run: Allure report (30 days), traces on failure (14 days), screenshots and videos on failure (14 days), results JSON (30 days).

---

## Accessibility Testing

Every major page is tested for WCAG 2.1 AA compliance using axe-core:

```typescript
test('booking list has no accessibility violations', async ({
  page, accessibilityHelper
}) => {
  await page.goto('/');
  const violations = await accessibilityHelper.getViolations();
  expect(violations).toHaveLength(0);
});
```

---

## Schema Validation

Every API response is validated against a TypeScript-defined schema. If the API returns an unexpected shape, the test fails with a descriptive diff rather than a cryptic downstream error.

---

## License

MIT
