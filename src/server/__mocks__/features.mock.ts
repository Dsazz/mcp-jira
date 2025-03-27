/**
 * Mocks for feature modules used in server tests
 */

import { mock } from "bun:test";
import { mockModule as mockLogger } from "./logger.mock";

// Mock logger
mock.module("../../shared/logging", mockLogger);

// Export mock functions for features
export const registerSystemTimeTools = mock(() => {});
export const registerJiraTools = mock(() => {});
