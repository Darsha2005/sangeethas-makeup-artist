import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import db, { initDatabase, recalculateBooking } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database schema and seeds
initDatabase();

// ============================================================================
// 1. DASHBOARD & STATS API
// ============================================================================
app.get('/api/stats', (req, res) => {
  try {
    const range = req.query.range || 'all';
    
    // Get all bookings
    let bookings = db.prepare('SELECT * FROM Bookings ORDER BY eventDate ASC').all();
    
    // Date filter logic (using local date strings to prevent timezone distortion)
    const today = new Date().toISOString().substring(0, 10);
    const curYear = today.substring(0, 4);
    const curMonth = today.substring(0, 7);

    if (range === 'today') {
      bookings = bookings.filter(b => b.eventDate === today);
    } else if (range === 'month') {
      bookings = bookings.filter(b => b.eventDate && b.eventDate.startsWith(curMonth));
    } else if (range === 'year') {
      bookings = bookings.filter(b => b.eventDate && b.eventDate.startsWith(curYear));
    } else if (range === 'week') {
      const nowMs = new Date().getTime();
      bookings = bookings.filter(b => {
        if (!b.eventDate) return false;
        const [y, m, d] = b.eventDate.split('-');
        const bMs = new Date(Number(y), Number(m) - 1, Number(d)).getTime();
        const diffDays = (bMs - nowMs) / (1000 * 3600 * 24);
        return diffDays >= -1 && diffDays <= 7;
      });
    }

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.confirmationStatus === 'Confirmed').length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
    const totalAdvance = bookings.reduce((sum, b) => sum + (parseFloat(b.advanceAmount) || 0), 0);
    const pendingBalance = bookings.reduce((sum, b) => sum + (parseFloat(b.balance) || 0), 0);
    const sangeethaEarnings = bookings.reduce((sum, b) => sum + (parseFloat(b.sangeethaEarnings) || 0), 0);
    const rizwanaEarnings = bookings.reduce((sum, b) => sum + (parseFloat(b.rizwanaEarnings) || 0), 0);
    const godsTithe = bookings.reduce((sum, b) => sum + (parseFloat(b.titheAmount) || 0), 0);

    // Monthly revenue breakdown for current year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map((mName, idx) => {
      const monthPrefix = `${curYear}-${String(idx + 1).padStart(2, '0')}`;
      const monthBookings = bookings.filter(b => b.eventDate && b.eventDate.startsWith(monthPrefix));
      const revenue = monthBookings.reduce((sum, b) => sum + (parseFloat(b.totalAmount) || 0), 0);
      const advance = monthBookings.reduce((sum, b) => sum + (parseFloat(b.advanceAmount) || 0), 0);
      const tithe = monthBookings.reduce((sum, b) => sum + (parseFloat(b.titheAmount) || 0), 0);
      return {
        month: mName,
        monthKey: monthPrefix,
        revenue,
        advance,
        tithe,
        bookingsCount: monthBookings.length
      };
    });

    // Payment Status Distribution
    const paymentStatusCounts = {
      fullyPaid: bookings.filter(b => b.paymentStatus === 'Fully Paid').length,
      partiallyPaid: bookings.filter(b => b.paymentStatus === 'Partially Paid').length,
      pending: bookings.filter(b => b.paymentStatus === 'Pending').length,
    };

    // Event Type Distribution
    const eventTypeMap = {};
    bookings.forEach(b => {
      const type = b.eventType || 'Other';
      eventTypeMap[type] = (eventTypeMap[type] || 0) + 1;
    });
    const eventTypes = Object.keys(eventTypeMap).map(type => ({
      name: type,
      value: eventTypeMap[type]
    }));

    // Upcoming events (>= today)
    const allBookingsRaw = db.prepare('SELECT * FROM Bookings ORDER BY eventDate ASC').all();
    const upcomingEvents = allBookingsRaw.filter(b => b.eventDate >= today).slice(0, 5);
    const recentBookings = [...allBookingsRaw].reverse().slice(0, 5);

    res.json({
      ok: true,
      data: {
        kpis: {
          totalBookings,
          confirmedBookings,
          totalRevenue,
          totalAdvance,
          pendingBalance,
          sangeethaEarnings,
          rizwanaEarnings,
          godsTithe
        },
        monthlyData,
        paymentStatusCounts,
        eventTypes,
        upcomingEvents,
        recentBookings
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============================================================================
// 2. BOOKINGS API
// ============================================================================
app.get('/api/bookings', (req, res) => {
  try {
    const { search, eventType, paymentStatus, confirmationStatus, sort } = req.query;
    let bookings = db.prepare('SELECT * FROM Bookings ORDER BY eventDate ASC').all();

    if (search) {
      const q = String(search).toLowerCase();
      bookings = bookings.filter(b => 
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.phone && b.phone.includes(q)) ||
        (b.bookingNumber && b.bookingNumber.toLowerCase().includes(q)) ||
        (b.location && b.location.toLowerCase().includes(q))
      );
    }

    if (eventType) bookings = bookings.filter(b => b.eventType === eventType);
    if (paymentStatus) bookings = bookings.filter(b => b.paymentStatus === paymentStatus);
    if (confirmationStatus) bookings = bookings.filter(b => b.confirmationStatus === confirmationStatus);

    if (sort === 'date-desc') {
      bookings.sort((a, b) => b.eventDate.localeCompare(a.eventDate));
    } else if (sort === 'amount-desc') {
      bookings.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sort === 'name-asc') {
      bookings.sort((a, b) => a.customerName.localeCompare(b.customerName));
    }

    res.json({ ok: true, data: bookings });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/bookings/:bookingNumber', (req, res) => {
  try {
    const booking = db.prepare('SELECT * FROM Bookings WHERE bookingNumber = ?').get(req.params.bookingNumber);
    if (!booking) {
      return res.status(404).json({ ok: false, error: 'Booking not found' });
    }
    const payments = db.prepare('SELECT * FROM Payments WHERE bookingId = ? ORDER BY paymentDate ASC').all(req.params.bookingNumber);
    const tithe = db.prepare('SELECT * FROM TitheRecords WHERE bookingId = ?').get(req.params.bookingNumber);

    res.json({ ok: true, data: { booking, payments, tithe } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/bookings', (req, res) => {
  try {
    const {
      customerName, phone, eventType, eventDate, eventTime,
      location, notes, totalAmount, sangeethaEarnings, rizwanaEarnings,
      confirmationStatus, initialAdvance, paymentMethod, paymentNotes
    } = req.body;

    if (!customerName || !phone || !eventType || !eventDate || !eventTime || !location) {
      return res.status(400).json({ ok: false, error: 'Missing required booking fields' });
    }

    const total = Math.max(0, parseFloat(totalAmount) || 0);
    const advance = Math.max(0, parseFloat(initialAdvance) || 0);
    const sangeetha = Math.max(0, parseFloat(sangeethaEarnings) || 0);
    const rizwana = Math.max(0, parseFloat(rizwanaEarnings) || 0);
    
    // Strict 1% Tithe calculation on full booking amount
    const tithe = Math.round(total * 0.01 * 100) / 100;
    const balance = Math.max(0, total - advance);

    let paymentStatus = 'Pending';
    if (advance === 0) {
      paymentStatus = 'Pending';
    } else if (advance >= total && total > 0) {
      paymentStatus = 'Fully Paid';
    } else {
      paymentStatus = 'Partially Paid';
    }

    const now = new Date().toISOString();
    const dateNum = eventDate.replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `BK-${dateNum}-${randomSuffix}`;

    // Insert Booking
    db.prepare(`
      INSERT INTO Bookings (
        bookingNumber, customerName, phone, eventType, eventDate, eventTime,
        location, notes, totalAmount, advanceAmount, balance,
        sangeethaEarnings, rizwanaEarnings, titheAmount, paymentStatus,
        confirmationStatus, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bookingNumber, customerName, phone, eventType, eventDate, eventTime,
      location, notes || '', total, advance, balance,
      sangeetha, rizwana, tithe, paymentStatus,
      confirmationStatus || 'Confirmed', now, now
    );

    // Insert Tithe Record
    db.prepare(`
      INSERT INTO TitheRecords (bookingId, bookingAmount, titheAmount, eventDate, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(bookingNumber, total, tithe, eventDate, now);

    // Insert Initial Advance Payment if > 0
    if (advance > 0) {
      const paymentId = `PM-${dateNum}-${Math.floor(1000 + Math.random() * 9000)}`;
      db.prepare(`
        INSERT INTO Payments (paymentId, bookingId, paymentDate, amount, paymentMethod, notes, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(paymentId, bookingNumber, eventDate, advance, paymentMethod || 'UPI', paymentNotes || 'Initial Advance', now);
    }

    const newBooking = db.prepare('SELECT * FROM Bookings WHERE bookingNumber = ?').get(bookingNumber);
    res.json({ ok: true, data: newBooking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.put('/api/bookings/:bookingNumber', (req, res) => {
  try {
    const bookingNumber = req.params.bookingNumber;
    const existing = db.prepare('SELECT * FROM Bookings WHERE bookingNumber = ?').get(bookingNumber);
    if (!existing) {
      return res.status(404).json({ ok: false, error: 'Booking not found' });
    }

    const {
      customerName, phone, eventType, eventDate, eventTime,
      location, notes, totalAmount, sangeethaEarnings, rizwanaEarnings,
      confirmationStatus
    } = req.body;

    const total = totalAmount !== undefined ? Math.max(0, parseFloat(totalAmount) || 0) : existing.totalAmount;
    const sangeetha = sangeethaEarnings !== undefined ? Math.max(0, parseFloat(sangeethaEarnings) || 0) : existing.sangeethaEarnings;
    const rizwana = rizwanaEarnings !== undefined ? Math.max(0, parseFloat(rizwanaEarnings) || 0) : existing.rizwanaEarnings;
    const tithe = Math.round(total * 0.01 * 100) / 100;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE Bookings SET
        customerName = ?, phone = ?, eventType = ?, eventDate = ?, eventTime = ?,
        location = ?, notes = ?, totalAmount = ?, sangeethaEarnings = ?,
        rizwanaEarnings = ?, titheAmount = ?, confirmationStatus = ?, updatedAt = ?
      WHERE bookingNumber = ?
    `).run(
      customerName || existing.customerName,
      phone || existing.phone,
      eventType || existing.eventType,
      eventDate || existing.eventDate,
      eventTime || existing.eventTime,
      location || existing.location,
      notes !== undefined ? notes : existing.notes,
      total, sangeetha, rizwana, tithe,
      confirmationStatus || existing.confirmationStatus,
      now, bookingNumber
    );

    // Update Tithe Record
    db.prepare(`
      INSERT OR REPLACE INTO TitheRecords (bookingId, bookingAmount, titheAmount, eventDate, createdAt)
      VALUES (?, ?, ?, ?, ?)
    `).run(bookingNumber, total, tithe, eventDate || existing.eventDate, now);

    // Recalculate Finance
    const updated = recalculateBooking(bookingNumber);
    res.json({ ok: true, data: updated });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/bookings/:bookingNumber', (req, res) => {
  try {
    const bookingNumber = req.params.bookingNumber;
    // Cascade deletes
    db.prepare('DELETE FROM Payments WHERE bookingId = ?').run(bookingNumber);
    db.prepare('DELETE FROM TitheRecords WHERE bookingId = ?').run(bookingNumber);
    const result = db.prepare('DELETE FROM Bookings WHERE bookingNumber = ?').run(bookingNumber);

    res.json({ ok: true, message: 'Booking deleted successfully', count: result.changes });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============================================================================
// 3. PAYMENTS API
// ============================================================================
app.get('/api/payments', (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT p.*, b.customerName, b.eventType, b.totalAmount, b.balance
      FROM Payments p
      LEFT JOIN Bookings b ON p.bookingId = b.bookingNumber
      ORDER BY p.paymentDate DESC
    `).all();

    res.json({ ok: true, data: payments });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/payments', (req, res) => {
  try {
    const { bookingId, amount, paymentDate, paymentMethod, notes } = req.body;
    if (!bookingId || !amount || !paymentDate || !paymentMethod) {
      return res.status(400).json({ ok: false, error: 'Missing payment fields' });
    }

    const pAmount = parseFloat(amount);
    if (isNaN(pAmount) || pAmount <= 0) {
      return res.status(400).json({ ok: false, error: 'Payment amount must be greater than zero' });
    }

    const booking = db.prepare('SELECT * FROM Bookings WHERE bookingNumber = ?').get(bookingId);
    if (!booking) {
      return res.status(404).json({ ok: false, error: 'Booking not found' });
    }

    const now = new Date().toISOString();
    const dateNum = paymentDate.replace(/-/g, '');
    const paymentId = `PM-${dateNum}-${Math.floor(1000 + Math.random() * 9000)}`;

    db.prepare(`
      INSERT INTO Payments (paymentId, bookingId, paymentDate, amount, paymentMethod, notes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(paymentId, bookingId, paymentDate, pAmount, paymentMethod, notes || '', now);

    const updatedBooking = recalculateBooking(bookingId);
    res.json({
      ok: true,
      data: {
        payment: { paymentId, bookingId, paymentDate, amount: pAmount, paymentMethod, notes, createdAt: now },
        booking: updatedBooking
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/payments/:paymentId', (req, res) => {
  try {
    const payment = db.prepare('SELECT * FROM Payments WHERE paymentId = ?').get(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ ok: false, error: 'Payment not found' });
    }

    db.prepare('DELETE FROM Payments WHERE paymentId = ?').run(req.params.paymentId);
    const updatedBooking = recalculateBooking(payment.bookingId);

    res.json({ ok: true, message: 'Payment deleted', booking: updatedBooking });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============================================================================
// 4. GOD'S TITHE & STAFF EARNINGS API
// ============================================================================
app.get('/api/tithe', (req, res) => {
  try {
    const titheRecords = db.prepare(`
      SELECT t.*, b.customerName, b.eventType, b.totalAmount
      FROM TitheRecords t
      LEFT JOIN Bookings b ON t.bookingId = b.bookingNumber
      ORDER BY t.eventDate DESC
    `).all();

    const totalTithe = titheRecords.reduce((sum, t) => sum + (parseFloat(t.titheAmount) || 0), 0);
    const curMonth = new Date().toISOString().substring(0, 7);
    const monthTithe = titheRecords
      .filter(t => t.eventDate && t.eventDate.startsWith(curMonth))
      .reduce((sum, t) => sum + (parseFloat(t.titheAmount) || 0), 0);

    res.json({
      ok: true,
      data: {
        totalTithe,
        monthTithe,
        count: titheRecords.length,
        records: titheRecords
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/staff-earnings', (req, res) => {
  try {
    const bookings = db.prepare('SELECT bookingNumber, customerName, eventDate, eventType, totalAmount, sangeethaEarnings, rizwanaEarnings, paymentStatus FROM Bookings ORDER BY eventDate DESC').all();

    const sangeethaTotal = bookings.reduce((sum, b) => sum + (parseFloat(b.sangeethaEarnings) || 0), 0);
    const rizwanaTotal = bookings.reduce((sum, b) => sum + (parseFloat(b.rizwanaEarnings) || 0), 0);
    const combinedTotal = sangeethaTotal + rizwanaTotal;

    res.json({
      ok: true,
      data: {
        sangeethaTotal,
        rizwanaTotal,
        combinedTotal,
        bookings
      }
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============================================================================
// 5. SETTINGS API
// ============================================================================
app.get('/api/settings', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM Settings').all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ ok: true, data: settings });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const updates = req.body;
    const upsert = db.prepare('INSERT OR REPLACE INTO Settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(updates)) {
      upsert.run(k, String(v));
    }
    res.json({ ok: true, message: 'Settings saved' });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============================================================================
// SERVE STATIC FILES (PRODUCTION)
// ============================================================================
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`✨ Sangeetha's Makeup Artist Server running on http://localhost:${PORT}`);
});
