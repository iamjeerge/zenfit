# Issue #13 — In-App Stripe Subscription Flow

**Type:** Enhancement  
**Labels:** `enhancement`, `payments`, `subscription`  
**Priority:** High

## Summary

The `SubscriptionScreen` currently displays a static premium plan card. Connect it to a real Stripe payment flow so users can subscribe, manage their subscription, and unlock premium features — all within the app.

## Motivation

Monetisation is essential for sustaining open-source development. The Stripe infrastructure (table, customer ID columns, webhook fields) is already in the database schema. Completing the checkout flow activates the revenue model.

## Proposed Solution

### Checkout Flow

1. User taps "Start Free Trial" or "Subscribe" in `SubscriptionScreen`.
2. App calls a Supabase Edge Function `create-checkout-session` which creates a Stripe Checkout Session.
3. Open the Stripe-hosted checkout URL in an in-app browser (`expo-web-browser`).
4. On success, Stripe sends a webhook to `stripe-webhook` Edge Function which updates `profiles.subscription_status = 'premium'`.
5. App detects the change via Supabase real-time subscription and unlocks premium content.

### Supabase Edge Functions Required

```
supabase/functions/
  create-checkout-session/index.ts  -- creates Stripe checkout URL
  stripe-webhook/index.ts           -- handles payment_intent.succeeded, subscription events
  cancel-subscription/index.ts      -- cancels via Stripe API
```

### Premium Features Gate

Define a `isPremium` selector in `authStore.ts` and use it to:
- Lock advanced yoga classes (`is_premium = true` videos)
- Lock AI workout recommendations
- Lock progress photos storage > 10 photos
- Show "Upgrade" prompts with `SubscriptionScreen` modal

### Environment Variables

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...          # server-side only
STRIPE_WEBHOOK_SECRET=whsec_...       # server-side only
```

## Acceptance Criteria

- [ ] "Subscribe" button opens Stripe Checkout in in-app browser
- [ ] Successful payment updates `profiles.subscription_status` to `'premium'`
- [ ] Failed/cancelled payment shows appropriate error UI
- [ ] Existing subscribers see "Manage Subscription" (links to Stripe Customer Portal)
- [ ] Cancellation works end-to-end
- [ ] Webhook handles `customer.subscription.deleted` (revoke premium)
- [ ] Premium content is gated behind `isPremium` check
- [ ] Stripe keys never exposed in client bundle (server functions only)

## Additional Context

- `subscriptions` table already exists in `supabase/schema.sql` with Stripe columns
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is in `.env.example`
- Price IDs need to be created in the Stripe Dashboard first
