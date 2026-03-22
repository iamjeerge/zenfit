# Contributing to ZenFit

Thank you for considering contributing to ZenFit! We welcome contributions from the community to help make ZenFit better.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md). We are committed to providing a welcoming and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Supabase account (free tier available)
- Familiarity with React Native and TypeScript

### Development Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/yourusername/zenfit.git
   cd zenfit
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/originalrepo/zenfit.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Create `.env` file**

   ```bash
   cp .env.example .env
   # Fill in your Supabase credentials
   ```

6. **Start development server**

   ```bash
   npm start
   ```

   See [SETUP.md](docs/SETUP.md) for detailed setup instructions.

## Making Changes

### Create a Feature Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation updates
- `refactor/` — Code refactoring
- `perf/` — Performance improvements
- `test/` — Test additions

### Development Workflow

1. **Make your changes**

   - Create or modify files in `src/`
   - Keep components small and focused
   - Follow TypeScript strict mode
   - Use functional components with hooks

2. **Write tests**

   ```bash
   # Create corresponding test files
   src/components/Button.tsx      → __tests__/Button.test.tsx
   src/hooks/useAuth.ts           → __tests__/useAuth.test.ts
   ```

   Run tests:
   ```bash
   npm test
   ```

3. **Format and lint code**

   ```bash
   # Automatic formatting
   npm run format

   # Lint check
   npm run lint

   # Type check
   npm run type-check
   ```

4. **Test locally**

   ```bash
   # iOS Simulator
   npm run ios

   # Android Emulator
   npm run android

   # Web
   npm run web
   ```

### Code Style Guide

#### TypeScript

- **Use strict mode**: No `any` types without justification
- **Explicit return types**: Always type function returns
- **Interfaces over types**: Use `interface` for component props
- **Avoid `!` operator**: Use proper type narrowing

```typescript
// Good
interface ButtonProps {
  onPress: () => void;
  label: string;
  disabled?: boolean;
}

export function Button({ onPress, label, disabled }: ButtonProps): ReactNode {
  return <Pressable onPress={onPress} disabled={disabled} />;
}

// Avoid
const Button = (props: any) => {
  return <Pressable {...props} />;
};
```

#### Functional Components

- Use functional components exclusively
- Prefer hooks over class components
- Use `useCallback` for event handlers
- Memoize expensive components with `React.memo`

```typescript
// Good
export const Card = React.memo(function Card({ item }: CardProps) {
  const handlePress = useCallback(() => {
    onPress(item.id);
  }, [item.id, onPress]);

  return <View onPress={handlePress}>{/* content */}</View>;
});

// Avoid
export class Card extends React.Component {
  render() {
    return <View>{/* content */}</View>;
  }
}
```

#### State Management (Zustand)

- One store per domain (auth, fitness, nutrition)
- Export hooks, not stores
- Use `getState()` for outside components
- Always use TypeScript types

```typescript
// Good
type AuthState = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  signIn: async (email, password) => {
    // Implementation
  },
}));

// Usage
const { user, signIn } = useAuthStore();

// Avoid
export const authStore = {
  user: null,
  signIn: async (email, password) => {},
};
```

#### Component Organization

```typescript
import { ReactNode } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Colors, Spacing } from '@/theme';
import { useCustomHook } from '@/hooks';

// Type definitions
interface Props {
  title: string;
  onPress: () => void;
}

// Component
export const MyComponent = React.memo(function MyComponent({
  title,
  onPress,
}: Props): ReactNode {
  const data = useCustomHook();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={onPress} />
    </View>
  );
});

// Styles
const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 16,
  },
});
```

#### File Naming

```
components/Button.tsx          # Component (PascalCase)
hooks/useAuth.ts              # Hook (camelCase)
services/authService.ts       # Service (camelCase)
store/authStore.ts            # Store (camelCase)
utils/formatters.ts           # Utility (camelCase)
types/user.ts                 # Type (camelCase)
theme/colors.ts               # Theme (camelCase)
```

#### Imports Organization

```typescript
// 1. React and React Native
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';

// 2. Third-party libraries
import { create } from 'zustand';

// 3. Local imports
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/Button';
import { Colors } from '@/theme/colors';

// 4. Relative imports (if necessary)
// import { helper } from './helper';
```

## Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body

