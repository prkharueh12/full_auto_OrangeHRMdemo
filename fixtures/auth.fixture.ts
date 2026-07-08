import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { env } from '../config/env';

interface AuthFixtures {
  authenticatedPage: Page;
}

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(env.username, env.password);
    await use(page);
  },
});

export { expect } from '@playwright/test';
