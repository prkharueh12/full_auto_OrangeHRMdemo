import { Page } from '@playwright/test';

const LOGIN_PATH_SUFFIX = '/auth/login';

// Call before navigating: authenticatedPage returns before the post-login redirect
// finishes, so an immediate goto() can abort it and leave the session unestablished.
export async function waitForAuthenticated(page: Page): Promise<void> {
  await page.waitForURL((url) => !url.pathname.endsWith(LOGIN_PATH_SUFFIX), {
    timeout: 15000,
  });
}
