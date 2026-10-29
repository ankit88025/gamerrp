GamerRP Legal + Basic Security Headers Patch — tailored to the current layout/config output shared on 2026-10-29.

Includes legal starter pages, founder/partnership contact, a shared footer, current app/layout.tsx merged with SiteFooter, and basic security headers in next.config.ts.
Founder: Ankit Kumar
Public contact email: ankit88025@gmail.com

SAFE INSTALL (Mac Terminal):
1. Confirm you already have a backup archive on Desktop. The user confirmed: ~/Desktop/gamerrp-backup-20261029-052709.tar.gz
2. In Terminal run:
   cd ~/gamerrp
   cp app/layout.tsx "app/layout.tsx.before-legal-security-$(date +%Y%m%d-%H%M%S)"
   cp next.config.ts "next.config.ts.before-legal-security-$(date +%Y%m%d-%H%M%S)"
   unzip -o ~/Downloads/GamerRP-Legal-Security-Patch-For-Current-Project.zip -d .
   npx tsc --noEmit && npm run build

IMPORTANT: First download this ZIP into Downloads using the link in ChatGPT. This command overwrites only app/layout.tsx and next.config.ts among existing tracked files, and adds four legal pages plus app/components/site-footer.tsx. It does not touch .env.local, social pages, profile, pricing, chat, or your backup files. If unzip prompts about overwriting, it is expected only for layout/config if already present in the archive.

If build succeeds, test locally at /terms, /privacy, /copyright, /partnerships and confirm footer links. Then commit only intended files:
   git add app/terms/page.tsx app/privacy/page.tsx app/copyright/page.tsx app/partnerships/page.tsx app/components/site-footer.tsx app/layout.tsx next.config.ts
   git commit -m "Add GamerRP legal pages and basic security headers"
   git push origin main

Never run git add . here: there are unrelated local changes and backup files. Do not commit .env.local or backups.

SECURITY LIMITS:
These headers are basic hardening, not a complete security audit and cannot guarantee the app is unhackable. Separately verify Supabase RLS on every table and Storage bucket, test with two accounts, ensure no service-role key is in browser code, review billing/webhook verification, and enable MFA for GitHub, Vercel, Supabase, and owner email.

LEGAL NOTICE:
Legal text is starter wording, not legal advice. Check it matches actual data collection, account deletion, cookies/analytics, image storage, payment, and retention. Consider Indian legal review before commercial launch. Do not claim trademark registration or incorporation unless completed.
