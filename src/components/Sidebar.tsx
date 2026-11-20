import React from 'react';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  BookOpen, 
  CalendarDays, 
  CreditCard, 
  Users, 
  HeartHandshake, 
  BarChart3, 
  Settings, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Database,
  X
} from 'lucide-react';
import { NavTab } from '../types';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  bookingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  bookingCount = 0,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-booking' as NavTab, label: 'New Booking', icon: CalendarPlus },
    { id: 'all-bookings' as NavTab, label: 'All Bookings', icon: BookOpen, badge: bookingCount },
    { id: 'calendar' as NavTab, label: 'Calendar', icon: CalendarDays },
    { id: 'payments' as NavTab, label: 'Payments', icon: CreditCard },
    { id: 'staff-earnings' as NavTab, label: 'Staff Earnings', icon: Users },
    { id: 'gods-tithe' as NavTab, label: "God's Tithe (1%)", icon: HeartHandshake },
    { id: 'reports' as NavTab, label: 'Reports', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-emerald-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-grad-sidebar text-white transition-all duration-300 ease-in-out border-r border-gold-500/20 shadow-2xl
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-gold-500/15">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-grad-gold flex items-center justify-center text-emerald-950 shadow-gold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="font-brand font-bold text-sm tracking-wider text-white leading-tight">
                  SANGEETHA'S
                </h1>
                <span className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold block">
                  Makeup Artist
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={onCloseMobile}
            className="lg:hidden text-white/70 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-gradient-to-r from-gold-500/25 to-gold-500/5 text-white font-semibold border-l-4 border-gold-400 shadow-sm' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }
                  ${collapsed ? 'justify-center px-0' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-gold-400' : 'text-gray-400 group-hover:text-gold-300'}`} />
                
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}

                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-gold-500 text-emerald-950 font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Database Status & Footer */}
        <div className="p-4 border-t border-gold-500/15 bg-black/20">
          {!collapsed ? (
            <div className="bg-white/5 rounded-lg p-2.5 border border-gold-500/10 flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-gold-400" /> SQLite Database
                </div>
                <div className="text-[10px] text-gray-400">Persistent & ACID Compliant</div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center" title="SQLite Database Active">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <div className="hidden lg:flex justify-end mt-3">
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
