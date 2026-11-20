# SANGEETHA'S MAKEUP ARTIST – PREMIUM BOOKING & BUSINESS MANAGEMENT SYSTEM

> **A luxury, full-stack commercial web application tailored for bridal makeup artists, beauty salons, and wedding couture entrepreneurs.**

---

## 1. Executive Summary

**SANGEETHA'S MAKEUP ARTIST** is a bespoke, enterprise-grade business management and financial tracking system designed specifically for bridal studios. Built with a **React 18 + TypeScript + Tailwind CSS** frontend, an **Express.js + Node.js v24 (node:sqlite)** persistent relational database engine, and a luxury **Emerald & Champagne Gold** visual aesthetic.

### Key Objectives Solved:
- **Full Relational Database Persistence:** Stores all bookings, customer records, installment payments, staff remunerations, and consecrated tithes permanently in a relational SQLite database (`./data/sangeethas_studio.sqlite`) with WAL mode and foreign-key cascade integrity.
- **Permanent Date & Time Bug Resolution:** Employs pure string parsing to completely eliminate timezone shifting (e.g. `22/11/2026` shifting to `21/11/2026`).
- **Consecrated God's Tithe (1%):** Automatically calculates exactly 1% of the full gross contract value (not from advance tokens), with deduplication per booking.
- **Multi-Payment Ledger:** Allows flexible installment tracking (e.g. initial token $\rightarrow$ pre-bridal advance $\rightarrow$ day-of final settlement) with dynamic balance recalculation.
- **Dedicated Staff Allocation:** Independent tracking and settlements for **Sangeetha** (Lead Artist) and **Rizwana** (Senior Artist).

---

## 2. Technology Stack & Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 REACT FRONTEND (SPA)                        │
│  - React 18, TypeScript, Vite                                │
│  - Styling: Tailwind CSS (Custom luxury color tokens)       │
│  - Icons: Lucide React                                      │
│  - Visual Charts: Recharts (Responsive bar, pie & line)     │
│  - State & Routing: Modular dynamic tab engine              │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 NODE.JS / EXPRESS BACKEND                   │
│  - Express.js HTTP Server (Port 5001)                       │
│  - CORS, Dotenv, Static SPA serving                         │
│  - Server-side Financial & Tithe Recalculations             │
└──────────────────────────────┬──────────────────────────────┘
                               │ Native SQL Driver
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 SQLITE DATABASE (node:sqlite)               │
│  - Persistent storage: ./data/sangeethas_studio.sqlite      │
│  - WAL Journal Mode (High concurrency)                      │
│  - Tables: Bookings, Payments, TitheRecords, Settings       │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend:** React 18, TypeScript, Tailwind CSS, Recharts, Lucide React, date-fns.
- **Backend:** Node.js v24, Express.js.
- **Database:** Native SQLite via Node.js `node:sqlite` (`DatabaseSync`), requiring zero external database daemons or native compilation.
- **Design Tokens:** Deep Emerald Green (`#123D32`), Dark Green (`#092820`), Champagne Gold (`#D6B36A`), Warm Ivory (`#FAF7F0`), Soft Beige (`#EDE5D8`), White (`#FFFFFF`), Charcoal (`#242424`).
- **Fonts:** `Cinzel` (Headings & Luxury Branding), `Plus Jakarta Sans` / `Inter` (Data tables & UI controls).

---

## 3. Core Modules & Capabilities

### 3.1. Executive Dashboard
- **7 Live KPI Summary Cards:**
  1. *Total Bookings* (with confirmed appointment badge)
  2. *Total Revenue* (gross contract value)
  3. *Advance Received* (total collected via Cash, UPI, and Bank)
  4. *Pending Balance* (uncollected receivables due)
  5. *Sangeetha Share* (Lead Artist remuneration)
  6. *Rizwana Share* (Senior Artist remuneration)
  7. *God's Tithe* (1% consecrated business offering)
- **Recharts Data Visualizations:**
  - Monthly Revenue & Advance Collection Bar Chart
  - Payment Status Doughnut Chart (Fully Paid, Partially Paid, Pending)
  - Monthly Bookings Trend Line
  - Occasion & Event Type Distribution
  - Staff Remuneration Comparison
- **Dynamic Time Filters:** Today, This Week (next 7 days), This Month, This Year, All-Time.
- **Upcoming & Recent Activity:** Real-time schedule feed with quick-action shortcuts.

### 3.2. Booking Manager (New & Edit Appointment)
- **Client Particulars:** Customer name, 10-digit mobile number, venue / Kalyana Mandapam, event date (strict `YYYY-MM-DD`), event time (`HH:mm`), special service notes.
- **Occasion Categories:** Bridal Makeup, Muhurtham Makeup, Reception Makeup, Engagement Makeup, Baby Shower Makeup, Puberty Function Makeup, Bridesmaid Makeup, Groom Makeup, and Custom Occasions.
- **Live Calculation Preview Box:**
  - Instantly computes **God's Tithe (1%)** from the full booking value.
  - Computes remaining balance and total staff allocation in real time as amounts are entered.
- **Confirmation Status:** Confirmed, Pending, Completed, Cancelled.

