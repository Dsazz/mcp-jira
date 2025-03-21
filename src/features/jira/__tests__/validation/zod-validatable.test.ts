import { z } from 'zod';
import { ZodValidatable } from '../../validation/zod-validatable.mixin';

// Create a mock base class
class MockBaseClass {
  mockMethod(): string {
    return 'mock method called';
  }
}

// Create a mock schema
const mockSchema = z.object({
  requiredField: z.string(),
  optionalField: z.number().optional(),
  defaultField: z.boolean().default(false)
});

// Create a extended class with the mixin
class ValidatableClass extends ZodValidatable(MockBaseClass, mockSchema) {
  validate(params: unknown): Record<string, any> {
    return this.validateParams(params);
  }
}

describe('ZodValidatable Mixin', () => {
  let validatable: ValidatableClass;
  
  beforeEach(() => {
    validatable = new ValidatableClass();
  });
  
  it('should preserve base class functionality', () => {
    // Act
    const result = validatable.mockMethod();
    
    // Assert
    expect(result).toBe('mock method called');
  });
  
  it('should validate valid parameters', () => {
    // Arrange
    const validParams = {
      requiredField: 'test'
    };
    
    // Act
    const result = validatable.validate(validParams);
    
    // Assert
    expect(result).toEqual({
      requiredField: 'test',
      defaultField: false
    });
  });
  
  it('should apply default values', () => {
    // Arrange
    const params = {
      requiredField: 'test',
      defaultField: true
    };
    
    // Act
    const result = validatable.validate(params);
    
    // Assert
    expect(result).toEqual({
      requiredField: 'test',
      defaultField: true
    });
  });
  
  it('should throw error on invalid parameters', () => {
    // Arrange
    const invalidParams = {
      optionalField: 123
      // Missing required field
    };
    
    // Act & Assert
    expect(() => validatable.validate(invalidParams))
      .toThrow();
  });
  
  it('should throw error when wrong type is provided', () => {
    // Arrange
    const invalidParams = {
      requiredField: 'test',
      optionalField: 'not a number' as any // Should be a number
    };
    
    // Act & Assert
    expect(() => validatable.validate(invalidParams))
      .toThrow();
  });
}); 