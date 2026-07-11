import { test, expect } from '../../../fixtures/auth.fixture';
import { PimPage } from '../../../pages/pim.page';
import { uniqueLastName } from '../../../utils/unique';
import pim from '../../../test-data/pim.json';

test.describe('PIM - Employee management', { tag: '@regression' }, () => {
  test('add a new employee successfully', async ({ authenticatedPage }) => {
    const pimPage = new PimPage(authenticatedPage);
    const { firstName } = pim.newEmployee;
    const lastName = uniqueLastName(pim.newEmployee.lastNamePrefix);

    await pimPage.gotoAddEmployee();
    await pimPage.addEmployee(firstName, lastName);

    await expect(authenticatedPage).toHaveURL(/pim\/viewPersonalDetails\/empNumber\/\d+/);
    await expect(pimPage.personalDetailsHeading).toBeVisible();
    await expect(pimPage.employeeNameHeading(`${firstName} ${lastName}`)).toBeVisible();
  });

  test('adding an employee with blank required fields shows validation errors', async ({
    authenticatedPage,
  }) => {
    const pimPage = new PimPage(authenticatedPage);

    await pimPage.gotoAddEmployee();
    await pimPage.saveWithoutInput();

    await expect(authenticatedPage).toHaveURL(/pim\/addEmployee/);
    expect(await pimPage.requiredErrors.count()).toBeGreaterThanOrEqual(2);
    await expect(pimPage.requiredErrors.first()).toContainText('Required');
  });

  test('search for an employee by name returns the matching record', async ({
    authenticatedPage,
  }) => {
    const pimPage = new PimPage(authenticatedPage);
    const { firstName } = pim.newEmployee;
    const lastName = uniqueLastName(pim.newEmployee.lastNamePrefix);

    await pimPage.gotoAddEmployee();
    await pimPage.addEmployee(firstName, lastName);

    await pimPage.gotoEmployeeList();
    await pimPage.searchByEmployeeName(`${firstName} ${lastName}`);

    await expect(pimPage.recordCount).toContainText(/Record(s)? Found/);
    await expect(pimPage.resultsTable).toBeVisible();
    await expect(pimPage.resultRow(lastName)).toBeVisible();
  });
});
