import { APIRequestContext } from '@playwright/test';
import { Booking } from './booking.factory';

export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  private log(method: string, url: string, status: number, ms: number): void {
    const icon = status >= 200 && status < 300 ? '✅' : '❌';
    console.log(`${icon} ${method.padEnd(6)} ${url} → ${status} (${ms}ms)`);
  }

  async getAllBookingIds(filters?: { firstname?: string; lastname?: string }) {
    const params = new URLSearchParams();
    if (filters?.firstname) params.append('firstname', filters.firstname);
    if (filters?.lastname) params.append('lastname', filters.lastname);
    const url = params.toString() ? `/booking?${params}` : '/booking';
    const start = Date.now();
    const res = await this.request.get(url);
    this.log('GET', url, res.status(), Date.now() - start);
    return res.json();
  }

  async getBookingById(id: number): Promise<Booking> {
    const start = Date.now();
    const res = await this.request.get(`/booking/${id}`);
    this.log('GET', `/booking/${id}`, res.status(), Date.now() - start);
    return res.json();
  }

  async getBookingStatusCode(id: number): Promise<number> {
    const res = await this.request.get(`/booking/${id}`);
    return res.status();
  }

  async createBooking(booking: Booking): Promise<{ bookingid: number; booking: Booking }> {
    const start = Date.now();
    const res = await this.request.post('/booking', { data: booking });
    this.log('POST', '/booking', res.status(), Date.now() - start);
    return res.json();
  }

  async createBookingRaw(booking: unknown): Promise<{ status: number; body: unknown }> {
    const res = await this.request.post('/booking', { data: booking });
    let body: unknown;
    try { body = await res.json(); } catch { body = await res.text(); }
    return { status: res.status(), body };
  }

  async updateBooking(id: number, booking: Booking, token: string): Promise<Booking> {
    const start = Date.now();
    const res = await this.request.put(`/booking/${id}`, {
      data: booking,
      headers: { Cookie: `token=${token}` },
    });
    this.log('PUT', `/booking/${id}`, res.status(), Date.now() - start);
    return res.json();
  }

  async updateBookingStatusCode(id: number, booking: Booking, token: string): Promise<number> {
    const res = await this.request.put(`/booking/${id}`, {
      data: booking,
      headers: { Cookie: `token=${token}` },
    });
    return res.status();
  }

  async partialUpdateBooking(id: number, booking: Partial<Booking>, token: string): Promise<Booking> {
    const start = Date.now();
    const res = await this.request.patch(`/booking/${id}`, {
      data: booking,
      headers: { Cookie: `token=${token}` },
    });
    this.log('PATCH', `/booking/${id}`, res.status(), Date.now() - start);
    return res.json();
  }

  async deleteBooking(id: number, token: string): Promise<number> {
    const start = Date.now();
    const res = await this.request.delete(`/booking/${id}`, {

cat > src/fixtures/base.fixture.ts << 'EOF'
import { test as base } from '@playwright/test';
import { BookingClient } from '../helpers/booking.client';
import { AuthManager } from '../helpers/auth-manager';
import { AccessibilityHelper } from '../helpers/accessibility.helper';
import { HomePage } from '../pages/home.page';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'password';

type Fixtures = {
  bookingClient: BookingClient;
  authClient: AuthManager;
  authToken: string;
  homePage: HomePage;
  a11y: AccessibilityHelper;
  createdBookingIds: number[];
};

export const test = base.extend<Fixtures>({
  bookingClient: async ({ request }, use) => {
    await use(new BookingClient(request));
  },

  authClient: async ({ request }, use) => {
    await use(new AuthManager(request));
  },

  authToken: async ({ request }, use) => {
    const auth = new AuthManager(request);
    const token = await auth.getToken(ADMIN_USERNAME, ADMIN_PASSWORD);
    await use(token);
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  a11y: async ({ page }, use) => {
    await use(new AccessibilityHelper(page));
  },

  createdBookingIds: async ({ request }, use) => {
    const ids: number[] = [];
    await use(ids);
    if (ids.length > 0) {
      const auth = new AuthManager(request);
      const client = new BookingClient(request);
      try {
        const token = await auth.getToken(ADMIN_USERNAME, ADMIN_PASSWORD);
        for (const id of ids) {
          try { await client.deleteBooking(id, token); }
          catch { console.warn(`[Fixture] Failed to clean up booking ${id}`); }
        }
      } catch { console.warn('[Fixture] Could not obtain token for teardown'); }
    }
  },
});

export { expect } from '@playwright/test';
