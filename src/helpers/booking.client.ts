import { APIRequestContext } from '@playwright/test';

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: { checkin: string; checkout: string; };
  additionalneeds?: string;
}

export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  async getAllBookingIds(filters?: { firstname?: string; lastname?: string }) {
    const params = new URLSearchParams();
    if (filters?.firstname) params.append('firstname', filters.firstname);
    if (filters?.lastname) params.append('lastname', filters.lastname);
    const url = params.toString() ? `/booking?${params}` : '/booking';
    const res = await this.request.get(url);
    return res.json();
  }

  async getBookingById(id: number): Promise<Booking> {
    const res = await this.request.get(`/booking/${id}`);
    return res.json();
  }

  async getBookingStatusCode(id: number): Promise<number> {
    const res = await this.request.get(`/booking/${id}`);
    return res.status();
  }

  async createBooking(booking: Booking): Promise<{ bookingid: number; booking: Booking }> {
    const res = await this.request.post('/booking', { data: booking });
    return res.json();
  }

  async createBookingRaw(booking: unknown): Promise<{ status: number; body: unknown }> {
    const res = await this.request.post('/booking', { data: booking });
    let body: unknown;
    try { body = await res.json(); } catch { body = await res.text(); }
    return { status: res.status(), body };
  }

  async updateBooking(id: number, booking: Booking, token: string): Promise<Booking> {
    const res = await this.request.put(`/booking/${id}`, { data: booking, headers: { Cookie: `token=${token}` } });
    return res.json();
  }

  async updateBookingStatusCode(id: number, booking: Booking, token: string): Promise<number> {
    const res = await this.request.put(`/booking/${id}`, { data: booking, headers: { Cookie: `token=${token}` } });
    return res.status();
  }

  async partialUpdateBooking(id: number, booking: Partial<Booking>, token: string): Promise<Booking> {
    const res = await this.request.patch(`/booking/${id}`, { data: booking, headers: { Cookie: `token=${token}` } });
    return res.json();
  }

  async deleteBooking(id: number, token: string): Promise<number> {
    const res = await this.request.delete(`/booking/${id}`, { headers: { Cookie: `token=${token}` } });
    return res.status();
  }
}
