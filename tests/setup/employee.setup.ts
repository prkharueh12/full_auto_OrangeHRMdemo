import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { env } from '../../config/env';
import { waitForAuthenticated } from '../../utils/session';
import { createEmployee } from '../../utils/api/employees';
import { writeEmployeeState } from '../../utils/employee-state';
import admin from '../../test-data/admin.json';

setup('create the employee the Add User test selects', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(env.username, env.password);
  // The API calls below are authenticated by the browser context's session cookies,
  // so the post-login redirect must have completed before they are issued.
  await waitForAuthenticated(page);

  const employee = await createEmployee(page.context().request, admin.setupEmployee);
  expect(employee.empNumber).toBeTruthy();

  // Teardown runs in a separate process, so the server-assigned empNumber is handed
  // over through a file rather than an in-memory variable.
  writeEmployeeState(employee);
});
