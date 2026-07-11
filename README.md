# OrangeHRM E2E Test Automation

Playwright + TypeScript end-to-end test suite for the [OrangeHRM demo app](https://opensource-demo.orangehrmlive.com/web/index.php/auth/login), built with the Page Object Model pattern, paired with Claude Code agents/skills for planning, generating, and healing tests.

## Prerequisites

- Node.js
- [Claude Code](https://claude.com/claude-code) (to use the included agents/skills)

## Setup

```bash
npm install
npx playwright install
cp .env.example .env
```

Fill in `.env` with the target app URL and login credentials (see `.env.example` for required keys: `BASE_URL`, `ORANGEHRM_USERNAME`, `ORANGEHRM_PASSWORD`). `.env` is git-ignored — never commit real credentials.

## Running tests

```bash
npm test                  # run all tests
npm run test:smoke        # run only tests tagged @smoke
npm run test:regression   # run only tests tagged @regression (none exist yet)
npx playwright test --ui  # interactive UI mode
npm run test:report       # open the last HTML report
```

## Project structure

```
tests/
├── ui/
│   ├── smoke/         # fast, critical-path checks tagged @smoke
│   ├── regression/    # per-module regression checks tagged @regression
│   └── e2e/           # deeper multi-module flows (empty for now)
├── api/                # API test specs
└── performance/        # Performance/load test specs
pages/                  # Page Object Model classes (locators + interaction methods)
fixtures/               # Reusable setup/teardown (e.g. auth.fixture.ts)
utils/                  # Helper functions and constants (e.g. unique.ts)
utils/report-pipeline/  # Parses reports/results.json → Slack notification + GitHub Step Summary
config/                 # Environment config, loaded from .env
test-data/              # Static test data as JSON (no locators)
__mocks__/api/          # API mock definitions
```

Locators live only inside Page Object classes under `pages/` — there is no separate `selectors.ts` file. Static values (URLs, emails, sample text) go in `test-data/*.json`.

Visual regression tests are tagged `@visual` in the test title.

## CI (GitHub Actions)

`.github/workflows/playwright.yml` runs on every push and pull request to `main`:

- **`smoke`** job — installs dependencies, runs `npm run test:smoke`, uploads the HTML report + test-results as artifacts, then posts a result summary to Slack (pass/fail counts, duration, branch, commit, failed test names, and a link to the run).
- **`regression`** job — runs after `smoke` succeeds (`needs: smoke`). Currently a scaffold: no `@regression` tests exist yet, so its test step uses `continue-on-error: true` to avoid failing CI on "No tests found." Remove that once real regression tests are added.

**Required GitHub repo secrets:**
| Secret | Purpose |
|---|---|
| `ORANGEHRM_USERNAME` / `ORANGEHRM_PASSWORD` | Login credentials — `config/env.ts` throws if these aren't set, so CI will fail without them |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL for the Notify Slack step |

**Optional repo variable:**
| Variable | Purpose |
|---|---|
| `BASE_URL` | Target app URL — falls back to the OrangeHRM demo URL if unset |

## Claude Code agents

This project ships with three agents (`.claude/agents/`) built on the `e2e` and `playwright-cli` skills:

| Agent | Use for |
|---|---|
| `playwright-cli-planner` | Explore a page/feature and produce a structured test plan (Page Object design + test scenarios) |
| `playwright-cli-generator` | Turn a test plan or a described flow into working Playwright spec files |
| `playwright-cli-healer` | Debug and fix a failing test |

Invoke them by asking Claude Code to use the agent by name, e.g. "use the playwright-cli-planner agent on the OrangeHRM PIM module."
