# Issue #9 — BMI & Body Metrics Calculator

**Type:** Enhancement  
**Labels:** `enhancement`, `health-metrics`  
**Priority:** Low

## Summary

Add a Body Metrics section to `ProgressScreen` (or a dedicated screen) that calculates BMI, BMR, TDEE, and ideal weight range from the user's height, weight, age, and activity level — with visual gauges and trend tracking.

## Motivation

Metrics like BMI, Basal Metabolic Rate (BMR), and Total Daily Energy Expenditure (TDEE) give users a science-backed starting point for nutrition and fitness goals. These numbers are foundational for calorie targets in the Nutrition screen.

## Proposed Solution

### Calculations

| Metric | Formula |
|--------|---------|
| **BMI** | weight(kg) / height(m)² |
| **BMR** | Mifflin-St Jeor equation |
| **TDEE** | BMR × activity multiplier |
| **Ideal Weight** | Devine formula (range) |

### UI Components

- **BMI Gauge** — colour-coded arc (Underweight / Normal / Overweight / Obese) with the user's value plotted.
- **Calorie Needs Card** — shows BMR and TDEE based on selected activity level (Sedentary → Very Active).
- **Weight Trend Graph** — 30-day line chart of logged weight readings (pulled from `profiles.weight_kg` history).

### Weight History Tracking

```sql
create table public.weight_logs (
  id uuid primary key,
  user_id uuid references profiles(id),
  weight_kg numeric(5,2) not null,
  logged_at date not null default current_date,
  unique(user_id, logged_at)
);
```

### Integration

- Auto-populate inputs from `profiles` (height_cm, weight_kg, date_of_birth, gender).
- Link TDEE result to Nutrition screen calorie goal.

## Acceptance Criteria

- [ ] BMI calculated and shown on a colour-coded gauge
- [ ] BMR and TDEE displayed with selectable activity level
- [ ] Ideal weight range displayed
- [ ] Weight log table created and values can be entered over time
- [ ] 30-day weight trend chart
- [ ] TDEE value offered as suggested calorie goal in Nutrition screen
- [ ] Inputs update in real-time as user adjusts sliders
- [ ] Unit tests for all calculation functions

## Additional Context

- Height and weight are already stored in `profiles` — this feature just extends their use.
