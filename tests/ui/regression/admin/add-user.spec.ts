import { test, expect } from '../../../../fixtures/auth.fixture';
import { AdminUsersPage } from '../../../../pages/admin-users.page';
import { MainMenuPage } from '../../../../pages/main-menu.page';
import { randomUsername } from '../../../../utils/unique';
import admin from '../../../../test-data/admin.json';

test.describe('Admin - Add user', { tag: '@regression' }, () => {
  test('should create a new system user and show it in the results table', async ({
    authenticatedPage,
  }) => {
    const mainMenuPage = new MainMenuPage(authenticatedPage);
    const adminUsersPage = new AdminUsersPage(authenticatedPage);
    const username = randomUsername(admin.newUser.usernamePrefix);

    // Given the user is at the Admin page
    await mainMenuPage.gotoAdmin();
    await expect(adminUsersPage.systemUsersHeading).toBeVisible();

    // When the user views the Add User form
    await adminUsersPage.openAddUserForm();

    // And the user fills all information
    await adminUsersPage.fillAddUserForm({
      userRole: admin.newUser.userRole,
      employeeName: admin.newUser.employeeName,
      status: admin.newUser.status,
      username,
      password: admin.newUser.password,
    });

    // And the user clicks the SAVE button
    await adminUsersPage.saveUser();
    await expect(authenticatedPage).toHaveURL(/admin\/viewSystemUsers/);
    await expect(adminUsersPage.requiredErrors).toHaveCount(0);

    // Then the user verifies the new username in the "Records Found" table
    await adminUsersPage.searchByUsername(username);

    await expect(adminUsersPage.recordCount).toContainText('(1) Record Found');
    await expect(adminUsersPage.resultsTable).toBeVisible();
    await expect(adminUsersPage.resultRow(username)).toBeVisible();
    await expect(adminUsersPage.resultRow(username)).toContainText(username);
    await expect(adminUsersPage.resultRow(username)).toContainText(admin.newUser.userRole);
    await expect(adminUsersPage.resultRow(username)).toContainText(admin.newUser.employeeName);
    await expect(adminUsersPage.resultRow(username)).toContainText(admin.newUser.status);
  });
});
