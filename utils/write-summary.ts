import { appendFileSync } from 'node:fs';
import { collectFailedTitles, formatDuration, readReport } from './parse-report';

function main(): void {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    console.log('GITHUB_STEP_SUMMARY not set — skipping (not running in GitHub Actions?).');
    return;
  }

  const suiteLabel = process.env.SUITE_LABEL ?? 'Test Suite';
  const report = readReport('reports/results.json');

  if (!report) {
    appendFileSync(
      summaryPath,
      `## ❌ ${suiteLabel} Failed to Run\n\nNo test results were produced — the run likely crashed before any tests executed.\n`
    );
    return;
  }

  const { stats } = report;
  const failedTitles = collectFailedTitles(report.suites);
  const total = stats.expected + stats.unexpected + stats.skipped + stats.flaky;
  const resultEmoji = stats.unexpected > 0 ? '❌' : '✅';
  const resultText = stats.unexpected > 0 ? 'Failed' : 'Passed';

  let markdown = `## ${resultEmoji} ${suiteLabel} ${resultText}\n\n`;
  markdown += '| Metric | Value |\n|---|---|\n';
  markdown += `| Total | ${total} |\n`;
  markdown += `| Passed | ${stats.expected} |\n`;
  markdown += `| Failed | ${stats.unexpected} |\n`;
  markdown += `| Skipped | ${stats.skipped} |\n`;
  markdown += `| Duration | ${formatDuration(stats.duration)} |\n`;

  if (failedTitles.length > 0) {
    markdown += '\n### Failed tests\n\n';
    for (const title of failedTitles) {
      markdown += `- ${title}\n`;
    }
  }

  appendFileSync(summaryPath, markdown);
  console.log('Job summary written.');
}

main();
