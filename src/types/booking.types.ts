/**
 * booking.types.ts
 *
 * TypeScript interfaces that mirror the Restful Booker API contract.
 * These serve as the single source of truth for both API response
 * validation and UI test data generation.
 *
 * API docs: https://restful-booker.herokuapp.com/apidoc/index.html
 */

export interface BookingDates {
  checkin: string;  // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export interface BookingResponse {
  bookingid: number;
  booking: Booking;
}

export interface BookingListItem {
  bookingid: number;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

export interface BookingFilter {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

// JSON Schema definitions for AJV validation
export const BookingDatesSchema = {
  type: 'object',
  required: ['checkin', 'checkout'],
  properties: {
    checkin: { type: 'string', format: 'date' },
    checkout: { type: 'string', format: 'date' },
  },
  additionalProperties: false,
} as const;

export const BookingSchema = {
  type: 'object',
  required: ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'],
  properties: {
    firstname: { type: 'string', minLength: 1 },
    lastname: { type: 'string', minLength: 1 },
    totalprice: { type: 'number', minimum: 0 },
    depositpaid: { type: 'boolean' },
    bookingdates: BookingDatesSchema,
    additionalneeds: { type: 'string' },
  },
  additionalProperties: false,
} as const;

export const BookingResponseSchema = {
  type: 'object',
  required: ['bookingid', 'booking'],
  properties: {
    bookingid: { type: 'number', minimum: 1 },
    booking: BookingSchema,
  },
  additionalProperties: false,
} as const;

export const BookingListSchema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['bookingid'],
    properties: {
      bookingid: { type: 'number', minimum: 1 },
    },
  },
} as const;

export const AuthResponseSchema = {
  type: 'object',
  required: ['token'],
  properties: {
    token: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
} as const;
