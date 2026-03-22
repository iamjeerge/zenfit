import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import WorkoutScreen from '../../src/screens/WorkoutScreen';

describe('WorkoutScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the workout tracker screen', () => {
      render(<WorkoutScreen />);
      expect(screen.getByText(/Workout Tracker/i)).toBeTruthy();
    });

    it('should display the subtitle', () => {
      render(<WorkoutScreen />);
      expect(screen.getByText(/Build strength/i)).toBeTruthy();
    });

    it('should show start workout button', () => {
      render(<WorkoutScreen />);
      expect(screen.getByText(/Start Workout/i)).toBeTruthy();
    });

    it('should display summary stats', () => {
      render(<WorkoutScreen />);
      expect(screen.getByText(/Exercises/i)).toBeTruthy();
      expect(screen.getByText(/Volume/i)).toBeTruthy();
      expect(screen.getByText(/Total Sets/i)).toBeTruthy();
    });

    it('should show quick add section', () => {
      render(<WorkoutScreen />);
      expect(screen.getByText(/Quick Add/i)).toBeTruthy();
    });

    it('should render preset exercises', () => {
      render(<WorkoutScreen />);
      expect(screen.getByText(/Push-ups/i)).toBeTruthy();
      expect(screen.getByText(/Squats/i)).toBeTruthy();
      expect(screen.getByText(/Pull-ups/i)).toBeTruthy();
    });

    it('should show today\'s exercises section', () => {
      render(<WorkoutScreen />);
      expect(screen.getByText(/Today's Exercises/i)).toBeTruthy();
    });

    it('should show empty state when no exercises logged', () => {
      render(<WorkoutScreen />);
      expect(screen.getByText(/No exercises logged yet/i)).toBeTruthy();
    });

    it('should show recent sessions section', () => {
      render(<WorkoutScreen />);
      expect(screen.getByText(/Recent Sessions/i)).toBeTruthy();
    });

    it('should display recent session data', () => {
      render(<WorkoutScreen />);
      expect(screen.getByText(/Yesterday/i)).toBeTruthy();
      expect(screen.getByText(/2 days ago/i)).toBeTruthy();
    });
  });

  describe('Workout Toggle', () => {
    it('should toggle to "End Workout" when start is pressed', () => {
      render(<WorkoutScreen />);
      const startButton = screen.getByText(/Start Workout/i);
      fireEvent.press(startButton);
      expect(screen.getByText(/End Workout/i)).toBeTruthy();
    });

    it('should toggle back to "Start Workout" when end is pressed', () => {
      render(<WorkoutScreen />);
      const startButton = screen.getByText(/Start Workout/i);
      fireEvent.press(startButton);
      const endButton = screen.getByText(/End Workout/i);
      fireEvent.press(endButton);
      expect(screen.getByText(/Start Workout/i)).toBeTruthy();
    });
  });

  describe('Add Exercise Modal', () => {
    it('should open modal when "+ Add" button is pressed', async () => {
      render(<WorkoutScreen />);
      const addButton = screen.getByText(/\+ Add/i);
      fireEvent.press(addButton);
      await waitFor(() => {
        expect(screen.getByText(/Add Exercise/i)).toBeTruthy();
      });
    });

    it('should show exercise name input in modal', async () => {
      render(<WorkoutScreen />);
      fireEvent.press(screen.getByText(/\+ Add/i));
      await waitFor(() => {
        expect(screen.getByText(/Exercise Name/i)).toBeTruthy();
      });
    });

    it('should show sets, reps, and weight inputs', async () => {
      render(<WorkoutScreen />);
      fireEvent.press(screen.getByText(/\+ Add/i));
      await waitFor(() => {
        expect(screen.getByText(/Sets/i)).toBeTruthy();
        expect(screen.getByText(/Reps/i)).toBeTruthy();
        expect(screen.getByText(/Weight/i)).toBeTruthy();
      });
    });

    it('should close modal when Cancel is pressed', async () => {
      render(<WorkoutScreen />);
      fireEvent.press(screen.getByText(/\+ Add/i));
      await waitFor(() => {
        expect(screen.getByText(/Add Exercise/i)).toBeTruthy();
      });
      fireEvent.press(screen.getByText(/Cancel/i));
      await waitFor(() => {
        expect(screen.queryByText(/Add Exercise/i)).toBeFalsy();
      });
    });

    it('should add exercise to list when saved', async () => {
      render(<WorkoutScreen />);
      fireEvent.press(screen.getByText(/\+ Add/i));
      await waitFor(() => {
        expect(screen.getByText(/Add Exercise/i)).toBeTruthy();
      });

      const nameInput = screen.getByDisplayValue('');
      fireEvent.changeText(nameInput, 'Burpees');

      fireEvent.press(screen.getByText(/^Save$/i));
      await waitFor(() => {
        expect(screen.getByText(/Burpees/i)).toBeTruthy();
      });
    });

    it('should not save exercise when name is empty', async () => {
      render(<WorkoutScreen />);
      fireEvent.press(screen.getByText(/\+ Add/i));
      await waitFor(() => {
        expect(screen.getByText(/Add Exercise/i)).toBeTruthy();
      });
      fireEvent.press(screen.getByText(/^Save$/i));
      // Modal should remain open (name is empty)
      expect(screen.getByText(/Add Exercise/i)).toBeTruthy();
    });
  });

  describe('Quick Add', () => {
    it('should open modal with preset name when a preset is tapped', async () => {
      render(<WorkoutScreen />);
      fireEvent.press(screen.getByText(/Push-ups/i));
      await waitFor(() => {
        expect(screen.getByText(/Add Exercise/i)).toBeTruthy();
        expect(screen.getByDisplayValue('Push-ups')).toBeTruthy();
      });
    });
  });

  describe('Remove Exercise', () => {
    it('should remove exercise when remove button is pressed', async () => {
      render(<WorkoutScreen />);

      // Add an exercise first
      fireEvent.press(screen.getByText(/\+ Add/i));
      await waitFor(() => expect(screen.getByText(/Add Exercise/i)).toBeTruthy());
      const nameInput = screen.getByDisplayValue('');
      fireEvent.changeText(nameInput, 'Lunges');
      fireEvent.press(screen.getByText(/^Save$/i));

      await waitFor(() => expect(screen.getByText(/Lunges/i)).toBeTruthy());

      // Remove it
      const removeButton = screen.getByAccessibilityLabel('Remove exercise');
      fireEvent.press(removeButton);

      await waitFor(() => {
        expect(screen.queryByText(/Lunges/i)).toBeFalsy();
      });
    });
  });

  describe('Summary Stats', () => {
    it('should update exercises count after adding exercise', async () => {
      render(<WorkoutScreen />);
      fireEvent.press(screen.getByText(/\+ Add/i));
      await waitFor(() => expect(screen.getByText(/Add Exercise/i)).toBeTruthy());
      const nameInput = screen.getByDisplayValue('');
      fireEvent.changeText(nameInput, 'Jump Rope');
      fireEvent.press(screen.getByText(/^Save$/i));

      await waitFor(() => {
        // Exercise count should be 1
        expect(screen.getByText('1')).toBeTruthy();
      });
    });
  });
});
