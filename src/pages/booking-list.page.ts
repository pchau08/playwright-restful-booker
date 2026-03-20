import { Page, Locator, expect } from '@playwright/test';
import type { Booking } from '../types/booking.types';

/**
 * BookingListPage
 *
 * Covers the Restful Booker Platform main booking management screen.
 * URL: https://automationintestingstore.com
 */
export class BookingListPage {
  readonly page: Page;

  private readonly pageTitle: Locator;
  private readonly bookingRows: Locator;
  private readonly newBookingButton: Locator;
  private readonly firstnameInput: Locator;
  private readonly lastnameInput: Locator;
  private readonly totalpriceInput: Locator;
  private readonly depositpaidSelect: Locator;
  private readonly checkinInput: Locator;
  private readonly checkoutInput: Locator;
  private readonly additionalNeedsInput: Locator;
  private readonly saveButton: Locator;
  private readonly deleteButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.locator('h1, .heading');
    this.bookingRows = page.locator('.booking-row, tbody tr');
    this.newBookingButton = page.locator('#addNew, button:has-text("Add")');
    this.firstnameInput = page.locator('[data-field="firstname"], #firstname');
    this.lastnameInput = page.locator('[data-field="lastname"], #lastname');
    this.totalpriceInput = page.locator('[data-field="totalprice"], #totalprice');
    this.depositpaidSelect = page.locator('[data-field="depositpaid"], #depositpaid');
    this.checkinInput = page.locator('[data-field="checkin"], #checkin');
    this.checkoutInput = page.locator('[data-field="checkout"], #checkout');
    this.additionalNeedsInput = page.locator('[data-field="additionalneeds"], #additionalneeds');
    this.saveButton = page.locator('button:has-text("Save")');
    this.deleteButtons = page.locator('button:has-text("Delete")');
  }

  // ─── Navigation ────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ─── Actions ───────────────────────────────────────────────────────────────

  async createBookingViaUI(booking: Booking): Promise<void> {
    await this.newBookingButton.click();
    await this.firstnameInput.fill(booking.firstname);
    await this.lastnameInput.fill(booking.lastname);
    await this.totalpriceInput.fill(String(booking.totalprice));
    await this.depositpaidSelect.selectOption(String(booking.depositpaid));
    await this.checkinInput.fill(booking.bookingdates.checkin);
    await this.checkoutInput.fill(booking.bookingdates.checkout);
    if (booking.additionalneeds) {
      await this.additionalNeedsInput.fill(booking.additionalneeds);
    }
    await this.saveButton.click();
  }

  async clickBookingById(bookingId: number): Promise<void> {
    await this.page.locator(`[data-id="${bookingId}"], tr:has-text("${bookingId}")`).click();
  }

  async deleteBookingById(bookingId: number): Promise<void> {
    const row = this.page.locator(`tr:has-text("${bookingId}")`);
    await row.locator('button:has-text("Delete")').click();
  }

  // ─── Assertions ────────────────────────────────────────────────────────────

  async expectOnPage(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL('/');
  }

  async expectBookingVisible(bookingId: number): Promise<void> {
    await expect(
      this.page.locator(`[data-id="${bookingId}"], td:has-text("${bookingId}")`)
    ).toBeVisible({ timeout: 10_000 });
  }

  async expectBookingNotVisible(bookingId: number): Promise<void> {
    await expect(
      this.page.locator(`[data-id="${bookingId}"], td:has-text("${bookingId}")`)
    ).not.toBeVisible();
  }

  async expectBookingCount(count: number): Promise<void> {
    await expect(this.bookingRows).toHaveCount(count);
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  async getBookingCount(): Promise<number> {
    return this.bookingRows.count();
  }

  async getAllBookingIds(): Promise<number[]> {
    const ids = await this.page.locator('[data-id]').allTextContents();
    return ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id));
  }
}
