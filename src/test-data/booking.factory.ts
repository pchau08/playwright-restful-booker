import type { Booking, BookingDates } from '../types/booking.types';

/**
 * BookingFactory
 *
 * Builder pattern for generating test booking data.
 * Produces realistic, unique data for every test run without
 * hardcoded values that cause conflicts in parallel execution.
 *
 * Usage:
 *   BookingFactory.create()                          // random booking
 *   BookingFactory.create({ firstname: 'Jane' })     // override specific fields
 *   BookingFactory.createMany(5)                     // array of 5 bookings
 */

const FIRST_NAMES = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 'Sophia'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
const ADDITIONAL_NEEDS = ['Breakfast', 'Lunch', 'Dinner', 'Late checkout', 'Early checkin', 'Extra pillows'];

const randomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Generate a date string offset from today.
 * @param daysFromNow - positive for future, negative for past
 */
const dateFromNow = (daysFromNow: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

export class BookingFactory {
  /**
   * Create a single booking with optional field overrides.
   */
  static create(overrides: Partial<Booking> = {}): Booking {
    const checkinOffset = randomInt(1, 30);
    const checkoutOffset = checkinOffset + randomInt(1, 14);

    const defaultDates: BookingDates = {
      checkin: dateFromNow(checkinOffset),
      checkout: dateFromNow(checkoutOffset),
    };

    const defaults: Booking = {
      firstname: randomElement(FIRST_NAMES),
      lastname: randomElement(LAST_NAMES),
      totalprice: randomInt(50, 500),
      depositpaid: Math.random() > 0.5,
      bookingdates: defaultDates,
      additionalneeds: randomElement(ADDITIONAL_NEEDS),
    };

    return {
      ...defaults,
      ...overrides,
      bookingdates: {
        ...defaults.bookingdates,
        ...(overrides.bookingdates ?? {}),
      },
    };
  }

  /**
   * Create multiple bookings, each with unique data.
   */
  static createMany(count: number, overrides: Partial<Booking> = {}): Booking[] {
    return Array.from({ length: count }, () => BookingFactory.create(overrides));
  }

  /**
   * Create a booking with specific name — useful for filter tests.
   */
  static createWithName(firstname: string, lastname: string): Booking {
    return BookingFactory.create({ firstname, lastname });
  }

  /**
   * Create a booking with specific date range — useful for date filter tests.
   */
  static createWithDates(checkin: string, checkout: string): Booking {
    return BookingFactory.create({
      bookingdates: { checkin, checkout },
    });
  }

  /**
   * Create a minimal valid booking — useful for negative/boundary tests.
   */
  static createMinimal(): Booking {
    return {
      firstname: 'A',
      lastname: 'B',
      totalprice: 0,
      depositpaid: false,
      bookingdates: {
        checkin: dateFromNow(1),
        checkout: dateFromNow(2),
      },
    };
  }
}

export const bookingFactory = () => new BookingFactory();

export const INVALID_BOOKINGS = {
  missingFirstName: { lastname: 'Test', totalprice: 100, depositpaid: true, bookingdates: { checkin: '2026-06-01', checkout: '2026-06-05' } },
  missingLastName: { firstname: 'Test', totalprice: 100, depositpaid: true, bookingdates: { checkin: '2026-06-01', checkout: '2026-06-05' } },
  checkoutBeforeCheckin: { firstname: 'Test', lastname: 'User', totalprice: 100, depositpaid: true, bookingdates: { checkin: '2026-06-10', checkout: '2026-06-01' } },
  negativeTotalPrice: { firstname: 'Test', lastname: 'User', totalprice: -100, depositpaid: true, bookingdates: { checkin: '2026-06-01', checkout: '2026-06-05' } },
  emptyPayload: {},
} as const;
