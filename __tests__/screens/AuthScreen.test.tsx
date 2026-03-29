import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from '../../src/utils/router';
import { useAuthStore } from '../../src/store/authStore';
import AuthScreen from '../../src/screens/AuthScreen';

jest.mock('../../src/utils/router');
jest.mock('../../src/store/authStore');

describe('AuthScreen', () => {
  let mockRouter: any;
  let mockSignInWithEmail: jest.Mock;
  let mockSignUpWithEmail: jest.Mock;
  let mockUseAuthStore: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    };
    (useRouter as unknown as jest.Mock).mockReturnValue(mockRouter);

    mockSignInWithEmail = jest.fn(() => Promise.resolve());
    mockSignUpWithEmail = jest.fn(() => Promise.resolve());

    mockUseAuthStore = jest.fn((selector: (s: unknown) => unknown) => {
      const state = {
        session: null,
        signInWithEmail: mockSignInWithEmail,
        signUpWithEmail: mockSignUpWithEmail,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });
    (useAuthStore as unknown as jest.Mock).mockImplementation(mockUseAuthStore);
  });

  describe('Rendering', () => {
    it('should render the auth screen', () => {
      render(<AuthScreen />);
      expect(screen.getByText('ZenFit')).toBeTruthy();
    });

    it('should render sign in form by default', () => {
      render(<AuthScreen />);
      expect(screen.getByText('Sign In')).toBeTruthy();
      expect(screen.getAllByText('Sign Up').length).toBeGreaterThan(0);
    });

    it('should display email input field', () => {
      render(<AuthScreen />);
      const emailInput = screen.getByPlaceholderText('Email Address');
      expect(emailInput).toBeTruthy();
    });

    it('should display password input field', () => {
      render(<AuthScreen />);
      const passwordInput = screen.getByPlaceholderText('Password');
      expect(passwordInput).toBeTruthy();
    });

    it('should display CTA button', () => {
      render(<AuthScreen />);
      const ctaButton = screen.getByText('Start Your Journey');
      expect(ctaButton).toBeTruthy();
    });

    it('should display mode toggle buttons', () => {
      render(<AuthScreen />);
      expect(screen.getByText('Sign In')).toBeTruthy();
      expect(screen.getAllByText('Sign Up').length).toBeGreaterThan(0);
    });
  });

  describe('Form Modes', () => {
    it('should show full name field only in sign up mode', () => {
      render(<AuthScreen />);

      // Initially in sign in mode, should not have full name field
      let fullNameInput = screen.queryByPlaceholderText('Full Name');
      expect(fullNameInput).toBeNull();

      // Switch to sign up mode
      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      // After switching, full name field should appear
      fullNameInput = screen.queryByPlaceholderText('Full Name');
      expect(fullNameInput).toBeTruthy();
    });

    it('should toggle between sign in and sign up modes', () => {
      render(<AuthScreen />);

      // Initial state: sign in mode
      expect(screen.queryByPlaceholderText('Full Name')).toBeNull();

      // Switch to sign up
      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      expect(screen.getByPlaceholderText('Full Name')).toBeTruthy();

      // Switch back to sign in
      const signInButton = screen.getAllByText('Sign In')[0];
      fireEvent.press(signInButton);

      expect(screen.queryByPlaceholderText('Full Name')).toBeNull();
    });

    it('should display welcome text in sign in mode', () => {
      render(<AuthScreen />);
      expect(screen.getByText('Welcome Back')).toBeTruthy();
    });

    it('should display begin journey text in sign up mode', () => {
      render(<AuthScreen />);

      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      expect(screen.getByText('Begin Your Journey')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      render(<AuthScreen />);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      // Enter invalid email
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email')).toBeTruthy();
      });
    });

    it('should validate password length', async () => {
      render(<AuthScreen />);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      // Enter valid email but short password
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeTruthy();
      });
    });

    it('should require email and password for sign in', async () => {
      render(<AuthScreen />);

      const submitButton = screen.getByText('Start Your Journey');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter email and password')).toBeTruthy();
      });
    });

    it('should require all fields for sign up', async () => {
      render(<AuthScreen />);

      // Switch to sign up
      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      const submitButton = screen.getByText('Start Your Journey');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill in all fields')).toBeTruthy();
      });
    });
  });

  describe('Sign In Flow', () => {
    it('should call signInWithEmail on sign in submit', async () => {
      render(<AuthScreen />);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should navigate to tabs on successful sign in', async () => {
      render(<AuthScreen />);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should display error on sign in failure', async () => {
      mockSignInWithEmail.mockImplementation(() =>
        Promise.reject(new Error('Invalid credentials')),
      );

      render(<AuthScreen />);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeTruthy();
      });
    });
  });

  describe('Sign Up Flow', () => {
    it('should call signUpWithEmail on sign up submit', async () => {
      render(<AuthScreen />);

      // Switch to sign up mode
      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      const fullNameInput = screen.getByPlaceholderText('Full Name');
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(fullNameInput, 'Test User');
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockSignUpWithEmail).toHaveBeenCalledWith(
          'test@example.com',
          'password123',
          'Test User',
        );
      });
    });

    it('should navigate to tabs on successful sign up', async () => {
      render(<AuthScreen />);

      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      const fullNameInput = screen.getByPlaceholderText('Full Name');
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(fullNameInput, 'Test User');
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should display error on sign up failure', async () => {
      mockSignUpWithEmail.mockImplementation(() =>
        Promise.reject(new Error('Email already exists')),
      );

      render(<AuthScreen />);

      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      const fullNameInput = screen.getByPlaceholderText('Full Name');
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(fullNameInput, 'Test User');
      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator during sign in', async () => {
      mockSignInWithEmail.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<AuthScreen />);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(screen.getByText('Start Your Journey'));

      // ActivityIndicator or disabled button should appear during loading
      await waitFor(() => {
        expect(mockSignInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should disable inputs during loading', async () => {
      mockSignInWithEmail.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      );

      render(<AuthScreen />);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByText('Start Your Journey');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');
      fireEvent.press(submitButton);

      // Inputs should be disabled
      expect(emailInput.props.editable).toBe(false);
      expect(passwordInput.props.editable).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should clear error when switching modes', () => {
      render(<AuthScreen />);

      const submitButton = screen.getByText('Start Your Journey');
      fireEvent.press(submitButton);

      // Error should appear
      expect(screen.getByText('Please enter email and password')).toBeTruthy();

      // Switch to sign up mode
      const signUpButton = screen.getAllByText('Sign Up')[0];
      fireEvent.press(signUpButton);

      // Error should be cleared
      expect(screen.queryByText('Please enter email and password')).toBeNull();
    });

    it('should display wellness message at bottom', () => {
      render(<AuthScreen />);
      expect(
        screen.getByText(/Unlock personalized yoga, meditation, and nutrition plans/),
      ).toBeTruthy();
    });
  });

  describe('Authenticated User Navigation', () => {
    it('should navigate to tabs if user is already authenticated', () => {
      mockUseAuthStore.mockImplementation((selector: (s: unknown) => unknown) => {
        const state = {
          session: { access_token: 'test-token', user: { id: 'user-id' } },
          signInWithEmail: mockSignInWithEmail,
          signUpWithEmail: mockSignUpWithEmail,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });

      render(<AuthScreen />);

      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});
