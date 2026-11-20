import React, { useState } from 'react';
import { Users, UserCheck, User, Award, Download, Search } from 'lucide-react';
import { Booking } from '../types';
import { formatDateDisplay } from '../utils/dateUtils';

interface StaffEarningsViewProps {
  bookings: Booking[];
}

export const StaffEarningsView: React.FC<StaffEarningsViewProps> = ({ bookings }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = bookings.filter((b) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      b.customerName.toLowerCase().includes(q) ||
      b.bookingNumber.toLowerCase().includes(q) ||
      b.eventType.toLowerCase().includes(q)
    );
  });

  const sangeethaTotal = filtered.reduce((sum, b) => sum + (Number(b.sangeethaEarnings) || 0), 0);
  const rizwanaTotal = filtered.reduce((sum, b) => sum + (Number(b.rizwanaEarnings) || 0), 0);
  const combinedTotal = sangeethaTotal + rizwanaTotal;

  const handleExportCSV = () => {
    const headers = ['BookingID', 'EventDate', 'Customer', 'Event', 'TotalContract', 'SangeethaShare', 'RizwanaShare', 'PaymentStatus'];
    const rows = filtered.map((b) => [
      b.bookingNumber,
      b.eventDate,
      `"${b.customerName.replace(/"/g, '""')}"`,
      `"${b.eventType}"`,
      b.totalAmount,
      b.sangeethaEarnings,
      b.rizwanaEarnings,
      b.paymentStatus
    ]);

    let csvContent = '\uFEFF' + headers.join(',') + '\n';
    rows.forEach((r) => { csvContent += r.join(',') + '\n'; });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Sangeethas_Staff_Earnings_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">
              Sangeetha Total Share
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-950">
            ₹{sangeethaTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">Lead Makeup Artist allocation</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">
              Rizwana Total Share
            </span>
            <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-950">
            ₹{rizwanaTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">Senior Artist allocation</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">
              Combined Remuneration
            </span>
            <div className="w-10 h-10 rounded-xl bg-grad-gold text-emerald-950 flex items-center justify-center shadow-gold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-900">
            ₹{combinedTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">Sangeetha + Rizwana payout total</div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ivory-200">
          <div>
            <h3 className="font-brand font-bold text-xl text-emerald-950 flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-600" /> Booking-wise Staff Allocation
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Strict audit separation between client collections and staff earnings
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 w-48"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-ivory-300 hover:border-gold-500 text-xs font-semibold text-emerald-950 hover:bg-gold-50/50 transition-all"
            >
              <Download className="w-4 h-4 text-gold-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-ivory-300">
          <table className="w-full text-xs text-left">
            <thead className="bg-ivory-100 text-emerald-950 font-bold uppercase tracking-wider text-[11px] border-b border-ivory-300">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Event Date</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Total Contract</th>
                <th className="py-3 px-4">Sangeetha Share</th>
                <th className="py-3 px-4">Rizwana Share</th>
                <th className="py-3 px-4">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-charcoal-muted">
                    No records found.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-900">{b.bookingNumber}</td>
                    <td className="py-3 px-4 font-bold whitespace-nowrap">{formatDateDisplay(b.eventDate)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-950">{b.customerName}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">{b.eventType}</td>
                    <td className="py-3 px-4 font-bold">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-800 text-sm">
                      ₹{Number(b.sangeethaEarnings).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-gold-700 text-sm">
                      ₹{Number(b.rizwanaEarnings).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.paymentStatus === 'Fully Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.paymentStatus === 'Partially Paid'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
