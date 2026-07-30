# Gamtaa Barattoota Shanan Gibee (Shanan Gibe Student Union) — Website

Full-stack MERN website for the Shanan Gibe Student Union at Jimma University.
Bilingual: English (en) + Afaan Oromo (or).

## Project Structure
```
shanan-gibe-union/
├── backend/     ← Node.js + Express + MongoDB API
└── frontend/    ← React (Vite) + i18next bilingual frontend
```

## Phase 1 — Completed ✅
- Project scaffold
- MongoDB connection (Mongoose)
- Member model (auth + membership status + leadership fields)
- JWT-based register / login / profile
- Admin middleware (role-based access: member / exec / admin)
- Admin member-management endpoints (approve, promote, remove)
- Public leadership directory endpoint

## Phase 2 — Completed ✅
- **Announcements (News & Events)** — bilingual (en/or) posts with comments from active members
- **Gallery** — image albums with bilingual captions
- **Blog/Articles** — member-authored posts (learning/teaching content, advice for new students), single language per post
- **Support Requests** — mentorship, conflict-resolution, orientation-help, general-support tickets; visible to all execs by default, with optional single-exec assignment; threaded responses
- **Image upload** — local file upload endpoint (`/api/upload`) used by gallery, blog covers, and profile photos

## Running the backend locally

1. Install MongoDB locally, or create a free MongoDB Atlas cluster.
2. In `backend/`, copy the env template:
   ```
   cp .env.example .env
   ```
3. Fill in `.env`:
   - `MONGO_URI` — your MongoDB connection string
   - `JWT_SECRET` — any long random string
4. Install dependencies and start:
   ```
   cd backend
   npm install
   npm run dev
   ```
5. Server runs at `http://localhost:5000`. Test it:
   ```
   GET  http://localhost:5000/api/health
   ```

## API Endpoints so far

| Method | Endpoint                  | Access        | Description                          |
|--------|----------------------------|---------------|---------------------------------------|
| POST   | /api/auth/register          | Public        | Register as a new member (pending)    |
| POST   | /api/auth/login             | Public        | Login, returns JWT                    |
| GET    | /api/auth/profile           | Private       | Get own profile                       |
| PUT    | /api/auth/profile           | Private       | Update own profile                    |
| GET    | /api/members/leadership     | Public        | List active exec/admin members        |
| GET    | /api/members                | Admin only    | List all members (filter by status/role/campus/search) |
| GET    | /api/members/:id            | Admin only    | Get one member                        |
| PUT    | /api/members/:id            | Admin only    | Approve/promote member, edit leadership info |
| DELETE | /api/members/:id            | Admin only    | Remove a member                       |

