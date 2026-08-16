import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { waitForAuthenticated } from '../utils/session';

export interface NewUserDetails {
  userRole: string;
  employeeName: string;
  status: string;
  username: string;
  password: string;
}

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

  // Add User form
  readonly addUserHeading: Locator;
  readonly userRoleDropdown: Locator;
  readonly statusDropdown: Locator;
  readonly employeeNameInput: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly cancelButton: Locator;
  readonly systemUsersHeading: Locator;

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

    this.addUserHeading = page.getByRole('heading', { name: 'Add User', level: 6 });
    this.userRoleDropdown = this.fieldGroup('User Role').locator('.oxd-select-text');
    this.statusDropdown = this.fieldGroup('Status').locator('.oxd-select-text');
    this.employeeNameInput = this.fieldGroup('Employee Name').getByRole('textbox', {
      name: 'Type for hints...',
    });
    // The Add User form's Username / Password / Confirm Password inputs carry no
    // accessible name, label `for`, `id`, `name` or `placeholder`, so the label
    // group is the only reliable handle. This never clashes with the list screen's
    // usernameFilterInput — the two screens never coexist.
    this.usernameInput = this.fieldInput('Username');
    this.passwordInput = this.fieldInput('Password');
    this.confirmPasswordInput = this.fieldInput('Confirm Password');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.systemUsersHeading = page.getByRole('heading', { name: 'System Users' });
  }

  /**
   * The `.oxd-input-group` wrapping a field, identified by its label's exact text.
   * Exact matching is what keeps "Password" from also matching "Confirm Password"
   * (the `*` in the rendered label is a CSS pseudo-element, not text).
   */
  private fieldGroup(label: string): Locator {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.getByText(label, { exact: true }) });
  }

  private fieldInput(label: string): Locator {
    return this.fieldGroup(label).locator('input');
  }

  /**
   * Each widget renders its option listbox inside its own `.oxd-input-group`, so
   * scoping to the group disambiguates the two dropdowns and the autocomplete.
   */
  private fieldOption(label: string, optionName: string): Locator {
    return this.fieldGroup(label).getByRole('option', { name: optionName, exact: true });
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

  async openAddUserForm(): Promise<void> {
    await this.addButton.waitFor({ state: 'visible' });
    await this.addButton.click();
    await this.addUserHeading.waitFor({ state: 'visible' });
  }

  async selectUserRole(role: string): Promise<void> {
    await this.userRoleDropdown.waitFor({ state: 'visible' });
    await this.userRoleDropdown.click();
    await this.fieldOption('User Role', role).click();
  }

  async selectStatus(status: string): Promise<void> {
    await this.statusDropdown.waitFor({ state: 'visible' });
    await this.statusDropdown.click();
    await this.fieldOption('Status', status).click();
  }

  async selectEmployeeName(name: string): Promise<void> {
    // Same autocomplete widget as the PIM employee search (see
    // PimPage.searchByEmployeeName): typing shows a "Searching...." placeholder that
    // resolves to the matching employee, and the field issues a hint request only
    // when its value changes. The employee is created via the API moments earlier
    // and can lag in the hint results, so retry by re-typing until the matching
    // suggestion resolves before selecting it.
    const option = this.fieldOption('Employee Name', name);
    const noResults = this.page.getByRole('option', { name: 'No Records Found' });
    await this.employeeNameInput.waitFor({ state: 'visible' });
    await this.employeeNameInput.fill(name);

    const deadline = Date.now() + 18000;
    let lastError: unknown;
    while (Date.now() < deadline) {
      try {
        // Only re-type when the hint request came back empty (the field re-queries
        // just on value change). While it still shows "Searching...." leave it alone
        // so the in-flight request can settle instead of being cancelled.
        if (await noResults.isVisible().catch(() => false)) {
          await this.employeeNameInput.fill('');
          await this.employeeNameInput.fill(name);
        }
        await option.waitFor({ state: 'visible', timeout: 8000 });
        lastError = undefined;
        break;
      } catch (error) {
        lastError = error;
      }
    }
    if (lastError) {
      throw lastError;
    }

    await option.click();
  }

  async fillCredentials(
    username: string,
    password: string,
    confirmPassword: string = password
  ): Promise<void> {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  async fillAddUserForm(details: NewUserDetails): Promise<void> {
    await this.selectUserRole(details.userRole);
    await this.selectEmployeeName(details.employeeName);
    await this.selectStatus(details.status);
    await this.fillCredentials(details.username, details.password);
  }

  async saveUser(): Promise<void> {
    await this.saveButton.waitFor({ state: 'visible' });
    await this.saveButton.click();
    // Saving redirects to the System Users list. Wait for that to complete so the
    // record is actually persisted; returning early lets the next navigation abort
    // the in-flight save (the same hazard PimPage.addEmployee guards against).
    await this.page.waitForURL(/admin\/viewSystemUsers/);
  }

  resultRow(text: string): Locator {
    return this.page.getByRole('row', { name: text });
  }
}
