/**
 * Validation rule definition
 */
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate if a value is required (not empty)
 */
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): string | null => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

/**
 * Validate pattern match
 */
export const validatePattern = (
  value: string,
  pattern: RegExp,
  message: string
): string | null => {
  if (!pattern.test(value)) {
    return message;
  }
  return null;
};

/**
 * Check if string is empty or only whitespace
 */
export const isEmptyOrWhitespace = (value: string): boolean => {
  return !value || value.trim() === '';
};

/**
 * Validate a field against multiple rules
 */
export const validateField = (
  value: string,
  rules: ValidationRule[],
  fieldName: string
): string | null => {
  for (const rule of rules) {
    if (rule.required) {
      const error = validateRequired(value, fieldName);
      if (error) return error;
    }

    if (rule.minLength !== undefined) {
      const error = validateMinLength(value, rule.minLength, fieldName);
      if (error) return error;
    }

    if (rule.maxLength !== undefined) {
      const error = validateMaxLength(value, rule.maxLength, fieldName);
      if (error) return error;
    }

    if (rule.pattern) {
      const error = validatePattern(value, rule.pattern, rule.message);
      if (error) return error;
    }
  }

  return null;
};

/**
 * Validate multiple fields
 */
export const validateForm = (
  values: Record<string, string>,
  rules: Record<string, ValidationRule[]>
): ValidationResult => {
  const errors: Record<string, string> = {};

  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = values[fieldName] || '';
    const error = validateField(value, fieldRules, fieldName);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
