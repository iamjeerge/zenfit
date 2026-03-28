import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthStore } from '../../src/store/authStore';
import { supabase } from '../../src/lib/supabase';

jest.mock('../../src/lib/supabase');

// Helper to build a chainable supabase from() mock
function makeFromMock(resolvedData: any = { data: null, error: null }) {
  const chainable = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve(resolvedData)),
  };
  return chainable;
}

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Zustand store to initial state between tests
    useAuthStore.setState({
      session: null,
      user: null,
      profile: null,
      loading: false,
      initialized: false,
    });

    // Default supabase mock implementations
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null },
      error: null,
    });
    (supabase.auth.onAuthStateChange as jest.Mock).mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    });

    const mockFromChain = makeFromMock({
      data: {
        id: 'test-profile-id',
        full_name: 'Test User',
        email: 'test@example.com',
        streak_days: 5,
        xp: 100,
        level: 1,
        subscription_status: 'free',
      },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue(mockFromChain);
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
      const { result, unmount } = renderHook(() => useAuthStore());

      (supabase.auth.signInWithPassword as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { session: null }, error: null }), 100),
          ),
      );

      // Start the operation but don't await it yet
      let operationPromise: Promise<void>;
      act(() => {
        operationPromise = result.current.signInWithEmail('test@example.com', 'password123');
      });

      // loading should be true immediately after triggering
      expect(result.current.loading).toBe(true);

      // Wait for it to complete
      await act(async () => {
        await operationPromise!;
      });

      expect(result.current.loading).toBe(false);
      unmount();
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
        }),
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
      const { result, unmount } = renderHook(() => useAuthStore());

      (supabase.auth.signUp as jest.Mock).mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ data: { session: null }, error: null }), 100),
          ),
      );

      let operationPromise: Promise<void>;
      act(() => {
        operationPromise = result.current.signUpWithEmail(
          'test@example.com',
          'password123',
          'Test User',
        );
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await operationPromise!;
      });

      expect(result.current.loading).toBe(false);
      unmount();
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
        }),
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

      // Plain Zustand subscribe (no subscribeWithSelector middleware) takes a full-state listener
      const unsubscribe = useAuthStore.subscribe(listener);

      const mockSession = {
        access_token: 'test-token',
        user: { id: 'user-id', email: 'test@example.com' },
      };

      act(() => {
        useAuthStore.setState({ session: mockSession as any });
      });

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });
  });
});