footer
```

### Types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `style` — Code style (formatting, missing semicolons)
- `refactor` — Code refactoring
- `perf` — Performance improvement
- `test` — Adding tests
- `chore` — Maintenance, dependencies

### Examples

```bash
git commit -m "feat(auth): add email verification flow"

git commit -m "fix(nutrition): correct macro calculation
Closes #123"

git commit -m "docs(setup): update installation instructions"

git commit -m "refactor(store): simplify auth store logic
BREAKING CHANGE: removed setUser action"
```

## Pull Request Process

### Before Creating PR

1. **Sync with upstream**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Test thoroughly**

   ```bash
   npm run type-check
   npm run lint
   npm test
   npm run build
   ```

3. **Update documentation**

   - Update README if adding features
   - Update API.md for new endpoints
   - Add JSDoc comments
   - Update CHANGELOG.md

### Creating PR

1. **Push your branch**

   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open Pull Request**

   - Clear title: `feat(yoga): add session filters`
   - Detailed description of changes
   - Explain why, not just what
   - Link related issues: `Closes #123`

3. **PR Description Template**

   ```markdown
   ## Description
   Brief description of the changes.

   ## Type of Change
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added
   - [ ] Component tests added
   - [ ] Manual testing completed

   ## Checklist
   - [ ] Code follows style guide
   - [ ] No new warnings generated
   - [ ] Documentation updated
   - [ ] Tests pass locally
   - [ ] Lint passes

   ## Screenshots
   (if applicable)

   Fixes #123
   ```

### PR Requirements

All PRs must meet these criteria:

- [ ] TypeScript strict type checking passes
- [ ] ESLint and Prettier checks pass
- [ ] Tests pass (unit and integration)
- [ ] No console errors or warnings
- [ ] Code is documented
- [ ] Breaking changes clearly noted
- [ ] Works on iOS, Android, and Web

### Review Process

- At least one maintainer review required
- Address all review feedback
- Rebase before merging (no merge commits)
- Squash commits if needed for clarity

## Testing Guidelines

### Unit Tests

Test individual functions and hooks:

```typescript
// utils/__tests__/formatters.test.ts
import { formatCalories } from '@/utils/formatters';

describe('formatCalories', () => {
  test('formats large numbers with "k" suffix', () => {
    expect(formatCalories(1500)).toBe('1.5k');
  });

  test('handles small numbers', () => {
    expect(formatCalories(500)).toBe('500');
  });
});
```

### Component Tests

Test component rendering and interaction:

```typescript
// __tests__/Button.test.tsx
import { render, userEvent } from '@testing-library/react-native';
import { Button } from '@/components/Button';

describe('Button', () => {
  test('calls onPress when clicked', async () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button label="Press Me" onPress={onPress} />
    );

    await userEvent.press(getByText('Press Me'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### E2E Tests

Test complete user flows:

```typescript
// e2e/signUpFlow.e2e.ts
describe('Sign Up Flow', () => {
  test('user can create account and see home screen', async () => {
    // Navigate to auth
    // Fill form
    // Assert home screen loads
  });
});
```

## Issue Guidelines

### Reporting Bugs

Use [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md):

```markdown
## Description
Clear description of the bug.

## Steps to Reproduce
1. Open app
2. Navigate to Yoga screen
3. Click filter button

## Expected Behavior
Filters should appear.

## Actual Behavior
App crashes with error.

## Environment
- OS: iOS 17.2
- Device: iPhone 15
- ZenFit Version: 1.0.0
- Expo: 55.0.8

## Screenshots
[Attach relevant screenshots]
```

### Requesting Features

Use [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md):

```markdown
## Feature Request
Brief description of feature.

## Problem
Why is this needed?

## Proposed Solution
How should it work?

## Alternatives
Other approaches considered?

## Additional Context
Related issues or context.
```

## Documentation

- Update [docs/API.md](docs/API.md) for API changes
- Update [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for design changes
- Add JSDoc comments for public APIs
- Keep README updated with new features

## Security

Please see [SECURITY.md](SECURITY.md) for reporting security vulnerabilities privately.

## License

By contributing to ZenFit, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to:
- Open a discussion on GitHub
- Create an issue for clarification
- Contact maintainers via email
- Check existing documentation

Thank you for contributing to ZenFit!
