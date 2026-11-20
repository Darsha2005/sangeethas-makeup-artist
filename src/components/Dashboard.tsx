import React, { useState } from 'react';
import { 
  CalendarCheck, 
  IndianRupee, 
  Wallet, 
  ClockAlert, 
  UserCheck, 
  User, 
  HeartHandshake, 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart2, 
  Clock, 
  ArrowUpRight, 
  Eye, 
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { DashboardStats, Booking } from '../types';
import { formatDateDisplay, formatTime12H } from '../utils/dateUtils';

interface DashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
  onFilterChange: (range: string) => void;
  activeFilter: string;
  onViewBooking: (booking: Booking) => void;
  onViewAllBookings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  loading,
  onFilterChange,
  activeFilter,
  onViewBooking,
  onViewAllBookings,
}) => {
  if (loading || !stats) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="h-10 bg-ivory-200 rounded-xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-ivory-300" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white rounded-2xl border border-ivory-300" />
          <div className="h-80 bg-white rounded-2xl border border-ivory-300" />
        </div>
      </div>
    );
  }

  const { kpis, monthlyData, paymentStatusCounts, eventTypes, upcomingEvents, recentBookings } = stats;

  const pieData = [
    { name: 'Fully Paid', value: paymentStatusCounts.fullyPaid, color: '#10B981' },
    { name: 'Partially Paid', value: paymentStatusCounts.partiallyPaid, color: '#F59E0B' },
    { name: 'Pending', value: paymentStatusCounts.pending, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const filterOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' },
  ];

  return (
    <div className="space-y-8">
      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-ivory-300 shadow-sm">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onFilterChange(opt.id)}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === opt.id
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-ivory text-charcoal hover:bg-gold-50 hover:text-gold-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-charcoal-muted font-medium">
          Database: <span className="font-bold text-emerald-900">SQLite Active</span>
        </div>
      </div>

      {/* KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bookings */}
        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-grad-gold" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">Total Bookings</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-950">{kpis.totalBookings}</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">
            {kpis.confirmedBookings} Confirmed appointments
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-grad-gold" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-950">
            ₹{kpis.totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">Gross contract booking value</div>
        </div>

        {/* Total Advance */}
        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-grad-gold" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">Advance Received</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">
            ₹{kpis.totalAdvance.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">Collected via Cash, UPI & Bank</div>
        </div>

        {/* Pending Balance */}
        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-400" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">Pending Balance</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ClockAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-red-600">
            ₹{kpis.pendingBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">Outstanding collections due</div>
        </div>

        {/* Sangeetha Earnings */}
        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">Sangeetha Share</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-950">
            ₹{kpis.sangeethaEarnings.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">Lead Makeup Artist allocation</div>
        </div>

        {/* Rizwana Earnings */}
        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-charcoal-muted">Rizwana Share</span>
            <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-950">
            ₹{kpis.rizwanaEarnings.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">Senior Artist allocation</div>
        </div>

        {/* God's Tithe (1%) */}
        <div className="bg-white rounded-2xl p-5 border border-gold-500/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all sm:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-bold tracking-wider text-gold-700">God's Tithe (Strict 1%)</span>
            <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center shadow-gold">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-gold-700">
            ₹{kpis.godsTithe.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-charcoal-muted mt-1">
            Dedicated 1% offering calculated strictly on full contract values
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Advance Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-brand font-bold text-lg text-emerald-950 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gold-600" /> Monthly Revenue & Collections
            </h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ecdf" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip 
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#FAF7F0', borderRadius: '12px', border: '1px solid #D6B36A' }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Total Contract" fill="#123D32" radius={[6, 6, 0, 0]} />
                <Bar dataKey="advance" name="Advance Received" fill="#D6B36A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-brand font-bold text-lg text-emerald-950 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-gold-600" /> Payment Status
            </h3>
          </div>
          <div className="h-72 w-full">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-charcoal-muted">
                No payment data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UPCOMING & RECENT SCHEDULE TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-brand font-bold text-lg text-emerald-950 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold-600" /> Upcoming Appointments
            </h3>
            <button
              onClick={onViewAllBookings}
              className="text-xs font-bold text-gold-700 hover:text-gold-600 flex items-center gap-1"
            >
              View Schedule <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8 text-sm text-charcoal-muted">
                No upcoming events scheduled.
              </div>
            ) : (
              upcomingEvents.map((b) => (
                <div
                  key={b.id}
                  onClick={() => onViewBooking(b)}
                  className="p-3.5 rounded-xl border border-ivory-200 hover:border-gold-400 bg-ivory-50/50 hover:bg-white transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-sm text-emerald-950">{b.customerName}</div>
                    <div className="text-xs text-emerald-800 font-semibold">{b.eventType}</div>
                    <div className="text-[11px] text-charcoal-muted">{b.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-emerald-950">
                      {formatDateDisplay(b.eventDate)}
                    </div>
                    <div className="text-xs text-gold-700 font-bold">
                      {formatTime12H(b.eventTime)}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      ₹{b.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Bookings Activity */}
        <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-brand font-bold text-lg text-emerald-950 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold-600" /> Latest Client Bookings
            </h3>
            <button
              onClick={onViewAllBookings}
              className="text-xs font-bold text-gold-700 hover:text-gold-600 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-ivory-200 text-charcoal-muted font-bold">
                  <th className="py-2.5">Date</th>
                  <th className="py-2.5">Client</th>
                  <th className="py-2.5">Total</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ivory-100">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-ivory-50/50">
                    <td className="py-2.5 font-medium">{formatDateDisplay(b.eventDate)}</td>
                    <td className="py-2.5 font-bold text-emerald-950">{b.customerName}</td>
                    <td className="py-2.5 font-semibold">₹{b.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-2.5">
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
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onViewBooking(b)}
                        className="p-1.5 rounded-lg bg-ivory text-emerald-950 hover:bg-gold-500 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
