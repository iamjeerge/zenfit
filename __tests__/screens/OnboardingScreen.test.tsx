import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from '../../src/utils/router';
import OnboardingScreen from '../../src/screens/OnboardingScreen';

jest.mock('../../src/utils/router');

describe('OnboardingScreen', () => {
  let mockRouter: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Rendering', () => {
    it('should render the welcome step by default', () => {
      render(<OnboardingScreen />);
      expect(screen.getByText('Welcome to ZenFit')).toBeTruthy();
    });

    it('should display wellness icon on first page', () => {
      render(<OnboardingScreen />);
      expect(screen.getByText('🧘')).toBeTruthy();
    });

    it('should display subtitle on welcome page', () => {
      render(<OnboardingScreen />);
      expect(screen.getByText('Your Personal Wellness Journey')).toBeTruthy();
    });

    it('should show step progress label', () => {
      render(<OnboardingScreen />);
      expect(screen.getByText('Step 1 of 7')).toBeTruthy();
    });

    it('should render Next button', () => {
      render(<OnboardingScreen />);
      expect(screen.getByText('Next →')).toBeTruthy();
    });

    it('should NOT show Skip button on step 0', () => {
      render(<OnboardingScreen />);
      expect(screen.queryByText('Skip')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should advance to step 2 when Next is pressed', async () => {
      render(<OnboardingScreen />);
      fireEvent.press(screen.getByText('Next →'));
      await waitFor(() => {
        expect(screen.getByText('About You')).toBeTruthy();
      });
    });

    it('should show Skip button on step 1 and beyond', async () => {
      render(<OnboardingScreen />);
      fireEvent.press(screen.getByText('Next →'));
      await waitFor(() => {
        expect(screen.getByText('Skip')).toBeTruthy();
      });
    });

    it('should navigate to /auth when Skip is pressed', async () => {
      render(<OnboardingScreen />);
      // Advance to step 1 so Skip appears
      fireEvent.press(screen.getByText('Next →'));
      await waitFor(() => screen.getByText('Skip'));
      fireEvent.press(screen.getByText('Skip'));
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/auth');
      });
    });

    it('should show Back button after first step', async () => {
      render(<OnboardingScreen />);
      fireEvent.press(screen.getByText('Next →'));
      await waitFor(() => {
        expect(screen.getByText('← Back')).toBeTruthy();
      });
    });

    it('should go back to previous step when Back is pressed', async () => {
      render(<OnboardingScreen />);
      fireEvent.press(screen.getByText('Next →'));
      await waitFor(() => screen.getByText('← Back'));
      fireEvent.press(screen.getByText('← Back'));
      await waitFor(() => {
        expect(screen.getByText('Welcome to ZenFit')).toBeTruthy();
      });
    });

    it('should show step 3 content after two Next presses', async () => {
      render(<OnboardingScreen />);
      fireEvent.press(screen.getByText('Next →'));
      await waitFor(() => screen.getByText('About You'));
      fireEvent.press(screen.getByText('Next →'));
      await waitFor(() => {
        expect(screen.getByText('Body Metrics')).toBeTruthy();
      });
    });

    it('should show Get Started button on last step', async () => {
      render(<OnboardingScreen />);
      // Navigate through all 7 steps
      for (let i = 0; i < 6; i++) {
        fireEvent.press(screen.getByText('Next →'));
        await waitFor(() => {});
      }
      await waitFor(() => {
        expect(screen.getByText('Get Started 🚀')).toBeTruthy();
      });
    });

    it('should navigate to /auth when Get Started is pressed on last step', async () => {
      render(<OnboardingScreen />);
      for (let i = 0; i < 6; i++) {
        fireEvent.press(screen.getByText('Next →'));
        await waitFor(() => {});
      }
      await waitFor(() => screen.getByText('Get Started 🚀'));
      fireEvent.press(screen.getByText('Get Started 🚀'));
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/auth');
      });
    });
  });

  describe('Step Content', () => {
    it('should render About You step with name input', async () => {
      render(<OnboardingScreen />);
      fireEvent.press(screen.getByText('Next →'));
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Your name')).toBeTruthy();
      });
    });

    it('should render Body Metrics step with height input', async () => {
      render(<OnboardingScreen />);
      fireEvent.press(screen.getByText('Next →'));
      await waitFor(() => screen.getByText('About You'));
      fireEvent.press(screen.getByText('Next →'));
      await waitFor(() => {
        expect(screen.getByPlaceholderText('e.g. 175')).toBeTruthy();
      });
    });

    it('should render Fitness Goal step', async () => {
      render(<OnboardingScreen />);
      for (let i = 0; i < 3; i++) {
        fireEvent.press(screen.getByText('Next →'));
        await waitFor(() => {});
      }
      await waitFor(() => {
        expect(screen.getByText('Fitness Goal')).toBeTruthy();
      });
    });
  });
});

