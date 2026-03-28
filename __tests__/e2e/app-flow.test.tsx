import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from '../../src/utils/router';
import { useAuthStore } from '../../src/store/authStore';
import SplashScreen from '../../src/screens/SplashScreen';
import OnboardingScreen from '../../src/screens/OnboardingScreen';
import AuthScreen from '../../src/screens/AuthScreen';

jest.mock('../../src/utils/router');
jest.mock('../../src/store/authStore');

describe('E2E: App Flow Integration Tests', () => {
  let mockRouter: any;
  let mockUseAuthStore: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Complete User Journey: New User', () => {
    beforeEach(() => {
      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          initialized: true,
          signInWithEmail: jest.fn(() => Promise.resolve()),
          signUpWithEmail: jest.fn(() => Promise.resolve()),
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);
    });

    it('should navigate from Splash to Onboarding when not authenticated', async () => {
      render(<SplashScreen />);

      expect(screen.getByText('ZenFit')).toBeTruthy();
      expect(screen.getByText('Mind · Body · Soul')).toBeTruthy();

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding');
      });
    });

    it('should complete onboarding flow', async () => {
      render(<OnboardingScreen />);

      // First page
      expect(screen.getByText('Find Your Inner Peace')).toBeTruthy();

      const nextButton = screen.getByText('Next');
      fireEvent.press(nextButton);

      expect(screen.getByText('Next')).toBeTruthy();
    });

    it('should navigate to auth from onboarding', async () => {
      render(<OnboardingScreen />);

      const skipButton = screen.getByText('Skip');
      fireEvent.press(skipButton);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/auth');
      });
    });

    it('should allow sign up from auth screen', async () => {
      const mockSignUpWithEmail = jest.fn(() => Promise.resolve());

      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          signUpWithEmail: mockSignUpWithEmail,
          signInWithEmail: jest.fn(),
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      render(<AuthScreen />);

      // Switch to sign up
      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      // Fill form
      const fullNameInput = screen.getByPlaceholderText('Full Name');
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(fullNameInput, 'Jane Doe');
      fireEvent.changeText(emailInput, 'jane@example.com');
      fireEvent.changeText(passwordInput, 'securePassword123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignUpWithEmail).toHaveBeenCalledWith(
          'jane@example.com',
          'securePassword123',
          'Jane Doe'
        );
      });
    });
  });

  describe('Complete User Journey: Returning User', () => {
    beforeEach(() => {
      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: {
            access_token: 'test-token',
            user: { id: 'user-id', email: 'test@example.com' },
          },
          initialized: true,
          profile: {
            id: 'user-id',
            full_name: 'Test User',
            streak_days: 5,
            xp: 100,
            level: 1,
          },
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);
    });

    it('should navigate directly to home for authenticated users', async () => {
      render(<SplashScreen />);

      expect(screen.getByText('ZenFit')).toBeTruthy();

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should skip onboarding for returning users', async () => {
      render(<SplashScreen />);

      jest.advanceTimersByTime(2500);

      // Should go directly to tabs, skipping onboarding
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      expect(mockRouter.replace).not.toHaveBeenCalledWith('/onboarding');
    });
  });

  describe('Authentication Flow', () => {
    it('should handle sign in flow correctly', async () => {
      const mockSignInWithEmail = jest.fn(() => Promise.resolve());

      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          signInWithEmail: mockSignInWithEmail,
          signUpWithEmail: jest.fn(),
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      render(<AuthScreen />);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalledWith(
          'john@example.com',
          'password123'
        );
      });

      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });

    it('should handle sign up to home navigation', async () => {
      const mockSignUpWithEmail = jest.fn(() => Promise.resolve());

      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          signUpWithEmail: mockSignUpWithEmail,
          signInWithEmail: jest.fn(),
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      render(<AuthScreen />);

      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      const fullNameInput = screen.getByPlaceholderText('Full Name');
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(fullNameInput, 'New User');
      fireEvent.changeText(emailInput, 'newuser@example.com');
      fireEvent.changeText(passwordInput, 'securepass123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should display validation errors in sign up', async () => {
      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          signUpWithEmail: jest.fn(() => Promise.resolve()),
          signInWithEmail: jest.fn(),
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      render(<AuthScreen />);

      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      // Try to submit empty form
      const submitButton = screen.getByText('Start Your Journey');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeTruthy();
      });
    });

    it('should display validation errors in sign in', async () => {
      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          signInWithEmail: jest.fn(),
          signUpWithEmail: jest.fn(),
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      render(<AuthScreen />);

      const submitButton = screen.getByText('Start Your Journey');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter email and password')).toBeTruthy();
      });
    });
  });

  describe('Navigation Between Screens', () => {
    it('should allow navigation from splash based on auth state', async () => {
      // Test with no auth
      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          initialized: true,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      const { unmount } = render(<SplashScreen />);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding');
      });

      unmount();

      // Test with auth
      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: { access_token: 'token', user: { id: 'id' } },
          initialized: true,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      jest.clearAllMocks();

      render(<SplashScreen />);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should handle auth state changes during app lifetime', async () => {
      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          initialized: true,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      render(<SplashScreen />);

      jest.advanceTimersByTime(2500);

      expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding');
    });
  });

  describe('Error Recovery', () => {
    it('should recover from sign up error', async () => {
      const mockSignUpWithEmail = jest.fn(() =>
        Promise.reject(new Error('Email already registered'))
      );

      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          signUpWithEmail: mockSignUpWithEmail,
          signInWithEmail: jest.fn(),
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      render(<AuthScreen />);

      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      const fullNameInput = screen.getByPlaceholderText('Full Name');
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(fullNameInput, 'Test User');
      fireEvent.changeText(emailInput, 'existing@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeTruthy();
      });

      // Should still be on auth screen, able to retry
      expect(screen.getByText('Begin Your Journey')).toBeTruthy();
    });

    it('should recover from sign in error', async () => {
      const mockSignInWithEmail = jest.fn(() =>
        Promise.reject(new Error('Invalid credentials'))
      );

      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          signInWithEmail: mockSignInWithEmail,
          signUpWithEmail: jest.fn(),
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      render(<AuthScreen />);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'wrongpass');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeTruthy();
      });

      // Should still be on auth screen, able to retry
      expect(screen.getByText('Welcome Back')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during authentication', async () => {
      let resolveAuth: any;
      const authPromise = new Promise((resolve) => {
        resolveAuth = resolve;
      });

      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          signInWithEmail: jest.fn(() => authPromise),
          signUpWithEmail: jest.fn(),
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      render(<AuthScreen />);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      // Button should be disabled during loading
      expect(submitButton.props.disabled).toBe(true);

      resolveAuth();

      await waitFor(() => {
        expect(submitButton.props.disabled).toBe(false);
      });
    });
  });

  describe('Full Onboarding to Home Journey', () => {
    it('should complete full new user journey', async () => {
      // Step 1: Splash screen
      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          initialized: true,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      const { unmount: unmountSplash } = render(<SplashScreen />);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding');
      });

      unmountSplash();

      // Step 2: Onboarding
      jest.clearAllMocks();
      const { unmount: unmountOnboarding } = render(<OnboardingScreen />);

      const skipButton = screen.getByText('Skip');
      fireEvent.press(skipButton);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/auth');
      });

      unmountOnboarding();

      // Step 3: Auth - Sign Up
      jest.clearAllMocks();

      mockUseAuthStore = jest.fn((selector) => {
        const state = {
          session: null,
          signSignUpWithEmail: jest.fn(() => Promise.resolve()),
          signInWithEmail: jest.fn(),
        };
        return typeof selector === 'function' ? selector(state) : state;
      });
      (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);

      render(<AuthScreen />);

      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      const fullNameInput = screen.getByPlaceholderText('Full Name');
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(fullNameInput, 'Jane Doe');
      fireEvent.changeText(emailInput, 'jane@example.com');
      fireEvent.changeText(passwordInput, 'securePassword123');
      fireEvent.press(submitButton);

      // Should navigate to home
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });
  });
});
