# Git Commit History — playwright-restful-booker

## Suggested commit sequence
## Apply oldest → newest. Spread across 2-3 weeks if possible.

---

```
chore: init project with Playwright + TypeScript

- npm init, playwright init
- tsconfig, .gitignore, .env.example
- playwright.config.ts with api/ui/mobile projects
```

```
feat: add BaseClient with request logging and response time tracking
```

```
feat: add AuthClient for token-based authentication
```

```
feat: add BookingClient with full CRUD operations
```

```
chore: add BookingFactory with builder pattern for test data

- Randomized data generation
- Named presets (luxury, longStay, sameDay)
- Static invalid payloads for negative testing
```

```
feat: add Zod schema validation layer

- BookingSchema, BookingResponseSchema, BookingIdListSchema
- AuthSuccessSchema
- SchemaValidator utility class
```

```
feat: add AccessibilityHelper wrapping axe-core

- WCAG 2.1 AA configuration
- expectNoViolations, getViolations, expectNoViolationOfType
```

```
feat: add base fixture with auto-cleanup via createdBookingIds

- BookingClient, AuthClient injected
- authToken obtained fresh per test
- Automatic API teardown after each test
```

```
feat: add HomePage page object
```

```
test: add auth API spec — valid and invalid credentials
```

```
test: add booking CRUD spec — full create/read/update/delete coverage
```

```
test: add schema validation spec — Zod validation on all responses
```

```
test: add negative and boundary test spec
```

```
test: add unified spec — API creates, UI verifies
```

```
test: add unified spec — UI creates, API verifies
```

```
test: add home page UI spec
```

```
test: add accessibility spec — WCAG 2.1 AA with axe-core
```

```
feat: add Docker + docker-compose for containerized test runs
```

```
ci: add sharded GitHub Actions pipeline

- Smoke → API regression + UI regression (sharded 2x per browser)
- Allure report merge job
- Artifacts retained 30 days
```

```
docs: add README with unified pattern diagram and full usage guide
```

---

## GitHub repo metadata

**Description:**
> Unified API and UI test automation framework built with Playwright. Demonstrates the unified testing pattern: API sets up state, UI verifies rendering, API confirms backend truth.

**Topics:**
`playwright` `typescript` `api-testing` `test-automation` `qa-automation` `axe-core` `accessibility-testing` `zod` `page-object-model` `github-actions` `docker` `restful-booker` `unified-testing`
