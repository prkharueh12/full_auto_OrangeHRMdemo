import { readFileSync } from 'node:fs';

interface PlaywrightSpec {
  title: string;
  ok: boolean;
  file: string;
  line: number;
}

interface PlaywrightSuite {
  specs: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

interface PlaywrightReport {
  suites: PlaywrightSuite[];
  stats: {
    startTime: string;
    duration: number;
    expected: number;
    skipped: number;
    unexpected: number;
    flaky: number;
  };
}

function collectFailedTitles(suites: PlaywrightSuite[]): string[] {
  const failed: string[] = [];

  for (const suite of suites) {
    for (const spec of suite.specs) {
      if (!spec.ok) {
        failed.push(`${spec.file}:${spec.line} - ${spec.title}`);
      }
    }

    if (suite.suites) {
      failed.push(...collectFailedTitles(suite.suites));
    }
  }

  return failed;
}

function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

async function main(): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('SLACK_WEBHOOK_URL not set — skipping Slack notification.');
    return;
  }

  const report: PlaywrightReport = JSON.parse(readFileSync('reports/results.json', 'utf8'));
  const { stats } = report;
  const failedTitles = collectFailedTitles(report.suites);

  const total = stats.expected + stats.unexpected + stats.skipped + stats.flaky;
  const runUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  const branch = process.env.GITHUB_REF_NAME ?? 'unknown';
  const commit = (process.env.GITHUB_SHA ?? 'unknown').slice(0, 7);
  const actor = process.env.GITHUB_ACTOR ?? 'unknown';
  const event = process.env.GITHUB_EVENT_NAME ?? 'unknown';
  const startedAt = new Date(stats.startTime).toUTCString();

  const resultEmoji = stats.unexpected > 0 ? '❌' : '✅';
  const resultText = stats.unexpected > 0 ? 'Failed' : 'Passed';
  const suiteLabel = process.env.SUITE_LABEL ?? 'Test Suite';

  const blocks: Record<string, unknown>[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `${resultEmoji} ${suiteLabel} ${resultText}` },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Total:*\n${total}` },
        { type: 'mrkdwn', text: `*Passed:*\n${stats.expected}` },
        { type: 'mrkdwn', text: `*Failed:*\n${stats.unexpected}` },
        { type: 'mrkdwn', text: `*Skipped:*\n${stats.skipped}` },
        { type: 'mrkdwn', text: `*Duration:*\n${formatDuration(stats.duration)}` },
        { type: 'mrkdwn', text: `*Branch:*\n${branch}` },
        { type: 'mrkdwn', text: `*Commit:*\n${commit}` },
        { type: 'mrkdwn', text: `*Triggered by:*\n${actor} (${event})` },
        { type: 'mrkdwn', text: `*Started:*\n${startedAt}` },
      ],
    },
  ];

  if (failedTitles.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Failed tests:*\n${failedTitles.map((title) => `• ${title}`).join('\n')}`,
      },
    });
  }

  blocks.push({
    type: 'context',
    elements: [{ type: 'mrkdwn', text: `<${runUrl}|View full run in GitHub Actions>` }],
  });

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook responded with ${response.status}: ${await response.text()}`);
  }

  console.log('Slack notification sent.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
