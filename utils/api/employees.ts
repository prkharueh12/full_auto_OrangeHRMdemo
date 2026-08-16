import { APIRequestContext } from '@playwright/test';
import { env } from '../../config/env';
import { randomEmployeeId } from '../unique';

/**
 * Typed wrapper over the OrangeHRM PIM employees endpoints.
 *
 * Every function takes an already-authenticated `APIRequestContext` (in practice
 * `page.context().request`, which shares the logged-in session cookies) and builds
 * its URL from `env.baseUrl` — the host and credentials are never hardcoded here.
 */
const EMPLOYEES_PATH = '/web/index.php/api/v2/pim/employees';

function employeesUrl(): string {
  return `${env.baseUrl}${EMPLOYEES_PATH}`;
}

export interface EmployeeInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  /** Human-facing id shown in the PIM UI. Auto-generated when omitted. */
  employeeId?: string;
}

export interface CreatedEmployee {
  /** Server-assigned internal id — the only value the DELETE endpoint accepts. */
  empNumber: number;
  firstName: string;
  middleName: string;
  lastName: string;
  employeeId: string;
  terminationId: number | null;
}

export interface FindEmployeesOptions {
  limit?: number;
  offset?: number;
  model?: string;
  includeEmployees?: string;
  sortField?: string;
  sortOrder?: string;
}

export interface FindEmployeesResult {
  data: CreatedEmployee[];
  meta: { total?: number } & Record<string, unknown>;
}

/**
 * Creates an employee. Returns the created record including the server-assigned
 * `empNumber`, which is distinct from the human-facing `employeeId`.
 */
export async function createEmployee(
  request: APIRequestContext,
  employee: EmployeeInput
): Promise<CreatedEmployee> {
  const response = await request.post(employeesUrl(), {
    data: {
      firstName: employee.firstName,
      middleName: employee.middleName ?? '',
      lastName: employee.lastName,
      empPicture: null,
      employeeId: employee.employeeId ?? randomEmployeeId(),
    },
  });

  if (!response.ok()) {
    // The demo instance is public and periodically reset by others, so surface the
    // response body to make CI failures immediately diagnosable.
    throw new Error(
      `Failed to create employee (${response.status()} ${response.statusText()}): ${await response.text()}`
    );
  }

  const body = (await response.json()) as { data: CreatedEmployee };
  return body.data;
}

/**
 * Deletes employees by their server-assigned `empNumber`s. Returns the deleted ids
 * as reported by the API. Deleting an employee cascades to any linked system user.
 */
export async function deleteEmployees(
  request: APIRequestContext,
  empNumbers: number[]
): Promise<string[]> {
  const response = await request.delete(employeesUrl(), {
    data: { ids: empNumbers },
  });

  if (!response.ok()) {
    throw new Error(
      `Failed to delete employees [${empNumbers.join(', ')}] (${response.status()} ${response.statusText()}): ${await response.text()}`
    );
  }

  const body = (await response.json()) as { data: string[] };
  return body.data;
}

/**
 * Looks up employees. Not used by the current suite — kept for future dedupe or
 * verification needs.
 */
export async function findEmployees(
  request: APIRequestContext,
  options: FindEmployeesOptions = {}
): Promise<FindEmployeesResult> {
  const response = await request.get(employeesUrl(), {
    params: {
      limit: options.limit ?? 50,
      offset: options.offset ?? 0,
      model: options.model ?? 'detailed',
      includeEmployees: options.includeEmployees ?? 'onlyCurrent',
      sortField: options.sortField ?? 'employee.firstName',
      sortOrder: options.sortOrder ?? 'ASC',
    },
  });

  if (!response.ok()) {
    throw new Error(
      `Failed to find employees (${response.status()} ${response.statusText()}): ${await response.text()}`
    );
  }

  return (await response.json()) as FindEmployeesResult;
}
