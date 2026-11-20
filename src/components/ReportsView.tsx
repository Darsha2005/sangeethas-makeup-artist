import React, { useState } from 'react';
import { BarChart3, Download, Printer, Filter, IndianRupee } from 'lucide-react';
import { Booking, Payment } from '../types';
import { formatDateDisplay } from '../utils/dateUtils';

interface ReportsViewProps {
  bookings: Booking[];
  payments: Payment[];
  onAddPayment: (bookingNumber: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ bookings, payments, onAddPayment }) => {
  const [reportType, setReportType] = useState('monthly-revenue');
  const [dateFilter, setDateFilter] = useState('all');

  const curYear = new Date().toISOString().substring(0, 4);
  const curMonth = new Date().toISOString().substring(0, 7);

  // Filter bookings
  let filteredBookings = [...bookings];
  if (dateFilter === 'this-month') {
    filteredBookings = filteredBookings.filter((b) => b.eventDate.startsWith(curMonth));
  } else if (dateFilter === 'this-year') {
    filteredBookings = filteredBookings.filter((b) => b.eventDate.startsWith(curYear));
  }

  // Monthly Revenue Map
  const monthMap: Record<string, { revenue: number; advance: number; balance: number; count: number }> = {};
  filteredBookings.forEach((b) => {
    const m = b.eventDate ? b.eventDate.substring(0, 7) : 'Unknown';
    if (!monthMap[m]) monthMap[m] = { revenue: 0, advance: 0, balance: 0, count: 0 };
    monthMap[m].revenue += Number(b.totalAmount) || 0;
    monthMap[m].advance += Number(b.advanceAmount) || 0;
    monthMap[m].balance += Number(b.balance) || 0;
    monthMap[m].count += 1;
  });

  // Pending Balances
  const pendingBookings = filteredBookings.filter((b) => Number(b.balance) > 0);
  const totalUncollected = pendingBookings.reduce((sum, b) => sum + (Number(b.balance) || 0), 0);

  // Payment Methods Map
  const methodMap: Record<string, number> = {};
  payments.forEach((p) => {
    const m = p.paymentMethod || 'Other';
    methodMap[m] = (methodMap[m] || 0) + (Number(p.amount) || 0);
  });

  // Event Type Revenue Map
  const eventRevenueMap: Record<string, { count: number; total: number }> = {};
  filteredBookings.forEach((b) => {
    const t = b.eventType || 'Other';
    if (!eventRevenueMap[t]) eventRevenueMap[t] = { count: 0, total: 0 };
    eventRevenueMap[t].count += 1;
    eventRevenueMap[t].total += Number(b.totalAmount) || 0;
  });

  return (
    <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ivory-200">
        <div>
          <h3 className="font-brand font-bold text-xl text-emerald-950 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-gold-600" /> Executive Financial Reports
          </h3>
          <p className="text-xs text-charcoal-muted mt-0.5">
            Audit collection performance, outstanding balance aging, and method distribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-grad-gold text-emerald-950 text-xs font-bold shadow-gold hover:shadow-gold-lg transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-ivory-50 p-4 rounded-xl border border-ivory-300">
        <div>
          <label className="block text-xs font-bold text-charcoal mb-1">Select Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-ivory-300 bg-white focus:outline-none focus:border-gold-500 font-semibold"
          >
            <option value="monthly-revenue">Monthly Revenue & Collection Analysis</option>
            <option value="pending-balances">Outstanding Balances Due (Actionable)</option>
            <option value="payment-methods">Payment Collection Breakdown by Method</option>
            <option value="event-revenue">Revenue by Event & Occasion Type</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-charcoal mb-1">Time Horizon Filter</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-ivory-300 bg-white focus:outline-none focus:border-gold-500 font-semibold"
          >
            <option value="all">All-Time Records</option>
            <option value="this-month">This Calendar Month</option>
            <option value="this-year">This Calendar Year</option>
          </select>
        </div>
      </div>

      {/* Report Content Panels */}
      {reportType === 'monthly-revenue' && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-emerald-950 font-brand">Monthly Revenue Summary</h4>
          <div className="overflow-x-auto rounded-xl border border-ivory-300">
            <table className="w-full text-xs text-left">
              <thead className="bg-ivory-100 text-emerald-950 font-bold uppercase tracking-wider text-[11px] border-b border-ivory-300">
                <tr>
                  <th className="py-3 px-4">Calendar Month</th>
                  <th className="py-3 px-4">Bookings Count</th>
                  <th className="py-3 px-4">Gross Contract Value</th>
                  <th className="py-3 px-4">Advance Collected</th>
                  <th className="py-3 px-4 text-right">Outstanding Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {Object.keys(monthMap).sort().reverse().map((m) => (
                  <tr key={m} className="hover:bg-ivory-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-emerald-950">{m}</td>
                    <td className="py-3 px-4 font-semibold">{monthMap[m].count}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-950">₹{monthMap[m].revenue.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-700">₹{monthMap[m].advance.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 font-extrabold text-red-600 text-right">₹{monthMap[m].balance.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'pending-balances' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-emerald-950 font-brand">Outstanding Client Balances</h4>
            <span className="text-sm font-extrabold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              Total Due: ₹{totalUncollected.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-ivory-300">
            <table className="w-full text-xs text-left">
              <thead className="bg-ivory-100 text-emerald-950 font-bold uppercase tracking-wider text-[11px] border-b border-ivory-300">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Occasion</th>
                  <th className="py-3 px-4">Contract Total</th>
                  <th className="py-3 px-4">Paid to Date</th>
                  <th className="py-3 px-4">Balance Outstanding</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {pendingBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-charcoal-muted">
                      No outstanding balances due! All clients are fully settled.
                    </td>
                  </tr>
                ) : (
                  pendingBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-ivory-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-emerald-950">{b.customerName}</td>
                      <td className="py-3 px-4">{b.phone}</td>
                      <td className="py-3 px-4 font-bold">{formatDateDisplay(b.eventDate)}</td>
                      <td className="py-3 px-4 text-emerald-800">{b.eventType}</td>
                      <td className="py-3 px-4 font-semibold">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 font-bold text-emerald-700">₹{b.advanceAmount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 font-extrabold text-red-600">₹{b.balance.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onAddPayment(b.bookingNumber)}
                          className="px-3 py-1 rounded-lg bg-grad-gold text-emerald-950 text-xs font-bold shadow-xs hover:shadow-sm"
                        >
                          Collect Payment
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'payment-methods' && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-emerald-950 font-brand">Payment Collections by Method</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(methodMap).map(([method, total]) => (
              <div key={method} className="bg-ivory-50 p-4 rounded-xl border border-ivory-300">
                <span className="text-xs uppercase font-bold text-charcoal-muted block">{method}</span>
                <span className="text-2xl font-extrabold text-emerald-900 block mt-1">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reportType === 'event-revenue' && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-emerald-950 font-brand">Occasion & Event Type Revenue Breakdown</h4>
          <div className="overflow-x-auto rounded-xl border border-ivory-300">
            <table className="w-full text-xs text-left">
              <thead className="bg-ivory-100 text-emerald-950 font-bold uppercase tracking-wider text-[11px] border-b border-ivory-300">
                <tr>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Total Bookings Count</th>
                  <th className="py-3 px-4 text-right">Gross Generated Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-200">
                {Object.entries(eventRevenueMap).map(([event, stat]) => (
                  <tr key={event} className="hover:bg-ivory-50">
                    <td className="py-3 px-4 font-bold text-emerald-950">{event}</td>
                    <td className="py-3 px-4 font-semibold">{stat.count} events</td>
                    <td className="py-3 px-4 font-extrabold text-emerald-900 text-right">
                      ₹{stat.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
