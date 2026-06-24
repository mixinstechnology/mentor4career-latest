# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Vite dev server on http://localhost:5173 (auto-opens browser)
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

No test runner is configured. There is no lint script.

## Environment Variables

Copy `.env` and fill in values. All vars must be prefixed `VITE_` to be exposed to the browser:

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend REST API base URL |
| `VITE_DEFAULT_TOKEN` | Fallback bearer token when no JWT cookie is present |
| `VITE_PLATFORM_FEE_PERCENTAGE` | Platform fee % added on top of session price |
| `VITE_GST_PERCENTAGE` | GST % applied after platform fee |
| `VITE_RAZORPAY_TEST_KEY` | Razorpay publishable key (client-side) |
| `VITE_RAZORPAY_SECRET` | Razorpay secret (should be server-side only) |
| `VITE_RESCHEDULE_OPTIONS` | Comma-separated reschedule time options |

## Architecture

### Provider hierarchy (`src/App.jsx`)

```
LoaderProvider
  AuthProvider
    BookingProvider
      AppLayout (Navbar + Routes + Footer)
      Loader          ← global full-page spinner
      ToastContainer  ← react-toastify, top-right, 3.5s
```

`<AuthModal />` and `<BookingModal />` are mounted once in `AppLayout` and are toggled open/closed via context — they are never rendered inside individual pages.

### Auth (`src/context/AuthContext.jsx`)

- `user` shape: `{ role: 'student'|'mentor'|'admin', name: string }` — **no `id` field**.
- `signIn(role, name)` sets sessionStorage keys (`m4c_role`, `m4c_name`) and updates `user` state. The `m4c_authed` key is intentionally commented out.
- The JWT token is stored in a **cookie named `token`** (set by the backend on login, read via `js-cookie`). To get the logged-in user's numeric ID anywhere in the app, decode the JWT directly — do not rely on `user.id`:

```js
import Cookies from 'js-cookie';
function getLoggedInUserId() {
  try {
    const payload = JSON.parse(atob(Cookies.get('token').split('.')[1]));
    return payload.id ?? payload.userId ?? null;
  } catch { return null; }
}
```

This pattern is duplicated in `Dashboard.jsx`, `MentorDashboard.jsx`, `BookingModal.jsx`, and `Home.jsx`.

### HTTP service (`src/utils/apiService.tsx`)

Single `HttpService` class exported as `httpService`. All methods wrap `axios` and:
- **Show/hide a global loader** (`globalLoader.tsx`) on every request.
- **Show a `toast.error()`** on failure, then **re-throw** — callers that want to suppress the toast must `.catch(() => {})`.
- Token behaviour: `token: false` → sends `VITE_DEFAULT_TOKEN`; anything else (including `token: true` or omitted) → sends JWT cookie or `VITE_DEFAULT_TOKEN` as fallback.

```js
httpService.get('/endpoint', { params: {}, token: true })
httpService.post('/endpoint', { data: payload, token: true })
httpService.put('/endpoint', { data: payload, token: true })
httpService.delete('/endpoint', { token: true })
httpService.postFormData('/endpoint', formData, { token: true })
```

### Email notifications (`sendMail` helper)

Both `Dashboard.jsx` and `MentorDashboard.jsx` define a module-level `sendMail(to, subject, html)` that posts to `POST /contactUs/send-mail` with `{ to: string[], subject, html }`. It is fire-and-forget (errors are swallowed). Trigger emails for: session booked (both parties), session cancelled (student), payment failed (student), webinar registered (student).

### Booking flow (`src/components/BookingModal.jsx`)

Opened via `useBooking().openBooking({ id, name, role, price, email, color, init })`. Three-step flow:
1. **Date/slot selection** — fetches availability from `GET /mentorSession/mentor/:id` and `GET /mentorSession/mySession` to mark already-booked slots. Filters out cleared slots (where `label` is `' - '`). Hides future dates with no valid open slots.
2. **Payment** — Razorpay checkout loaded via CDN script. Fee = `price + platform% + GST% + 2% gateway`. Free sessions skip payment.
3. **Confirmation** — creates session record, sends booking emails.

### Dashboard structure

Each dashboard (`Dashboard.jsx`, `MentorDashboard.jsx`, `AdminDashboard.jsx`) renders inside `DashboardShell` which provides the sidebar nav. Each section is a separate function component defined in the same file (e.g., `SessionsView`, `WebinarsView`, `ProfileView`). These are large files (1500–2500 lines).

**Student Dashboard (`Dashboard.jsx`) sections:** Overview, Profile, Sessions, My Mentors, Webinars, Applications, Support Tickets.

**Webinars section pattern:**
- Default tab: registered webinars from `GET /webinar/my-registrations/:userId` — response shape `{ registrations: [{ webinarId, Webinar: {...} }], totalPages }`. Note: nested webinar object key is `Webinar` (capital W).
- "All Webinars" button switches to `GET /webinar` list.
- Registered IDs are tracked in a `Set<string>` for O(1) badge lookup.

**Mentor Dashboard (`MentorDashboard.jsx`) sections:** Overview, Profile, Availability, Sessions, Earnings, Support Tickets.

- Availability: mentor sets slots per date; cleared slots stored as `{ label: ' - ', startTime: '', endTime: '' }` — these must be filtered out on the student booking side.
- Session cancellation: PATCH to cancel API with `{ isSessionDone: true, paymentStatus: 'done', cancellationReason }`, then fetches student email via `GET /user/:userId` since the session object does not include student email.

### Key API patterns

- User ID from URL: most endpoints use `authId` or `userId` (numeric). Get it from the JWT cookie.
- Student profile: `GET /studentDetails?authId=:id` — use this to fetch student email when the session object doesn't include it.
- Mentor profile: `GET /mentorProfile/:authUserId`
- Sessions (student): `GET /mentorSession/mySession?userId=:id&paymentStatus=done`
- Sessions (mentor): `GET /mentorSession/mentor/:mentorId`
- Webinar registrations: `GET /webinar/my-registrations/:userId?page=1&limit=10`

### Styling

All styles live in `src/styles/global.css` — a single large CSS file using custom properties (`--ink`, `--surface`, `--border`, `--grad`, `--font-display`, etc.). No CSS modules, no Tailwind. Dashboard-specific classes are prefixed `db-`, `sess-`, `earn-`. Booking modal classes: `bk-*`. Auth modal classes: `am-*`. Theme switching toggles `data-theme="violet"` on `<html>`.

Icons are inline SVGs exported from `src/components/Icons.jsx`. Additional one-off icons are defined inline within the component files that use them.
