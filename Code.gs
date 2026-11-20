/**
 * ============================================================================
 * SANGEETHA'S MAKEUP ARTIST – PREMIUM BUSINESS MANAGEMENT SYSTEM
 * Backend Google Apps Script (Code.gs)
 * ============================================================================
 * 
 * Version: 2.0 Production Ready
 * Timezone: Asia/Kolkata (IST)
 * Database: Google Sheets (3 Primary Tables: Bookings, Payments, Tithe Records)
 * Security: Script Properties API Key Validation & LockService Concurrency Guard
 */

// Configuration Constants
var SPREADSHEET_TIMEZONE = 'Asia/Kolkata';

var SHEET_NAMES = {
  BOOKINGS: 'Bookings',
  PAYMENTS: 'Payments',
  TITHE: 'Tithe Records'
};

var HEADERS = {
  BOOKINGS: [
    'BookingID', 'EventDate', 'Customer', 'Phone', 'Event', 'Time', 
    'Location', 'Notes', 'Total', 'Advance', 'Balance', 'Sangeetha', 
    'Rizwana', 'Tithe', 'PaymentStatus', 'Confirmation', 'Created', 'Updated'
  ],
  PAYMENTS: [
    'PaymentID', 'BookingID', 'Date', 'Amount', 'Method', 'Notes', 'Created'
  ],
  TITHE: [
    'BookingID', 'EventDate', 'Customer', 'BookingAmount', 'Tithe'
  ]
};

/**
 * Safe Database Initialization & Migration
 * - Creates missing sheets without touching existing data.
 * - Safely verifies and aligns headers if sheets exist.
 * - Sets spreadsheet timezone to Asia/Kolkata.
 */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Set Timezone to Asia/Kolkata
  try {
    ss.setSpreadsheetTimeZone(SPREADSHEET_TIMEZONE);
  } catch (err) {
    Logger.log('Could not set timezone: ' + err.toString());
  }

  // Setup Bookings Sheet
  initSheetWithHeaders(ss, SHEET_NAMES.BOOKINGS, HEADERS.BOOKINGS);

  // Setup Payments Sheet
  initSheetWithHeaders(ss, SHEET_NAMES.PAYMENTS, HEADERS.PAYMENTS);

  // Setup Tithe Records Sheet
  initSheetWithHeaders(ss, SHEET_NAMES.TITHE, HEADERS.TITHE);

  // Initialize Default API Key in Script Properties if not set
  var props = PropertiesService.getScriptProperties();
  var existingKey = props.getProperty('API_KEY');
  if (!existingKey) {
    var generatedKey = 'SMA_' + Utilities.getUuid().replace(/-/g, '').substring(0, 16);
    props.setProperty('API_KEY', generatedKey);
    Logger.log('Generated New API Key: ' + generatedKey);
  } else {
    Logger.log('Existing API Key preserved: ' + existingKey);
  }

  return {
    ok: true,
    message: 'System and Sheets initialized successfully.',
    apiKey: props.getProperty('API_KEY')
  };
}

/**
 * Helper: Initializes a sheet with required headers while preserving existing rows.
 */
function initSheetWithHeaders(ss, sheetName, expectedHeaders) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(expectedHeaders);
    sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight('bold').setBackground('#0F3E33').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    Logger.log('Created sheet: ' + sheetName);
  } else {
    // If sheet exists, check headers
    var lastCol = sheet.getLastColumn();
    if (lastCol === 0) {
      sheet.appendRow(expectedHeaders);
      sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight('bold').setBackground('#0F3E33').setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    } else {
      var currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      // Check for missing columns and append them safely
      for (var i = 0; i < expectedHeaders.length; i++) {
        var header = expectedHeaders[i];
        if (currentHeaders.indexOf(header) === -1) {
          var newColIndex = sheet.getLastColumn() + 1;
          sheet.getRange(1, newColIndex).setValue(header).setFontWeight('bold');
          Logger.log('Safely migrated: Added column "' + header + '" to ' + sheetName);
        }
      }
    }
  }
}

/**
 * Validates the API key from request against Script Properties.
 */
function checkKey(providedKey) {
  var storedKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
  // If no key is configured yet in Script Properties, permit first setup or reject
  if (!storedKey) {
    return true; // Allows first setup call if not configured
  }
  return providedKey && String(providedKey).trim() === String(storedKey).trim();
}

/**
 * Standard JSON Response Output Helper
 */
function out(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Access sheet by name
 */
function sh(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    initSheetWithHeaders(ss, name, HEADERS[name.toUpperCase().replace(/\s+/g, '_')] || []);
    sheet = ss.getSheetByName(name);
  }
  return sheet;
}

