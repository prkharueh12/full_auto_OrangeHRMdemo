import { test, expect } from '../../../fixtures/auth.fixture';
import { AdminUsersPage } from '../../../pages/admin-users.page';
import admin from '../../../test-data/admin.json';

test.describe('Admin - System users', { tag: '@regression' }, () => {
  test('search system users by username returns the matching user', async ({
    authenticatedPage,
  }) => {
    const adminUsersPage = new AdminUsersPage(authenticatedPage);

    await adminUsersPage.gotoUserList();
    await adminUsersPage.searchByUsername(admin.existingUsername);

    await expect(adminUsersPage.recordCount).toContainText(/Record(s)? Found/);
    await expect(adminUsersPage.resultsTable).toBeVisible();
    await expect(adminUsersPage.resultRow('Admin')).toBeVisible();
  });

  test('adding a user with a blank form shows required-field validation', async ({
    authenticatedPage,
  }) => {
    const adminUsersPage = new AdminUsersPage(authenticatedPage);

    await adminUsersPage.gotoAddUser();
    await adminUsersPage.saveWithoutInput();

    await expect(authenticatedPage).toHaveURL(/admin\/saveSystemUser/);
    expect(await adminUsersPage.requiredErrors.count()).toBeGreaterThanOrEqual(4);
    await expect(adminUsersPage.requiredErrors.first()).toContainText('Required');
  });
});
