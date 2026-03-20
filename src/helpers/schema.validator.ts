import { z } from 'zod';

const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

export const BookingDatesSchema = z.object({
  checkin: DateString,
  checkout: DateString,
});

export const BookingSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: BookingDatesSchema,
  additionalneeds: z.string().optional(),
});

export const BookingResponseSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdSchema = z.object({
  bookingid: z.number().int().positive(),
});

export const BookingIdListSchema = z.array(BookingIdSchema);

export const AuthSuccessSchema = z.object({
  token: z.string().min(1),
});

export class SchemaValidator {
  static validate<T>(schema: z.ZodSchema<T>, data: unknown, label = 'Response'): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      const errors = result.error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n');
      throw new Error(`${label} schema validation failed:\n${errors}`);
    }
    return result.data;
  }

  static validateBooking(data: unknown) { return this.validate(BookingSchema, data, 'Booking'); }
  static validateBookingResponse(data: unknown) { return this.validate(BookingResponseSchema, data, 'BookingResponse'); }
  static validateBookingIdList(data: unknown) { return this.validate(BookingIdListSchema, data, 'BookingIdList'); }
  static validateAuthSuccess(data: unknown) { return this.validate(AuthSuccessSchema, data, 'AuthSuccess'); }
}
