import { test, expect } from '../../src/fixtures/base.fixture';
import { bookingFactory } from '../../src/helpers/booking.factory';
import { SchemaValidator } from '../../src/helpers/schema.validator';

/**
 * Booking CRUD API tests
 *
 * Full coverage of the /booking endpoint:
 * Create → Read → Update (full) → Update (partial) → Delete
 *
 * Each test cleans up after itself via the createdBookingIds fixture.
 * Tests are independent — no shared state between them.
 */

test.describe('Booking CRUD API', () => {

  // ─── Create ────────────────────────────────────────────────────────────────

  test.describe('POST /booking', () => {
    test('should create a booking and return bookingid @smoke @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().build();
      const response = await bookingClient.createBooking(payload);

      expect(response.bookingid).toBeDefined();
      expect(typeof response.bookingid).toBe('number');
      expect(response.bookingid).toBeGreaterThan(0);

      createdBookingIds.push(response.bookingid);
    });

    test('should return created booking data matching the payload @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory()
        .withFirstName('James')
        .withLastName('Playwright')
        .withTotalPrice(500)
        .withDepositPaid(true)
        .build();

      const response = await bookingClient.createBooking(payload);
      createdBookingIds.push(response.bookingid);

      expect(response.booking.firstname).toBe(payload.firstname);
      expect(response.booking.lastname).toBe(payload.lastname);
      expect(response.booking.totalprice).toBe(payload.totalprice);
      expect(response.booking.depositpaid).toBe(payload.depositpaid);
      expect(response.booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
      expect(response.booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
    });

    test('should pass schema validation on create response @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().build();
      const response = await bookingClient.createBooking(payload);
      createdBookingIds.push(response.bookingid);

      // If the API ever changes its response shape, Zod catches it here
      SchemaValidator.validateBookingResponse(response);
    });

    test('should create booking without additionalneeds field @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().withNoAdditionalNeeds().build();
      const response = await bookingClient.createBooking(payload);
      createdBookingIds.push(response.bookingid);

      expect(response.bookingid).toBeGreaterThan(0);
    });

    test('should create a luxury booking with high price @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().luxury().build();
      const response = await bookingClient.createBooking(payload);
      createdBookingIds.push(response.bookingid);

      expect(response.booking.totalprice).toBe(9999);
    });
  });

  // ─── Read ──────────────────────────────────────────────────────────────────

  test.describe('GET /booking', () => {
    test('should return a list of booking IDs @smoke @regression', async ({ bookingClient }) => {
      const ids = await bookingClient.getAllBookingIds();

      expect(Array.isArray(ids)).toBe(true);
      expect(ids.length).toBeGreaterThan(0);
      expect(ids[0]).toHaveProperty('bookingid');
    });

    test('should return booking IDs that pass schema validation @regression', async ({
      bookingClient,
    }) => {
      const ids = await bookingClient.getAllBookingIds();
      SchemaValidator.validateBookingIdList(ids);
    });

    test('should filter bookings by firstname @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const uniqueName = `TestFilter_${Date.now()}`;
      const payload = bookingFactory().withFirstName(uniqueName).build();
      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const filtered = await bookingClient.getAllBookingIds({ firstname: uniqueName });

      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.some((b) => b.bookingid === created.bookingid)).toBe(true);
    });
  });

  test.describe('GET /booking/:id', () => {
    test('should retrieve a booking by ID @smoke @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().withFirstName('Retrieve').withLastName('Test').build();
      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const booking = await bookingClient.getBookingById(created.bookingid);

      expect(booking.firstname).toBe('Retrieve');
      expect(booking.lastname).toBe('Test');
    });

    test('should return 404 for a nonexistent booking ID @regression', async ({
      bookingClient,
    }) => {
      const status = await bookingClient.getBookingStatusCode(999999999);
      expect(status).toBe(404);
    });

    test('should pass schema validation on GET response @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().build();
      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const booking = await bookingClient.getBookingById(created.bookingid);
      SchemaValidator.validateBooking(booking);
    });
  });

  // ─── Update ────────────────────────────────────────────────────────────────

  test.describe('PUT /booking/:id', () => {
    test('should fully update a booking @regression', async ({
      bookingClient,
      authToken,
      createdBookingIds,
    }) => {
      const original = bookingFactory().withFirstName('Original').build();
      const created = await bookingClient.createBooking(original);
      createdBookingIds.push(created.bookingid);

      const updated = bookingFactory()
        .withFirstName('Updated')
        .withLastName('Person')
        .withTotalPrice(999)
        .build();

      const result = await bookingClient.updateBooking(created.bookingid, updated, authToken);

      expect(result.firstname).toBe('Updated');
      expect(result.lastname).toBe('Person');
      expect(result.totalprice).toBe(999);
    });

    test('should return 403 when updating without auth token @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().build();
      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const status = await bookingClient.updateBookingStatusCode(
        created.bookingid,
        bookingFactory().build(),
        'invalidtoken'
      );

      expect(status).toBe(403);
    });
  });

  test.describe('PATCH /booking/:id', () => {
    test('should partially update firstname only @regression', async ({
      bookingClient,
      authToken,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().withFirstName('Original').withLastName('Name').build();
      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const result = await bookingClient.partialUpdateBooking(
        created.bookingid,
        { firstname: 'Patched' },
        authToken
      );

      expect(result.firstname).toBe('Patched');
      expect(result.lastname).toBe('Name'); // unchanged
    });

    test('should partially update price and deposit @regression', async ({
      bookingClient,
      authToken,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().withTotalPrice(100).withDepositPaid(false).build();
      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const result = await bookingClient.partialUpdateBooking(
        created.bookingid,
        { totalprice: 500, depositpaid: true },
        authToken
      );

      expect(result.totalprice).toBe(500);
      expect(result.depositpaid).toBe(true);
    });
  });

  // ─── Delete ────────────────────────────────────────────────────────────────

  test.describe('DELETE /booking/:id', () => {
    test('should delete a booking and return 201 @regression', async ({
      bookingClient,
      authToken,
    }) => {
      const payload = bookingFactory().build();
      const created = await bookingClient.createBooking(payload);

      const status = await bookingClient.deleteBooking(created.bookingid, authToken);
      expect(status).toBe(201);
    });

    test('should return 404 after deletion @smoke @regression', async ({
      bookingClient,
      authToken,
    }) => {
      const payload = bookingFactory().build();
      const created = await bookingClient.createBooking(payload);

      await bookingClient.deleteBooking(created.bookingid, authToken);

      const status = await bookingClient.getBookingStatusCode(created.bookingid);
      expect(status).toBe(404);
    });

    test('should return 403 when deleting without valid token @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().build();
      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const status = await bookingClient.deleteBooking(created.bookingid, 'badtoken');
      expect(status).toBe(403);
    });
  });
});
