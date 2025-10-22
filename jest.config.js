module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  tsconfig: 'tsconfig.spec.json',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts']
};