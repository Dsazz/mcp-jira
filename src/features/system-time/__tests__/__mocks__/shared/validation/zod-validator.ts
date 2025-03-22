/**
 * Mock for zod-validator
 * This file is automatically used when calling jest.mock('../../../../shared/validation/zod-validator')
 */

import { jest } from '@jest/globals';

export const validate = jest.fn().mockImplementation((schema, data) => data); 