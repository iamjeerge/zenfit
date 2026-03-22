describe('Starter E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.sendToHome();
  });

  describe('App Launch', () => {
    it('should launch the app successfully', async () => {
      // App should be launched at this point
      await expect(element(by.text('ZenFit'))).toBeVisible();
    });

    it('should display splash screen on launch', async () => {
      await expect(element(by.text('ZenFit'))).toBeVisible();
      await expect(element(by.text('Mind · Body · Soul'))).toBeVisible();
    });

    it('should display animated elements on splash', async () => {
      // Animated logo and subtitle should be visible
      await expect(element(by.text('ZenFit'))).toBeVisible();
      await expect(element(by.text('Mind · Body · Soul'))).toBeVisible();
    });
  });

  describe('Navigation from Splash', () => {
    it('should navigate to onboarding after splash duration', async () => {
      // Wait for splash to navigate automatically
      await waitFor(element(by.text('Find Your Inner Peace')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text('Find Your Inner Peace'))).toBeVisible();
    });

    it('should display first onboarding page', async () => {
      await waitFor(element(by.text('Find Your Inner Peace')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text('Meditation & Mindfulness'))).toBeVisible();
      await expect(element(by.text('🧘'))).toBeVisible();
    });
  });

  describe('Onboarding Navigation', () => {
    beforeEach(async () => {
      // Make sure we're on the onboarding screen
      await waitFor(element(by.text('Find Your Inner Peace')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display skip button', async () => {
      await expect(element(by.text('Skip'))).toBeVisible();
    });

    it('should navigate to auth when skip is tapped', async () => {
      await element(by.text('Skip')).tap();

      await waitFor(element(by.text('Welcome Back')))
        .toBeVisible()
        .withTimeout(5000);

      await expect(element(by.text('Welcome Back'))).toBeVisible();
    });

    it('should display next button', async () => {
      await expect(element(by.text('Next'))).toBeVisible();
    });

    it('should advance pages when next is tapped', async () => {
      const nextButton = element(by.text('Next'));

      // First page visible
      await expect(element(by.text('Find Your Inner Peace'))).toBeVisible();

      // Tap next
      await nextButton.tap();

      // Wait for page to change (may take a moment)
      await waitFor(element(by.text('Transform Your Body')))
        .toBeVisible()
        .withTimeout(3000);

      await expect(element(by.text('Transform Your Body'))).toBeVisible();
    });

    it('should show all onboarding pages in sequence', async () => {
      const nextButton = element(by.text('Next'));

      // Page 1
      await expect(element(by.text('Find Your Inner Peace'))).toBeVisible();
      await nextButton.tap();

      // Page 2
      await waitFor(element(by.text('Transform Your Body')))
        .toBeVisible()
        .withTimeout(3000);
      await expect(element(by.text('Transform Your Body'))).toBeVisible();
      await nextButton.tap();

      // Page 3
      await waitFor(element(by.text('Nourish Your Soul')))
        .toBeVisible()
        .withTimeout(3000);
      await expect(element(by.text('Nourish Your Soul'))).toBeVisible();
    });

    it('should change button text to get started on last page', async () => {
      const nextButton = element(by.text('Next'));

      // Navigate to last page
      await nextButton.tap();
      await waitFor(element(by.text('Transform Your Body')))
        .toBeVisible()
        .withTimeout(3000);

      await nextButton.tap();
      await waitFor(element(by.text('Nourish Your Soul')))
        .toBeVisible()
        .withTimeout(3000);

      // Button should say "Get Started" instead of "Next"
      await expect(element(by.text('Get Started'))).toBeVisible();
    });

    it('should display dot indicators', async () => {
      // Dot indicators should be present
      await expect(element(by.type('RCTTouchableOpacity'))).toBeVisible();
    });
  });

  describe('Authentication Screen', () => {
    beforeEach(async () => {
      // Navigate to auth screen
      await waitFor(element(by.text('Find Your Inner Peace')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.text('Skip')).tap();

      await waitFor(element(by.text('Welcome Back')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display auth screen', async () => {
      await expect(element(by.text('Welcome Back'))).toBeVisible();
    });

    it('should display sign in and sign up toggle buttons', async () => {
      await expect(element(by.text('Sign In'))).toBeVisible();
      await expect(element(by.text('Sign Up'))).toBeVisible();
    });

    it('should display email and password fields', async () => {
      await expect(element(by.placeholder('Email Address'))).toBeVisible();
      await expect(element(by.placeholder('Password'))).toBeVisible();
    });

    it('should display CTA button', async () => {
      await expect(element(by.text('Start Your Journey'))).toBeVisible();
    });

    it('should toggle to sign up mode', async () => {
      // Get all "Sign Up" elements and tap the toggle button (first one)
      const signUpToggle = element(by.text('Sign Up')).atIndex(0);
      await signUpToggle.tap();

      // Full name field should appear
      await expect(element(by.placeholder('Full Name'))).toBeVisible();
      await expect(element(by.text('Begin Your Journey'))).toBeVisible();
    });

    it('should show full name field only in sign up mode', async () => {
      // Should not have full name in sign in mode
      await expect(element(by.placeholder('Full Name'))).not.toBeVisible();

      // Switch to sign up
      const signUpToggle = element(by.text('Sign Up')).atIndex(0);
      await signUpToggle.tap();

      // Should have full name in sign up mode
      await expect(element(by.placeholder('Full Name'))).toBeVisible();
    });

    it('should validate empty form submission', async () => {
      const submitButton = element(by.text('Start Your Journey'));
      await submitButton.tap();

      // Error message should appear
      await waitFor(element(by.text('Please enter email and password')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.text('Please enter email and password'))).toBeVisible();
    });

    it('should validate invalid email', async () => {
      const emailInput = element(by.placeholder('Email Address'));
      const passwordInput = element(by.placeholder('Password'));
      const submitButton = element(by.text('Start Your Journey'));

      await emailInput.typeText('invalid-email');
      await passwordInput.typeText('password123');
      await submitButton.tap();

      // Error should appear
      await waitFor(element(by.text('Please enter a valid email')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(element(by.text('Please enter a valid email'))).toBeVisible();
    });

    it('should validate short password', async () => {
      const emailInput = element(by.placeholder('Email Address'));
      const passwordInput = element(by.placeholder('Password'));
      const submitButton = element(by.text('Start Your Journey'));

      await emailInput.typeText('test@example.com');
      await passwordInput.typeText('123');
      await submitButton.tap();

      // Error should appear
      await waitFor(element(by.text('Password must be at least 6 characters')))
        .toBeVisible()
        .withTimeout(2000);

      await expect(
        element(by.text('Password must be at least 6 characters'))
      ).toBeVisible();
    });
  });

  describe('Full User Flow', () => {
    it('should complete splash to onboarding to auth flow', async () => {
      // Splash
      await expect(element(by.text('ZenFit'))).toBeVisible();

      // Navigate to onboarding
      await waitFor(element(by.text('Find Your Inner Peace')))
        .toBeVisible()
        .withTimeout(5000);

      // Navigate to auth
      await element(by.text('Skip')).tap();

      await waitFor(element(by.text('Welcome Back')))
        .toBeVisible()
        .withTimeout(5000);

      // Should be on auth screen
      await expect(element(by.placeholder('Email Address'))).toBeVisible();
      await expect(element(by.placeholder('Password'))).toBeVisible();
    });
  });

  describe('Device Interactions', () => {
    it('should handle multiple button taps', async () => {
      // Multiple taps should not crash app
      const skipButton = element(by.text('Skip'));

      await skipButton.tap();
      await skipButton.tap();
      await skipButton.tap();

      // App should still be responsive
      await expect(element(by.text('Welcome Back'))).toBeVisible();
    });

    it('should handle text input', async () => {
      await waitFor(element(by.text('Welcome Back')))
        .toBeVisible()
        .withTimeout(5000);

      const emailInput = element(by.placeholder('Email Address'));
      await emailInput.typeText('test@example.com');

      // Text should be entered
      await expect(element(by.placeholder('Email Address'))).toHaveToggleValue(
        true
      );
    });

    it('should handle rapid interactions', async () => {
      await waitFor(element(by.text('Find Your Inner Peace')))
        .toBeVisible()
        .withTimeout(5000);

      const nextButton = element(by.text('Next'));

      // Rapid taps
      await nextButton.multiTap(3);

      // App should still work
      await expect(element(by.text('Nourish Your Soul'))).toBeVisible();
    });
  });
});
