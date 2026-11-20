import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'sangeethas_studio.sqlite');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookingNumber TEXT UNIQUE NOT NULL,
      customerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      eventType TEXT NOT NULL,
      eventDate TEXT NOT NULL,
      eventTime TEXT NOT NULL,
      location TEXT NOT NULL,
      notes TEXT,
      totalAmount REAL NOT NULL DEFAULT 0,
      advanceAmount REAL NOT NULL DEFAULT 0,
      balance REAL NOT NULL DEFAULT 0,
      sangeethaEarnings REAL NOT NULL DEFAULT 0,
      rizwanaEarnings REAL NOT NULL DEFAULT 0,
      titheAmount REAL NOT NULL DEFAULT 0,
      paymentStatus TEXT NOT NULL DEFAULT 'Pending',
      confirmationStatus TEXT NOT NULL DEFAULT 'Confirmed',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_bookings_date ON Bookings(eventDate);
    CREATE INDEX IF NOT EXISTS idx_bookings_number ON Bookings(bookingNumber);
    CREATE INDEX IF NOT EXISTS idx_bookings_status ON Bookings(paymentStatus);

    CREATE TABLE IF NOT EXISTS Payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paymentId TEXT UNIQUE NOT NULL,
      bookingId TEXT NOT NULL,
      paymentDate TEXT NOT NULL,
      amount REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_payments_booking ON Payments(bookingId);
    CREATE INDEX IF NOT EXISTS idx_payments_date ON Payments(paymentDate);

    CREATE TABLE IF NOT EXISTS TitheRecords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bookingId TEXT UNIQUE NOT NULL,
      bookingAmount REAL NOT NULL,
      titheAmount REAL NOT NULL,
      eventDate TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tithe_booking ON TitheRecords(bookingId);
    CREATE INDEX IF NOT EXISTS idx_tithe_date ON TitheRecords(eventDate);

    CREATE TABLE IF NOT EXISTS Settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Default settings if empty
  const getSetting = db.prepare('SELECT value FROM Settings WHERE key = ?');
  const insertSetting = db.prepare('INSERT OR IGNORE INTO Settings (key, value) VALUES (?, ?)');

  insertSetting.run('businessName', "SANGEETHA'S MAKEUP ARTIST");
  insertSetting.run('phone', '+91 9042468594');
  insertSetting.run('currency', '₹');
  insertSetting.run('timezone', 'Asia/Kolkata');
  insertSetting.run('staff1', 'Sangeetha');
  insertSetting.run('staff2', 'Rizwana');
  insertSetting.run('tithePercentage', '1');

  // Seed default records if Bookings table is empty
  const countRow = db.prepare('SELECT COUNT(*) as count FROM Bookings').get();
  if (countRow.count === 0) {
    seedInitialData();
  }
}

/**
 * Seed realistic bridal appointments for immediate testing
 */