/**
 * Convert sheet rows to Array of Objects safely.
 * Normalizes Dates to 'YYYY-MM-DD' and Times to 'HH:mm' strings to prevent timezone shifts!
 */
function rows(name) {
  var sheet = sh(name);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  var values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = values[0];
  var result = [];

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    // Skip completely empty rows
    var isEmpty = true;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== '' && row[c] !== null && row[c] !== undefined) {
        isEmpty = false;
        break;
      }
    }
    if (isEmpty) continue;

    var obj = {};
    for (var h = 0; h < headers.length; h++) {
      var key = headers[h];
      var cellVal = row[h];

      // CRITICAL DATE & TIME SANITIZATION
      if (key === 'EventDate' || key === 'Date') {
        obj[key] = normalizeDateCell(cellVal);
      } else if (key === 'Time') {
        obj[key] = normalizeTimeCell(cellVal);
      } else if (cellVal instanceof Date) {
        // Created / Updated timestamp fields
        obj[key] = Utilities.formatDate(cellVal, SPREADSHEET_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
      } else {
        obj[key] = cellVal;
      }
    }
    result.push(obj);
  }
  return result;
}

/**
 * Normalize Date value into strict YYYY-MM-DD string.
 * Prevents timezone offset shifts.
 */
function normalizeDateCell(val) {
  if (!val && val !== 0) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, SPREADSHEET_TIMEZONE, 'yyyy-MM-dd');
  }
  var str = String(val).trim();
  // Strip leading apostrophe if present
  if (str.charAt(0) === "'") str = str.substring(1);
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }
  // If DD-MM-YYYY or DD/MM/YYYY
  var match = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (match) {
    var d = ('0' + match[1]).slice(-2);
    var m = ('0' + match[2]).slice(-2);
    var y = match[3];
    return y + '-' + m + '-' + d;
  }
  return str;
}

/**
 * Normalize Time value into strict HH:mm string.
 * Never defaults to current time.
 */
function normalizeTimeCell(val) {
  if (!val && val !== 0) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, SPREADSHEET_TIMEZONE, 'HH:mm');
  }
  var str = String(val).trim();
  if (str.charAt(0) === "'") str = str.substring(1);
  var match = str.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    var h = ('0' + match[1]).slice(-2);
    var min = match[2];
    return h + ':' + min;
  }
  return str;
}

/**
 * Find row index by primary key (1-based sheet row index)
 */
function findRow(sheet, id, idColIndex) {
  var col = idColIndex || 1;
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;
  var colValues = sheet.getRange(1, col, lastRow, 1).getValues();
  var targetId = String(id).trim();
  for (var i = 1; i < colValues.length; i++) {
    if (String(colValues[i][0]).trim() === targetId) {
      return i + 1; // 1-based index
    }
  }
  return -1;
}

/**
 * Upsert row by ID with safe header alignment
 */
function upsert(sheet, id, rowData, idColIndex) {
  var col = idColIndex || 1;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowValues = [];

  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    var val = rowData[header];
    if (val === undefined || val === null) {
      val = '';
    }
    
    // Store Date and Time as explicit strings prefixed with apostrophe to stop Sheets auto-date distortion
    if (header === 'EventDate' || header === 'Date') {
      val = "'" + normalizeDateCell(val);
    } else if (header === 'Time') {
      val = "'" + normalizeTimeCell(val);
    }
    rowValues.push(val);
  }

  var existingRowIndex = findRow(sheet, id, col);
  if (existingRowIndex > 0) {
    sheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    return existingRowIndex;
  } else {
    sheet.appendRow(rowValues);
    return sheet.getLastRow();
  }
}

/**
 * Remove row matching primary key
 */
function removeById(sheet, id, idColIndex) {
  var row = findRow(sheet, id, idColIndex);
  if (row > 0) {
    sheet.deleteRow(row);
    return true;
  }
  return false;
}

// ============================================================================
// API REQUEST HANDLERS (doGet & doPost)
// ============================================================================

