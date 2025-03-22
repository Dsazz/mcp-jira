import { z } from 'zod';
import { validate, isValid } from '../zod-validator';

describe('zod-validator', () => {
  // Test schema
  const testSchema = z.object({
    name: z.string(),
    age: z.number().min(0).max(120),
    email: z.string().email().optional()
  });

  describe('validate', () => {
    it('should return validated data when valid', () => {
      // Arrange
      const validData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
      };

      // Act
      const result = validate(testSchema, validData);

      // Assert
      expect(result).toEqual(validData);
    });

    it('should apply defaults when not provided', () => {
      // Arrange
      const schemaWithDefault = z.object({
        name: z.string(),
        active: z.boolean().default(true)
      });

      const data = { name: 'Test User' };

      // Act
      const result = validate(schemaWithDefault, data);

      // Assert
      expect(result).toEqual({
        name: 'Test User',
        active: true
      });
    });

    it('should throw error with formatted message for invalid data', () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        age: 150, // Over max
        email: 'invalid-email' // Invalid email
      };

      // Act & Assert
      expect(() => validate(testSchema, invalidData))
        .toThrow(/Validation error/);
    });

    it('should use custom error prefix', () => {
      // Arrange
      const invalidData = {
        name: 'John Doe',
        age: -10 // Below min
      };

      // Act & Assert
      expect(() => validate(testSchema, invalidData, 'Custom error'))
        .toThrow(/Custom error/);
    });
  });

  describe('isValid', () => {
    it('should return true for valid data', () => {
      // Arrange
      const validData = {
        name: 'John Doe',
        age: 30
      };

      // Act
      const result = isValid(testSchema, validData);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false for invalid data', () => {
      // Arrange
      const invalidData = {
        name: 123, // Not a string
        age: 30
      };

      // Act
      const result = isValid(testSchema, invalidData);

      // Assert
      expect(result).toBe(false);
    });
  });
}); 