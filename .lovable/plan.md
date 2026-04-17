

## Problem
Admin panel-এ গেলে user-এর front-end-এ ফেরত আসার কোনো way নেই। AdminSidebar এবং ModeratorSidebar-এ "Back to Site" / "Return to Site" link missing. ProviderSidebar-এ আছে, কিন্তু admin/moderator sidebar-এ নাই।

## Investigation Needed
দেখি admin sidebar আর moderator sidebar-এ ঠিক কী আছে।

## Plan

### 1. AdminSidebar.tsx-এ "Back to Site" link add করা
ProviderSidebar-এর pattern follow করে — bottom-এ একটা SidebarGroup with `mt-auto` যেখানে Home icon সহ "Back to Site" link থাকবে যেটা `/` route-এ navigate করবে। Logout button-এর উপরে place হবে।

### 2. ModeratorSidebar.tsx-এ same "Back to Site" link add করা
Same pattern, same placement।

### 3. Optional — "Previous Page" button
Browser back navigation-এর জন্য `navigate(-1)` দিয়ে একটা ArrowLeft icon সহ button add করা যায়। কিন্তু sidebar-এ এটা confusing হতে পারে কারণ admin pages-এর মধ্যে navigation history থাকে। 

**Recommendation**: শুধু "Back to Site" রাখি (reliable & clear)। Previous page browser-এর native back button দিয়েই handle করা যায়।

## Files: 2
- `src/components/admin/AdminSidebar.tsx` — bottom group-এ "Back to Site" link add
- `src/components/admin/ModeratorSidebar.tsx` — same

## DB Changes
None — pure UI fix। DB-তে কিছু store করার দরকার নেই।