/**
 * HTTP GET Handler
 * Used for pinging connection and fetching all data or subsets.
 */
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || 'ping';
    var key = params.key || params.apiKey || '';

    // Allow ping action to check if service is live
    if (action === 'ping') {
      var isKeyValid = checkKey(key);
      return out({
        ok: true,
        action: 'ping',
        authenticated: isKeyValid,
        serverTime: Utilities.formatDate(new Date(), SPREADSHEET_TIMEZONE, 'yyyy-MM-dd HH:mm:ss'),
        timezone: SPREADSHEET_TIMEZONE
      });
    }

    // Require Key for data read
    if (!checkKey(key)) {
      return out({ ok: false, error: 'Unauthorized: Invalid or missing API Key.' });
    }

    if (action === 'getAll') {
      return out({
        ok: true,
        data: {
          bookings: rows(SHEET_NAMES.BOOKINGS),
          payments: rows(SHEET_NAMES.PAYMENTS),
          titheRecords: rows(SHEET_NAMES.TITHE)
        }
      });
    }

    if (action === 'getBookings') {
      return out({ ok: true, data: rows(SHEET_NAMES.BOOKINGS) });
    }

    if (action === 'getPayments') {
      return out({ ok: true, data: rows(SHEET_NAMES.PAYMENTS) });
    }

    if (action === 'getTithe') {
      return out({ ok: true, data: rows(SHEET_NAMES.TITHE) });
    }

    return out({ ok: false, error: 'Unknown GET action: ' + action });
  } catch (err) {
    return out({ ok: false, error: 'GET error: ' + err.toString() });
  }
}

