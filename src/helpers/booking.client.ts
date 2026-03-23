import { APIRequestContext } from '@playwright/test';
import { ApiClient } from './api-client';
import { Booking, BookingResponse, BookingListItem } from '../types/booking.types';

export class BookingClient {
  private readonly client: ApiClient;

  constructor(request: APIRequestContext) {
    this.client = new ApiClient(request);
  }

  async getAllBookingIds(filters?: { firstname?: string; lastname?: string }): Promise<BookingListItem[]> {
    return this.client.getBookings(filters);
  }

  async getBookingById(id: number): Promise<Booking> {
    return this.client.getBooking(id);
  }

  async getBookingStatusCode(id: number): Promise<number> {
    const res = await this.client.getRaw(`/booking/${id}`);
    return res.status();
  }

  async createBooking(booking: Booking): Promise<BookingResponse> {
    return this.client.createBooking(booking);
  }

  async createBookingRaw(booking: unknown): Promise<{ status: number; body: unknown }> {
    const res = await this.client.postRaw('/booking', { data: booking });
    let body: unknown;
    try { body = await res.json(); } catch { body = await res.text(); }
    return { status: res.status(), body };
  }

  async updateBooking(id: number, booking: Booking, token: string): Promise<Booking> {
    return this.client.updateBooking(id, booking, token);
  }

  async updateBookingStatusCode(id: number, booking: Booking, token: string): Promise<number> {
    const res = await this.client.getRaw(`/booking/${id}`);
    return res.status();
  }

  async partialUpdateBooking(id: number, booking: Partial<Booking>, token: string): Promise<Booking> {
    return this.client.partialUpdateBooking(id, booking, token);
  }

  async deleteBooking(id: number, token: string): Promise<number> {
    const res = await this.client.deleteRaw(`/booking/${id}`, {
      headers: { Cookie: `token=${token}` },
    });
    return res.status();
  }
}