// Orphaned blocks removed — all tests are in the describe above
/*
    it('should render first page content by default', () => {
      render(<OnboardingScreen />);

      expect(screen.getByText('Find Your Inner Peace')).toBeTruthy();
      expect(screen.getByText('Meditation & Mindfulness')).toBeTruthy();
      expect(
        screen.getByText(/Guided meditation sessions and breathwork exercises/i)
      ).toBeTruthy();
    });

    it('should display meditation icon on first page', () => {
      render(<OnboardingScreen />);
      expect(screen.getByText('🧘')).toBeTruthy();
    });

    it('should render skip button', () => {
      render(<OnboardingScreen />);
      const skipButton = screen.getByText('Skip');
      expect(skipButton).toBeTruthy();
    });

    it('should render Next button on first page', () => {
      render(<OnboardingScreen />);
      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeTruthy();
    });
  });

  describe('Pagination', () => {
    it('should have correct number of dot indicators', () => {
      const { getAllByTestId } = render(<OnboardingScreen />);
      // The onboarding has 3 pages
      expect(screen.getByText('Find Your Inner Peace')).toBeTruthy();
    });

    it('should navigate to next page when Next is pressed', async () => {
      const { rerender } = render(<OnboardingScreen />);

      const nextButton = screen.getByText('Next');
      fireEvent.press(nextButton);

      // Component should still be rendered (still in onboarding)
      expect(screen.getByText('Find Your Inner Peace')).toBeTruthy();
    });

    it('should show yoga page on second page', () => {
      render(<OnboardingScreen />);

      // We can verify the component is working by checking it renders
      expect(screen.getByText('Find Your Inner Peace')).toBeTruthy();
    });

    it('should show nutrition page on third page', () => {
      render(<OnboardingScreen />);

      // Component should render successfully
      expect(screen.getByText('Find Your Inner Peace')).toBeTruthy();
    });
  });

  describe('Button Navigation', () => {
    it('should navigate to auth when Skip button is pressed', async () => {
      render(<OnboardingScreen />);

      const skipButton = screen.getByText('Skip');
      fireEvent.press(skipButton);

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith('/auth');
      });
    });

    it('should advance to next page when Next is pressed on page 1', async () => {
      render(<OnboardingScreen />);

      const nextButton = screen.getByText('Next');
      fireEvent.press(nextButton);

      // The scroll should be triggered
      expect(nextButton).toBeTruthy();
    });

    it('should navigate to auth when Get Started is pressed on final page', async () => {
      render(<OnboardingScreen />);

      // The button text changes based on which page we're on
      // On the last page (3), it should say "Get Started"
      const buttons = screen.getAllByText(/Next|Get Started/);
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Indicators', () => {
    it('should have 3 dot indicators for 3 pages', () => {
      render(<OnboardingScreen />);
      // Component should render, dots are in the tree
      expect(screen.getByText('Find Your Inner Peace')).toBeTruthy();
    });

    it('should highlight correct active dot', () => {
      render(<OnboardingScreen />);
      // First page is active by default
      expect(screen.getByText('Find Your Inner Peace')).toBeTruthy();
    });

    it('should update active dot when page changes', async () => {
      render(<OnboardingScreen />);

      const nextButton = screen.getByText('Next');
      fireEvent.press(nextButton);

      // Active indicator should change as we scroll
      expect(nextButton).toBeTruthy();
    });
  });

  describe('Content Validation', () => {
    it('should have descriptive text for meditation page', () => {
      render(<OnboardingScreen />);
      expect(
        screen.getByText(/Guided meditation sessions and breathwork exercises/i)
      ).toBeTruthy();
    });

    it('should contain all page titles', () => {
      render(<OnboardingScreen />);
      // First page is visible
      expect(screen.getByText('Find Your Inner Peace')).toBeTruthy();
    });

    it('should have decoration elements on each page', () => {
      render(<OnboardingScreen />);
      // Component renders with decorations
      expect(screen.getByText('Find Your Inner Peace')).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should handle skip button interaction', () => {
      render(<OnboardingScreen />);
      const skipButton = screen.getByText('Skip');

      expect(skipButton).toBeTruthy();
      fireEvent.press(skipButton);

      expect(mockRouter.replace).toHaveBeenCalled();
    });

    it('should handle next button interaction', () => {
      render(<OnboardingScreen />);
      const nextButton = screen.getByText('Next');

      expect(nextButton).toBeTruthy();
      fireEvent.press(nextButton);
    });
  });
});
*/
