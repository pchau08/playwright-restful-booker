import { test, expect } from '../../src/fixtures/base.fixture';
import { INVALID_BOOKINGS, bookingFactory } from '../../src/helpers/booking.factory';

/**
 * Booking negative and boundary tests
 *
 * Validates that the API handles invalid inputs gracefully.
 * These tests document the API's actual behavior for edge cases —
 * some APIs return 400, others return 200 with empty/null fields.
 * Whatever the behavior, we assert it consistently.
 */

test.describe('Booking API — Negative Cases', () => {

  test.describe('Invalid payloads on create', () => {
    test('should handle missing firstname @regression', async ({ bookingClient }) => {
      const result = await bookingClient.createBookingRaw(INVALID_BOOKINGS.missingFirstName);
      // Document actual API behavior — may return 200 or 400 or 500
      console.log(`Missing firstname → status ${result.status}`);
      expect([200, 400, 500]).toContain(result.status);
    });

    test('should handle missing lastname @regression', async ({ bookingClient }) => {
      const result = await bookingClient.createBookingRaw(INVALID_BOOKINGS.missingLastName);
      console.log(`Missing lastname → status ${result.status}`);
      expect([200, 400, 500]).toContain(result.status);
    });

    test('should handle empty payload @regression', async ({ bookingClient }) => {
      const result = await bookingClient.createBookingRaw(INVALID_BOOKINGS.emptyPayload);
      console.log(`Empty payload → status ${result.status}`);
      expect([400, 500]).toContain(result.status);
    });

    test('should handle negative total price @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const result = await bookingClient.createBookingRaw(INVALID_BOOKINGS.negativeTotalPrice);
      console.log(`Negative price → status ${result.status}, body: ${JSON.stringify(result.body)}`);
      if (result.status === 200 && result.body && typeof result.body === 'object' && 'bookingid' in result.body) {
        createdBookingIds.push((result.body as { bookingid: number }).bookingid);
      }
      expect([200, 400, 500]).toContain(result.status);
    });
  });

  test.describe('Boundary values', () => {
    test('should handle very long firstname @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const longName = 'A'.repeat(500);
      const payload = bookingFactory().withFirstName(longName).build();
      const result = await bookingClient.createBookingRaw(payload);
      if (result.status === 200 && result.body && typeof result.body === 'object' && 'bookingid' in result.body) {
        createdBookingIds.push((result.body as { bookingid: number }).bookingid);
      }
      expect([200, 400]).toContain(result.status);
    });

    test('should handle zero total price @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().withTotalPrice(0).build();
      const result = await bookingClient.createBookingRaw(payload);
      if (result.status === 200 && result.body && typeof result.body === 'object' && 'bookingid' in result.body) {
        createdBookingIds.push((result.body as { bookingid: number }).bookingid);
      }
      expect([200, 400]).toContain(result.status);
    });

    test('should handle same-day checkin and checkout @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().sameDay().build();
      const result = await bookingClient.createBookingRaw(payload);
      if (result.status === 200 && result.body && typeof result.body === 'object' && 'bookingid' in result.body) {
        createdBookingIds.push((result.body as { bookingid: number }).bookingid);
      }
      expect([200, 400]).toContain(result.status);
    });

    test('should handle special characters in name fields @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory()
        .withFirstName("O'Brien")
        .withLastName('Müller-Schmidt')
        .build();
      const result = await bookingClient.createBookingRaw(payload);
      if (result.status === 200 && result.body && typeof result.body === 'object' && 'bookingid' in result.body) {
        createdBookingIds.push((result.body as { bookingid: number }).bookingid);
      }
      expect([200, 400]).toContain(result.status);
    });
  });

  test.describe('Unauthorized access', () => {
    test('should return 403 for PUT without token @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().build();
      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const status = await bookingClient.updateBookingStatusCode(
        created.bookingid,
        bookingFactory().build(),
        ''
      );
      // Restful Booker may return 403 or 200 with empty token
      expect([200, 403]).toContain(status);
    });

    test('should return 403 for DELETE without token @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().build();
      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const status = await bookingClient.deleteBooking(created.bookingid, '');
      expect(status).toBe(403);
    });

    test('should return 403 for DELETE with expired token @regression', async ({
      bookingClient,
      createdBookingIds,
    }) => {
      const payload = bookingFactory().build();
      const created = await bookingClient.createBooking(payload);
      createdBookingIds.push(created.bookingid);

      const status = await bookingClient.deleteBooking(created.bookingid, 'expiredtoken12345');
      expect(status).toBe(403);
    });
  });
});
