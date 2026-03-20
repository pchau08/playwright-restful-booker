import type { APIRequestContext } from '@playwright/test';
import { ApiClient } from './api-client';
import { CREDENTIALS } from '../test-data/credentials';

/**
 * AuthManager
 *
 * Manages the lifecycle of Restful Booker auth tokens.
 * Tokens are cached for the duration of a test worker's session
 * to avoid redundant auth API calls on every test.
 *
 * This is the pattern real teams use — auth is treated as
 * infrastructure, not something each test manages independently.
 */
export class AuthManager {
  private token: string | null = null;
  private tokenExpiry: number = 0;
  private readonly TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

  constructor(private readonly apiClient: ApiClient) {}

  /**
   * Get a valid auth token. Returns cached token if still valid,
   * otherwise fetches a fresh one.
   */
  async getToken(): Promise<string> {
    const now = Date.now();

    if (this.token && now < this.tokenExpiry) {
      return this.token;
    }

    const response = await this.apiClient.createToken(CREDENTIALS.valid);
    this.token = response.token;
    this.tokenExpiry = now + this.TOKEN_TTL_MS;

    return this.token;
  }

  /**
   * Force refresh the token — useful if a test invalidates the current one.
   */
  async refreshToken(): Promise<string> {
    this.token = null;
    this.tokenExpiry = 0;
    return this.getToken();
  }

  /**
   * Clear the cached token.
   */
  clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
  }

  /**
   * Check if a token is currently cached and valid.
   */
  get hasValidToken(): boolean {
    return this.token !== null && Date.now() < this.tokenExpiry;
  }
}

/**
 * Factory function — creates an AuthManager from a raw request context.
 * Used in fixtures to wire everything together.
 */
export const createAuthManager = (request: APIRequestContext): AuthManager => {
  const apiClient = new ApiClient(request);
  return new AuthManager(apiClient);
};
