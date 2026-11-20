import React, { useState } from 'react';
import { HeartHandshake, Calendar, CheckCheck, Download, Printer, Search } from 'lucide-react';
import { TitheRecord, Booking } from '../types';
import { formatDateDisplay } from '../utils/dateUtils';

interface GodsTitheViewProps {
  titheRecords: TitheRecord[];
  bookings: Booking[];
}

export const GodsTitheView: React.FC<GodsTitheViewProps> = ({ titheRecords, bookings }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const curMonth = new Date().toISOString().substring(0, 7);
  const curYear = new Date().toISOString().substring(0, 4);

  // Match customer name from bookings if missing in record
  const enrichedRecords = titheRecords.map((t) => {
    const b = bookings.find((item) => item.bookingNumber === t.bookingId);
    return {
      ...t,
      customerName: t.customerName || (b ? b.customerName : 'Client'),
      eventType: t.eventType || (b ? b.eventType : 'Bridal Service'),
      bookingAmount: t.bookingAmount || (b ? b.totalAmount : 0),
    };
  });

  const filtered = enrichedRecords.filter((t) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (t.customerName && t.customerName.toLowerCase().includes(q)) ||
      t.bookingId.toLowerCase().includes(q) ||
      (t.eventType && t.eventType.toLowerCase().includes(q))
    );
  });

  const totalTithe = enrichedRecords.reduce((sum, t) => sum + (Number(t.titheAmount) || 0), 0);
  const monthTithe = enrichedRecords
    .filter((t) => t.eventDate && t.eventDate.startsWith(curMonth))
    .reduce((sum, t) => sum + (Number(t.titheAmount) || 0), 0);
  const yearTithe = enrichedRecords
    .filter((t) => t.eventDate && t.eventDate.startsWith(curYear))
    .reduce((sum, t) => sum + (Number(t.titheAmount) || 0), 0);

  const handleExportCSV = () => {
    const headers = ['BookingID', 'EventDate', 'Customer', 'BookingAmount', 'TitheOffering'];
    const rows = filtered.map((t) => [
      t.bookingId,
      t.eventDate,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      t.bookingAmount,
      t.titheAmount
    ]);

    let csvContent = '\uFEFF' + headers.join(',') + '\n';
    rows.forEach((r) => { csvContent += r.join(',') + '\n'; });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Gods_Tithe_Statement_${new Date().toISOString().substring(0, 10)}.csv`;
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
            <span className="text-xs uppercase font-bold tracking-wider text-gold-700">
              Total God's Tithe
            </span>
            <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center shadow-gold">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gold-700">
            ₹{totalTithe.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">Constituted 1% of gross revenue</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">
              Tithe This Month
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-950">
            ₹{monthTithe.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">Accrued current calendar month</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">
              Total Bookings Tithed
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <CheckCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-950">
            {enrichedRecords.length}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">Dedicated appointments offering</div>
        </div>
      </div>

      {/* Tithe Ledger Table */}
      <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ivory-200">
          <div>
            <h3 className="font-brand font-bold text-xl text-emerald-950 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-gold-600" /> Consecrated Offerings Ledger
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Strictly calculated at 1% of full contract amount with deduplication per booking
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tithe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 w-44"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-ivory-300 hover:border-gold-500 text-xs font-semibold text-emerald-950 hover:bg-gold-50/50 transition-all"
            >
              <Download className="w-4 h-4 text-gold-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-grad-gold text-emerald-950 text-xs font-bold shadow-gold hover:shadow-gold-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Statement</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-ivory-300">
          <table className="w-full text-xs text-left">
            <thead className="bg-ivory-100 text-emerald-950 font-bold uppercase tracking-wider text-[11px] border-b border-ivory-300">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Event Date</th>
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Occasion</th>
                <th className="py-3 px-4">Booking Amount</th>
                <th className="py-3 px-4 text-right">Tithe Offering (1%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-charcoal-muted">
                    No tithe records recorded yet.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-ivory-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-900">{t.bookingId}</td>
                    <td className="py-3 px-4 font-bold whitespace-nowrap">{formatDateDisplay(t.eventDate)}</td>
                    <td className="py-3 px-4 font-bold text-emerald-950">{t.customerName}</td>
                    <td className="py-3 px-4 text-emerald-800 font-semibold">{t.eventType}</td>
                    <td className="py-3 px-4 font-bold">₹{Number(t.bookingAmount).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-gold-700 text-sm whitespace-nowrap">
                      ₹{Number(t.titheAmount).toLocaleString('en-IN')}
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
