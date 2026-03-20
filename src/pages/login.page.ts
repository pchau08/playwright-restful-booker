import { Page, Locator, expect } from '@playwright/test';

/**
 * LoginPage — Restful Booker Platform admin login
 * URL: https://www.phptravels.net/admin (or equivalent demo)
 *
 * Note: Restful Booker's UI (https://automationintestingstore.com) is the
 * recommended UI target. The admin panel login is at the root.
 */
export class LoginPage {
  readonly page: Page;

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.loginButton = page.locator('#doLogin');
    this.errorMessage = page.locator('.alert-danger, .invalid-credentials');
    this.pageHeading = page.locator('h2, .login-title');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectOnLoginPage(): Promise<void> {
    await expect(this.loginButton).toBeVisible();
  }

  async expectErrorVisible(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }

  async expectLoggedIn(): Promise<void> {
    await this.page.waitForURL(/.*admin.*/);
  }
}
