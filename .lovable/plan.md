

## "Track Your Progress" Section — Investigation Result

### Current State (Education.tsx, lines 111-117)
এটা একটা **purely decorative static block**। শুধু একটা CheckCircle icon, heading "Track Your Progress", আর তিনটা promise লেখা:
- "save your progress"
- "bookmark lessons"  
- "get notified when new content drops"

### Reality Check — কোনটা actually কাজ করে?

| Promise | Status | Note |
|---------|--------|------|
| Save your progress | ❌ **Not built** | কোনো `education_progress` table নেই, কোনো "mark as complete" button নেই |
| Bookmark lessons | ❌ **Not built** | Bookmark শুধু brokers-এর জন্য আছে (`Watchlist.tsx`), lessons-এর জন্য না |
| Get notified | ❌ **Not built** | Education-specific notification subscription নেই |
| Sign up button/CTA | ❌ **Missing** | Section-এ কোনো clickable button-ই নেই — শুধু text |

### Verdict
এই section টা **ঠিকমতো কাজ করানো হয়নি**। এটা একটা "coming soon" placeholder যেখানে user-কে false promise দেওয়া হচ্ছে কিন্তু backend-এ কিচ্ছু implement করা নেই। এমনকি একটা signup CTA button-ও নেই — user click করার মতো কিছুই পাবে না।

### Two Options to Fix

**Option A — Make it real (full feature, ~30 min)**
1. New table `education_progress` (user_id, lesson_slug, completed_at, bookmarked_at)
2. RLS policies — users can only see/edit their own rows
3. "Mark as complete" + "Bookmark" toggle buttons on each lesson card
4. New dashboard page `/dashboard/learning` showing progress + bookmarks
5. Section becomes contextual: shows progress bar if logged in, signup CTA if not

**Option B — Honest placeholder (5 min)**
1. Add a real "Sign Up Free" button linking to `/signup`
2. Hide section entirely if user is already logged in
3. Keep promises but only the achievable ones (e.g., "Get notified when new courses drop" — possible via existing notifications table)

### My Recommendation
**Option B first** (quick honest fix), then Option A later as a proper feature when education hub gets more lessons. Right now there are only ~15 lessons across 3 tracks — progress tracking is overkill।

কোন option চাও? নাকি একদম remove করে দিই section টা?

