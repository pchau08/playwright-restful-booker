import { test as base, request as baseRequest } from '@playwright/test';
import { AccessibilityHelper } from '../helpers/accessibility.helper';
import { HomePage } from '../pages/home.page';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'password';
const API_BASE_URL = process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com';

type Fixtures = {
  bookingClient: BookingClient;
  authToken: string;
  homePage: HomePage;
  a11y: AccessibilityHelper;
  createdBookingIds: number[];
};

import { BookingClient } from '../helpers/api-client';
import { AuthManager } from '../helpers/auth-manager';

export const test = base.extend<Fixtures>({
  bookingClient: async ({ request }, use) => {
    await use(new BookingClient(request));
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
      const bookingClient = new BookingClient(request);
      try {
        const token = await auth.getToken(ADMIN_USERNAME, ADMIN_PASSWORD);
        for (const id of ids) {
          try {
            await bookingClient.deleteBooking(id, token);
          } catch {
            console.warn(`[Fixture] Failed to clean up booking ${id}`);
          }
        }
      } catch {
        console.warn('[Fixture] Could not obtain token for teardown');
      }
    }
  },
});

export { expect } from '@playwright/test';
