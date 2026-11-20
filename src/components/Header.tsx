import React from 'react';
import { Menu, Calendar, PlusCircle, Search, Bell, Sparkles } from 'lucide-react';
import { NavTab } from '../types';
import { formatDateDisplay, getTodayIso } from '../utils/dateUtils';

interface HeaderProps {
  activeTab: NavTab;
  onOpenMobileNav: () => void;
  onOpenNewBooking: () => void;
  onSearchChange?: (term: string) => void;
  searchValue?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileNav,
  onOpenNewBooking,
  onSearchChange,
  searchValue = '',
}) => {
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    'dashboard': { title: 'Executive Dashboard', subtitle: 'Real-time studio KPIs and business intelligence' },
    'new-booking': { title: 'New Appointment', subtitle: 'Register bridal and makeup client particulars' },
    'all-bookings': { title: 'Client Bookings', subtitle: 'Comprehensive appointment registry and actions' },
    'calendar': { title: 'Studio Calendar', subtitle: 'Monthly & weekly schedule overview' },
    'payments': { title: 'Payment Transactions', subtitle: 'Installment ledger and balance tracking' },
    'staff-earnings': { title: 'Staff Remuneration', subtitle: 'Sangeetha and Rizwana earnings breakdown' },
    'gods-tithe': { title: "God's Tithe Ledger", subtitle: '1% consecrated business offerings tracking' },
    'reports': { title: 'Financial Reports', subtitle: 'Revenue, collections, and distribution summaries' },
    'settings': { title: 'System Settings', subtitle: 'Business profile and studio parameters' },
  };

  const current = titles[activeTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-md border-b border-ivory-300/80 px-6 sm:px-8 flex items-center justify-between transition-all">
      {/* Left: Hamburger & Titles */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg text-emerald-900 hover:bg-emerald-50 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div>
          <h2 className="font-brand font-bold text-xl sm:text-2xl text-emerald-950 tracking-tight">
            {current.title}
          </h2>
          <p className="text-xs text-charcoal-muted hidden sm:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Search, Date, Add Booking, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Search */}
        {onSearchChange && (
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients, phone, ID..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-full border border-ivory-300 bg-ivory-50 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 w-48 lg:w-64 transition-all"
            />
          </div>
        )}

        {/* Live Date Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-ivory-300 shadow-sm text-xs font-semibold text-emerald-900">
          <Calendar className="w-3.5 h-3.5 text-gold-600" />
          <span>{formatDateDisplay(getTodayIso())}</span>
        </div>

        {/* Add Booking Quick Action */}
        <button
          onClick={onOpenNewBooking}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-grad-gold text-emerald-950 font-semibold text-xs sm:text-sm shadow-gold hover:shadow-gold-lg hover:-translate-y-0.5 active:translate-y-0 transition-all shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden xs:inline">Add Booking</span>
        </button>

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-emerald-800 border-2 border-gold-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          SM
        </div>
      </div>
    </header>
  );
};
