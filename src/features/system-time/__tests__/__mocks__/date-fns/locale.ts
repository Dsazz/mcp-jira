/**
 * Mock for date-fns/locale module
 * This file is automatically used when calling jest.mock('date-fns/locale')
 */

import { jest } from '@jest/globals';

// Mock locale objects with code property for identification in tests
export const enUS = { code: 'en-US' };
export const es = { code: 'es' };
export const fr = { code: 'fr' };
export const de = { code: 'de' };
export const ja = { code: 'ja' };