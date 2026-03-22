import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SleepScreen from '../../src/screens/SleepScreen';

describe('SleepScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the sleep tracker screen', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/Sleep Tracker/i)).toBeTruthy();
    });

    it('should display subtitle', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/Rest well/i)).toBeTruthy();
    });

    it('should show last night card', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/Last Night/i)).toBeTruthy();
    });

    it('should show "Log Sleep" button when no sleep logged', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/\+ Log Sleep/i)).toBeTruthy();
    });

    it('should display no-log message before logging', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/No sleep logged yet/i)).toBeTruthy();
    });

    it('should show weekly average stats', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/Weekly Avg/i)).toBeTruthy();
      expect(screen.getByText(/Goal/i)).toBeTruthy();
      expect(screen.getByText(/Goal Met/i)).toBeTruthy();
    });

    it('should display weekly chart', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/This Week/i)).toBeTruthy();
      expect(screen.getByText(/Mon/i)).toBeTruthy();
      expect(screen.getByText(/Sun/i)).toBeTruthy();
    });

    it('should show sleep history section', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/Sleep History/i)).toBeTruthy();
    });

    it('should display recent sleep log entries', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/Last night/i)).toBeTruthy();
      expect(screen.getByText(/2 nights ago/i)).toBeTruthy();
    });

    it('should show sleep tips section', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/Sleep Tips/i)).toBeTruthy();
    });

    it('should render sleep tip cards', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/Consistent Schedule/i)).toBeTruthy();
      expect(screen.getByText(/Screen-Free Wind Down/i)).toBeTruthy();
    });
  });

  describe('Log Sleep Modal', () => {
    it('should open modal when "Log Sleep" button is pressed', async () => {
      render(<SleepScreen />);
      fireEvent.press(screen.getByText(/\+ Log Sleep/i));
      await waitFor(() => {
        expect(screen.getByText(/Log Sleep/i)).toBeTruthy();
      });
    });

    it('should show bedtime and wake time selectors', async () => {
      render(<SleepScreen />);
      fireEvent.press(screen.getByText(/\+ Log Sleep/i));
      await waitFor(() => {
        expect(screen.getByText(/Bedtime/i)).toBeTruthy();
        expect(screen.getByText(/Wake Time/i)).toBeTruthy();
      });
    });

    it('should show sleep quality selector', async () => {
      render(<SleepScreen />);
      fireEvent.press(screen.getByText(/\+ Log Sleep/i));
      await waitFor(() => {
        expect(screen.getByText(/Sleep Quality/i)).toBeTruthy();
      });
    });

    it('should display all quality rating options', async () => {
      render(<SleepScreen />);
      fireEvent.press(screen.getByText(/\+ Log Sleep/i));
      await waitFor(() => {
        expect(screen.getByText(/Terrible/i)).toBeTruthy();
        expect(screen.getByText(/Poor/i)).toBeTruthy();
        expect(screen.getByText(/Fair/i)).toBeTruthy();
        expect(screen.getByText(/Good/i)).toBeTruthy();
        expect(screen.getByText(/Excellent/i)).toBeTruthy();
      });
    });

    it('should allow selecting a quality rating', async () => {
      render(<SleepScreen />);
      fireEvent.press(screen.getByText(/\+ Log Sleep/i));
      await waitFor(() => {
        expect(screen.getByText(/Excellent/i)).toBeTruthy();
      });
      fireEvent.press(screen.getByAccessibilityLabel('Quality Excellent'));
      // Selection should succeed without errors
      expect(screen.getByText(/Excellent/i)).toBeTruthy();
    });

    it('should close modal when Cancel is pressed', async () => {
      render(<SleepScreen />);
      fireEvent.press(screen.getByText(/\+ Log Sleep/i));
      await waitFor(() => {
        expect(screen.getByText(/Sleep Quality/i)).toBeTruthy();
      });
      fireEvent.press(screen.getByText(/Cancel/i));
      await waitFor(() => {
        expect(screen.queryByText(/Sleep Quality/i)).toBeFalsy();
      });
    });

    it('should save log and update UI when Save is pressed', async () => {
      render(<SleepScreen />);
      fireEvent.press(screen.getByText(/\+ Log Sleep/i));
      await waitFor(() => {
        expect(screen.getByText(/Sleep Quality/i)).toBeTruthy();
      });
      fireEvent.press(screen.getByText(/^Save$/i));
      await waitFor(() => {
        // After saving, "Edit Log" button should appear
        expect(screen.getByText(/Edit Log/i)).toBeTruthy();
      });
    });
  });

  describe('Weekly Stats', () => {
    it('should display calculated weekly average', () => {
      render(<SleepScreen />);
      // Average of [7.5, 6, 8, 6.5, 7, 9, 8] = 7.43h
      expect(screen.getByText(/7\.4h/i)).toBeTruthy();
    });

    it('should show goal of 8 hours', () => {
      render(<SleepScreen />);
      expect(screen.getByText('8h')).toBeTruthy();
    });
  });

  describe('Sleep Tips', () => {
    it('should display all four sleep tips', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/Consistent Schedule/i)).toBeTruthy();
      expect(screen.getByText(/Screen-Free Wind Down/i)).toBeTruthy();
      expect(screen.getByText(/Cool Room/i)).toBeTruthy();
      expect(screen.getByText(/Herbal Tea/i)).toBeTruthy();
    });

    it('should show tip descriptions', () => {
      render(<SleepScreen />);
      expect(screen.getByText(/same time every day/i)).toBeTruthy();
    });
  });
});
