/**
 * Mock implementation of GetTimeTool
 * This file is automatically used when calling jest.mock('../../tools/get-time/get-time.tool')
 */

import { jest } from '@jest/globals';

const handlerMock = jest.fn().mockReturnValue({
  content: [{ type: 'text', text: 'mocked time' }]
});

export class GetTimeTool {
  constructor() {
    jest.fn()();
  }
  
  handler = handlerMock;
} 