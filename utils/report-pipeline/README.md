# utils/report-pipeline

Turns Playwright's `reports/results.json` into human-readable CI output.

- `parse-report.ts` — shared parsing (report shape, failed-test collection, duration formatting), used by both scripts below.
- `notify-slack.ts` — posts a pass/fail summary to a Slack Incoming Webhook.
- `write-summary.ts` — writes the same summary to the GitHub Actions Job Summary (`$GITHUB_STEP_SUMMARY`).