**Note:** the very first admin account must be created manually (e.g. register normally, then update that member's `role` to `"admin"` directly in the database) — there's no public "create admin" endpoint, for security.

### Announcements (News & Events) — `/api/announcements`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | / | Public | List announcements (`?type=news` or `?type=event`) |
| GET | /:id | Public | Get one (with comments) |
| POST | / | Exec+Admin | Create (requires title_en, title_or, content_en, content_or) |
| PUT | /:id | Exec+Admin | Update |
| DELETE | /:id | Admin | Delete |
| POST | /:id/comments | Active members | Add comment |
| DELETE | /:id/comments/:commentId | Owner or Admin | Remove comment |

### Gallery — `/api/gallery`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | / | Public | List images (`?album=...`) |
| POST | / | Exec+Admin | Add image (needs `imageUrl` from `/api/upload`) |
| DELETE | /:id | Admin | Remove image |

### Blog/Articles — `/api/blog`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | / | Public | List published posts (`?language=en\|or`) |
| GET | /:id | Public | Get one post |
| POST | / | Active members | Create post |
| PUT | /:id | Owner or Admin | Update / admin can publish/unpublish |
| DELETE | /:id | Owner or Admin | Delete |

### Support Requests — `/api/support-requests`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | / | Any member | Submit request (category, subject, description) |
| GET | /my | Owner | My own requests |
| GET | / | Exec+Admin | All requests (`?status=&category=&assignedTo=`) |
| GET | /:id | Owner or Exec+Admin | Get one |
| PUT | /:id | Exec+Admin | Update status / assign to an exec |
| POST | /:id/responses | Owner or Exec+Admin | Add a response |

### Upload — `/api/upload`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | / | Any logged-in member | Upload image (form field: `image`), returns `{ imageUrl }` |

## Next Steps
The core 5-phase build is complete. See `DEPLOYMENT.md` for how to put this live. Reasonable follow-ups if you want to keep going:
- A slimmer exec-only admin view (Announcements + Gallery only, without full member/admin management)
- Cloud image storage (Cloudinary/S3) so uploads survive redeploys in production
- Email notifications (e.g. notify a member when their support request gets a response)

---

## Phase 5b — Completed ✅
- **Admin → Support Requests**: filter by status/category, view any request's full thread, assign it to a specific exec/admin, change its status, and reply — all from `/admin/support`
- **Testing pass**: traced every frontend API call against its backend route/controller by hand (couldn't run a live MongoDB in the sandbox this was built in, so this was a full manual contract review rather than an automated test suite). Found and fixed one real bug: editing an announcement's type (news ↔ event) was silently ignored by the backend, leaving stale event fields on the record — now fixed, with type changes properly clearing/setting `eventDate`/`location`.
- **Deployment guide** (`DEPLOYMENT.md`): step-by-step for MongoDB Atlas, backend hosting (Render), frontend hosting (Vercel/Netlify), CORS, custom domains, and a post-deploy checklist. Also added `vercel.json` and `public/_redirects` so React Router's client-side routes don't 404 on page refresh once deployed.
- **⚠️ Flagged for production:** the image upload feature writes to local disk, which most free hosting platforms wipe on every redeploy. `DEPLOYMENT.md` explains the tradeoff and the two ways to fix it (persistent disk, or migrating to Cloudinary/S3) — worth deciding before you rely on it for real photos.

---

## Phase 5a — Completed ✅
The **Admin Panel** (`/admin`, visible only to `role: "admin"` members — linked from the header once logged in as admin):

- **Members** — filter by status/role/search, approve pending sign-ups, change any member's role inline, edit leadership position + display order for exec/admin members, remove members
- **News & Events** — full list with New/Edit/Delete, a bilingual create/edit form (type toggle switches event-only fields on/off), with image upload straight from the form
- **Gallery** — upload photos (with bilingual captions + album name) directly from a file picker, remove photos
- **Articles** — moderation view showing *all* posts including hidden ones, with Publish/Hide toggle and delete

**Bug fix while building this:** uploaded image URLs (gallery photos, news images, blog covers, profile pictures) were being rendered as relative paths, which only works if the frontend and backend share an origin. Added a `getMediaUrl()` helper in `src/api/client.js` that resolves these against the backend's actual origin, and applied it everywhere an uploaded image is displayed. Worth knowing about if you add any new image-displaying page later — always pass image URLs from the API through `getMediaUrl()`.

**Design note:** the admin area is gated to `role === 'admin'` only for now (not `exec`), since the backend's most consequential actions (approving members, deleting content) already require admin. A slimmer exec-only view (e.g. just Announcements + Gallery) would be a reasonable Phase 6 addition if your union wants execs to publish without full admin rights.

---

## Phase 4 — Completed ✅
All frontend pages are now real and connected to the backend API:

- **Login / Register (Membership)** — full sign-up form (name, email, password, phone, student ID, campus, department, year, home area, preferred language); new members start as `pending` and must be approved by an admin
- **Leadership** — public directory pulling active exec/admin members
- **News & Events** — list with News/Event filter tabs, detail page with bilingual content and a comment thread (comments require an active-member login)
- **Gallery** — album-filterable photo grid
- **Articles (Blog)** — list with language filter, detail view, and a "Write an Article" form for active members (with delete for the author or an admin)
- **Get Support** — mentorship / conflict-resolution / orientation / general-support request form, plus a "My Requests" list showing status
- **Dashboard** — logged-in member's own status, role, support requests, and articles

Routes requiring login (`/dashboard`, `/blog/new`) redirect to `/login` automatically if not authenticated.

### Try it end-to-end
1. Run both `backend` (`npm run dev`) and `frontend` (`npm run dev`)
2. Go to `/register`, sign up — you'll land on `/dashboard` with a `pending` status badge
3. In MongoDB, manually set your member's `role` to `"admin"` and `membershipStatus` to `"active"` (see Phase 1 note above)
4. Log back in — comment on news, write an article, submit a support request, and check the leadership directory once you set `leadershipPosition` on a member

---

## Phase 3 — Completed ✅
- React (Vite) frontend scaffold
- Bilingual EN / Afaan Oromo via `react-i18next`, with a language switcher in the header (persists choice in the browser)
- Design system (`src/styles/index.css`): colors, type, layout tokens drawn from the union's own emblem
- Header, Footer, and main layout — built around the union's actual logo (extracted from the founding document)
- Auth context + API client scaffolded, ready for Phase 4 forms
- **Home** and **About** pages fully built, using the union's actual mission/vision/bylaw text in both languages
- All other routes (Membership, News, Gallery, Blog, Leadership, Support, Login, Register, Dashboard) wired up with placeholder pages, ready to be filled in during Phase 4

### Running the frontend locally
```
cd frontend
cp .env.example .env      # points to your local backend (http://localhost:5000/api)
npm install
npm run dev
```
Open `http://localhost:5173`. Make sure the backend (`npm run dev` in `backend/`) is also running so pages that call the API will work in later phases.

### ⚠️ Translation note
The **mission, vision, bylaw, and definition text** on the About page are the union's own original Afaan Oromo wording, taken directly from your founding document — those are authentic. The **UI chrome** (navigation labels, hero headline, button text) was translated by me for this phase and is a reasonable best-effort, but I'm not a certified Oromo translator — it's worth having a fluent member proofread those short phrases before the site goes live. They're all in one file (`frontend/src/i18n/locales/or/translation.json`) so it's a quick pass for a native speaker.
# FullStack-website-for-5G-student
