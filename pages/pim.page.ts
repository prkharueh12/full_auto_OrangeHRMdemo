import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { waitForAuthenticated } from '../utils/session';

export class PimPage extends BasePage {
  private static readonly ADD_EMPLOYEE_PATH = '/web/index.php/pim/addEmployee';
  private static readonly EMPLOYEE_LIST_PATH = '/web/index.php/pim/viewEmployeeList';

  readonly addButton: Locator;
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly saveButton: Locator;
  readonly requiredErrors: Locator;
  readonly personalDetailsHeading: Locator;
  readonly employeeNameSearchInput: Locator;
  readonly searchButton: Locator;
  readonly recordCount: Locator;
  readonly resultsTable: Locator;

  constructor(page: Page) {
    super(page);
    this.addButton = page.getByRole('button', { name: 'Add' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.middleNameInput = page.getByRole('textbox', { name: 'Middle Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.requiredErrors = page.locator('.oxd-input-field-error-message');
    this.personalDetailsHeading = page.getByRole('heading', { name: 'Personal Details' });
    this.employeeNameSearchInput = page
      .getByRole('textbox', { name: 'Type for hints...' })
      .first();
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.recordCount = page
      .locator('span.oxd-text--span')
      .filter({ hasText: /Record(s)? Found/ });
    this.resultsTable = page.getByRole('table');
  }

  async gotoAddEmployee(): Promise<void> {
    await waitForAuthenticated(this.page);
    await super.goto(PimPage.ADD_EMPLOYEE_PATH);
  }

  async gotoEmployeeList(): Promise<void> {
    await waitForAuthenticated(this.page);
    await super.goto(PimPage.EMPLOYEE_LIST_PATH);
  }

  async addEmployee(firstName: string, lastName: string, middleName?: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    if (middleName) {
      await this.middleNameInput.fill(middleName);
    }
    await this.lastNameInput.fill(lastName);
    await this.saveButton.click();
    // Saving redirects to the new employee's Personal Details page. Wait for that
    // to complete so the record is actually persisted; returning early lets the
    // next navigation abort the in-flight save and the employee is never created.
    await this.personalDetailsHeading.waitFor({ state: 'visible' });
  }

  async saveWithoutInput(): Promise<void> {
    await this.saveButton.click();
    // Client-side validation renders the required-field errors asynchronously;
    // wait for the first one so callers reading requiredErrors.count() don't race it.
    await this.requiredErrors.first().waitFor({ state: 'visible' });
  }

  async searchByEmployeeName(name: string): Promise<void> {
    // The employee-name field is an autocomplete: typing shows a "Searching...."
    // placeholder that resolves to the matching employee, and the name is only
    // applied as a filter once a real suggestion is selected. The field issues a
    // hint request only when its value changes, and a freshly created employee can
    // take a moment to appear in those results, so retry by re-typing until the
    // matching suggestion resolves before selecting it and searching. Without this
    // the search either runs with no bound employee (all records) or the stale
    // "No Records Found" hint sticks (zero records).
    const option = this.autocompleteOption(name);
    const noResults = this.page.getByRole('option', { name: 'No Records Found' });
    await this.employeeNameSearchInput.fill(name);

    const deadline = Date.now() + 18000;
    let lastError: unknown;
    while (Date.now() < deadline) {
      try {
        // Only re-type when the hint request came back empty (the field re-queries
        // just on value change). While it still shows "Searching...." leave it alone
        // so the in-flight request can settle instead of being cancelled.
        if (await noResults.isVisible().catch(() => false)) {
          await this.employeeNameSearchInput.fill('');
          await this.employeeNameSearchInput.fill(name);
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
    await this.searchButton.click();
  }

  autocompleteOption(name: string): Locator {
    return this.page.getByRole('option', { name });
  }

  employeeNameHeading(fullName: string): Locator {
    return this.page.getByRole('heading', { name: fullName, level: 6 });
  }

  resultRow(text: string): Locator {
    return this.page.getByRole('row', { name: text });
  }
}
