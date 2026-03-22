# ZenFit Test Scripts Configuration

Add these scripts to your `package.json` for easy test execution:

## Scripts to Add

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",

    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:screens": "jest __tests__/screens",
    "test:store": "jest __tests__/store",
    "test:e2e-integration": "jest __tests__/e2e",
    "test:verbose": "jest --verbose",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand",
    "test:clear": "jest --clearCache",
    "test:ci": "jest --coverage --ci --bail",

    "detox:build-cache": "detox build-framework-cache",
    "detox:build-ios": "detox build-app -c ios.sim.debug",
    "detox:build-android": "detox build-app -c android.emu.debug",
    "detox:test-ios": "detox test e2e/starter.test.js -c ios.sim.debug",
    "detox:test-android": "detox test e2e/starter.test.js -c android.emu.debug",
    "detox:test-ios-release": "detox test e2e/starter.test.js -c ios.sim.release",
    "detox:setup": "detox init -r jest",

    "test:all": "npm run test && npm run detox:test-ios"
  }
}
```

## Script Usage Guide

### Unit & Integration Tests

**Run all tests:**
```bash
npm test
```

**Watch mode (auto-rerun on file changes):**
```bash
npm run test:watch
```

**Generate coverage report:**
```bash
npm run test:coverage
```

**Test only screen components:**
```bash
npm run test:screens
```

**Test only state management:**
```bash
npm run test:store
```

**Test only E2E integration flows:**
```bash
npm run test:e2e-integration
```

**Verbose output (see each test):**
```bash
npm run test:verbose
```

**Clear Jest cache:**
```bash
npm run test:clear
```

**CI/CD mode (fails on first error, with coverage):**
```bash
npm run test:ci
```

### Detox E2E Tests

**Initial setup (one-time):**
```bash
npm run detox:build-cache
```

**Build iOS app for testing:**
```bash
npm run detox:build-ios
```

**Build Android app for testing:**
```bash
npm run detox:build-android
```

**Run iOS E2E tests:**
```bash
npm run detox:test-ios
```

**Run Android E2E tests:**
```bash
npm run detox:test-android
```

**Run iOS release build tests:**
```bash
npm run detox:test-ios-release
```

### Full Test Suite

**Run all Jest + Detox tests:**
```bash
npm run test:all
```

This will:
1. Run all unit/integration tests
2. Run E2E tests on iOS simulator
3. Generate coverage report

## Test Running Examples

### Daily Development

```bash
# Watch mode for development
npm run test:watch

# Run before committing
npm run test:ci

# Test specific feature
npm run test -- AuthScreen
```

### Pre-commit Checks

```bash
# Full validation
npm test && npm run test:coverage
```

### CI/CD Pipeline

```bash
# In .github/workflows/test.yml
- run: npm run test:ci
- run: npm run detox:build-ios
- run: npm run detox:test-ios
```

### Quick Verification

```bash
# Just screens (fast)
npm run test:screens

# Just store (fast)
npm run test:store

# Full integration (slower)
npm run test:e2e-integration
```

## Environment Variables

### For CI/CD

```bash
# Disable interactive mode
CI=true npm test

# Set timeout for slow CI servers
TEST_TIMEOUT=10000 npm test

# Verbose logging
DEBUG=* npm test
```

### Example .env.test

```bash
# jest.setup.js can read these
NODE_ENV=test
DETOX_CLEANUP=true
```

## Performance Optimization

### Run Tests in Parallel

Jest runs tests in parallel by default. To adjust:

```bash
# Single threaded (slower but more stable)
npm test -- --runInBand

# Specific number of workers
npm test -- --maxWorkers=4
```

### Skip Slow Tests

```bash
# Run without E2E
npm run test:screens && npm run test:store

# Skip integration tests
npm test -- --testPathIgnorePatterns=e2e
```

### Cache Optimization

```bash
# Use cache
npm test

# Clear cache
npm run test:clear

# Disable cache
npm test -- --no-cache
```

## Debugging

### Debug Specific Test

```bash
npm test -- --testNamePattern="should navigate" --verbose
```

### Debug with Node Inspector

```bash
npm run test:debug
```

Then open `chrome://inspect` in Chrome.

### See Test Output

```bash
npm test -- --verbose --no-coverage
```

## Integration with IDEs

### VS Code

Add to `.vscode/settings.json`:

```json
{
  "jest.rootPath": ".",
  "jest.runMode": "on-demand",
  "jest.showCoverageOnLoad": false
}
```

### WebStorm/IntelliJ

- Run tests: `Cmd+Shift+F10` (Mac) or `Ctrl+Shift+F10` (Windows/Linux)
- Debug tests: `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows/Linux)
- Create test file template: Settings → Editor → File and Code Templates

## Git Hooks

### Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash
npm run test:screens && npm run test:store
if [ $? -ne 0 ]; then
  echo "Tests failed. Commit aborted."
  exit 1
fi
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Test Coverage Targets

Monitor with:

```bash
npm run test:coverage
```

Coverage report location: `coverage/lcov-report/index.html`

Current targets:
- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

## Continuous Integration Examples

### GitHub Actions

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - run: npm install
      - run: npm run test:ci

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Pre-deployment Checklist

```bash
# Full validation before deployment
npm run test:ci && \
npm run detox:build-ios && \
npm run detox:test-ios && \
echo "All tests passed! Safe to deploy."
```

## Troubleshooting Scripts

### "jest not found"
```bash
npm install --save-dev jest @testing-library/react-native
```

### "detox not found"
```bash
npm install --save-dev detox-cli detox
```

### Port already in use
```bash
# For Detox on different port
export DETOX_SERVER_PORT=8099
npm run detox:test-ios
```

### Clear all caches
```bash
npm run test:clear
npm run test:ci -- --clearCache
detox clean-framework-cache
detox clean-artifacts
```

## Quick Reference

```bash
# Common workflows
npm test                    # Quick test
npm run test:watch         # Development
npm run test:ci            # Pre-commit
npm run test:coverage      # Coverage report
npm run detox:test-ios     # E2E tests
npm run test:all           # Full suite
```

## Notes

- All scripts assume npm 6+ and Node 14+
- Detox scripts require iOS Simulator or Android Emulator running
- Coverage reports in `coverage/` directory
- Test output in console and `.test-results/` directory (if configured)
- For Windows, use `npm run` (not `npm`) and ensure proper PATH setup

## Support

For script issues:
1. Verify npm packages installed: `npm list jest detox`
2. Clear cache: `npm run test:clear`
3. Reinstall: `rm -rf node_modules && npm install`
4. Check Node version: `node --version` (should be 14+)
