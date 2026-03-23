import type { APIRequestContext } from '@playwright/test';

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string };
  additionalneeds?: string;
}

export class BookingFactory {
  private booking: Booking;

  constructor() {
    this.booking = {
      firstname: this.randomName('First'),
      lastname: this.randomName('Last'),
      totalprice: this.randomPrice(),
      depositpaid: true,
      bookingdates: { checkin: this.futureDate(1), checkout: this.futureDate(3) },
      additionalneeds: 'Breakfast',
    };
  }

  withFirstName(firstname: string): this { this.booking.firstname = firstname; return this; }
  withLastName(lastname: string): this { this.booking.lastname = lastname; return this; }
  withTotalPrice(totalprice: number): this { this.booking.totalprice = totalprice; return this; }
  withDepositPaid(depositpaid: boolean): this { this.booking.depositpaid = depositpaid; return this; }
  withDates(checkin: string, checkout: string): this { this.booking.bookingdates = { checkin, checkout }; return this; }
  withAdditionalNeeds(n: string): this { this.booking.additionalneeds = n; return this; }
  withNoAdditionalNeeds(): this { delete this.booking.additionalneeds; return this; }
  withoutDeposit(): this { this.booking.depositpaid = false; return this; }
  luxury(): this { this.booking.totalprice = 9999; this.booking.additionalneeds = 'Airport transfer, Champagne'; return this; }
  sameDay(): this { const d = this.futureDate(0); this.booking.bookingdates = { checkin: d, checkout: d }; return this; }

  build(): Booking { return JSON.parse(JSON.stringify(this.booking)) as Booking; }

  private randomName(prefix: string): string { return prefix + '_' + Math.random().toString(36).slice(2, 7); }
  private randomPrice(): number { return Math.floor(Math.random() * 500) + 50; }
  private futureDate(daysFromNow: number): string {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split('T')[0];
  }
}

export const bookingFactory = (): BookingFactory => new BookingFactory();

export const INVALID_BOOKINGS = {
  missingFirstName: { lastname: 'Test', totalprice: 100, depositpaid: true, bookingdates: { checkin: '2026-06-01', checkout: '2026-06-05' } },
  missingLastName: { firstname: 'Test', totalprice: 100, depositpaid: true, bookingdates: { checkin: '2026-06-01', checkout: '2026-06-05' } },
  checkoutBeforeCheckin: { firstname: 'Test', lastname: 'User', totalprice: 100, depositpaid: true, bookingdates: { checkin: '2026-06-10', checkout: '2026-06-01' } },
  negativeTotalPrice: { firstname: 'Test', lastname: 'User', totalprice: -100, depositpaid: true, bookingdates: { checkin: '2026-06-01', checkout: '2026-06-05' } },
  emptyPayload: {},
} as const;
