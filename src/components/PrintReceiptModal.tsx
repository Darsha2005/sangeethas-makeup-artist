import React from 'react';
import { X, Printer } from 'lucide-react';
import { Booking, Payment } from '../types';
import { formatDateDisplay, formatTime12H } from '../utils/dateUtils';

interface PrintReceiptModalProps {
  booking: Booking | null;
  payments: Payment[];
  isOpen: boolean;
  onClose: () => void;
  businessName?: string;
  phone?: string;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  booking,
  payments,
  isOpen,
  onClose,
  businessName = "SANGEETHA'S MAKEUP ARTIST",
  phone = "+91 9042468594",
}) => {
  if (!isOpen || !booking) return null;

  const bPayments = payments.filter((p) => p.bookingId === booking.bookingNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gold-500/30 overflow-hidden my-8">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-6 py-4 bg-ivory-100 border-b border-ivory-200 flex items-center justify-between no-print">
          <span className="text-xs font-bold text-emerald-950">Printable Client Invoice & Receipt</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-grad-gold text-emerald-950 text-xs font-bold shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Now</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-ivory text-charcoal-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Section */}
        <div id="printable-receipt" className="p-8 sm:p-10 font-sans text-charcoal space-y-6">
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-dashed border-ivory-300">
            <h1 className="font-brand font-bold text-2xl tracking-wider text-emerald-950 uppercase">
              {businessName}
            </h1>
            <p className="text-xs uppercase tracking-widest text-gold-700 font-semibold mt-1">
              Luxury Bridal Couturier & Professional Makeup Studio
            </p>
            <p className="text-xs text-charcoal-muted mt-1.5">
              Contact / WhatsApp: <strong>{phone}</strong> | Timezone: Asia/Kolkata
            </p>
          </div>

          {/* Client & Booking Info */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div>
              <span className="text-charcoal-muted uppercase tracking-wider block font-bold text-[10px]">
                Billed To Client:
              </span>
              <div className="text-base font-extrabold text-emerald-950 mt-0.5">{booking.customerName}</div>
              <div className="text-charcoal-muted mt-0.5">Mobile: {booking.phone}</div>
              <div className="text-charcoal-muted mt-0.5">Venue: {booking.location}</div>
            </div>

            <div className="text-right">
              <span className="text-charcoal-muted uppercase tracking-wider block font-bold text-[10px]">
                Invoice Details:
              </span>
              <div className="font-mono font-bold text-emerald-900 mt-0.5">ID: {booking.bookingNumber}</div>
              <div className="text-charcoal-muted mt-0.5">
                Event Date: <strong>{formatDateDisplay(booking.eventDate)}</strong>
              </div>
              <div className="text-charcoal-muted mt-0.5">
                Event Time: <strong>{formatTime12H(booking.eventTime)}</strong>
              </div>
            </div>
          </div>

          {/* Service Particulars */}
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-ivory-100 border-b-2 border-emerald-900 text-emerald-950 font-bold uppercase">
                <th className="py-2.5 px-3">Service Description</th>
                <th className="py-2.5 px-3 text-right">Agreed Contract Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ivory-200">
                <td className="py-3 px-3">
                  <div className="font-bold text-emerald-950 text-sm">{booking.eventType}</div>
                  <div className="text-charcoal-muted text-[11px] mt-0.5">
                    {booking.notes || 'Luxury bridal makeover, hair styling, saree draping & touchup support.'}
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-extrabold text-sm text-emerald-950">
                  ₹{booking.totalAmount.toLocaleString('en-IN')}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Payments Received Table */}
          <div>
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
              Payments Received Breakdown:
            </h4>
            <table className="w-full text-xs text-left border-collapse border border-ivory-200">
              <thead>
                <tr className="bg-ivory-50 text-charcoal-muted font-bold text-[10px] border-b border-ivory-200">
                  <th className="py-2 px-3">Payment ID</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Method</th>
                  <th className="py-2 px-3 text-right">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-100">
                {bPayments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-3 text-center text-charcoal-muted">
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  bPayments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2 px-3 font-mono">{p.paymentId}</td>
                      <td className="py-2 px-3">{formatDateDisplay(p.paymentDate)}</td>
                      <td className="py-2 px-3">{p.paymentMethod}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-charcoal-muted">Contract Total:</span>
                <strong>₹{booking.totalAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Total Paid:</span>
                <strong>₹{booking.advanceAmount.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-emerald-900 text-sm font-extrabold text-emerald-950">
                <span>Balance Due:</span>
                <span className={booking.balance > 0 ? 'text-red-600' : 'text-emerald-700'}>
                  ₹{booking.balance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Signature */}
          <div className="pt-8 border-t border-dashed border-ivory-300 flex justify-between items-end text-xs text-charcoal-muted">
            <div>
              <p>Thank you for choosing Sangeetha's Makeup Artist!</p>
              <p className="text-[10px] mt-0.5">Computer-generated business invoice. Valid without physical signature.</p>
            </div>
            <div className="text-right">
              <div className="h-10 border-b border-charcoal-muted w-36 mb-1"></div>
              <p className="font-semibold text-[10px]">Authorized Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
