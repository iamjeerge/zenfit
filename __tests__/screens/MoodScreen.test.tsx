import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import MoodScreen from '../../src/screens/MoodScreen';

describe('MoodScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the mood journal screen', () => {
      render(<MoodScreen />);
      expect(screen.getByText(/Mood Journal/i)).toBeTruthy();
    });

    it('should display subtitle', () => {
      render(<MoodScreen />);
      expect(screen.getByText(/Check in with yourself/i)).toBeTruthy();
    });

    it('should show today check-in card', () => {
      render(<MoodScreen />);
      // Shows either a mood prompt or today's existing mood
      expect(
        screen.queryByText(/Log Mood/i) ||
        screen.queryByText(/Update Mood/i)
      ).toBeTruthy();
    });

    it('should show a mood logging button', () => {
      render(<MoodScreen />);
      expect(
        screen.queryByText(/\+ Log Mood/i) ||
        screen.queryByText(/Update Mood/i)
      ).toBeTruthy();
    });

    it('should display weekly stats row', () => {
      render(<MoodScreen />);
      expect(screen.getByText(/Avg Mood/i)).toBeTruthy();
      expect(screen.getByText(/Days Logged/i)).toBeTruthy();
      expect(screen.getByText(/Overall/i)).toBeTruthy();
    });

    it('should show 7-day trend chart section', () => {
      render(<MoodScreen />);
      expect(screen.getByText(/7-Day Trend/i)).toBeTruthy();
    });

    it('should show mood history section', () => {
      render(<MoodScreen />);
      expect(screen.getByText(/Mood History/i)).toBeTruthy();
    });

    it('should display recent mood entries', () => {
      render(<MoodScreen />);
      expect(screen.getByText(/Yesterday/i)).toBeTruthy();
      expect(screen.getByText(/2 days ago/i)).toBeTruthy();
    });

    it('should display notes for entries that have them', () => {
      render(<MoodScreen />);
      expect(screen.getByText(/yoga session/i)).toBeTruthy();
    });
  });

  describe('Log Mood Modal', () => {
    it('should open modal when Log Mood button is pressed', async () => {
      render(<MoodScreen />);
      const logButton =
        screen.queryByText(/\+ Log Mood/i) ||
        screen.queryByText(/Update Mood/i);
      fireEvent.press(logButton!);
      await waitFor(() => {
        expect(screen.getByText(/How are you feeling/i)).toBeTruthy();
      });
    });

    it('should display mood emoji options', async () => {
      render(<MoodScreen />);
      const logButton =
        screen.queryByText(/\+ Log Mood/i) ||
        screen.queryByText(/Update Mood/i);
      fireEvent.press(logButton!);
      await waitFor(() => {
        expect(screen.getByText(/Awful/i)).toBeTruthy();
        expect(screen.getByText(/Bad/i)).toBeTruthy();
        expect(screen.getByText(/Okay/i)).toBeTruthy();
        expect(screen.getByText(/Good/i)).toBeTruthy();
        expect(screen.getByText(/Amazing/i)).toBeTruthy();
      });
    });

    it('should show notes text input in modal', async () => {
      render(<MoodScreen />);
      const logButton =
        screen.queryByText(/\+ Log Mood/i) ||
        screen.queryByText(/Update Mood/i);
      fireEvent.press(logButton!);
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Write something/i)).toBeTruthy();
      });
    });

    it('should allow selecting a mood level', async () => {
      render(<MoodScreen />);
      const logButton =
        screen.queryByText(/\+ Log Mood/i) ||
        screen.queryByText(/Update Mood/i);
      fireEvent.press(logButton!);
      await waitFor(() => {
        expect(screen.getByAccessibilityLabel('Mood: Amazing')).toBeTruthy();
      });
      fireEvent.press(screen.getByAccessibilityLabel('Mood: Amazing'));
      expect(screen.getByAccessibilityLabel('Mood: Amazing')).toBeTruthy();
    });

    it('should allow typing notes', async () => {
      render(<MoodScreen />);
      const logButton =
        screen.queryByText(/\+ Log Mood/i) ||
        screen.queryByText(/Update Mood/i);
      fireEvent.press(logButton!);
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Write something/i)).toBeTruthy();
      });
      fireEvent.changeText(
        screen.getByPlaceholderText(/Write something/i),
        'Had a great run today!'
      );
      expect(
        screen.getByDisplayValue('Had a great run today!')
      ).toBeTruthy();
    });

    it('should close modal when Cancel is pressed', async () => {
      render(<MoodScreen />);
      const logButton =
        screen.queryByText(/\+ Log Mood/i) ||
        screen.queryByText(/Update Mood/i);
      fireEvent.press(logButton!);
      await waitFor(() => {
        expect(screen.getByText(/How are you feeling/i)).toBeTruthy();
      });
      fireEvent.press(screen.getByText(/Cancel/i));
      await waitFor(() => {
        expect(screen.queryByText(/How are you feeling/i)).toBeFalsy();
      });
    });

    it('should save mood entry and update today\'s mood display', async () => {
      render(<MoodScreen />);
      // First remove any "Today" entry so we get the "+ Log Mood" button
      const logButton = screen.queryByText(/\+ Log Mood/i);
      if (!logButton) {
        // Already has today entry — use Update Mood
        const updateButton = screen.getByText(/Update Mood/i);
        fireEvent.press(updateButton);
      } else {
        fireEvent.press(logButton);
      }
      await waitFor(() => {
        expect(screen.getByText(/How are you feeling/i)).toBeTruthy();
      });
      fireEvent.press(screen.getByAccessibilityLabel('Mood: Amazing'));
      fireEvent.press(screen.getByText(/^Save$/i));

      await waitFor(() => {
        // Should now show "Update Mood" or the mood label
        expect(
          screen.queryByText(/Update Mood/i) ||
          screen.queryByText(/Amazing/i)
        ).toBeTruthy();
      });
    });
  });

  describe('Mood History Entries', () => {
    it('should show mood emoji in each history entry', () => {
      render(<MoodScreen />);
      const goodEntries = screen.getAllByText(/Good/i);
      expect(goodEntries.length).toBeGreaterThan(0);
    });

    it('should display "Today" entry in history', () => {
      render(<MoodScreen />);
      expect(screen.getByText(/Today/i)).toBeTruthy();
    });
  });

  describe('Statistics', () => {
    it('should display a numeric average mood value', () => {
      render(<MoodScreen />);
      // Average should be shown — look for decimal number near mood section
      const avgMoodElements = screen.queryAllByText(/[0-9]\.[0-9]/);
      expect(avgMoodElements.length).toBeGreaterThan(0);
    });

    it('should display days logged count', () => {
      render(<MoodScreen />);
      // 7 entries in RECENT_ENTRIES
      expect(screen.getByText('7')).toBeTruthy();
    });
  });
});
