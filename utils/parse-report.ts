import { readFileSync } from 'node:fs';

export interface PlaywrightSpec {
  title: string;
  ok: boolean;
  file: string;
  line: number;
}

export interface PlaywrightSuite {
  specs: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

export interface PlaywrightReport {
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

export function readReport(path: string): PlaywrightReport | null {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

export function collectFailedTitles(suites: PlaywrightSuite[]): string[] {
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

export function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}
