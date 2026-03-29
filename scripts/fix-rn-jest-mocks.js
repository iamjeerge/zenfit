#!/usr/bin/env node
/**
 * Patches react-native/jest/mockComponent.js to fix a Node 20 incompatibility.
 *
 * The built-in version uses:
 *   RealComponent.prototype != null &&
 *   RealComponent.prototype.constructor instanceof React.Component
 *
 * This crashes on Node 20 with:
 *   TypeError: Cannot read properties of undefined (reading 'constructor')
 *
 * The fix uses optional chaining which is safe on all Node versions:
 *   RealComponent.prototype?.constructor instanceof React.Component
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '../node_modules/react-native/jest/mockComponent.js',
);

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = content.replace(
    /RealComponent\.prototype != null &&\n(\s*)RealComponent\.prototype\.constructor/,
    'RealComponent.prototype?.constructor',
  );
  if (fixed !== content) {
    fs.writeFileSync(filePath, fixed);
    console.log(
      '✓ Patched react-native/jest/mockComponent.js for Node 20 compatibility',
    );
  } else {
    console.log(
      'react-native/jest/mockComponent.js: already patched or pattern not found — skipping',
    );
  }
} catch (e) {
  console.warn('Could not patch react-native/jest/mockComponent.js:', e.message);
}
