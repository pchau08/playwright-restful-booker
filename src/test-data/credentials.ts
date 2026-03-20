/**
 * Restful Booker API credentials.
 * These are the public default credentials documented by the API author.
 */
export const CREDENTIALS = {
  valid: {
    username: process.env.API_USERNAME ?? 'admin',
    password: process.env.API_PASSWORD ?? 'password123',
  },
  invalid: {
    username: 'wronguser',
    password: 'wrongpassword',
  },
  emptyUsername: {
    username: '',
    password: 'password123',
  },
  emptyPassword: {
    username: 'admin',
    password: '',
  },
} as const;