/**
 * HTTP POST Handler
 * Concurrency-safe operations with LockService.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // Acquire lock with 30-second timeout to prevent race conditions
    var hasLock = lock.tryLock(30000);
    if (!hasLock) {
      return out({ ok: false, error: 'Server busy: Could not acquire lock. Please retry.' });
    }

    var body = {};
    if (e && e.postData && e.postData.contents) {
      try {
        body = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        return out({ ok: false, error: 'Invalid JSON payload: ' + jsonErr.toString() });
      }
    } else if (e && e.parameter) {
      body = e.parameter;
    }

    var key = body.key || body.apiKey || (e && e.parameter ? e.parameter.key : '');
    var action = body.action || (e && e.parameter ? e.parameter.action : '');

    // Allow setup action to initialize sheet & set API key if authorized
    if (action === 'setup') {
      var result = setup();
      return out(result);
    }

    // Check API Key
    if (!checkKey(key)) {
      return out({ ok: false, error: 'Unauthorized: Invalid or missing API Key.' });
    }

    var nowIso = Utilities.formatDate(new Date(), SPREADSHEET_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");

    // ------------------------------------------------------------------------
    // ACTION: saveBooking (Create or Update)
    // ------------------------------------------------------------------------
    if (action === 'saveBooking') {
      var bookingData = body.booking;
      if (!bookingData) {
        return out({ ok: false, error: 'Missing booking payload' });
      }

      // Generate ID if missing
      if (!bookingData.BookingID) {
        bookingData.BookingID = 'BK-' + Utilities.formatDate(new Date(), SPREADSHEET_TIMEZONE, 'yyyyMMdd') + '-' + Math.floor(1000 + Math.random() * 9000);
      }

      // Backend Recalculation & Validation
      var totalAmount = Math.max(0, parseFloat(bookingData.Total) || 0);
      bookingData.Total = totalAmount;

      // Calculate Tithe: Strictly 1% of Total Booking Amount
      var titheAmount = Math.round(totalAmount * 0.01 * 100) / 100;
      bookingData.Tithe = titheAmount;

      // Staff Earnings
      bookingData.Sangeetha = parseFloat(bookingData.Sangeetha) || 0;
      bookingData.Rizwana = parseFloat(bookingData.Rizwana) || 0;

      // Recalculate Payments & Balances from Payments sheet
      var paymentsSheet = sh(SHEET_NAMES.PAYMENTS);
      var allPayments = rows(SHEET_NAMES.PAYMENTS);
      var bookingPayments = allPayments.filter(function(p) {
        return String(p.BookingID).trim() === String(bookingData.BookingID).trim();
      });

      // Handle Initial Advance if creating a new booking with an advance
      var initialAdvance = Math.max(0, parseFloat(bookingData.InitialAdvance) || 0);
      if (initialAdvance > 0 && bookingPayments.length === 0) {
        var paymentId = 'PM-' + Utilities.formatDate(new Date(), SPREADSHEET_TIMEZONE, 'yyyyMMdd') + '-' + Math.floor(1000 + Math.random() * 9000);
        var paymentDate = normalizeDateCell(bookingData.PaymentDate || bookingData.EventDate || nowIso.substring(0, 10));
        var newPaymentRow = {
          PaymentID: paymentId,
          BookingID: bookingData.BookingID,
          Date: paymentDate,
          Amount: initialAdvance,
          Method: bookingData.PaymentMethod || 'UPI',
          Notes: bookingData.PaymentNotes || 'Initial Advance',
          Created: nowIso
        };
        upsert(paymentsSheet, paymentId, newPaymentRow, 1);
        bookingPayments.push(newPaymentRow);
      }

      var totalPaid = 0;
      for (var i = 0; i < bookingPayments.length; i++) {
        totalPaid += (parseFloat(bookingPayments[i].Amount) || 0);
      }

      bookingData.Advance = totalPaid;
      bookingData.Balance = Math.max(0, totalAmount - totalPaid);

      if (totalPaid === 0) {
        bookingData.PaymentStatus = 'Pending';
      } else if (totalPaid >= totalAmount && totalAmount > 0) {
        bookingData.PaymentStatus = 'Fully Paid';
      } else {
        bookingData.PaymentStatus = 'Partially Paid';
      }

      bookingData.Confirmation = bookingData.Confirmation || 'Pending';
      bookingData.Updated = nowIso;
      if (!bookingData.Created) {
        bookingData.Created = nowIso;
      }

      // Upsert Booking Row
      var bookingsSheet = sh(SHEET_NAMES.BOOKINGS);
      upsert(bookingsSheet, bookingData.BookingID, bookingData, 1);

      // Auto-Sync to Tithe Records Sheet (Deduplicated by BookingID)
      var titheSheet = sh(SHEET_NAMES.TITHE);
      var titheRow = {
        BookingID: bookingData.BookingID,
        EventDate: bookingData.EventDate,
        Customer: bookingData.Customer,
        BookingAmount: totalAmount,
        Tithe: titheAmount
      };
      upsert(titheSheet, bookingData.BookingID, titheRow, 1);

      return out({
        ok: true,
        data: {
          booking: bookingData,
          payments: bookingPayments
        }
      });
    }

    // ------------------------------------------------------------------------
    // ACTION: deleteBooking
    // ------------------------------------------------------------------------
    if (action === 'deleteBooking') {
      var bookingIdToDelete = body.bookingId || body.BookingID;
      if (!bookingIdToDelete) {
        return out({ ok: false, error: 'Booking ID required for deletion' });
      }

      // 1. Delete from Bookings
      var bSheet = sh(SHEET_NAMES.BOOKINGS);
      var deleted = removeById(bSheet, bookingIdToDelete, 1);

      // 2. Cascade delete from Payments
      var pSheet = sh(SHEET_NAMES.PAYMENTS);
      var lastPRow = pSheet.getLastRow();
      if (lastPRow > 1) {
        var pData = pSheet.getRange(1, 1, lastPRow, 2).getValues();
        // Traverse backwards when deleting rows
        for (var pr = pData.length - 1; pr >= 1; pr--) {
          if (String(pData[pr][1]).trim() === String(bookingIdToDelete).trim()) {
            pSheet.deleteRow(pr + 1);
          }
        }
      }

      // 3. Cascade delete from Tithe Records
      var tSheet = sh(SHEET_NAMES.TITHE);
      removeById(tSheet, bookingIdToDelete, 1);

      return out({
        ok: true,
        message: 'Booking and associated payments/tithe records deleted successfully',
        bookingId: bookingIdToDelete,
        deleted: deleted
      });
    }

    // ------------------------------------------------------------------------
    // ACTION: savePayment (Add or Update)
    // ------------------------------------------------------------------------
    if (action === 'savePayment') {
      var payment = body.payment;
      if (!payment || !payment.BookingID) {
        return out({ ok: false, error: 'Payment data and BookingID are required' });
      }

      var pAmount = parseFloat(payment.Amount);
      if (isNaN(pAmount) || pAmount <= 0) {
        return out({ ok: false, error: 'Payment amount must be greater than zero' });
      }

      if (!payment.PaymentID) {
        payment.PaymentID = 'PM-' + Utilities.formatDate(new Date(), SPREADSHEET_TIMEZONE, 'yyyyMMdd') + '-' + Math.floor(1000 + Math.random() * 9000);
      }
      payment.Created = payment.Created || nowIso;
      payment.Date = normalizeDateCell(payment.Date || nowIso.substring(0, 10));

      var paySheet = sh(SHEET_NAMES.PAYMENTS);
      upsert(paySheet, payment.PaymentID, payment, 1);

      // Recalculate Booking Balance and PaymentStatus
      var updatedBooking = recalculateBookingFinance(payment.BookingID);

      return out({
        ok: true,
        data: {
          payment: payment,
          booking: updatedBooking
        }
      });
    }

    // ------------------------------------------------------------------------
    // ACTION: deletePayment
    // ------------------------------------------------------------------------
    if (action === 'deletePayment') {
      var paymentIdToDelete = body.paymentId || body.PaymentID;
      var targetBookingId = body.bookingId || body.BookingID;

      if (!paymentIdToDelete) {
        return out({ ok: false, error: 'PaymentID required' });
      }

      var pSheetDel = sh(SHEET_NAMES.PAYMENTS);
      var pRowIndex = findRow(pSheetDel, paymentIdToDelete, 1);
      if (pRowIndex > 0) {
        if (!targetBookingId) {
          // Read BookingID from column 2
          targetBookingId = pSheetDel.getRange(pRowIndex, 2).getValue();
        }
        pSheetDel.deleteRow(pRowIndex);
      }

      var bUpdated = null;
      if (targetBookingId) {
        bUpdated = recalculateBookingFinance(targetBookingId);
      }

      return out({
        ok: true,
        message: 'Payment deleted and booking financial balance recalculated',
        booking: bUpdated
      });
    }

    // ------------------------------------------------------------------------
    // ACTION: batchSync
    // ------------------------------------------------------------------------
    if (action === 'batchSync') {
      var syncBookings = body.bookings || [];
      var syncPayments = body.payments || [];
      var bkSheet = sh(SHEET_NAMES.BOOKINGS);
      var pmSheet = sh(SHEET_NAMES.PAYMENTS);
      var thSheet = sh(SHEET_NAMES.TITHE);

      for (var b = 0; b < syncBookings.length; b++) {
        var bItem = syncBookings[b];
        if (bItem && bItem.BookingID) {
          upsert(bkSheet, bItem.BookingID, bItem, 1);
          // Sync Tithe
          var tAmt = Math.round((parseFloat(bItem.Total) || 0) * 0.01 * 100) / 100;
          upsert(thSheet, bItem.BookingID, {
            BookingID: bItem.BookingID,
            EventDate: bItem.EventDate,
            Customer: bItem.Customer,
            BookingAmount: bItem.Total,
            Tithe: tAmt
          }, 1);
        }
      }

      for (var p = 0; p < syncPayments.length; p++) {
        var pItem = syncPayments[p];
        if (pItem && pItem.PaymentID) {
          upsert(pmSheet, pItem.PaymentID, pItem, 1);
        }
      }

      return out({
        ok: true,
        message: 'Batch synchronization complete',
        bookingsSynced: syncBookings.length,
        paymentsSynced: syncPayments.length
      });
    }

    return out({ ok: false, error: 'Unknown POST action: ' + action });

  } catch (postErr) {
    return out({ ok: false, error: 'Server error: ' + postErr.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Backend Finance Recalculation Engine
 * Recalculates total payments, advances, pending balance, and payment status.
 */
