/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  testMatch: ["<rootDir>/src/test/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": ["@swc/jest", {
      jsc: {
        parser: { syntax: "typescript" },
        target: "es2022",
      },
      module: { type: "es6" },
    }],
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@/(.*)\\.js$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/bootstrap.ts", "!src/test/**", "!src/types/**"],
  coverageProvider: "v8",
  coverageReporters: ["text", "text-summary"],
};
