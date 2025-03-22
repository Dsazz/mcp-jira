/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^src/features/jira$":
      "<rootDir>/src/server/__tests__/__mocks__/features.ts",
    "^src/features/system-time$":
      "<rootDir>/src/server/__tests__/__mocks__/features.ts",
  },
};
