# SANGEETHA'S MAKEUP ARTIST – INSTALLATION, RUNNING & DEPLOYMENT GUIDE

This guide provides step-by-step instructions for running the application locally, verifying database operations, building for production, and deploying.

---

## 1. PREREQUISITES

- **Node.js:** v20+ (Node.js v24 recommended, as it includes native `node:sqlite`).
- **NPM:** v10+.
- No external database installations (like PostgreSQL or MySQL) are required. The application uses a persistent, zero-configuration SQLite database engine.

---

## 2. INSTALLATION

Navigate to the project directory:

```bash
cd /Users/darshans/.gemini/antigravity/scratch/sangeethas-makeup-artist
```

Install all dependencies:

```bash
npm install
```

---

## 3. CONFIGURATION

Copy the example environment file if not already present:

```bash
cp .env.example .env
```

The default `.env` configuration contains:

```env
PORT=5001
NODE_ENV=development
DATABASE_URL=./data/sangeethas_studio.sqlite
BUSINESS_NAME="SANGEETHA'S MAKEUP ARTIST"
BUSINESS_PHONE="+91 9042468594"
DEFAULT_TITHE_PERCENT=1
TIMEZONE="Asia/Kolkata"
API_SECRET="sangeetha_luxury_bridal_2026_secure_key"
```

---

## 4. RUNNING THE APPLICATION

You can run the application in two ways:

### Option A: Integrated Full-Stack Server (Recommended)
This runs the Express API server and serves the compiled React application on **`http://localhost:5001`**:

```bash
# Build the React frontend
npm run build

# Start the full-stack server
npm start
```

Open your browser and navigate to:
**`http://localhost:5001`**

### Option B: Vite Development Mode
This runs the Vite live-reloading dev server on **`http://localhost:5173`** with an API proxy to the Express server on port 5001:

Terminal 1 (Backend Server):
```bash
npm run server
```

Terminal 2 (Frontend Dev Server):
```bash
npm run dev
```

Open your browser and navigate to:
**`http://localhost:5173`**

---

## 5. DATABASE SETUP & VERIFICATION

The database schema and default bridal bookings are created automatically on the first server launch:

- **Database File:** `./data/sangeethas_studio.sqlite`
- **Tables Created:**
  - `Bookings` (18 columns, indexed on `eventDate` and `bookingNumber`)
  - `Payments` (7 columns, foreign key cascade to `Bookings`)
  - `TitheRecords` (5 columns, deduplicated by `bookingId`)
  - `Settings` (Key-value business profile storage)

### Verifying Database Integrity:
Run the direct database verification command:

```bash
node --experimental-sqlite -e "
import('./server/db.js').then(({ default: db }) => {
  const count = db.prepare('SELECT COUNT(*) as count FROM Bookings').get().count;
  console.log('Bookings verified in database:', count);
  process.exit(0);
});"
```

---

## 6. END-TO-END VERIFICATION TEST CASES

Follow these test cases to verify full functional reliability:

### Test 1: Date & Time Accuracy Preservation
1. Click **New Booking** in the top header or sidebar.
2. Enter Customer Name: `Kavitha Sundaram`, Mobile: `9042468594`.
3. Event Date: Select `2026-11-22`.
4. Event Time: Select `10:30` (or `10:30 AM`).
5. Venue: `Chennai Central Hall`.
6. Total Booking Amount: `15000`. Initial Advance: `5000`.
7. Staff: Sangeetha: `9000`, Rizwana: `4000`.
8. Click **Confirm & Save Booking**.
9. In **All Bookings**, verify:
   - Date displays strictly as **`22-11-2026`** (never shifts to 21-11-2026).
   - Time displays strictly as **`10:30 AM`**.
   - God's Tithe is calculated as exactly **`₹150`** (1% of ₹15,000).
   - Balance displays as **`₹10,000`**.

### Test 2: Multi-Installment Payment
1. Navigate to **Payments** > Click **Record Payment**.
2. Select Kavitha Sundaram's booking (`BK-20261122-...`).
3. Notice the dialog displays *Outstanding Balance: ₹10,000*.
4. Enter Amount: `6000`, Method: `Bank Transfer`. Click **Record Payment**.
5. Verify in **All Bookings**:
   - Advance has increased to `₹11,000`.
   - Balance has reduced to `₹4,000`.
   - Payment Status remains `Partially Paid`.
6. Click **Record Payment** again and record the remaining `4000` via `Cash`.
7. Verify:
   - Balance is now `₹0`.
   - Payment Status automatically flips to green badge: **`Fully Paid`**.

### Test 3: Printable Bridal Receipt
1. In **All Bookings**, click the printer icon 🖨️ on Kavitha Sundaram's row.
2. Verify the printable invoice shows:
   - Studio title and contact number: `+91 9042468594`.
   - All three recorded installments itemized by date and method.
   - Balance Due showing `₹0`.
   - Studio signature line.

### Test 4: God's Tithe Accountability
1. Navigate to **God's Tithe (1%)** in the sidebar.
2. Confirm the total tithe matches the sum of 1% across all bookings.
3. Confirm Kavitha Sundaram's tithe is recorded as `₹150` once (no duplicate rows).
4. Click **Export CSV** or **Print Statement**.

---

## 7. PRODUCTION DEPLOYMENT

### Docker Deployment
The project can be containerized using Node 24:

```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5001
CMD ["npm", "start"]
```

### Self-Hosted VPS / Cloud (Ubuntu / Debian / macOS Server)
1. Clone the repository onto your server.
2. Run `npm install` and `npm run build`.
3. Use `pm2` to manage the process:
   ```bash
   pm2 start "node --experimental-sqlite server/index.js" --name "sangeethas-makeup"
   pm2 save
   pm2 startup
   ```
4. Configure an Nginx reverse proxy to `http://localhost:5001`.
