import { test, expect } from '../../src/fixtures/base.fixture';
import { bookingFactory } from '../../src/helpers/booking.factory';
import { SchemaValidator } from '../../src/helpers/schema.validator';
import {
  BookingSchema,
  BookingResponseSchema,
  BookingIdListSchema,
} from '../../src/helpers/schema.validator';

/**
 * Schema validation tests
 *
 * These tests validate that API responses conform to the expected
 * data contract (shape, types, required fields).
 *
 * Why this matters: TypeScript types are erased at runtime. A response
 * that looks correct in tests can silently break if the API changes a
 * field name or type. Zod catches these regressions immediately.
 *
 * In a real project, these tests would also run against staging and
 * production environments as part of a contract testing strategy.
 */

test.describe('API Schema Validation', () => {
  test.describe('GET /booking response schema', () => {
    test('should return an array of objects with bookingid number fields @regression', async ({
      bookingClient,
    }) => {
      const ids = await bookingClient.getAllBookingIds();

      // Validate full list schema
      const validated = SchemaValidator.validateBookingIdList(ids);
      expect(validated.length).toBeGreaterThan(0);

      // Spot-check individual items
      for (const item of validated.slice(0, 5)) {
        expect(typeof item.bookingid).toBe('number');
        expect(item.bookingid).toBeGreaterThan(0);
        expect(Number.isInteger(item.bookingid)).toBe(true);
      }
    });
  });

  test.describe('POST /booking response schema', () => {
    test('should match BookingResponse schema exactly @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().build();
      const response = await bookingClient.createBooking(payload);
      createdBookingIds.push(response.bookingid);

      const validated = SchemaValidator.validateBookingResponse(response);

      // bookingid must be a positive integer
      expect(validated.bookingid).toBeGreaterThan(0);
      expect(Number.isInteger(validated.bookingid)).toBe(true);

      // Nested booking object must be complete
      expect(validated.booking.firstname).toBeTruthy();
      expect(validated.booking.lastname).toBeTruthy();
      expect(typeof validated.booking.totalprice).toBe('number');
      expect(typeof validated.booking.depositpaid).toBe('boolean');
      expect(validated.booking.bookingdates.checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(validated.booking.bookingdates.checkout).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  test.describe('GET /booking/:id response schema', () => {
    test('should match Booking schema exactly @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory()
        .withFirstName('Schema')
        .withLastName('Test')
        .withTotalPrice(200)
        .withDepositPaid(true)
        .build();

      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const booking = await bookingClient.getBookingById(created.bookingid);
      const validated = SchemaValidator.validateBooking(booking);

      // All required fields present and correct type
      expect(typeof validated.firstname).toBe('string');
      expect(typeof validated.lastname).toBe('string');
      expect(typeof validated.totalprice).toBe('number');
      expect(typeof validated.depositpaid).toBe('boolean');
      expect(validated.bookingdates).toHaveProperty('checkin');
      expect(validated.bookingdates).toHaveProperty('checkout');
    });

    test('should have dates in YYYY-MM-DD format @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory()
        .withDates('2026-08-01', '2026-08-05')
        .build();

      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const booking = await bookingClient.getBookingById(created.bookingid);

      expect(booking.bookingdates.checkin).toBe('2026-08-01');
      expect(booking.bookingdates.checkout).toBe('2026-08-05');

      // Validate date format with regex
      expect(booking.bookingdates.checkin).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(booking.bookingdates.checkout).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  test.describe('PUT /booking/:id response schema', () => {
    test('should return updated booking matching Booking schema @regression', async ({
      bookingClient,
      authToken,
      createdBookingIds,
    }) => {
      const original = bookingFactory().build();
      const created = await bookingClient.createBooking(original);
      createdBookingIds.push(created.bookingid);

      const updated = bookingFactory()
        .withFirstName('SchemaUpdated')
        .withTotalPrice(750)
        .build();

      const result = await bookingClient.updateBooking(created.bookingid, updated, authToken);

      // Validate full schema of update response
      SchemaValidator.validateBooking(result);
      expect(result.firstname).toBe('SchemaUpdated');
      expect(result.totalprice).toBe(750);
    });
  });
});
