const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  setupFiles: ['<rootDir>/jest.setup.ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
   testPathIgnorePatterns: [
    '<rootDir>/__tests__/authorized-route.test.ts',],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // maps @/lib/... to ./lib/...
  },
};