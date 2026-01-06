import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateEmail,
  isEmptyOrWhitespace,
  validateField,
  validateForm,
  type ValidationRule,
} from './validators';

describe('Validators Property-Based Tests', () => {
  /**
   * Feature: admin-system-foundation, Property 3: Input Validation Before Submission
   * Validates: Requirements 1.5
   * 
   * For any login form input that is empty or invalid format (e.g., whitespace-only strings),
   * the system should display validation error messages and prevent form submission.
   */
  it('should reject empty or whitespace-only strings as invalid', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(''),                           // Empty string
          fc.constant(' '),                          // Single space
          fc.constant('  '),                         // Multiple spaces
          fc.constant('\t'),                         // Tab
          fc.constant('\n'),                         // Newline
          fc.constant('\r'),                         // Carriage return
          fc.stringMatching(/^\s+$/),                // Any whitespace-only string
        ),
        fc.constantFrom('username', 'password', 'email', 'field'),
        (invalidInput, fieldName) => {
          // Test validateRequired function
          const error = validateRequired(invalidInput, fieldName);
          
          // Verify: Error message is returned
          expect(error).not.toBeNull();
          expect(error).toContain(fieldName);
          expect(error).toContain('required');
          
          // Test isEmptyOrWhitespace helper
          expect(isEmptyOrWhitespace(invalidInput)).toBe(true);
          
          // Test validateField with required rule
          const rules: ValidationRule[] = [
            { required: true, message: `${fieldName} is required` }
          ];
          const fieldError = validateField(invalidInput, rules, fieldName);
          expect(fieldError).not.toBeNull();
          
          // Test validateForm with multiple fields
          const formValues = {
            [fieldName]: invalidInput,
          };
          const formRules = {
            [fieldName]: rules,
          };
          const result = validateForm(formValues, formRules);
          
          // Verify: Form validation fails
          expect(result.isValid).toBe(false);
          expect(result.errors[fieldName]).toBeDefined();
          expect(result.errors[fieldName]).toContain('required');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Valid non-empty strings should pass validation
   * Ensures that legitimate inputs are not incorrectly rejected
   */
  it('should accept non-empty, non-whitespace strings as valid', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), // Non-empty, non-whitespace strings
        fc.constantFrom('username', 'password', 'email', 'field'),
        (validInput, fieldName) => {
          // Test validateRequired function
          const error = validateRequired(validInput, fieldName);
          
          // Verify: No error message
          expect(error).toBeNull();
          
          // Test isEmptyOrWhitespace helper
          expect(isEmptyOrWhitespace(validInput)).toBe(false);
          
          // Test validateField with required rule
          const rules: ValidationRule[] = [
            { required: true, message: `${fieldName} is required` }
          ];
          const fieldError = validateField(validInput, rules, fieldName);
          expect(fieldError).toBeNull();
          
          // Test validateForm
          const formValues = {
            [fieldName]: validInput,
          };
          const formRules = {
            [fieldName]: rules,
          };
          const result = validateForm(formValues, formRules);
          
          // Verify: Form validation passes
          expect(result.isValid).toBe(true);
          expect(result.errors[fieldName]).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Minimum length validation
   * Tests that strings below minimum length are rejected
   */
  it('should reject strings below minimum length', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // Minimum length requirement
        fc.constantFrom('username', 'password', 'field'),
        (minLength, fieldName) => {
          // Generate string shorter than minLength
          const shortString = 'a'.repeat(Math.max(0, minLength - 1));
          
          const error = validateMinLength(shortString, minLength, fieldName);
          
          // Verify: Error message is returned
          expect(error).not.toBeNull();
          expect(error).toContain(fieldName);
          expect(error).toContain(`${minLength}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Maximum length validation
   * Tests that strings exceeding maximum length are rejected
   */
  it('should reject strings exceeding maximum length', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }), // Maximum length requirement
        fc.constantFrom('username', 'password', 'field'),
        (maxLength, fieldName) => {
          // Generate string longer than maxLength
          const longString = 'a'.repeat(maxLength + 1);
          
          const error = validateMaxLength(longString, maxLength, fieldName);
          
          // Verify: Error message is returned
          expect(error).not.toBeNull();
          expect(error).toContain(fieldName);
          expect(error).toContain(`${maxLength}`);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Email validation
   * Tests that invalid email formats are rejected
   */
  it('should reject invalid email formats', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant('notanemail'),
          fc.constant('missing@domain'),
          fc.constant('@nodomain.com'),
          fc.constant('spaces in@email.com'),
          fc.constant('double@@domain.com'),
        ),
        (invalidEmail) => {
          const error = validateEmail(invalidEmail);
          
          // Verify: Error message is returned
          expect(error).not.toBeNull();
          expect(error).toContain('email');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Valid email formats should pass
   */
  it('should accept valid email formats', () => {
    fc.assert(
      fc.property(
        fc.emailAddress(),
        (validEmail) => {
          const error = validateEmail(validEmail);
          
          // Verify: No error message
          expect(error).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
