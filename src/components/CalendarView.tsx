import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Sparkles } from 'lucide-react';
import { Booking } from '../types';
import { formatDateDisplay, formatTime12H, getTodayIso } from '../utils/dateUtils';

interface CalendarViewProps {
  bookings: Booking[];
  onViewBooking: (booking: Booking) => void;
  onSelectDateForNewBooking: (isoDate: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  bookings,
  onViewBooking,
  onSelectDateForNewBooking,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const curYear = currentDate.getFullYear();
  const curMonth = currentDate.getMonth(); // 0-based

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Grid calculation
  const firstDayIndex = new Date(curYear, curMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(curYear, curMonth, 0).getDate();

  const todayIso = getTodayIso();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(curYear, curMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(curYear, curMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Build grid cells
  const days = [];

  // Previous month filler days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    days.push({
      day: d,
      isCurrentMonth: false,
      isoDate: '',
      events: [] as Booking[],
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = bookings.filter((b) => b.eventDate === iso);
    days.push({
      day: d,
      isCurrentMonth: true,
      isoDate: iso,
      events: dayEvents,
    });
  }

  // Next month filler days (to make total 35 or 42 cells)
  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      isoDate: '',
      events: [] as Booking[],
    });
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-6">
      {/* Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-ivory-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <h3 className="font-brand font-bold text-xl text-emerald-950">
              {monthNames[curMonth]} {curYear}
            </h3>
            <p className="text-xs text-charcoal-muted">Studio bridal appointment schedule & timeline</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-xl border border-ivory-300 hover:border-gold-500 text-xs font-semibold text-emerald-950 hover:bg-gold-50 transition-all"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-ivory-300 hover:bg-ivory text-charcoal transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-ivory-300 hover:bg-ivory text-charcoal transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase tracking-wider text-emerald-900 bg-ivory-100 py-2.5 rounded-xl">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((item, idx) => {
          const isToday = item.isoDate === todayIso;

          return (
            <div
              key={idx}
              onClick={() => {
                if (item.isCurrentMonth && item.isoDate) {
                  onSelectDateForNewBooking(item.isoDate);
                }
              }}
              className={`min-h-[110px] p-2 rounded-xl border transition-all flex flex-col group
                ${!item.isCurrentMonth ? 'bg-ivory-50/40 opacity-40 border-transparent' : 'bg-white border-ivory-200 hover:border-gold-400 hover:shadow-sm cursor-pointer'}
                ${isToday ? 'ring-2 ring-gold-500 border-gold-500 bg-gold-50/10' : ''}
              `}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-extrabold ${isToday ? 'w-6 h-6 rounded-full bg-gold-500 text-emerald-950 flex items-center justify-center font-bold shadow-sm' : 'text-emerald-950'}`}>
                  {item.day}
                </span>

                {item.events.length > 0 && (
                  <span className="text-[10px] font-bold text-gold-700 bg-gold-50 px-1.5 py-0.5 rounded-md">
                    {item.events.length}
                  </span>
                )}
              </div>

              {/* Event Chips */}
              <div className="space-y-1 overflow-y-auto max-h-[75px] flex-1">
                {item.events.map((b) => (
                  <div
                    key={b.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewBooking(b);
                    }}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-md truncate cursor-pointer transition-transform hover:scale-[1.02] shadow-xs flex items-center justify-between
                      ${b.confirmationStatus === 'Confirmed' ? 'bg-emerald-100 text-emerald-900 border-l-2 border-emerald-600' : 
                        b.confirmationStatus === 'Cancelled' ? 'bg-gray-100 text-gray-700 border-l-2 border-gray-400' :
                        'bg-amber-100 text-amber-900 border-l-2 border-amber-600'}
                    `}
                    title={`${b.customerName} (${b.eventType}) at ${formatTime12H(b.eventTime)}`}
                  >
                    <span className="truncate">{b.customerName}</span>
                    <span className="text-[9px] opacity-75 shrink-0 ml-1 font-mono">{formatTime12H(b.eventTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
