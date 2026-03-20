import { test as base } from '@playwright/test';
import { BookingClient } from '../helpers/booking.client';
import { AuthManager } from '../helpers/auth-manager';
import { AccessibilityHelper } from '../helpers/accessibility.helper';
import { HomePage } from '../pages/home.page';

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
    const token = await auth.getToken();
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
        const token = await auth.getToken();
        for (const id of ids) {
          try { await client.deleteBooking(id, token); }
          catch { console.warn(`[Fixture] Failed to clean up booking ${id}`); }
        }
      } catch { console.warn('[Fixture] Could not obtain token for teardown'); }
    }
  },
});

export { expect } from '@playwright/test';
