# Mentor4Career — React App

AI career guidance, college predictor & 1:1 mentorship platform, built with **React 18 + Vite + React Router**. This is a full port of the HTML prototype into a structured, component-based React project.

## Quick start

```bash
cd react-app
npm install
npm run dev      # starts Vite on http://localhost:5173
```

Build for production:

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

> Requires Node 18+.

## Project structure

```
react-app/
├─ index.html                 # Vite entry + Google Fonts (Sora, Plus Jakarta Sans)
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx                # React root + <BrowserRouter>
   ├─ App.jsx                 # Providers + routes + global modals
   ├─ styles/
   │  └─ global.css           # Full design system (ported verbatim from the prototype)
   ├─ data/
   │  └─ mentors.js           # Mentor directory + avatar palette + focus labels
   ├─ context/
   │  ├─ AuthContext.jsx      # Login/Signup modal state + session (localStorage)
   │  └─ BookingContext.jsx   # Which mentor the booking modal is open for
   ├─ hooks/
   │  └─ useReveal.js         # Scroll-reveal (.reveal → .in) on each route
   ├─ components/
   │  ├─ Icons.jsx            # Shared inline-SVG icon set
   │  ├─ Navbar.jsx           # Sticky nav + mobile menu + theme switch
   │  ├─ ThemeSwitcher.jsx    # Indigo ↔ Violet theme toggle (persisted)
   │  ├─ Footer.jsx
   │  ├─ PageHero.jsx         # Reusable breadcrumb + title hero
   │  ├─ MentorCard.jsx       # Mentor card; "Book Now" → opens BookingModal
   │  ├─ JourneyRail.jsx      # Animated home "career journey" rail
   │  ├─ BookingModal.jsx     # ⭐ 3-step booking flow (date/time → pay → confirm)
   │  ├─ AuthModal.jsx        # Login / Signup popup with role tabs
   │  └─ DashboardShell.jsx   # Shared dashboard layout
   └─ pages/
      ├─ Home.jsx             # Landing page (hero, journey, overview, mentors, stories)
      ├─ Mentors.jsx          # Filterable mentor directory + booking
      ├─ Predictor.jsx        # AI college predictor
      ├─ Jobs.jsx             # Internships & jobs
      ├─ Webinars.jsx         # Live sessions
      ├─ Interview.jsx        # Interview prep
      ├─ Contact.jsx          # Contact form
      ├─ Faq.jsx              # FAQ accordion
      ├─ Support.jsx          # Help centre
      ├─ Dashboard.jsx        # Student dashboard
      ├─ MentorDashboard.jsx  # Mentor dashboard
      └─ AdminDashboard.jsx   # Admin dashboard
```

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/mentors` | Mentorship directory (with booking) |
| `/predictor` | AI College Predictor |
| `/jobs` | Jobs & internships |
| `/webinars` | Webinars |
| `/interview` | Interview prep |
| `/contact` | Contact |
| `/faq` | FAQs |
| `/support` | Help & support |
| `/dashboard`, `/mentor-dashboard`, `/admin-dashboard` | Role dashboards |

## Key architecture decisions

- **Two global modals, two contexts.** `BookingProvider` and `AuthProvider` wrap the app; the `<BookingModal>` and `<AuthModal>` are mounted once in `App.jsx` and open from anywhere via `useBooking().openBooking(mentor)` / `useAuth().openAuth('login' | 'signup')`. This mirrors how the prototype injected a single modal on every page — but the React version passes the mentor object as data instead of scraping the DOM.

- **The booking flow** (`BookingModal.jsx`) is the headline feature:
  1. **Date & time** — next 14 days + 3-col time-slot grid. Open/booked slots are deterministic per `(date + mentor)` (swap `slotsFor()` for a real availability API).
  2. **Payment** — fee breakdown (`session fee + ₹49 platform fee`) and UPI / Card / Netbanking. Free intro-call mentors skip payment. The fake `setTimeout` "processing" should be replaced with a real gateway (Razorpay/Stripe) — advance to step 3 only on a success callback.
  3. **Confirmation** — booking ID + "View my bookings" → `/dashboard`.
  Session length derives from price: `0 → 20 min`, `≥1000 → 45 min`, else `30 min`.

- **Design system** lives entirely in `src/styles/global.css` (CSS custom properties for color/type/spacing/radii/shadows, plus all `.bk-*` booking and `.am-*` auth styles). Theme switching toggles `data-theme="violet"` on `<html>`.

- **Auth is mocked.** Submitting the auth form stores `m4c_role` / `m4c_authed` in localStorage and routes to the matching dashboard. Wire `signIn()` in `AuthContext.jsx` to your real API.

## What's production-ready vs. mocked

- ✅ Routing, layout, navigation, theming, design system, scroll-reveal
- ✅ Mentor directory with live filtering/sorting
- ✅ Full booking flow UI + state machine
- ✅ Auth modal UI + role routing
- 🔌 **To wire up:** real mentor/availability API, payment gateway, auth backend, jobs/webinars data, predictor model. These are clearly isolated (data files, context `signIn`, `slotsFor`, the payment `setTimeout`).

The feature pages (Predictor, Jobs, Webinars, Interview, Contact, FAQ, Support, dashboards) are built on the real design system with representative sample data — ready to be connected to live data sources.
