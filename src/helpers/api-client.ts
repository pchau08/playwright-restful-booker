import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import type {
  Booking,
  BookingResponse,
  BookingListItem,
  AuthRequest,
  AuthResponse,
  BookingFilter,
} from '../types/booking.types';

/**
 * ApiClient
 *
 * A strongly-typed REST client wrapping Playwright's APIRequestContext.
 * Every method returns typed responses and performs status code assertions,
 * so callers can focus on business logic rather than HTTP mechanics.
 *
 * This client is injected via the base fixture and shared across all tests —
 * both pure API tests and unified cross-layer tests.
 */
export class ApiClient {
  private readonly baseURL: string;

  constructor(
    private readonly request: APIRequestContext,
    baseURL?: string
  ) {
    this.baseURL = baseURL ?? process.env.API_BASE_URL ?? 'https://restful-booker.herokuapp.com';
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────

  async createToken(credentials: AuthRequest): Promise<AuthResponse> {
    const response = await this.request.post(`${this.baseURL}/auth`, {
      data: credentials,
      headers: { 'Content-Type': 'application/json' },
    });
    await this.assertStatus(response, 200, 'POST /auth');
    return response.json() as Promise<AuthResponse>;
  }

  // ─── Bookings ──────────────────────────────────────────────────────────────

  async getBookings(filter?: BookingFilter): Promise<BookingListItem[]> {
    const response = await this.request.get(`${this.baseURL}/booking`, {
      params: filter as Record<string, string>,
    });
    await this.assertStatus(response, 200, 'GET /booking');
    return response.json() as Promise<BookingListItem[]>;
  }

  async getBooking(id: number): Promise<Booking> {
    const response = await this.request.get(`${this.baseURL}/booking/${id}`, {
      headers: { Accept: 'application/json' },
    });
    await this.assertStatus(response, 200, `GET /booking/${id}`);
    return response.json() as Promise<Booking>;
  }

  async createBooking(booking: Booking): Promise<BookingResponse> {
    const response = await this.request.post(`${this.baseURL}/booking`, {
      data: booking,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    await this.assertStatus(response, 200, 'POST /booking');
    return response.json() as Promise<BookingResponse>;
  }

  async updateBooking(id: number, booking: Booking, token: string): Promise<Booking> {
    const response = await this.request.put(`${this.baseURL}/booking/${id}`, {
      data: booking,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: `token=${token}`,
      },
    });
    await this.assertStatus(response, 200, `PUT /booking/${id}`);
    return response.json() as Promise<Booking>;
  }

  async partialUpdateBooking(
    id: number,
    partial: Partial<Booking>,
    token: string
  ): Promise<Booking> {
    const response = await this.request.patch(`${this.baseURL}/booking/${id}`, {
      data: partial,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Cookie: `token=${token}`,
      },
    });
    await this.assertStatus(response, 200, `PATCH /booking/${id}`);
    return response.json() as Promise<Booking>;
  }

  async deleteBooking(id: number, token: string): Promise<void> {
    const response = await this.request.delete(`${this.baseURL}/booking/${id}`, {
      headers: { Cookie: `token=${token}` },
    });
    await this.assertStatus(response, 201, `DELETE /booking/${id}`);
  }

  // ─── Health ────────────────────────────────────────────────────────────────

  async ping(): Promise<number> {
    const response = await this.request.get(`${this.baseURL}/ping`);
    return response.status();
  }

  // ─── Raw access (for negative tests) ──────────────────────────────────────

  async getRaw(path: string, options?: Parameters<APIRequestContext['get']>[1]): Promise<APIResponse> {
    return this.request.get(`${this.baseURL}${path}`, options);
  }

  async postRaw(path: string, options?: Parameters<APIRequestContext['post']>[1]): Promise<APIResponse> {
    return this.request.post(`${this.baseURL}${path}`, options);
  }

  async deleteRaw(path: string, options?: Parameters<APIRequestContext['delete']>[1]): Promise<APIResponse> {
    return this.request.delete(`${this.baseURL}${path}`, options);
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async assertStatus(
    response: APIResponse,
    expectedStatus: number,
    context: string
  ): Promise<void> {
    if (response.status() !== expectedStatus) {
      const body = await response.text().catch(() => '[unreadable]');
      throw new Error(
        `${context} — expected status ${expectedStatus}, got ${response.status()}\nBody: ${body}`
      );
    }
  }
}
