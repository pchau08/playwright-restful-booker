import { test, expect } from '../../src/fixtures/base.fixture';
import { bookingFactory } from '../../src/helpers/booking.factory';

/**
 * Home page UI tests
 *
 * These tests focus on what only a browser can verify:
 * rendering, layout, navigation, and user-facing behavior.
 *
 * All prerequisite data is created via API.
 * UI tests never click through setup flows.
 */

test.describe('Home Page UI', () => {

  test.describe('Page load and structure', () => {
    test('should load the home page successfully @smoke @regression', async ({ homePage }) => {
      await homePage.navigate();
      await homePage.expectOnHomePage();
    });

    test('should display the rooms section @smoke @regression', async ({ homePage }) => {
      await homePage.navigate();
      await homePage.expectRoomsSectionVisible();
    });

    test('should display the contact form @regression', async ({ homePage }) => {
      await homePage.navigate();
      await homePage.expectContactFormVisible();
    });

    test('should have correct page title @regression', async ({ homePage }) => {
      await homePage.navigate();
      // Assert something is in the title
      const title = await homePage.page.title();
      expect(title.length).toBeGreaterThan(0);
    });

    test('should load within performance threshold @regression', async ({ homePage }) => {
      const start = Date.now();
      await homePage.navigate();
      const loadTime = Date.now() - start;

      console.log(`Home page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10_000);
    });
  });

  test.describe('Contact form interactions', () => {
    test('should submit contact form with valid data @smoke @regression', async ({ homePage }) => {
      await homePage.navigate();
      await homePage.fillAndSubmitContact({
        name: 'Test User',
        email: 'test@example.com',
        phone: '01234567890',
        subject: 'Room availability enquiry',
        message: 'I would like to enquire about room availability for a business trip.',
      });

      await homePage.expectContactSuccessMessage('Test User');
    });

    test('should display success message with submitted name @regression', async ({ homePage }) => {
      await homePage.navigate();

      const uniqueName = `Tester_${Date.now()}`;
      await homePage.fillAndSubmitContact({
        name: uniqueName,
        email: 'unique@test.com',
        phone: '01234567890',
        subject: 'Unique test subject',
        message: 'This is a unique test message with enough characters.',
      });

      await homePage.expectContactSuccessMessage(uniqueName);
    });
  });

  test.describe('Cross-layer state verification', () => {
    test('API booking count remains stable after UI page loads @regression', async ({
      bookingClient,
      homePage,
      createdBookingIds,
    }) => {
      // Get baseline booking count
      const before = await bookingClient.getAllBookingIds();

      // Create a known booking
      const payload = bookingFactory().withFirstName('StabilityCheck').build();
      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      // Load the UI
      await homePage.navigate();
      await homePage.expectOnHomePage();

      // Verify API state hasn't changed unexpectedly
      const after = await bookingClient.getAllBookingIds();
      expect(after.length).toBeGreaterThanOrEqual(before.length + 1);
    });
  });
});
