import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  private readonly heading: Locator;
  private readonly roomsSection: Locator;
  private readonly contactForm: Locator;
  private readonly contactNameInput: Locator;
  private readonly contactEmailInput: Locator;
  private readonly contactPhoneInput: Locator;
  private readonly contactSubjectInput: Locator;
  private readonly contactMessageInput: Locator;
  private readonly contactSubmitButton: Locator;
  private readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.roomsSection = page.locator('#rooms');
    this.contactForm = page.locator('#contact');
    this.contactNameInput = page.locator('[data-testid="ContactName"]');
    this.contactEmailInput = page.locator('[data-testid="ContactEmail"]');
    this.contactPhoneInput = page.locator('[data-testid="ContactPhone"]');
    this.contactSubjectInput = page.locator('[data-testid="ContactSubject"]');
    this.contactMessageInput = page.locator('[data-testid="ContactDescription"]');
    this.contactSubmitButton = page.locator('button').filter({ hasText: 'Submit' }).or(page.locator('#submitContact'));
    this.successMessage = page.locator('.contact h2');
  }

  async navigate(): Promise<void> {
    await this.page.goto('/');
    await expect(this.heading).toBeVisible();
  }

  async fillAndSubmitContact(data: { name: string; email: string; phone: string; subject: string; message: string; }): Promise<void> {
    await this.contactNameInput.fill(data.name);
    await this.contactEmailInput.fill(data.email);
    await this.contactPhoneInput.fill(data.phone);
    await this.contactSubjectInput.fill(data.subject);
    await this.contactMessageInput.fill(data.message);
    await this.contactSubmitButton.click();
  }

  async expectOnHomePage(): Promise<void> {
    await expect(this.page).toHaveURL('/');
    await expect(this.heading).toBeVisible();
  }

  async expectRoomsSectionVisible(): Promise<void> {
    await expect(this.roomsSection).toBeVisible();
  }

  async expectContactFormVisible(): Promise<void> {
    await expect(this.contactForm).toBeVisible();
  }

  async expectContactSuccessMessage(name: string): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 10_000 });
    await expect(this.successMessage).toContainText(name);
  }
}
