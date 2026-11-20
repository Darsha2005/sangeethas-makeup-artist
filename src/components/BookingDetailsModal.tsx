import React from 'react';
import { X, Printer, Edit, CreditCard, Sparkles, MapPin, Phone, Calendar, Clock, IndianRupee } from 'lucide-react';
import { Booking, Payment } from '../types';
import { formatDateDisplay, formatTime12H } from '../utils/dateUtils';

interface BookingDetailsModalProps {
  booking: Booking | null;
  payments: Payment[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onAddPayment: (bookingNumber: string) => void;
  onPrint: (booking: Booking) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  payments,
  isOpen,
  onClose,
  onEdit,
  onAddPayment,
  onPrint,
}) => {
  if (!isOpen || !booking) return null;

  const bPayments = payments.filter((p) => p.bookingId === booking.bookingNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gold-500/30 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 via-emerald-850 to-emerald-900 text-white flex items-center justify-between border-b border-gold-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-grad-gold flex items-center justify-center text-emerald-950 shadow-gold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-lg">Booking Details</h3>
              <p className="text-xs text-gold-300 font-mono">{booking.bookingNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Client & Occasion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-ivory-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-charcoal-muted tracking-wider block">
                Client Name
              </span>
              <div className="text-xl font-extrabold text-emerald-950">{booking.customerName}</div>
              <div className="flex items-center gap-1.5 text-xs text-charcoal-muted mt-1">
                <Phone className="w-3.5 h-3.5 text-gold-600" />
                <span>{booking.phone}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-charcoal-muted tracking-wider block">
                Occasion & Timing
              </span>
              <div className="text-lg font-bold text-emerald-800">{booking.eventType}</div>
              <div className="flex items-center gap-2 text-xs text-charcoal-muted mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gold-600" />
                  <strong>{formatDateDisplay(booking.eventDate)}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gold-600" />
                  <strong>{formatTime12H(booking.eventTime)}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Venue & Notes */}
          <div className="p-3.5 rounded-xl bg-ivory-50 border border-ivory-300 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong>Venue:</strong> {booking.location}
              </div>
            </div>
            {booking.notes && (
              <div className="pt-1.5 border-t border-ivory-200">
                <strong>Service Notes:</strong> {booking.notes}
              </div>
            )}
          </div>

          {/* Financial Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gradient-to-br from-gold-50/50 to-ivory-50 p-4 rounded-2xl border border-gold-400/30">
            <div>
              <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Contract Total</span>
              <span className="text-lg font-extrabold text-emerald-950">
                ₹{booking.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Advance / Paid</span>
              <span className="text-lg font-extrabold text-emerald-700">
                ₹{booking.advanceAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-charcoal-muted block">Pending Balance</span>
              <span className={`text-lg font-extrabold ${booking.balance > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                ₹{booking.balance.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-gold-700 block">God's Tithe (1%)</span>
              <span className="text-lg font-extrabold text-gold-700">
                ₹{booking.titheAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payment History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-brand font-bold text-sm text-emerald-950">Recorded Payments</h4>
              <button
                onClick={() => {
                  onClose();
                  onAddPayment(booking.bookingNumber);
                }}
                className="text-xs font-bold text-gold-700 hover:text-gold-600 flex items-center gap-1"
              >
                + Add Payment
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-ivory-300">
              <table className="w-full text-xs text-left">
                <thead className="bg-ivory-100 text-emerald-950 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {bPayments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-charcoal-muted">
                        No payments recorded yet.
                      </td>
                    </tr>
                  ) : (
                    bPayments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2.5 px-3 font-medium">{formatDateDisplay(p.paymentDate)}</td>
                        <td className="py-2.5 px-3 font-semibold">{p.paymentMethod}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700">₹{p.amount.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-charcoal-muted">{p.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-ivory-50 border-t border-ivory-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onPrint(booking)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-ivory-300 hover:border-gold-500 bg-white text-xs font-semibold text-emerald-950 transition-all"
          >
            <Printer className="w-4 h-4 text-gold-600" />
            <span>Print Receipt</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onAddPayment(booking.bookingNumber);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>Record Payment</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onEdit(booking);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-grad-gold text-emerald-950 text-xs font-bold shadow-gold hover:shadow-gold-lg transition-all"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Booking</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