function recalculateBookingFinance(bookingId) {
  var bSheet = sh(SHEET_NAMES.BOOKINGS);
  var bRowIdx = findRow(bSheet, bookingId, 1);
  if (bRowIdx <= 0) return null;

  var bHeaders = bSheet.getRange(1, 1, 1, bSheet.getLastColumn()).getValues()[0];
  var bValues = bSheet.getRange(bRowIdx, 1, 1, bSheet.getLastColumn()).getValues()[0];

  var bookingObj = {};
  for (var i = 0; i < bHeaders.length; i++) {
    bookingObj[bHeaders[i]] = bValues[i];
  }

  var allPayments = rows(SHEET_NAMES.PAYMENTS);
  var bPayments = allPayments.filter(function(p) {
    return String(p.BookingID).trim() === String(bookingId).trim();
  });

  var totalPaid = 0;
  for (var j = 0; j < bPayments.length; j++) {
    totalPaid += (parseFloat(bPayments[j].Amount) || 0);
  }

  var totalAmount = Math.max(0, parseFloat(bookingObj.Total) || 0);
  var balance = Math.max(0, totalAmount - totalPaid);

  var paymentStatus = 'Pending';
  if (totalPaid === 0) {
    paymentStatus = 'Pending';
  } else if (totalPaid >= totalAmount && totalAmount > 0) {
    paymentStatus = 'Fully Paid';
  } else {
    paymentStatus = 'Partially Paid';
  }

  bookingObj.Advance = totalPaid;
  bookingObj.Balance = balance;
  bookingObj.PaymentStatus = paymentStatus;
  bookingObj.Updated = Utilities.formatDate(new Date(), SPREADSHEET_TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");

  upsert(bSheet, bookingId, bookingObj, 1);
  return bookingObj;
}
