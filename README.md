# The Embrione: Meet The Team

A full-stack onboarding and moderation system for The Embrione (PES University) built for the Web Development domain recruitment challenge.

**Live site:** https://mahee-embrione-task.vercel.app

## Features

- **/register**: member form with a live card preview that updates as you type. The profile photo is converted to WebP in the browser (max 800px wide, quality 0.8) and uploaded to Supabase Storage only on submit. Submissions are saved with `status: 'pending'`, and duplicate SRNs are rejected.
- **/admin**: login-protected moderation dashboard with counters (Total, Pending, Approved) and Approve, Reject and Delete actions.
- **/team**: public directory showing only approved members, with Domain and Position filters. It is responsive and uses a dark theme.

## Tech stack

- React + Vite
- React Router
- Supabase (PostgreSQL + Storage)
- Sonner (toast notifications)
- Plain CSS
- Deployed on Vercel

## Run locally

```bash
git clone https://github.com/maheesagar7/embrione-team.git
cd embrione-team
npm install
```

Create a `.env.local` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Then start the dev server:

```bash
npm run dev
```

## Supabase setup

1. Create a project and run this in the SQL Editor:

```sql
create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null,
  position text not null,
  srn text not null,
  email text not null,
  linkedin_url text,
  github_url text,
  branch text not null,
  semester integer not null,
  bio text,
  photo_url text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.members enable row level security;
create policy "Allow public insert" on public.members for insert with check (true);
create policy "Allow public read" on public.members for select using (true);
create policy "Allow admin updates" on public.members for update using (true);
create policy "Allow admin deletes" on public.members for delete using (true);
```

2. Create a **public** Storage bucket named `member-photos`.
3. Allow uploads to it:

```sql
create policy "Allow public uploads"
on storage.objects for insert
with check (bucket_id = 'member-photos');
```

4. Seed a few rows with `status = 'approved'` so `/team` is populated.

## Admin login

| Email | Password |
|---|---|
| admin@embrione.pes.edu | EmbrioneAdmin@2026 |

## Deployment

Deployed on Vercel. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under Project Settings → Environment Variables, then redeploy.

## Notes

- Admin login is checked in the browser (a session flag), as the brief provides fixed credentials. A production app would use Supabase Auth with server-enforced row-level security.
- Photos are resized and converted to WebP client-side before upload to keep files light.