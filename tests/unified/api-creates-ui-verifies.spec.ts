import { test, expect } from '../../src/fixtures/base.fixture';
import { bookingFactory } from '../../src/helpers/booking.factory';

/**
 * Unified Tests — API Creates, UI Verifies
 *
 * This is the core of the unified testing pattern.
 *
 * The problem with pure UI tests:
 * - They're slow because they click through forms to create prerequisite data
 * - They're fragile because unrelated UI changes break setup steps
 * - They test the wrong thing — a test for "booking renders correctly"
 *   shouldn't fail because the "create booking" form changed
 *
 * The solution:
 * 1. Use the API to create test data (fast, reliable, direct)
 * 2. Use the UI to verify what only a browser can verify (rendering, layout, UX)
 * 3. Use the API to tear down (clean, guaranteed)
 *
 * This gives us the best of both worlds: API speed for setup,
 * browser accuracy for assertions.
 */

test.describe('Unified — API Creates, UI Verifies', () => {
  test('API creates booking → home page renders without errors @smoke @regression', async ({
    bookingClient,
    homePage,
    createdBookingIds,
  }) => {
    // Step 1: Create booking via API (fast, no UI involved)
    const payload = bookingFactory()
      .withFirstName('Unified')
      .withLastName('ApiToUI')
      .withTotalPrice(300)
      .withDepositPaid(true)
      .build();

    const created = await bookingClient.createBooking(payload);
    createdBookingIds.push(created.bookingid);

    // Step 2: Navigate to the UI and verify the page loads correctly
    await homePage.navigate();
    await homePage.expectOnHomePage();
    await homePage.expectRoomsSectionVisible();

    // Step 3: Verify booking ID is a valid positive integer (API contract)
    expect(created.bookingid).toBeGreaterThan(0);
    expect(Number.isInteger(created.bookingid)).toBe(true);
  });

  test('API creates booking → GET confirms all fields persisted correctly @regression', async ({
    bookingClient,
    createdBookingIds,
  }) => {
    // Step 1: Create via API with specific known values
    const payload = bookingFactory()
      .withFirstName('Persistence')
      .withLastName('Check')
      .withTotalPrice(450)
      .withDepositPaid(false)
      .withDates('2026-09-01', '2026-09-07')
      .withAdditionalNeeds('Late checkout')
      .build();

    const created = await bookingClient.createBooking(payload);
    createdBookingIds.push(created.bookingid);

    // Step 2: GET the booking back and verify every field persisted
    const retrieved = await bookingClient.getBookingById(created.bookingid);

    expect(retrieved.firstname).toBe('Persistence');
    expect(retrieved.lastname).toBe('Check');
    expect(retrieved.totalprice).toBe(450);
    expect(retrieved.depositpaid).toBe(false);
    expect(retrieved.bookingdates.checkin).toBe('2026-09-01');
    expect(retrieved.bookingdates.checkout).toBe('2026-09-07');
    expect(retrieved.additionalneeds).toBe('Late checkout');
  });

  test('API creates → UI contact form → API-level state is clean @regression', async ({
    bookingClient,
    homePage,
    createdBookingIds,
  }) => {
    // Step 1: Create a booking via API to establish known state
    const payload = bookingFactory().withFirstName('ContactTest').build();
    const created = await bookingClient.createBooking(payload);
    createdBookingIds.push(created.bookingid);

    // Step 2: Navigate to UI and submit contact form
    await homePage.navigate();
    await homePage.fillAndSubmitContact({
      name: 'Jane Tester',
      email: 'jane@test.com',
      phone: '01234567890',
      subject: 'Test enquiry about availability',
      message: 'I would like to enquire about room availability for the summer.',
    });

    // Step 3: Verify success message renders (UI assertion)
    await homePage.expectContactSuccessMessage('Jane Tester');

    // Step 4: Verify our original booking still exists (API assertion)
    // This confirms UI actions didn't corrupt backend state
    const status = await bookingClient.getBookingStatusCode(created.bookingid);
    expect(status).toBe(200);
  });

  test('full lifecycle — create, update, verify update, delete, verify deletion @regression', async ({
    bookingClient,
    authToken,
  }) => {
    // This is the complete data lifecycle test — no cleanup needed
    // because we delete within the test itself

    // Step 1: Create
    const original = bookingFactory()
      .withFirstName('Lifecycle')
      .withLastName('Original')
      .withTotalPrice(100)
      .build();

    const created = await bookingClient.createBooking(original);
    const id = created.bookingid;
    expect(id).toBeGreaterThan(0);

    // Step 2: Verify creation
    const afterCreate = await bookingClient.getBookingById(id);
    expect(afterCreate.firstname).toBe('Lifecycle');
    expect(afterCreate.totalprice).toBe(100);

    // Step 3: Full update
    const updated = bookingFactory()
      .withFirstName('Lifecycle')
      .withLastName('Updated')
      .withTotalPrice(500)
      .withDepositPaid(true)
      .build();

    await bookingClient.updateBooking(id, updated, authToken);

    // Step 4: Verify update persisted
    const afterUpdate = await bookingClient.getBookingById(id);
    expect(afterUpdate.lastname).toBe('Updated');
    expect(afterUpdate.totalprice).toBe(500);
    expect(afterUpdate.depositpaid).toBe(true);

    // Step 5: Partial update
    await bookingClient.partialUpdateBooking(id, { totalprice: 750 }, authToken);

    // Step 6: Verify partial update
    const afterPatch = await bookingClient.getBookingById(id);
    expect(afterPatch.totalprice).toBe(750);
    expect(afterPatch.lastname).toBe('Updated'); // unchanged

    // Step 7: Delete
    const deleteStatus = await bookingClient.deleteBooking(id, authToken);
    expect(deleteStatus).toBe(201);

    // Step 8: Verify deletion
    const afterDelete = await bookingClient.getBookingStatusCode(id);
    expect(afterDelete).toBe(404);
  });

  test('multiple bookings created via API are independently retrievable @regression', async ({
    bookingClient,
    createdBookingIds,
  }) => {
    // Create 3 bookings with distinct data
    const bookings = await Promise.all([
      bookingClient.createBooking(bookingFactory().withFirstName('Alpha').withTotalPrice(100).build()),
      bookingClient.createBooking(bookingFactory().withFirstName('Beta').withTotalPrice(200).build()),
      bookingClient.createBooking(bookingFactory().withFirstName('Gamma').withTotalPrice(300).build()),
    ]);

    bookings.forEach((b) => createdBookingIds.push(b.bookingid));

    // Verify each is independently retrievable and data is correct
    const retrieved = await Promise.all(
      bookings.map((b) => bookingClient.getBookingById(b.bookingid))
    );

    expect(retrieved[0].firstname).toBe('Alpha');
    expect(retrieved[0].totalprice).toBe(100);
    expect(retrieved[1].firstname).toBe('Beta');
    expect(retrieved[1].totalprice).toBe(200);
    expect(retrieved[2].firstname).toBe('Gamma');
    expect(retrieved[2].totalprice).toBe(300);

    // Confirm IDs are all unique
    const ids = bookings.map((b) => b.bookingid);
    expect(new Set(ids).size).toBe(3);
  });
});
