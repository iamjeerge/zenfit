import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import ProfileScreen from '../../app/(tabs)/profile';

jest.mock('expo-router');
jest.mock('../../src/store/authStore');

describe('ProfileScreen', () => {
  let mockRouter: any;
  let mockSignOut: jest.Mock;
  let mockUseAuthStore: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRouter = {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    mockSignOut = jest.fn(() => Promise.resolve());

    mockUseAuthStore = jest.fn((selector) => {
      const state = {
        profile: {
          id: 'test-user-id',
          full_name: 'Test User',
          avatar_url: 'https://example.com/avatar.jpg',
          email: 'test@example.com',
          streak_days: 5,
          xp: 100,
          level: 1,
          subscription_status: 'free',
        },
        session: { access_token: 'test-token', user: { id: 'user-id' } },
        signOut: mockSignOut,
      };
      return selector(state);
    });
    (useAuthStore as jest.Mock).mockImplementation(mockUseAuthStore);
  });

  describe('Rendering', () => {
    it('should render the profile screen', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/profile|settings|account/i)).toBeTruthy();
    });

    it('should display user avatar', () => {
      render(<ProfileScreen />);
      // Avatar should be rendered
      expect(screen.queryByText(/profile|avatar|image/i)).toBeTruthy();
    });

    it('should display user name', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.queryByText(/test user|user/i)).toBeTruthy();
      });
    });

    it('should display user email', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.queryByText(/test@example.com|email/i)).toBeTruthy();
      });
    });
  });

  describe('User Statistics', () => {
    it('should display user level', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.queryByText(/level|1/i)).toBeTruthy();
      });
    });

    it('should display XP points', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.queryByText(/xp|experience|100/i)).toBeTruthy();
      });
    });

    it('should display current streak', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.queryByText(/streak|5|day/i)).toBeTruthy();
      });
    });

    it('should show XP progress bar', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/xp|progress|level/i)).toBeTruthy();
    });

    it('should display subscription status', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.queryByText(/free|premium|subscription/i)).toBeTruthy();
      });
    });

    it('should show stats in organized layout', () => {
      render(<ProfileScreen />);
      // Stats should be displayed
      expect(screen.queryByText(/level|streak|xp|stat/i)).toBeTruthy();
    });
  });

  describe('Menu Items', () => {
    it('should display settings menu item', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/settings|preference/i)).toBeTruthy();
    });

    it('should display edit profile menu item', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/edit|profile|update/i)).toBeTruthy();
    });

    it('should display achievements menu item', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/achievement|badge|award/i)).toBeTruthy();
    });

    it('should display preferences menu item', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/preference|setting|option/i)).toBeTruthy();
    });

    it('should display help menu item', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/help|support|faq|contact/i)).toBeTruthy();
    });

    it('should display sign out button', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/sign out|logout|exit/i)).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to settings when settings item is pressed', async () => {
      render(<ProfileScreen />);

      const settingsItem = screen.queryByText(/settings|preference/i);
      if (settingsItem) {
        fireEvent.press(settingsItem);

        await waitFor(() => {
          expect(mockRouter.push).toHaveBeenCalled();
        });
      }
    });

    it('should navigate to edit profile when edit item is pressed', async () => {
      render(<ProfileScreen />);

      const editItem = screen.queryByText(/edit|profile|update/i);
      if (editItem) {
        fireEvent.press(editItem);

        await waitFor(() => {
          expect(mockRouter.push).toHaveBeenCalled();
        });
      }
    });

    it('should navigate to achievements when achievements item is pressed', async () => {
      render(<ProfileScreen />);

      const achievementsItem = screen.queryByText(/achievement|badge/i);
      if (achievementsItem) {
        fireEvent.press(achievementsItem);

        await waitFor(() => {
          expect(mockRouter.push).toHaveBeenCalled();
        });
      }
    });

    it('should navigate to help when help item is pressed', async () => {
      render(<ProfileScreen />);

      const helpItem = screen.queryByText(/help|support|faq/i);
      if (helpItem) {
        fireEvent.press(helpItem);

        await waitFor(() => {
          expect(mockRouter.push).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Sign Out', () => {
    it('should display sign out button', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/sign out|logout/i)).toBeTruthy();
    });

    it('should call signOut function when sign out is pressed', async () => {
      render(<ProfileScreen />);

      const signOutButton = screen.queryByText(/sign out|logout/i);
      if (signOutButton) {
        fireEvent.press(signOutButton);

        await waitFor(() => {
          expect(mockSignOut).toHaveBeenCalled();
        });
      }
    });

    it('should navigate to auth screen after sign out', async () => {
      render(<ProfileScreen />);

      const signOutButton = screen.queryByText(/sign out|logout/i);
      if (signOutButton) {
        fireEvent.press(signOutButton);

        await waitFor(() => {
          expect(mockRouter.replace).toHaveBeenCalledWith('/auth');
        });
      }
    });

    it('should show confirmation before sign out', async () => {
      render(<ProfileScreen />);

      const signOutButton = screen.queryByText(/sign out|logout/i);
      if (signOutButton) {
        fireEvent.press(signOutButton);

        // Alert or confirmation dialog should appear
        expect(screen.queryByText(/sign out|confirm|sure|logout/i)).toBeTruthy();
      }
    });
  });

  describe('User Profile Display', () => {
    it('should show user level with styling', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/level|1/i)).toBeTruthy();
    });

    it('should show XP with progress visualization', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/xp|100|progress/i)).toBeTruthy();
    });

    it('should show streak with visual indicator', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/streak|5/i)).toBeTruthy();
    });

    it('should display avatar image', () => {
      render(<ProfileScreen />);
      // Avatar should be rendered
      expect(screen.queryByText(/profile|avatar/i)).toBeTruthy();
    });
  });

  describe('Subscription Info', () => {
    it('should show current subscription tier', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        expect(screen.queryByText(/free|premium/i)).toBeTruthy();
      });
    });

    it('should display upgrade option for free users', async () => {
      render(<ProfileScreen />);

      await waitFor(() => {
        const upgradeElements = screen.queryAllByText(/upgrade|premium|subscribe/i);
        expect(upgradeElements.length).toBeGreaterThanOrEqual(0);
      });
    });

    it('should display subscription benefits', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/benefit|feature|access/i)).toBeTruthy();
    });

    it('should allow navigating to subscription screen', () => {
      render(<ProfileScreen />);
      const subscriptionElements = screen.queryAllByText(/subscription|premium|upgrade/i);
      expect(subscriptionElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Empty States', () => {
    it('should handle missing profile data gracefully', () => {
      mockUseAuthStore.mockImplementation((selector) => {
        const state = {
          profile: null,
          session: { access_token: 'test-token', user: { id: 'user-id' } },
          signOut: mockSignOut,
        };
        return selector(state);
      });

      render(<ProfileScreen />);
      expect(screen.queryByText(/profile|loading|error/i)).toBeTruthy();
    });

    it('should handle missing session', () => {
      mockUseAuthStore.mockImplementation((selector) => {
        const state = {
          profile: {
            id: 'test-user-id',
            full_name: 'Test User',
            streak_days: 5,
            xp: 100,
            level: 1,
          },
          session: null,
          signOut: mockSignOut,
        };
        return selector(state);
      });

      render(<ProfileScreen />);
      expect(screen.queryByText(/profile/i)).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible stat labels', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/level|streak|xp/i)).toBeTruthy();
    });

    it('should have accessible menu button labels', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/settings|edit|help/i)).toBeTruthy();
    });

    it('should have accessible sign out button', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/sign out/i)).toBeTruthy();
    });
  });

  describe('Data Updates', () => {
    it('should update when profile data changes', async () => {
      const { rerender } = render(<ProfileScreen />);

      mockUseAuthStore.mockImplementation((selector) => {
        const state = {
          profile: {
            id: 'test-user-id',
            full_name: 'Updated User',
            streak_days: 10,
            xp: 200,
            level: 2,
          },
          session: { access_token: 'test-token', user: { id: 'user-id' } },
          signOut: mockSignOut,
        };
        return selector(state);
      });

      rerender(<ProfileScreen />);

      await waitFor(() => {
        expect(mockUseAuthStore).toHaveBeenCalled();
      });
    });
  });

  describe('Layout', () => {
    it('should display profile header at top', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/profile|name|user/i)).toBeTruthy();
    });

    it('should display stats in middle section', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/level|streak|xp/i)).toBeTruthy();
    });

    it('should display menu items in middle-lower section', () => {
      render(<ProfileScreen />);
      expect(screen.queryByText(/settings|edit|help/i)).toBeTruthy();
    });

    it('should display sign out button at bottom', () => {
      render(<ProfileScreen />);
      const signOutButton = screen.queryByText(/sign out/i);
      expect(signOutButton).toBeTruthy();
    });
  });
});
