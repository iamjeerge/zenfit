# Issue #7 — Progress Photos Feature

**Type:** Enhancement  
**Labels:** `enhancement`, `progress`, `camera`  
**Priority:** Medium

## Summary

Allow users to take or upload before/after progress photos that are stored securely in Supabase Storage, with a timeline view to visualise physical transformation over time.

## Motivation

Visual progress tracking is highly motivating and helps users see results that numbers alone (weight, steps) cannot capture. Progress photos are a staple of fitness apps and significantly improve long-term user retention.

## Proposed Solution

### Camera / Gallery Access

- Use `expo-image-picker` to capture a new photo or choose from the camera roll.
- Prompt user to choose a category: **Front**, **Side**, **Back**.
- Optionally overlay today's date and current weight on the photo.

### Storage

- Upload photos to Supabase Storage bucket `progress-photos/{user_id}/{date}-{category}.jpg`.
- Store metadata (bucket path, category, date, weight_at_time) in a new `progress_photos` table.
- Apply client-side compression before upload to reduce storage costs.

### Timeline View

Add a **Progress Photos** section to `ProgressScreen`:
- Horizontal scroll showing thumbnails grouped by month.
- Tap a thumbnail to view full-screen with pinch-to-zoom.
- Side-by-side comparison mode: pick any two photos to compare.

### Database Changes

```sql
create table public.progress_photos (
  id uuid primary key,
  user_id uuid references profiles(id),
  photo_url text not null,
  category text check (category in ('front', 'side', 'back', 'other')),
  weight_kg numeric(5,2),
  taken_at date not null default current_date,
  created_at timestamptz default now()
);

alter table public.progress_photos enable row level security;
create policy "Users manage own progress photos"
  on public.progress_photos for all using (auth.uid() = user_id);
```

## Acceptance Criteria

- [ ] Camera/gallery picker opens on "Add Photo" tap
- [ ] Photo is compressed and uploaded to Supabase Storage
- [ ] Metadata saved to `progress_photos` table
- [ ] Timeline displays thumbnails ordered by date (newest first)
- [ ] Full-screen view with pinch-to-zoom
- [ ] Side-by-side comparison view for any two photos
- [ ] Photos are private (RLS + signed URLs for access)
- [ ] Error handling for upload failures with retry
- [ ] Unit tests for metadata insert and URL generation

## Additional Context

- `expo-image-picker` and `expo-media-library` are available as Expo modules
- Supabase Storage supports signed URLs for private assets
