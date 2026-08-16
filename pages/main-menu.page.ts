import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class MainMenuPage extends BasePage {
  readonly adminLink: Locator;
  readonly pimLink: Locator;
  readonly leaveLink: Locator;
  readonly timeLink: Locator;
  readonly recruitmentLink: Locator;
  readonly myInfoLink: Locator;
  readonly performanceLink: Locator;
  readonly dashboardLink: Locator;
  readonly directoryLink: Locator;
  readonly maintenanceLink: Locator;
  readonly claimLink: Locator;
  readonly buzzLink: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.adminLink = page.getByRole('link', { name: 'Admin' });
    this.pimLink = page.getByRole('link', { name: 'PIM' });
    this.leaveLink = page.getByRole('link', { name: 'Leave' });
    this.timeLink = page.getByRole('link', { name: 'Time' });
    this.recruitmentLink = page.getByRole('link', { name: 'Recruitment' });
    this.myInfoLink = page.getByRole('link', { name: 'My Info' });
    this.performanceLink = page.getByRole('link', { name: 'Performance' });
    this.dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    this.directoryLink = page.getByRole('link', { name: 'Directory' });
    this.maintenanceLink = page.getByRole('link', { name: 'Maintenance' });
    this.claimLink = page.getByRole('link', { name: 'Claim' });
    this.buzzLink = page.getByRole('link', { name: 'Buzz' });
    this.searchInput = page.getByRole('textbox', { name: 'Search' });
  }

  async gotoAdmin(): Promise<void> {
    await this.adminLink.click();
  }

  async gotoPim(): Promise<void> {
    await this.pimLink.click();
  }

  async gotoLeave(): Promise<void> {
    await this.leaveLink.click();
  }

  async gotoTime(): Promise<void> {
    await this.timeLink.click();
  }

  async gotoRecruitment(): Promise<void> {
    await this.recruitmentLink.click();
  }

  async gotoMyInfo(): Promise<void> {
    await this.myInfoLink.click();
  }

  async gotoPerformance(): Promise<void> {
    await this.performanceLink.click();
  }

  async gotoDashboard(): Promise<void> {
    await this.dashboardLink.click();
  }

  async gotoDirectory(): Promise<void> {
    await this.directoryLink.click();
  }

  async gotoMaintenance(): Promise<void> {
    await this.maintenanceLink.click();
  }

  async gotoClaim(): Promise<void> {
    await this.claimLink.click();
  }

  async gotoBuzz(): Promise<void> {
    await this.buzzLink.click();
  }

  async search(text: string): Promise<void> {
    await this.searchInput.fill(text);
  }
}
