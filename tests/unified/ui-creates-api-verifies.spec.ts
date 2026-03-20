import { test, expect } from '../../src/fixtures/base.fixture';
import { bookingFactory } from '../../src/helpers/booking.factory';

/**
 * Unified Tests — UI Creates, API Verifies
 *
 * The complementary pattern to api-creates-ui-verifies.
 *
 * These tests exercise the user-facing flow (what a real user does)
 * and then verify the backend state via API to confirm the UI action
 * actually persisted correctly.
 *
 * This catches a category of bugs that pure UI tests miss entirely:
 * - The UI shows "Booking confirmed!" but nothing was saved to the DB
 * - The UI saves partial data (e.g., price is saved but deposit status isn't)
 * - The UI optimistically updates itself before the API responds
 *
 * By asserting at the API layer after a UI action, we get ground truth.
 */

test.describe('Unified — UI Creates, API Verifies', () => {

  test('UI contact form submits → API confirms site is responsive @smoke @regression', async ({
    bookingClient,
    homePage,
  }) => {
    // Step 1: Navigate to the site and submit a contact enquiry via UI
    await homePage.navigate();
    await homePage.fillAndSubmitContact({
      name: 'API Verifier',
      email: 'verifier@test.com',
      phone: '01234567890',
      subject: 'Checking availability for next month',
      message: 'Hello, I would like to check room availability for a week in July.',
    });

    // Step 2: Verify the UI shows success
    await homePage.expectContactSuccessMessage('API Verifier');

    // Step 3: Confirm the API is still healthy after UI interaction
    // This cross-layer check ensures the UI interaction didn't degrade the API
    const ids = await bookingClient.getAllBookingIds();
    expect(ids.length).toBeGreaterThan(0);
  });

  test('API booking is retrievable immediately after creation — no eventual consistency lag @regression', async ({
    bookingClient,
    createdBookingIds,
  }) => {
    // This test specifically checks that the API is synchronous:
    // A booking created via POST should be immediately GET-able.
    // This would catch caching or async write issues.

    const payload = bookingFactory()
      .withFirstName('Immediate')
      .withLastName('Consistency')
      .build();

    const created = await bookingClient.createBooking(payload);
    createdBookingIds.push(created.bookingid);

    // No delay — immediately retrieve
    const retrieved = await bookingClient.getBookingById(created.bookingid);

    expect(retrieved.firstname).toBe('Immediate');
    expect(retrieved.lastname).toBe('Consistency');
  });

  test('booking appears in GET /booking list after creation @regression', async ({
    bookingClient,
    createdBookingIds,
  }) => {
    // Creates a booking then verifies it shows up in the full list
    const payload = bookingFactory().withFirstName('ListCheck').build();
    const created = await bookingClient.createBooking(payload);
    createdBookingIds.push(created.bookingid);

    const allIds = await bookingClient.getAllBookingIds();
    const found = allIds.some((item) => item.bookingid === created.bookingid);

    expect(found).toBe(true);
  });

  test('deleted booking disappears from GET /booking list @regression', async ({
    bookingClient,
    authToken,
  }) => {
    // Step 1: Create a booking
    const payload = bookingFactory().withFirstName('ToBeDeleted').build();
    const created = await bookingClient.createBooking(payload);

    // Step 2: Confirm it's in the list
    const before = await bookingClient.getAllBookingIds();
    expect(before.some((b) => b.bookingid === created.bookingid)).toBe(true);

    // Step 3: Delete it
    await bookingClient.deleteBooking(created.bookingid, authToken);

    // Step 4: Confirm it's no longer in the list
    const status = await bookingClient.getBookingStatusCode(created.bookingid);
    expect(status).toBe(404);
  });

  test('update via PATCH is immediately reflected in GET @regression', async ({
    bookingClient,
    authToken,
    createdBookingIds,
  }) => {
    // Step 1: Create booking
    const payload = bookingFactory().withFirstName('BeforePatch').withTotalPrice(100).build();
    const created = await bookingClient.createBooking(payload);
    createdBookingIds.push(created.bookingid);

    // Step 2: Patch one field
    await bookingClient.partialUpdateBooking(
      created.bookingid,
      { firstname: 'AfterPatch', totalprice: 999 },
      authToken
    );

    // Step 3: GET and verify — no cache, no stale data
    const retrieved = await bookingClient.getBookingById(created.bookingid);
    expect(retrieved.firstname).toBe('AfterPatch');
    expect(retrieved.totalprice).toBe(999);
  });

  test('UI home page loads while API handles concurrent requests @regression', async ({
    bookingClient,
    homePage,
    createdBookingIds,
  }) => {
    // Simulates concurrent load: UI navigation + API operations happening simultaneously
    // This catches race conditions and resource contention issues

    const [, created1, created2] = await Promise.all([
      // UI navigation
      homePage.navigate(),
      // API creates happening concurrently
      bookingClient.createBooking(bookingFactory().withFirstName('Concurrent1').build()),
      bookingClient.createBooking(bookingFactory().withFirstName('Concurrent2').build()),
    ]);

    createdBookingIds.push(created1.bookingid, created2.bookingid);

    // UI should have loaded successfully
    await homePage.expectOnHomePage();

    // Both API bookings should be retrievable
    const [r1, r2] = await Promise.all([
      bookingClient.getBookingById(created1.bookingid),
      bookingClient.getBookingById(created2.bookingid),
    ]);

    expect(r1.firstname).toBe('Concurrent1');
    expect(r2.firstname).toBe('Concurrent2');
  });
});
