# Playwright CLI Agents Template

A reusable Playwright E2E test project template, paired with Claude Code agents/skills for planning, generating, and healing tests via the Page Object Model pattern.

## Prerequisites

- Node.js
- [Claude Code](https://claude.com/claude-code) (to use the included agents/skills)

## Setup

```bash
npm install
npx playwright install
```

Set the target application URL, either by editing `baseURL` in `playwright.config.ts` or via an environment variable:

```bash
BASE_URL=https://your-app.example.com npm test
```

## Running tests

```bash
npm test                  # run all tests
npx playwright test --ui  # interactive UI mode
npx playwright show-report reports/html-report
```

## Project structure

```
tests/
├── ui/              # UI test specs
├── api/             # API test specs
└── performance/     # Performance/load test specs
pages/               # Page Object Model classes (locators + interaction methods)
fixtures/            # Reusable setup/teardown
utils/               # Helper functions and constants
config/              # Environment config (BASE_URL, etc.)
test-data/           # Static test data as JSON
__mocks__/api/       # API mock definitions
```

Locators live only inside Page Object classes under `pages/` — there is no separate `selectors.ts` file. Static values (URLs, emails, sample text) go in `test-data/*.json`.

Visual regression tests are tagged `@visual` in the test title.

## Claude Code agents

This template ships with three agents (`.claude/agents/`) built on the `e2e` and `playwright-cli` skills:

| Agent | Use for |
|---|---|
| `playwright-cli-planner` | Explore a page/feature and produce a structured test plan (Page Object design + test scenarios) |
| `playwright-cli-generator` | Turn a test plan or a described flow into working Playwright spec files |
| `playwright-cli-healer` | Debug and fix a failing test |

Invoke them by asking Claude Code to use the agent by name, e.g. "use the playwright-cli-planner agent on https://your-app.example.com/checkout".

## Using this template for a new project

1. Copy/clone this repo.
2. Update `package.json` name/description for the new project.
3. Set `baseURL` in `playwright.config.ts` (or `BASE_URL` env var) to the target app.
4. Run the `playwright-cli-planner` agent against the target app to generate a test plan, then `playwright-cli-generator` to scaffold specs.
