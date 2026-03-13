const createJestConfig = require("next/jest").default;
const path = require("path");

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFiles: ["<rootDir>/jest.polyfills.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next-intl/server$": "<rootDir>/__mocks__/next-intl-server.js",
    "^next-intl$": "<rootDir>/__mocks__/next-intl.js",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  collectCoverageFrom: [
    "src/app/**/*.{ts,tsx}",
    "src/lib/**/*.{ts,tsx}",
    "src/hooks/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
};

// Pass project dir so next/jest loads next.config and sets up SWC transform
module.exports = createJestConfig({ dir: path.resolve(__dirname) })(
  customJestConfig
);
