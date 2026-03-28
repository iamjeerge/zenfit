// Runs after the test framework is installed — beforeAll/afterAll are available here.

const origConsoleError = console.error;

beforeAll(() => {
  console.error = (...args) => {
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (msg.includes('Warning:') || msg.includes('Non-serializable')) return;
    origConsoleError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = origConsoleError;
});
