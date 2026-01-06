import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StorageService } from './storage';
import type { User } from '../types/auth';

describe('StorageService Property-Based Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  /**
   * Feature: admin-system-foundation, Property 1: Successful Login Token Storage and Redirection
   * Validates: Requirements 2.1
   * 
   * For any successful login with valid credentials, the system should store 
   * the authentication token in local storage.
   */
  it('should store and retrieve any valid token', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }), // Generate non-empty token strings
        (token) => {
          // Store the token
          StorageService.setToken(token);
          
          // Retrieve the token
          const retrievedToken = StorageService.getToken();
          
          // Verify the token was stored and retrieved correctly
          expect(retrievedToken).toBe(token);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: admin-system-foundation, Property 6: Logout Cleanup
   * Validates: Requirements 2.4
   * 
   * For any authenticated user who initiates logout, the system should clear 
   * all authentication information from local storage.
   */
  it('should clear all authentication data on logout', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }), // Generate token
        fc.record({
          id: fc.string({ minLength: 1 }),
          username: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          countryCode: fc.constant('+86'),
          phone: fc.string({ minLength: 11, maxLength: 11 }),
          emailVerified: fc.boolean(),
          phoneVerified: fc.boolean(),
          lastLoginAt: fc.option(fc.integer({ min: 1577836800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString())),
          createdAt: fc.option(fc.integer({ min: 1577836800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString())),
          profile: fc.record({
            name: fc.string(),
            bio: fc.string(),
            firstName: fc.string(),
            lastName: fc.string(),
            gender: fc.string(),
          }),
        }), // Generate user object
        (token, user) => {
          // Setup: Store token and user (simulating authenticated state)
          StorageService.setToken(token);
          StorageService.setUser(user as User);
          
          // Verify data is stored
          expect(StorageService.getToken()).toBe(token);
          expect(StorageService.getUser()).toEqual(user);
          
          // Action: Clear all authentication data (logout)
          StorageService.clear();
          
          // Verify: All authentication data is cleared
          expect(StorageService.getToken()).toBeNull();
          expect(StorageService.getUser()).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Token storage round-trip
   * Validates that storing and retrieving preserves token integrity
   */
  it('should maintain token integrity through storage round-trip', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (token) => {
          StorageService.setToken(token);
          const retrieved = StorageService.getToken();
          expect(retrieved).toBe(token);
          
          // Verify removal works
          StorageService.removeToken();
          expect(StorageService.getToken()).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: User storage round-trip with JSON serialization
   * Validates that user objects are correctly serialized and deserialized
   */
  it('should maintain user data integrity through storage round-trip', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.string({ minLength: 1 }),
          username: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          countryCode: fc.constant('+86'),
          phone: fc.string({ minLength: 11, maxLength: 11 }),
          emailVerified: fc.boolean(),
          phoneVerified: fc.boolean(),
          lastLoginAt: fc.option(fc.integer({ min: 1577836800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString())),
          createdAt: fc.option(fc.integer({ min: 1577836800000, max: 1924905600000 }).map(ts => new Date(ts).toISOString())),
          profile: fc.record({
            name: fc.string(),
            bio: fc.string(),
            firstName: fc.string(),
            lastName: fc.string(),
            gender: fc.string(),
          }),
        }),
        (user) => {
          StorageService.setUser(user as User);
          const retrieved = StorageService.getUser();
          expect(retrieved).toEqual(user);
          
          // Verify removal works
          StorageService.removeUser();
          expect(StorageService.getUser()).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
