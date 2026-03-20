import { test as base } from '@playwright/test';
import { ApiClient } from '../helpers/api-client';
import { AuthManager, createAuthManager } from '../helpers/auth-manager';
import { AccessibilityHelper } from '../helpers/accessibility.helper';
import { HomePage } from '../pages/home.page';

type Fixtures = {
  apiClient: ApiClient;
  authManager: AuthManager;
  authToken: string;
  bookingClient: ApiClient;
  homePage: HomePage;
  a11y: AccessibilityHelper;
  createdBookingIds: number[];
};

export const test = base.extend<Fixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  bookingClient: async ({ request }, use) => {
    await use(new ApiClient(request));
  },

  authManager: async ({ request }, use) => {
    await use(createAuthManager(request));
  },

  authToken: async ({ request }, use) => {
    const auth = createAuthManager(request);
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
      const auth = createAuthManager(request);
      const client = new ApiClient(request);
      try {
        const token = await auth.getToken();
        for (const id of ids) {
          try { await client.deleteBooking(id, token); }
          catch { console.warn(\`[Fixture] Failed to clean up booking \${id}\`); }
        }
      } catch { console.warn('[Fixture] Could not obtain token for teardown'); }
    }
  },
});

export { expect } from '@playwright/test';
