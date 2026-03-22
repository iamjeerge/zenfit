import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthStore } from '../../src/store/authStore';
import { supabase } from '../../src/lib/supabase';

jest.mock('../../src/lib/supabase');

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.initialized).toBe(false);
    });

    it('should have all action methods available', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(typeof result.current.setSession).toBe('function');
      expect(typeof result.current.signInWithEmail).toBe('function');
      expect(typeof result.current.signUpWithEmail).toBe('function');
      expect(typeof result.current.signOut).toBe('function');
      expect(typeof result.current.fetchProfile).toBe('function');
      expect(typeof result.current.updateProfile).toBe('function');
      expect(typeof result.current.initialize).toBe('function');
    });
  });

  describe('setSession', () => {
    it('should update session state', () => {
      const { result } = renderHook(() => useAuthStore());

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      act(() => {
        result.current.setSession(mockSession as any);
      });

      expect(result.current.session).toEqual(mockSession);
    });

    it('should update user state from session', () => {
      const { result } = renderHook(() => useAuthStore());

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      act(() => {
        result.current.setSession(mockSession as any);
      });

      expect(result.current.user).toEqual(mockSession.user);
    });

    it('should clear session when null is passed', () => {
      const { result } = renderHook(() => useAuthStore());

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      act(() => {
        result.current.setSession(mockSession as any);
      });

      expect(result.current.session).not.toBeNull();

      act(() => {
        result.current.setSession(null);
      });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in user with valid credentials', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      await act(async () => {
        await result.current.signInWithEmail('test@example.com', 'password123');
      });

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockSession.user);
    });

    it('should set loading state during sign in', async () => {
      const { result } = renderHook(() => useAuthStore());

      (supabase.auth.signInWithPassword as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { session: null }, error: null }), 100))
      );

      const promise = act(async () => {
        await result.current.signInWithEmail('test@example.com', 'password123');
      });

      expect(result.current.loading).toBe(true);

      await promise;

      expect(result.current.loading).toBe(false);
    });

    it('should fetch profile after successful sign in', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      await act(async () => {
        await result.current.signInWithEmail('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });
    });

    it('should handle sign in errors', async () => {
      const { result } = renderHook(() => useAuthStore());

      const errorMessage = 'Invalid credentials';
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: new Error(errorMessage),
      });

      await expect(
        act(async () => {
          await result.current.signInWithEmail('test@example.com', 'wrong-password');
        })
      ).rejects.toBeDefined();
    });

    it('should call supabase signInWithPassword with correct parameters', async () => {
      const { result } = renderHook(() => useAuthStore());

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      await act(async () => {
        await result.current.signInWithEmail('test@example.com', 'password123');
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  describe('signUpWithEmail', () => {
    it('should sign up user with valid data', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      await act(async () => {
        await result.current.signUpWithEmail('test@example.com', 'password123', 'Test User');
      });

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockSession.user);
    });

    it('should set loading state during sign up', async () => {
      const { result } = renderHook(() => useAuthStore());

      (supabase.auth.signUp as jest.Mock).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: { session: null }, error: null }), 100))
      );

      const promise = act(async () => {
        await result.current.signUpWithEmail('test@example.com', 'password123', 'Test User');
      });

      expect(result.current.loading).toBe(true);

      await promise;

      expect(result.current.loading).toBe(false);
    });

    it('should pass full name in user metadata', async () => {
      const { result } = renderHook(() => useAuthStore());

      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      await act(async () => {
        await result.current.signUpWithEmail('test@example.com', 'password123', 'Test User');
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { data: { full_name: 'Test User' } },
      });
    });

    it('should handle sign up errors', async () => {
      const { result } = renderHook(() => useAuthStore());

      const errorMessage = 'Email already exists';
      (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: new Error(errorMessage),
      });

      await expect(
        act(async () => {
          await result.current.signUpWithEmail('existing@example.com', 'password123', 'Test User');
        })
      ).rejects.toBeDefined();
    });
  });

  describe('signOut', () => {
    it('should clear all auth state on sign out', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set initial state
      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      act(() => {
        result.current.setSession(mockSession as any);
      });

      expect(result.current.session).not.toBeNull();

      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
    });

    it('should call supabase signOut', async () => {
      const { result } = renderHook(() => useAuthStore());

      (supabase.auth.signOut as jest.Mock).mockResolvedValueOnce({ error: null });

      await act(async () => {
        await result.current.signOut();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('fetchProfile', () => {
    it('should fetch profile for current user', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      act(() => {
        result.current.setSession(mockSession as any);
      });

      const mockProfile = {
        id: 'user-id',
        full_name: 'Test User',
        streak_days: 5,
        xp: 100,
        level: 1,
      };

      await act(async () => {
        await result.current.fetchProfile();
      });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });
    });

    it('should not fetch profile if no user', async () => {
      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.fetchProfile();
      });

      expect(result.current.profile).toBeNull();
    });

    it('should update profile state with fetched data', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      act(() => {
        result.current.setSession(mockSession as any);
      });

      await act(async () => {
        await result.current.fetchProfile();
      });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
        expect(result.current.profile?.id).toBe('test-profile-id');
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile data', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      act(() => {
        result.current.setSession(mockSession as any);
      });

      const updates = { full_name: 'Updated User' };

      await act(async () => {
        await result.current.updateProfile(updates);
      });

      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('should not update if no user', async () => {
      const { result } = renderHook(() => useAuthStore());

      const updates = { full_name: 'Updated User' };

      await act(async () => {
        await result.current.updateProfile(updates);
      });

      expect(result.current.profile).toBeNull();
    });
  });

  describe('initialize', () => {
    it('should set initialized flag to true', async () => {
      const { result } = renderHook(() => useAuthStore());

      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValueOnce({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      await act(async () => {
        await result.current.initialize();
      });

      expect(result.current.initialized).toBe(true);
    });

    it('should check existing session on initialize', async () => {
      const { result } = renderHook(() => useAuthStore());

      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValueOnce({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      await act(async () => {
        await result.current.initialize();
      });

      expect(supabase.auth.getSession).toHaveBeenCalled();
    });

    it('should setup auth state listener on initialize', async () => {
      const { result } = renderHook(() => useAuthStore());

      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValueOnce({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      await act(async () => {
        await result.current.initialize();
      });

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled();
    });

    it('should fetch profile if session exists', async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValueOnce({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      await act(async () => {
        await result.current.initialize();
      });

      await waitFor(() => {
        expect(result.current.initialized).toBe(true);
      });
    });
  });

  describe('Zustand Store Behavior', () => {
    it('should maintain state across multiple hook calls', () => {
      const { result: result1 } = renderHook(() => useAuthStore());
      const { result: result2 } = renderHook(() => useAuthStore());

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      act(() => {
        result1.current.setSession(mockSession as any);
      });

      expect(result2.current.session).toEqual(mockSession);
    });

    it('should allow subscribing to state changes', () => {
      const listener = jest.fn();

      const unsubscribe = useAuthStore.subscribe(
        (state) => state.session,
        listener
      );

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      act(() => {
        useAuthStore.setState({ session: mockSession });
      });

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });
  });
});
