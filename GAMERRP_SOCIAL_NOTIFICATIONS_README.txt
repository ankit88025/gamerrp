GamerRP combined social notifications update

Included:
- app/feed/page.tsx: preserves the current image-post feed and adds a Notifications link.
- app/notifications/page.tsx: inbox for post likes, comments and new followers; unread state and mark-read actions.
- SUPABASE_NOTIFICATIONS_SETUP.sql: idempotent migration and database triggers for notification creation.

Install in existing ~/gamerrp only. Do not replace the project or .env.local.
1) Make a backup of app/feed/page.tsx, then extract this ZIP into ~/gamerrp, allowing the two app files and SQL file to be added/replaced.
2) Run SUPABASE_NOTIFICATIONS_SETUP.sql in Supabase SQL Editor.
3) Run: cd ~/gamerrp && npx tsc --noEmit && npm run build
4) Commit only app/feed/page.tsx and app/notifications/page.tsx after checks; keep backups and SQL out of git unless you intentionally want to version the migration.
5) Deploy and test with two accounts: Account B likes/comments on Account A's post and follows A; A should see notifications at /notifications.

Existing likes/comments/follow functionality is retained. Notification events are created by database triggers. This update does not send push/email notifications.
