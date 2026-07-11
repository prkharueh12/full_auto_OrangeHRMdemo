import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { waitForAuthenticated } from '../utils/session';

export class AdminUsersPage extends BasePage {
  private static readonly USER_LIST_PATH = '/web/index.php/admin/viewSystemUsers';
  private static readonly ADD_USER_PATH = '/web/index.php/admin/saveSystemUser';

  readonly addButton: Locator;
  readonly usernameFilterInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly recordCount: Locator;
  readonly resultsTable: Locator;
  readonly saveButton: Locator;
  readonly requiredErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.usernameFilterInput = page
      .locator('.oxd-table-filter-area')
      .getByRole('textbox')
      .first();
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });
    this.recordCount = page.getByText(/Record(s)? Found/);
    this.resultsTable = page.getByRole('table');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.requiredErrors = page.locator('.oxd-input-field-error-message');
  }

  async gotoUserList(): Promise<void> {
    await waitForAuthenticated(this.page);
    await super.goto(AdminUsersPage.USER_LIST_PATH);
  }

  async gotoAddUser(): Promise<void> {
    await waitForAuthenticated(this.page);
    await super.goto(AdminUsersPage.ADD_USER_PATH);
  }

  async searchByUsername(username: string): Promise<void> {
    await this.usernameFilterInput.fill(username);
    await this.searchButton.click();
  }

  async saveWithoutInput(): Promise<void> {
    await this.saveButton.click();
    // Client-side validation renders the required-field errors asynchronously;
    // wait for the first one so callers reading requiredErrors.count() don't race it.
    await this.requiredErrors.first().waitFor({ state: 'visible' });
  }

  resultRow(text: string): Locator {
    return this.page.getByRole('row', { name: text });
  }
}
