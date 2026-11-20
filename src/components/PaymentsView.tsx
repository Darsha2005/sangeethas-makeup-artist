import React, { useState } from 'react';
import { CreditCard, Plus, Search, Trash2, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Payment, Booking } from '../types';
import { formatDateDisplay, getTodayIso, toIsoDate } from '../utils/dateUtils';

interface PaymentsViewProps {
  payments: Payment[];
  bookings: Booking[];
  onAddPayment: (data: any) => Promise<void>;
  onDeletePayment: (paymentId: string) => Promise<void>;
  onViewBooking: (booking: Booking) => void;
  preSelectedBookingNumber?: string | null;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  bookings,
  onAddPayment,
  onDeletePayment,
  onViewBooking,
  preSelectedBookingNumber = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for new payment
  const [selectedBookingId, setSelectedBookingId] = useState(preSelectedBookingNumber || '');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState(getTodayIso());
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Bank Transfer' | 'Other'>('UPI');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selectedBooking = bookings.find((b) => b.bookingNumber === selectedBookingId);

  // Open modal if preSelectedBookingNumber passed
  React.useEffect(() => {
    if (preSelectedBookingNumber) {
      setSelectedBookingId(preSelectedBookingNumber);
      const b = bookings.find((item) => item.bookingNumber === preSelectedBookingNumber);
      if (b && b.balance > 0) setAmount(b.balance);
      setIsModalOpen(true);
    }
  }, [preSelectedBookingNumber, bookings]);

  const handleBookingChange = (bNum: string) => {
    setSelectedBookingId(bNum);
    const b = bookings.find((item) => item.bookingNumber === bNum);
    if (b && b.balance > 0) {
      setAmount(b.balance);
    } else {
      setAmount('');
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !amount || Number(amount) <= 0) {
      alert('Please select a booking and enter a valid positive payment amount.');
      return;
    }

    if (selectedBooking && Number(amount) > selectedBooking.balance && selectedBooking.balance > 0) {
      if (!confirm(`Warning: Payment of ₹${Number(amount).toLocaleString('en-IN')} exceeds current pending balance of ₹${selectedBooking.balance.toLocaleString('en-IN')}.\nDo you want to proceed?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      await onAddPayment({
        bookingId: selectedBookingId,
        amount: Number(amount),
        paymentDate: toIsoDate(paymentDate),
        paymentMethod,
        notes: notes.trim(),
      });
      setIsModalOpen(false);
      setAmount('');
      setNotes('');
    } catch (err: any) {
      alert(`Error saving payment: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        p.paymentId.toLowerCase().includes(q) ||
        p.bookingId.toLowerCase().includes(q) ||
        (p.customerName && p.customerName.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (methodFilter && p.paymentMethod !== methodFilter) return false;
    return true;
  });

  const totalCollected = filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-brand font-bold text-xl text-emerald-950 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold-600" /> Payment Ledger & Collections
          </h3>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Manage advance tokens, partial installments, and final balance settlements
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            Total Filtered: ₹{totalCollected.toLocaleString('en-IN')}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-grad-gold text-emerald-950 text-xs font-bold shadow-gold hover:shadow-gold-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-2xl p-4 border border-ivory-300 shadow-sm flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search payments by ID, client, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500"
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500"
        >
          <option value="">All Payment Methods</option>
          <option value="UPI">UPI / GPay / PhonePe</option>
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer / NEFT</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto rounded-xl border border-ivory-300">
          <table className="w-full text-xs text-left">
            <thead className="bg-ivory-100 text-emerald-950 font-bold uppercase tracking-wider text-[11px] border-b border-ivory-300">
              <tr>
                <th className="py-3.5 px-4 whitespace-nowrap">Payment ID</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Booking ID</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Client</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Date</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Amount</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Method</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Notes</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Recorded</th>
                <th className="py-3.5 px-4 whitespace-nowrap text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-charcoal-muted">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-900">{p.paymentId}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => {
                          const b = bookings.find((item) => item.bookingNumber === p.bookingId);
                          if (b) onViewBooking(b);
                        }}
                        className="font-mono text-gold-700 hover:underline font-bold"
                      >
                        {p.bookingId}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-950">{p.customerName || '-'}</td>
                    <td className="py-3 px-4 font-bold whitespace-nowrap">{formatDateDisplay(p.paymentDate)}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700 text-sm whitespace-nowrap">
                      ₹{Number(p.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-ivory text-emerald-950 font-semibold border border-ivory-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-charcoal-muted max-w-[200px] truncate">{p.notes || '-'}</td>
                    <td className="py-3 px-4 text-[10px] text-charcoal-muted whitespace-nowrap">
                      {p.createdAt ? p.createdAt.replace('T', ' ').substring(0, 16) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          if (confirm(`Delete payment "${p.paymentId}" of ₹${p.amount}? Booking balance will be recalculated.`)) {
                            onDeletePayment(p.paymentId);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                        title="Delete payment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gold-500/30 overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 to-emerald-850 text-white flex items-center justify-between">
              <h3 className="font-brand font-bold text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold-400" /> Record Client Payment
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/70 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Select Booking <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedBookingId}
                  onChange={(e) => handleBookingChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500"
                >
                  <option value="">-- Choose a Client Appointment --</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.bookingNumber}>
                      {b.customerName} – {b.bookingNumber} (Due: ₹{b.balance.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {selectedBooking && (
                <div className="p-3 rounded-xl bg-ivory-100 border border-ivory-300 text-xs space-y-1">
                  <div>
                    <span className="text-charcoal-muted">Contract Total:</span>{' '}
                    <strong>₹{selectedBooking.totalAmount.toLocaleString('en-IN')}</strong> |{' '}
                    <span className="text-charcoal-muted">Paid So Far:</span>{' '}
                    <strong className="text-emerald-700">₹{selectedBooking.advanceAmount.toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="text-sm font-bold text-red-600">
                    Outstanding Balance: ₹{selectedBooking.balance.toLocaleString('en-IN')}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Payment Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500"
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Notes / Reference Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref: 312384912903, final installment"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-ivory-300 text-xs font-semibold hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-grad-gold text-emerald-950 text-xs font-bold shadow-gold hover:shadow-gold-lg disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
