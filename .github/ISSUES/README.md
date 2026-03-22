# ZenFit — Improvements & Feature Issues Index

This directory contains detailed issue documents for all planned improvements to ZenFit.
Each file is structured as a GitHub Issue and can be directly copy-pasted when opening issues in the tracker.

---

## Summary Table

| # | Title | Priority | Labels |
|---|-------|----------|--------|
| [01](01-profile-screen-navigation.md) | Wire up Profile Screen Navigation | 🔴 High | `enhancement` `navigation` |
| [02](02-workout-tracker-supabase-persistence.md) | Workout Tracker — Supabase Persistence | 🔴 High | `enhancement` `backend` `workout` |
| [03](03-sleep-tracker-persistence-wearables.md) | Sleep Tracker — Supabase Persistence & Wearable Integration | 🔴 High | `enhancement` `backend` `sleep` `wearables` |
| [04](04-mood-journal-persistence-insights.md) | Mood Journal — Supabase Persistence & Insights | 🔴 High | `enhancement` `backend` `mood` |
| [05](05-social-friends-leaderboard.md) | Social Features: Friends & Global Leaderboard | 🟡 Medium | `enhancement` `social` |
| [06](06-ai-personalised-workout-recommendations.md) | AI-Powered Personalised Workout Recommendations | 🟡 Medium | `enhancement` `AI` `workout` |
| [07](07-progress-photos.md) | Progress Photos Feature | 🟡 Medium | `enhancement` `progress` `camera` |
| [08](08-custom-workout-plan-builder.md) | Custom Workout Plan Builder | 🟡 Medium | `enhancement` `workout` |
| [09](09-bmi-body-metrics-calculator.md) | BMI & Body Metrics Calculator | 🟢 Low | `enhancement` `health-metrics` |
| [10](10-offline-data-sync.md) | Offline Data Sync & Local Caching | 🟡 Medium | `enhancement` `offline` `performance` |
| [11](11-push-notification-reminders.md) | Deep Push Notification Reminders | 🟡 Medium | `enhancement` `notifications` |
| [12](12-wearable-apple-watch-wear-os-integration.md) | Deeper Apple Watch & Wear OS Integration | 🟡 Medium | `enhancement` `wearables` `health` |
| [13](13-stripe-subscription-flow.md) | In-App Stripe Subscription Flow | 🔴 High | `enhancement` `payments` `subscription` |
| [14](14-dark-light-theme-toggle.md) | Dark / Light Theme Toggle | 🟢 Low | `enhancement` `UI` `accessibility` |
| [15](15-onboarding-personalisation.md) | Onboarding Personalisation Improvements | 🟡 Medium | `enhancement` `onboarding` `UX` |

---

## Suggested Implementation Order

### Sprint 1 — Core Data Persistence (Issues 1–4)
These unlock the value of features already built:
1. **#01** — Profile navigation (low effort, high impact — unlocks all screens)
2. **#02** — Workout Tracker persistence (Supabase integration)
3. **#03** — Sleep Tracker persistence + wearable auto-fill
4. **#04** — Mood Journal persistence + insights

### Sprint 2 — Engagement & Monetisation (Issues 11, 13, 15)
5. **#11** — Push notification reminders (drives daily habit)
6. **#13** — Stripe subscription flow (enables revenue)
7. **#15** — Onboarding personalisation (improves activation)

### Sprint 3 — Advanced Features (Issues 5–8)
8. **#06** — AI workout recommendations (differentiator)
9. **#05** — Social / leaderboard (retention driver)
10. **#08** — Custom workout plan builder
11. **#07** — Progress photos

### Sprint 4 — Polish & Infrastructure (Issues 9, 10, 12, 14)
12. **#12** — Deeper wearable integration
13. **#10** — Offline sync
14. **#09** — BMI calculator
15. **#14** — Dark/light theme

---

## How to Use These Documents

1. Open the GitHub repository at https://github.com/iamjeerge/zenfit
2. Navigate to **Issues** → **New Issue**
3. Choose the relevant template (Feature Request / Bug Report)
4. Copy the content of the corresponding `.md` file in this directory
5. Assign labels, priority milestone, and assignee as appropriate