### 3.3. All Bookings Registry
- Search across client name, phone number, booking number, and location.
- Multi-filters: Event Type, Payment Status, Confirmation Status.
- Sorting: Event Date (Upcoming first / Latest first), Contract Amount, Client Name.
- Pagination with 10 records per page.
- Actions per row: View details, Record payment, Print receipt, Edit, Delete (with confirmation).
- Export to UTF-8 CSV with quote escaping.

### 3.4. Multi-Payment Management
- Supports multiple installment payments for any single booking.
- Automatic backend recalculation of `advanceAmount`, `balance`, and `paymentStatus`.
- Validation against negative payments and warning prompts when payments exceed contract totals.
- Filter by payment method (UPI, Cash, Bank Transfer, Other) and date.

### 3.5. Studio Calendar
- Monthly interactive calendar grid with week and day views.
- Color-coded event chips for each appointment status.
- Clicking an event opens its full particulars and payment ledger.
- Clicking any blank date opens the booking form with that date pre-filled.

### 3.6. Staff Earnings Tracking
- Independent accounting for **Sangeetha** and **Rizwana**.
- Summary KPI cards for individual and combined staff payouts.
- Booking-wise audit ledger.
- CSV export for monthly remuneration settlements.

### 3.7. God's Tithe Management
- Formula: $\text{God's Tithe} = \text{Total Booking Amount} \times 0.01$.
- Accrued on the full contract value (not advance payments).
- Dedicated `TitheRecords` table with `bookingId` as unique key for zero duplication.
- Printable Tithe Offering Statement and CSV download.

### 3.8. Reports Section
- Financial summaries by Month, Year, and Custom range.
- Outstanding Balances Due report with direct "Collect Payment" action buttons.
- Payment collection breakdown by method (UPI vs Cash vs Bank Transfer).
- Printable financial reports.

### 3.9. Settings & System Administration
- Studio business profile configuration (Business Name, Phone: `+91 9042468594`, Staff names, Tithe percentage).
- Relational database health indicators (Engine, SQLite WAL mode, foreign keys, ACID status).
- One-click full database JSON backup download.

---

## 4. Date & Time Accuracy Engine

Previous versions of web booking systems often had bugs where `22/11/2026` would display as `21/11/2026` or times would shift randomly.

This system resolves those issues permanently:
1. **Pure String Handling:** Dates are treated strictly as ISO `YYYY-MM-DD` strings. JavaScript `new Date('YYYY-MM-DD')` is **never** used for date-only display or storage, avoiding automatic UTC midnight rollbacks.
2. **String Formatting Engine:**
   - Input: `2026-11-22` $\rightarrow$ Display: `22-11-2026` via pure string splitting.
   - Input: `10:30` $\rightarrow$ Display: `10:30 AM` via mathematical conversion.
   - Input: `18:45` $\rightarrow$ Display: `06:45 PM`.
   - Missing times never default to execution time.
3. **Database Storage:** Stored as `TEXT` in SQLite, ensuring zero localization or timezone skew.

---

## 5. File Structure

```
sangeethas-makeup-artist/
├── .env.example              # Environment variables template
├── .env                      # Local environment configuration
├── package.json              # Project scripts and dependencies
├── vite.config.ts            # Vite bundler configuration & API proxy
├── tsconfig.json             # TypeScript compiler configuration
├── tailwind.config.js        # Luxury styling color tokens & gradients
├── postcss.config.js         # PostCSS plugins
├── index.html                # Single-page application entry point
├── server/
│   ├── index.js              # Express REST API server & static host
│   └── db.js                 # SQLite database schema, WAL mode, seeds
├── data/
│   └── sangeethas_studio.sqlite # Persistent SQLite database
├── src/
│   ├── main.tsx              # React mounting root
│   ├── App.tsx               # Primary application coordinator
│   ├── index.css             # Tailwind directives & print styles
│   ├── types/index.ts        # TypeScript data contracts
│   ├── utils/dateUtils.ts    # Pure string date/time formatters
│   ├── services/api.ts       # Typed API client
│   └── components/
│       ├── Sidebar.tsx       # Luxury navigation & mobile drawer
│       ├── Header.tsx        # Top header & search
│       ├── Dashboard.tsx     # 7 KPI cards & Recharts
│       ├── AllBookings.tsx   # Data table, filters, CSV export
│       ├── BookingFormModal.tsx # New & edit booking modal
│       ├── CalendarView.tsx  # Monthly appointment calendar
│       ├── PaymentsView.tsx  # Multi-payment installment ledger
│       ├── StaffEarningsView.tsx # Sangeetha & Rizwana accounting
│       ├── GodsTitheView.tsx # 1% consecrated offerings ledger
│       ├── ReportsView.tsx   # Financial & receivables reporting
│       ├── SettingsView.tsx  # Profile, DB status, JSON backup
│       ├── BookingDetailsModal.tsx # Client details modal
│       ├── PrintReceiptModal.tsx # Printable bridal invoice
│       └── Toast.tsx         # Notification alerts
├── README.md                 # System architecture documentation
└── SETUP.md                  # Installation, testing & deployment guide
```

---

## 6. License & Credits

Developed with precision for **Sangeetha's Makeup Artist**.  
All rights reserved © 2026.
