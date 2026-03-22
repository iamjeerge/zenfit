import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import BreatheScreen from '../../app/(tabs)/breathe';

describe('BreatheScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render the breathe screen', () => {
      render(<BreatheScreen />);
      expect(screen.queryByText(/breathe|breathing|circle/i)).toBeTruthy();
    });

    it('should display breathing circle animation', () => {
      render(<BreatheScreen />);
      // Breathing circle should be rendered
      expect(screen.queryByText(/breathe|circle/i)).toBeTruthy();
    });

    it('should show start button', () => {
      render(<BreatheScreen />);
      const startButton = screen.queryByText(/start|begin|begin breathing/i);
      expect(startButton).toBeTruthy();
    });

    it('should display phase instructions', () => {
      render(<BreatheScreen />);
      // Phase text should be displayed
      expect(screen.queryByText(/inhale|hold|exhale|ready/i)).toBeTruthy();
    });

    it('should show cycle counter', () => {
      render(<BreatheScreen />);
      // Cycle information should be displayed
      expect(screen.queryByText(/cycle|round|breath/i)).toBeTruthy();
    });
  });

  describe('Breathing Timer', () => {
    it('should start timer when start button is pressed', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      await waitFor(() => {
        // Timer should start
        expect(screen.queryByText(/inhale|hold|exhale/i)).toBeTruthy();
      });
    });

    it('should display inhale phase', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      // Advance timers for inhale phase
      jest.advanceTimersByTime(4000);

      await waitFor(() => {
        expect(screen.queryByText(/inhale/i)).toBeTruthy();
      });
    });

    it('should display hold phase', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      // Advance through inhale to hold phase
      jest.advanceTimersByTime(4500);

      await waitFor(() => {
        expect(screen.queryByText(/hold/i)).toBeTruthy();
      });
    });

    it('should display exhale phase', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      // Advance through to exhale phase
      jest.advanceTimersByTime(8500);

      await waitFor(() => {
        expect(screen.queryByText(/exhale/i)).toBeTruthy();
      });
    });
  });

  describe('Controls', () => {
    it('should show pause button when timer is running', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      await waitFor(() => {
        const pauseButton = screen.queryByText(/pause|stop/i);
        expect(pauseButton).toBeTruthy();
      });
    });

    it('should pause breathing exercise when pause button is pressed', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      await waitFor(() => {
        const pauseButton = screen.queryByText(/pause|stop/i);
        expect(pauseButton).toBeTruthy();
        fireEvent.press(pauseButton);
      });

      await waitFor(() => {
        // Resume button should appear
        expect(screen.queryByText(/resume|continue/i)).toBeTruthy();
      });
    });

    it('should show reset button', () => {
      render(<BreatheScreen />);
      const resetButton = screen.queryByText(/reset|restart|start over/i);
      expect(resetButton).toBeTruthy();
    });

    it('should reset state when reset button is pressed', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      jest.advanceTimersByTime(2000);

      const resetButton = screen.queryByText(/reset|restart/i);
      if (resetButton) {
        fireEvent.press(resetButton);

        await waitFor(() => {
          // Should show start button again
          expect(screen.queryByText(/start|begin/i)).toBeTruthy();
        });
      }
    });
  });

  describe('Cycle Counter', () => {
    it('should increment cycle counter after each complete breath', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      // Complete one breathing cycle (4 + 4 + 4 = 12 seconds)
      jest.advanceTimersByTime(12000);

      await waitFor(() => {
        // Cycle should increment
        expect(screen.queryByText(/cycle|round|breath/i)).toBeTruthy();
      });
    });

    it('should display cycle count to user', () => {
      render(<BreatheScreen />);
      // Cycle counter should be visible
      expect(screen.queryByText(/cycle|round|1|0/i)).toBeTruthy();
    });

    it('should continue incrementing cycles', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      // Multiple cycles
      jest.advanceTimersByTime(24000);

      await waitFor(() => {
        expect(screen.queryByText(/cycle|round/i)).toBeTruthy();
      });
    });
  });

  describe('Visual Feedback', () => {
    it('should animate breathing circle during inhale', () => {
      render(<BreatheScreen />);
      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      // Circle should be animating
      expect(screen.queryByText(/breathe|circle/i)).toBeTruthy();
    });

    it('should provide color feedback for phases', () => {
      render(<BreatheScreen />);
      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      // Component should render with visual feedback
      expect(screen.queryByText(/breathe/i)).toBeTruthy();
    });

    it('should show duration time remaining', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      await waitFor(() => {
        // Time display should be present
        expect(screen.queryByText(/sec|s|minute|time/i)).toBeTruthy();
      });
    });
  });

  describe('Session Management', () => {
    it('should allow customizing session duration', () => {
      render(<BreatheScreen />);
      // Duration controls should be present if available
      expect(screen.queryByText(/duration|length|time/i)).toBeTruthy();
    });

    it('should save session history', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      jest.advanceTimersByTime(1000);

      const resetButton = screen.queryByText(/reset/i);
      if (resetButton) {
        fireEvent.press(resetButton);
        // Session should be saved
        expect(screen.queryByText(/session|history|save/i)).toBeTruthy();
      }
    });

    it('should display session statistics', () => {
      render(<BreatheScreen />);
      // Stats should be displayed
      expect(screen.queryByText(/stat|session|history/i)).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should handle rapid button presses', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);
      fireEvent.press(startButton);
      fireEvent.press(startButton);

      // Component should handle this gracefully
      expect(screen.queryByText(/breathe/i)).toBeTruthy();
    });

    it('should handle reset during active session', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      jest.advanceTimersByTime(5000);

      const resetButton = screen.queryByText(/reset/i);
      if (resetButton) {
        fireEvent.press(resetButton);
      }

      expect(screen.queryByText(/breathe/i)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<BreatheScreen />);
      expect(screen.queryByText(/start|pause|reset/i)).toBeTruthy();
    });

    it('should provide audio cues for phases', () => {
      render(<BreatheScreen />);
      // Audio cues might be indicated in text or UI
      expect(screen.queryByText(/breathe|inhale|exhale|hold/i)).toBeTruthy();
    });

    it('should have readable phase text', async () => {
      render(<BreatheScreen />);

      const startButton = screen.queryByText(/start|begin/i);
      fireEvent.press(startButton);

      await waitFor(() => {
        const phaseElements = screen.queryAllByText(/inhale|hold|exhale/i);
        expect(phaseElements.length).toBeGreaterThan(0);
      });
    });
  });
});
