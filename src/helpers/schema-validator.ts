import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/**
 * SchemaValidator
 *
 * Wraps AJV (Another JSON Schema Validator) to provide typed,
 * descriptive schema validation for API responses.
 *
 * Why validate schemas explicitly?
 * - Catches API contract changes before they break downstream tests
 * - Provides clear failure messages: "missing field 'totalprice'" beats
 *   "Cannot read property of undefined" five lines later
 * - Documents the expected API shape as executable code
 */

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

export class SchemaValidator {
  /**
   * Validate data against a JSON schema.
   * Throws a descriptive error if validation fails.
   */
  static validate(data: unknown, schema: object, contextLabel = 'Response'): void {
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = validate.errors
        ?.map((err) => `  - ${err.instancePath || '(root)'}: ${err.message}`)
        .join('\n');
      throw new Error(`${contextLabel} schema validation failed:\n${errors}`);
    }
  }

  /**
   * Returns true if data matches schema, false otherwise.
   * Non-throwing version for conditional checks.
   */
  static isValid(data: unknown, schema: object): boolean {
    const validate = ajv.compile(schema);
    return validate(data) as boolean;
  }

  /**
   * Get validation errors without throwing.
   * Returns null if valid, array of error strings if invalid.
   */
  static getErrors(data: unknown, schema: object): string[] | null {
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (valid) return null;

    return (
      validate.errors?.map(
        (err) => `${err.instancePath || '(root)'}: ${err.message}`
      ) ?? []
    );
  }
}
