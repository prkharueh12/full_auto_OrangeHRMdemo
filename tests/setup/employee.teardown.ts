import { test as teardown } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { env } from '../../config/env';
import { waitForAuthenticated } from '../../utils/session';
import { deleteEmployees } from '../../utils/api/employees';
import { clearEmployeeState, readEmployeeState } from '../../utils/employee-state';

teardown('delete the employee created for the Add User test', async ({ page }) => {
  const state = readEmployeeState();
  if (!state) {
    // Setup failed before writing the hand-off file, or it was already consumed.
    // That is not a failure condition, and deleting with an empty id list would be.
    console.log('[teardown] No employee state found — nothing to clean up.');
    return;
  }

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(env.username, env.password);
  await waitForAuthenticated(page);

  try {
    // Deleting the employee cascades to the system user created by the test, so no
    // separate system-user cleanup is required.
    await deleteEmployees(page.context().request, [state.empNumber]);
  } catch (error) {
    // A stale state file pointing at an already-deleted employee must not fail the
    // run; log it and clear the file below so the next run starts clean.
    console.log(`[teardown] Delete did not succeed, clearing state anyway: ${String(error)}`);
  }

  clearEmployeeState();
});