function seedInitialData() {
  const seedBookings = [
    {
      bookingNumber: 'BK-20261122-001',
      customerName: 'Priyadharshini M.',
      phone: '9840123456',
      eventType: 'Muhurtham Makeup',
      eventDate: '2026-11-22',
      eventTime: '06:00',
      location: 'Sri Krishna Kalyana Mandapam, Chennai',
      notes: 'Muhurtham bridal styling with traditional Kanjeevaram draping and floral veni.',
      totalAmount: 25000,
      sangeethaEarnings: 16000,
      rizwanaEarnings: 6000,
      confirmationStatus: 'Confirmed',
      initialAdvance: 15000,
      paymentMethod: 'UPI'
    },
    {
      bookingNumber: 'BK-20261125-002',
      customerName: 'Ananya Ramanathan',
      phone: '9884567890',
      eventType: 'Reception Makeup',
      eventDate: '2026-11-25',
      eventTime: '18:45',
      location: 'Leela Palace Grand Ballroom, MRC Nagar',
      notes: 'Glamour cocktail reception with HD airbrush finish and soft waves styling.',
      totalAmount: 22000,
      sangeethaEarnings: 14000,
      rizwanaEarnings: 5000,
      confirmationStatus: 'Confirmed',
      initialAdvance: 22000,
      paymentMethod: 'UPI'
    },
    {
      bookingNumber: 'BK-20261205-003',
      customerName: 'Divya & Karthik',
      phone: '9790112233',
      eventType: 'Engagement Makeup',
      eventDate: '2026-12-05',
      eventTime: '10:30',
      location: 'Mayor Ramanathan Chettiar Hall, RA Puram',
      notes: 'Subtle pastel makeup for ring ceremony.',
      totalAmount: 15000,
      sangeethaEarnings: 9000,
      rizwanaEarnings: 4000,
      confirmationStatus: 'Confirmed',
      initialAdvance: 5000,
      paymentMethod: 'Cash'
    },
    {
      bookingNumber: 'BK-20261214-004',
      customerName: 'Meera Krishnan',
      phone: '9444123987',
      eventType: 'Baby Shower Makeup',
      eventDate: '2026-12-14',
      eventTime: '09:00',
      location: 'Hyatt Regency, Anna Salai',
      notes: 'Traditional Seemantham makeup with gold jewellery setting.',
      totalAmount: 12000,
      sangeethaEarnings: 8000,
      rizwanaEarnings: 3000,
      confirmationStatus: 'Pending',
      initialAdvance: 0,
      paymentMethod: 'UPI'
    }
  ];

  const now = new Date().toISOString();

  for (const b of seedBookings) {
    const tithe = Math.round(b.totalAmount * 0.01 * 100) / 100;
    const balance = Math.max(0, b.totalAmount - b.initialAdvance);
    const payStatus = b.initialAdvance === 0 ? 'Pending' : (b.initialAdvance >= b.totalAmount ? 'Fully Paid' : 'Partially Paid');

    db.prepare(`
      INSERT INTO Bookings (
        bookingNumber, customerName, phone, eventType, eventDate, eventTime,
        location, notes, totalAmount, advanceAmount, balance,
        sangeethaEarnings, rizwanaEarnings, titheAmount, paymentStatus,
        confirmationStatus, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      b.bookingNumber, b.customerName, b.phone, b.eventType, b.eventDate, b.eventTime,
      b.location, b.notes, b.totalAmount, b.initialAdvance, balance,
      b.sangeethaEarnings, b.rizwanaEarnings, tithe, payStatus,
      b.confirmationStatus, now, now
    );

    // Tithe Record
    db.prepare(`
      INSERT INTO TitheRecords (bookingId, bookingAmount, titheAmount, eventDate, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(b.bookingNumber, b.totalAmount, tithe, b.eventDate, now);

    // Payment Record
    if (b.initialAdvance > 0) {
      const pId = 'PM-' + b.eventDate.replace(/-/g, '') + '-001';
      db.prepare(`
        INSERT INTO Payments (paymentId, bookingId, paymentDate, amount, paymentMethod, notes, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(pId, b.bookingNumber, b.eventDate, b.initialAdvance, b.paymentMethod, 'Booking Advance', now);
    }
  }

  // Add extra payment to BK-20261125-002 to test multi-payment
  const secondPayment = {
    paymentId: 'PM-20261110-002',
    bookingId: 'BK-20261125-002',
    paymentDate: '2026-11-10',
    amount: 12000,
    paymentMethod: 'Bank Transfer',
    notes: 'Final balance settlement',
    createdAt: now
  };
  // Adjust first payment to 10000
  db.prepare('UPDATE Payments SET amount = 10000 WHERE bookingId = ?').run('BK-20261125-002');
  db.prepare(`
    INSERT INTO Payments (paymentId, bookingId, paymentDate, amount, paymentMethod, notes, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(secondPayment.paymentId, secondPayment.bookingId, secondPayment.paymentDate, secondPayment.amount, secondPayment.paymentMethod, secondPayment.notes, now);
}

/**
 * Recalculate Booking Finance (Advance, Balance, PaymentStatus)
 */
export function recalculateBooking(bookingNumber) {
  const booking = db.prepare('SELECT * FROM Bookings WHERE bookingNumber = ?').get(bookingNumber);
  if (!booking) return null;

  const payments = db.prepare('SELECT * FROM Payments WHERE bookingId = ?').all(bookingNumber);
  const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const totalAmount = parseFloat(booking.totalAmount) || 0;
  const balance = Math.max(0, totalAmount - totalPaid);

  let paymentStatus = 'Pending';
  if (totalPaid === 0) {
    paymentStatus = 'Pending';
  } else if (totalPaid >= totalAmount && totalAmount > 0) {
    paymentStatus = 'Fully Paid';
  } else {
    paymentStatus = 'Partially Paid';
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE Bookings 
    SET advanceAmount = ?, balance = ?, paymentStatus = ?, updatedAt = ?
    WHERE bookingNumber = ?
  `).run(totalPaid, balance, paymentStatus, now, bookingNumber);

  return db.prepare('SELECT * FROM Bookings WHERE bookingNumber = ?').get(bookingNumber);
}

export default db;
