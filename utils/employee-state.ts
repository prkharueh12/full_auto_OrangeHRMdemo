import fs from 'fs';
import path from 'path';
import { CreatedEmployee } from './api/employees';

/**
 * Hand-off file between the `setup` and `teardown` projects.
 *
 * They run as separate Playwright processes, so an in-memory variable cannot carry
 * the server-assigned `empNumber` between them: setup writes it, teardown reads it.
 * `.auth/` is used (not `test-results/`) because it is not wiped between runs by the
 * reporter and is the conventional Playwright name for run-local, secret-adjacent
 * state. It is gitignored.
 *
 * Pure Node `fs` helpers — keeps `utils/api/` HTTP-only.
 */
export const EMPLOYEE_STATE_PATH = path.resolve(__dirname, '..', '.auth', 'employee-state.json');

export function writeEmployeeState(state: CreatedEmployee): void {
  fs.mkdirSync(path.dirname(EMPLOYEE_STATE_PATH), { recursive: true });
  fs.writeFileSync(EMPLOYEE_STATE_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

/** Returns null when the file is absent or unparseable — never throws. */
export function readEmployeeState(): CreatedEmployee | null {
  try {
    const raw = fs.readFileSync(EMPLOYEE_STATE_PATH, 'utf-8');
    return JSON.parse(raw) as CreatedEmployee;
  } catch {
    return null;
  }
}

export function clearEmployeeState(): void {
  fs.rmSync(EMPLOYEE_STATE_PATH, { force: true });
}
