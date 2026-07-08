import { test, expect } from '../../../fixtures/auth.fixture';
import { LoginPage } from '../../../pages/login.page';
import { DashboardPage } from '../../../pages/dashboard.page';
import { env } from '../../../config/env';
import users from '../../../test-data/users.json';

test.describe('Login and Logout', { tag: '@smoke' }, () => {
  test('valid login navigates to the dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(env.username, env.password);

    await expect(dashboardPage.header).toBeVisible();
  });

  test('invalid login shows an error and stays on the login page', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(users.invalidUser.username, users.invalidUser.password);

    await expect(loginPage.errorAlert).toContainText('Invalid credentials');
    await expect(page).toHaveURL(/auth\/login/);
  });

  test('logout returns to the login page', async ({ authenticatedPage }) => {
    const dashboardPage = new DashboardPage(authenticatedPage);
    const loginPage = new LoginPage(authenticatedPage);

    await dashboardPage.logout();

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(authenticatedPage).toHaveURL(/auth\/login/);
  });
});
