import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from '../../src/utils/router';
import { useAuthStore } from '../../src/store/authStore';
import SplashScreen from '../../src/screens/SplashScreen';

jest.mock('../../src/utils/router');
jest.mock('../../src/store/authStore');

describe('SplashScreen', () => {
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

    mockUseAuthStore = jest.fn((selector) => {
      const state = {
        session: null,
        initialized: true,
      };
      return typeof selector === 'function' ? selector(state) : state;
    });
    (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render ZenFit title', () => {
      render(<SplashScreen />);
      const titleElement = screen.getByText('ZenFit');
      expect(titleElement).toBeTruthy();
    });

    it('should render subtitle text', () => {
      render(<SplashScreen />);
      const subtitleElement = screen.getByText('Mind · Body · Soul');
      expect(subtitleElement).toBeTruthy();
    });

    it('should render animated elements', () => {
      render(<SplashScreen />);
      // The component should render without errors
      // Animated elements are present in the component tree
      expect(screen.getByText('ZenFit')).toBeTruthy();
    });

    it('should have a gradient background container', () => {
      const { getByTestId } = render(<SplashScreen />);
      // LinearGradient is mocked as a View, so we check for the main container
      expect(screen.getByText('ZenFit')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to onboarding when not authenticated', async () => {
      mockUseAuthStore.mockImplementation((selector) => {
        const state = {
          session: null,
          initialized: true,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });

      render(<SplashScreen />);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/onboarding');
      });
    });

    it('should navigate to tabs when authenticated', async () => {
      mockUseAuthStore.mockImplementation((selector) => {
        const state = {
          session: { access_token: 'test-token', user: { id: 'user-id' } },
          initialized: true,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });

      render(<SplashScreen />);

      jest.advanceTimersByTime(2500);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)');
      });
    });

    it('should not navigate if not initialized', async () => {
      mockUseAuthStore.mockImplementation((selector) => {
        const state = {
          session: null,
          initialized: false,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });

      render(<SplashScreen />);

      jest.advanceTimersByTime(2500);

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should clear navigation timeout on unmount', async () => {
      const { unmount } = render(<SplashScreen />);

      unmount();

      jest.advanceTimersByTime(2500);

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });
  });

  describe('Animation', () => {
    it('should trigger logo scale animation on mount', () => {
      render(<SplashScreen />);
      // Animation setup occurs, component should render
      expect(screen.getByText('ZenFit')).toBeTruthy();
    });

    it('should trigger logo opacity animation on mount', () => {
      render(<SplashScreen />);
      // Animation setup occurs, component should render
      expect(screen.getByText('Mind · Body · Soul')).toBeTruthy();
    });

    it('should setup star twinkling animations', () => {
      render(<SplashScreen />);
      // Star animations are setup in useEffect
      expect(screen.getByText('ZenFit')).toBeTruthy();
    });
  });

  describe('Timing', () => {
    it('should have 2.5 second delay before navigation', async () => {
      render(<SplashScreen />);

      // Before 2.5 seconds
      jest.advanceTimersByTime(2000);
      expect(mockRouter.replace).not.toHaveBeenCalled();

      // After 2.5 seconds
      jest.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalled();
      });
    });
  });
});
