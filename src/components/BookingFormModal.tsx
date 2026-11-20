import React, { useState, useEffect } from 'react';
import { X, CalendarPlus, CheckCircle, Calculator, Sparkles } from 'lucide-react';
import { Booking } from '../types';
import { getTodayIso, toIsoDate } from '../utils/dateUtils';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  editBooking?: Booking | null;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editBooking = null,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('Bridal Makeup');
  const [customEventType, setCustomEventType] = useState('');
  const [eventDate, setEventDate] = useState(getTodayIso());
  const [eventTime, setEventTime] = useState('06:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>(15000);
  const [initialAdvance, setInitialAdvance] = useState<number | ''>(5000);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Bank Transfer' | 'Other'>('UPI');
  const [sangeethaEarnings, setSangeethaEarnings] = useState<number | ''>(9000);
  const [rizwanaEarnings, setRizwanaEarnings] = useState<number | ''>(4000);
  const [confirmationStatus, setConfirmationStatus] = useState<'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'>('Confirmed');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editBooking) {
      setCustomerName(editBooking.customerName || '');
      setPhone(editBooking.phone || '');
      
      const standardEvents = [
        'Bridal Makeup', 'Muhurtham Makeup', 'Reception Makeup', 'Engagement Makeup',
        'Baby Shower Makeup', 'Puberty Function Makeup', 'Bridesmaid Makeup', 'Groom Makeup'
      ];
      if (standardEvents.includes(editBooking.eventType)) {
        setEventType(editBooking.eventType);
        setCustomEventType('');
      } else {
        setEventType('Other');
        setCustomEventType(editBooking.eventType);
      }

      setEventDate(toIsoDate(editBooking.eventDate) || getTodayIso());
      setEventTime(editBooking.eventTime || '06:00');
      setLocation(editBooking.location || '');
      setNotes(editBooking.notes || '');
      setTotalAmount(editBooking.totalAmount || 0);
      setInitialAdvance(''); // Not used during edit (payments managed in ledger)
      setSangeethaEarnings(editBooking.sangeethaEarnings || 0);
      setRizwanaEarnings(editBooking.rizwanaEarnings || 0);
      setConfirmationStatus(editBooking.confirmationStatus || 'Confirmed');
    } else {
      // Reset defaults
      setCustomerName('');
      setPhone('');
      setEventType('Bridal Makeup');
      setCustomEventType('');
      setEventDate(getTodayIso());
      setEventTime('06:00');
      setLocation('');
      setNotes('');
      setTotalAmount(15000);
      setInitialAdvance(5000);
      setPaymentMethod('UPI');
      setSangeethaEarnings(9000);
      setRizwanaEarnings(4000);
      setConfirmationStatus('Confirmed');
    }
  }, [editBooking, isOpen]);

  if (!isOpen) return null;

  // Live Calculations
  const numericTotal = typeof totalAmount === 'number' ? totalAmount : 0;
  const numericAdvance = typeof initialAdvance === 'number' ? initialAdvance : 0;
  const numericSangeetha = typeof sangeethaEarnings === 'number' ? sangeethaEarnings : 0;
  const numericRizwana = typeof rizwanaEarnings === 'number' ? rizwanaEarnings : 0;

  // Strict 1% Tithe from full contract value
  const tithePreview = Math.round(numericTotal * 0.01 * 100) / 100;
  const balancePreview = Math.max(0, numericTotal - numericAdvance);
  const staffAllocationTotal = numericSangeetha + numericRizwana;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!customerName || !phone || !eventDate || !eventTime || !location) {
      alert('Please fill in all required fields.');
      return;
    }

    if (!editBooking && numericAdvance > numericTotal && numericTotal > 0) {
      alert('Initial advance cannot exceed the total booking amount.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        eventType: eventType === 'Other' ? (customEventType.trim() || 'Other') : eventType,
        eventDate: toIsoDate(eventDate),
        eventTime: eventTime.trim(),
        location: location.trim(),
        notes: notes.trim(),
        totalAmount: numericTotal,
        sangeethaEarnings: numericSangeetha,
        rizwanaEarnings: numericRizwana,
        confirmationStatus,
      };

      if (!editBooking) {
        payload.initialAdvance = numericAdvance;
        payload.paymentMethod = paymentMethod;
        payload.paymentNotes = 'Initial advance payment';
      }

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      alert(`Error saving booking: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gold-500/30 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-900 via-emerald-850 to-emerald-900 text-white flex items-center justify-between border-b border-gold-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-grad-gold flex items-center justify-center text-emerald-950 shadow-gold">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-brand font-bold text-lg">
                {editBooking ? `Edit Booking – ${editBooking.bookingNumber}` : 'Create New Bridal Booking'}
              </h3>
              <p className="text-xs text-gold-300">
                {editBooking ? 'Modify appointment specifics and financial quotas' : 'Enter bridal client particulars and schedule'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Customer Particulars */}
          <div>
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" /> Client & Schedule Particulars
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priyadharshini M."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                >
                  <option value="Bridal Makeup">Bridal Makeup</option>
                  <option value="Muhurtham Makeup">Muhurtham Makeup</option>
                  <option value="Reception Makeup">Reception Makeup</option>
                  <option value="Engagement Makeup">Engagement Makeup</option>
                  <option value="Baby Shower Makeup">Baby Shower Makeup</option>
                  <option value="Puberty Function Makeup">Puberty Function Makeup</option>
                  <option value="Bridesmaid Makeup">Bridesmaid Makeup</option>
                  <option value="Groom Makeup">Groom Makeup</option>
                  <option value="Other">Other (Custom Event)</option>
                </select>
              </div>

              {eventType === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">
                    Custom Event Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter custom occasion"
                    value={customEventType}
                    onChange={(e) => setCustomEventType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                  />
                </div>
              )}

              {/* Exact Date & Time Fields */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 font-semibold"
                />
                <span className="text-[10px] text-charcoal-muted">Strict YYYY-MM-DD (No timezone shift)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Event Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 font-semibold"
                />
                <span className="text-[10px] text-charcoal-muted">Stored as HH:mm 24-hr format</span>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Venue / Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Krishna Kalyana Mandapam, Chennai"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                />
              </div>
            </div>
          </div>

          {/* Financial Particulars */}
          <div className="pt-4 border-t border-ivory-300">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Calculator className="w-3.5 h-3.5 text-gold-600" /> Contract Value & Advance Payment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Total Booking Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 font-bold"
                />
              </div>

              {!editBooking && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      Initial Advance (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={initialAdvance}
                      onChange={(e) => setInitialAdvance(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">
                      Advance Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                    >
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Confirmation Status
                </label>
                <select
                  value={confirmationStatus}
                  onChange={(e) => setConfirmationStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Staff Allocations */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Sangeetha Earnings (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={sangeethaEarnings}
                  onChange={(e) => setSangeethaEarnings(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Rizwana Earnings (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={rizwanaEarnings}
                  onChange={(e) => setRizwanaEarnings(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Service Notes / Special Requests
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Traditional saree draping, HD airbrush requested, 2 extra family members..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                />
              </div>
            </div>
          </div>

          {/* LIVE PREVIEW BOX */}
          <div className="bg-gradient-to-br from-gold-50 to-ivory-100 p-4 rounded-2xl border border-gold-400/40 grid grid-cols-2 sm:grid-cols-4 gap-3 shadow-sm">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gold-700 block">
                God's Tithe (1%)
              </span>
              <span className="text-lg font-extrabold text-gold-700">
                ₹{tithePreview.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-charcoal-muted block">1% of Full Contract</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
                Advance / Paid
              </span>
              <span className="text-lg font-extrabold text-emerald-800">
                ₹{numericAdvance.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 block">
                Pending Balance
              </span>
              <span className="text-lg font-extrabold text-red-600">
                ₹{balancePreview.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-950 block">
                Staff Allocation
              </span>
              <span className="text-lg font-extrabold text-emerald-950">
                ₹{staffAllocationTotal.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-charcoal-muted block">Sangeetha + Rizwana</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ivory-300">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-ivory-300 text-charcoal hover:bg-ivory text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-grad-gold text-emerald-950 text-sm font-bold shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : editBooking ? 'Update Appointment' : 'Confirm & Save Booking'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
