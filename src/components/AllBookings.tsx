import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Download, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CreditCard, 
  Printer, 
  ChevronLeft, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { Booking } from '../types';
import { formatDateDisplay, formatTime12H } from '../utils/dateUtils';

interface AllBookingsProps {
  bookings: Booking[];
  onOpenNewBooking: () => void;
  onViewBooking: (booking: Booking) => void;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (bookingNumber: string) => Promise<void>;
  onAddPayment: (bookingNumber: string) => void;
  onPrintBooking: (booking: Booking) => void;
}

export const AllBookings: React.FC<AllBookingsProps> = ({
  bookings,
  onOpenNewBooking,
  onViewBooking,
  onEditBooking,
  onDeleteBooking,
  onAddPayment,
  onPrintBooking,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [confirmationFilter, setConfirmationFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter & Search
  let filtered = bookings.filter((b) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        b.customerName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.bookingNumber.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (eventTypeFilter && b.eventType !== eventTypeFilter) return false;
    if (paymentStatusFilter && b.paymentStatus !== paymentStatusFilter) return false;
    if (confirmationFilter && b.confirmationStatus !== confirmationFilter) return false;
    return true;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'date-asc') return a.eventDate.localeCompare(b.eventDate);
    if (sortBy === 'date-desc') return b.eventDate.localeCompare(a.eventDate);
    if (sortBy === 'amount-desc') return b.totalAmount - a.totalAmount;
    if (sortBy === 'name-asc') return a.customerName.localeCompare(b.customerName);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'BookingID', 'EventDate', 'Customer', 'Phone', 'Event', 'Time', 
      'Location', 'TotalAmount', 'Advance', 'Balance', 'PaymentStatus', 
      'Confirmation', 'Sangeetha', 'Rizwana', 'Tithe'
    ];
    const rows = filtered.map((b) => [
      b.bookingNumber,
      b.eventDate,
      `"${b.customerName.replace(/"/g, '""')}"`,
      `"${b.phone}"`,
      `"${b.eventType}"`,
      b.eventTime,
      `"${b.location.replace(/"/g, '""')}"`,
      b.totalAmount,
      b.advanceAmount,
      b.balance,
      b.paymentStatus,
      b.confirmationStatus,
      b.sangeethaEarnings,
      b.rizwanaEarnings,
      b.titheAmount
    ]);

    let csvContent = '\uFEFF' + headers.join(',') + '\n';
    rows.forEach((r) => { csvContent += r.join(',') + '\n'; });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Sangeethas_Bookings_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ivory-200">
        <div>
          <h3 className="font-brand font-bold text-xl text-emerald-950 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gold-600" /> Client Bookings Registry
          </h3>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage bridal appointments, payment installments, and client schedule
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-ivory-300 hover:border-gold-500 bg-white hover:bg-gold-50/50 text-xs font-semibold text-emerald-950 transition-all"
          >
            <Download className="w-4 h-4 text-gold-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewBooking}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-grad-gold text-emerald-950 text-xs font-bold shadow-gold hover:shadow-gold-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative lg:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search name, phone, venue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          />
        </div>

        {/* Event Type Filter */}
        <div>
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500"
          >
            <option value="">All Event Types</option>
            <option value="Bridal Makeup">Bridal Makeup</option>
            <option value="Muhurtham Makeup">Muhurtham Makeup</option>
            <option value="Reception Makeup">Reception Makeup</option>
            <option value="Engagement Makeup">Engagement Makeup</option>
            <option value="Baby Shower Makeup">Baby Shower Makeup</option>
            <option value="Puberty Function Makeup">Puberty Function Makeup</option>
            <option value="Bridesmaid Makeup">Bridesmaid Makeup</option>
            <option value="Groom Makeup">Groom Makeup</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500"
          >
            <option value="">All Payment Statuses</option>
            <option value="Fully Paid">Fully Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        {/* Confirmation Status Filter */}
        <div>
          <select
            value={confirmationFilter}
            onChange={(e) => setConfirmationFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500"
          >
            <option value="">All Confirmations</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Sorting */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500"
          >
            <option value="date-asc">Event Date (Upcoming First)</option>
            <option value="date-desc">Event Date (Latest First)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="name-asc">Client Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-xl border border-ivory-300">
        <table className="w-full text-xs text-left">
          <thead className="bg-ivory-100 text-emerald-950 font-bold uppercase tracking-wider text-[11px] border-b border-ivory-300">
            <tr>
              <th className="py-3.5 px-4 whitespace-nowrap">Booking ID</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Client</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Phone</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Event</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Time</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Location</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Total</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Advance</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Balance</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Payment</th>
              <th className="py-3.5 px-4 whitespace-nowrap">Status</th>
              <th className="py-3.5 px-4 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ivory-200">
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-8 text-center text-charcoal-muted">
                  No booking records found matching your filters.
                </td>
              </tr>
            ) : (
              currentItems.map((b) => (
                <tr key={b.id} className="hover:bg-ivory-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-900">{b.bookingNumber}</td>
                  <td className="py-3 px-4 font-bold text-charcoal whitespace-nowrap">{formatDateDisplay(b.eventDate)}</td>
                  <td className="py-3 px-4 font-bold text-emerald-950 whitespace-nowrap">{b.customerName}</td>
                  <td className="py-3 px-4 text-charcoal-muted whitespace-nowrap">{b.phone}</td>
                  <td className="py-3 px-4 font-semibold text-emerald-800 whitespace-nowrap">{b.eventType}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{formatTime12H(b.eventTime)}</td>
                  <td className="py-3 px-4 max-w-[150px] truncate" title={b.location}>{b.location}</td>
                  <td className="py-3 px-4 font-bold whitespace-nowrap">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700 whitespace-nowrap">₹{b.advanceAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-bold text-red-600 whitespace-nowrap">₹{b.balance.toLocaleString('en-IN')}</td>
                  
                  {/* Payment Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.paymentStatus === 'Fully Paid'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : b.paymentStatus === 'Partially Paid'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {b.paymentStatus}
                    </span>
                  </td>

                  {/* Confirmation Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      b.confirmationStatus === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.confirmationStatus === 'Cancelled'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.confirmationStatus}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewBooking(b)}
                        className="p-1.5 rounded-lg bg-ivory text-emerald-950 hover:bg-gold-500 transition-colors"
                        title="View particulars"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onAddPayment(b.bookingNumber)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white transition-colors"
                        title="Record Payment"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onPrintBooking(b)}
                        className="p-1.5 rounded-lg bg-ivory text-charcoal hover:bg-gold-400 transition-colors"
                        title="Print Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onEditBooking(b)}
                        className="p-1.5 rounded-lg bg-ivory text-charcoal hover:bg-gold-500 transition-colors"
                        title="Edit Booking"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Permanently delete booking for "${b.customerName}" (${b.bookingNumber})?`)) {
                            onDeleteBooking(b.bookingNumber);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                        title="Delete Booking"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="text-xs text-charcoal-muted">
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} bookings
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-ivory-300 disabled:opacity-40 hover:bg-ivory transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-emerald-950 px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-ivory-300 disabled:opacity-40 hover:bg-ivory transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
