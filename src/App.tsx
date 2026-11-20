import React, { useState, useEffect, useCallback } from 'react';
import { NavTab, Booking, Payment, DashboardStats, SystemSettings, TitheRecord } from './types';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AllBookings } from './components/AllBookings';
import { CalendarView } from './components/CalendarView';
import { PaymentsView } from './components/PaymentsView';
import { StaffEarningsView } from './components/StaffEarningsView';
import { GodsTitheView } from './components/GodsTitheView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { BookingFormModal } from './components/BookingFormModal';
import { BookingDetailsModal } from './components/BookingDetailsModal';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [titheRecords, setTitheRecords] = useState<TitheRecord[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({});
  const [loading, setLoading] = useState(true);
  const [dashboardFilter, setDashboardFilter] = useState('all');

  // Layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);
  const [printingBooking, setPrintingBooking] = useState<Booking | null>(null);
  const [preSelectedPaymentBooking, setPreSelectedPaymentBooking] = useState<string | null>(null);

  // Search in header
  const [headerSearch, setHeaderSearch] = useState('');

  // Toast Queue
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch all initial data
  const loadData = useCallback(async (filterRange = dashboardFilter) => {
    try {
      setLoading(true);
      const [statsData, bookingsData, paymentsData, titheData, settingsData] = await Promise.all([
        api.getStats(filterRange),
        api.getBookings(),
        api.getPayments(),
        api.getTithe(),
        api.getSettings(),
      ]);

      setStats(statsData);
      setBookings(bookingsData);
      setPayments(paymentsData);
      setTitheRecords(titheData.records || []);
      setSettings(settingsData);
    } catch (err: any) {
      console.error('Data load error:', err);
      showToast(`Error connecting to database: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [dashboardFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dashboard filter change
  const handleDashboardFilterChange = async (range: string) => {
    setDashboardFilter(range);
    try {
      const statsData = await api.getStats(range);
      setStats(statsData);
    } catch (err: any) {
      showToast(`Filter error: ${err.message}`, 'error');
    }
  };

  // Booking actions
  const handleSaveBooking = async (formData: any) => {
    if (editingBooking) {
      await api.updateBooking(editingBooking.bookingNumber, formData);
      showToast(`Appointment ${editingBooking.bookingNumber} updated successfully!`, 'success');
    } else {
      const newBooking = await api.createBooking(formData);
      showToast(`New booking ${newBooking.bookingNumber} created in database!`, 'success');
    }
    setEditingBooking(null);
    setIsBookingModalOpen(false);
    loadData();
  };

  const handleDeleteBooking = async (bookingNumber: string) => {
    try {
      await api.deleteBooking(bookingNumber);
      showToast(`Booking ${bookingNumber} deleted permanently from database.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  // Payment actions
  const handleAddPayment = async (paymentData: any) => {
    try {
      await api.createPayment(paymentData);
      showToast(`Payment of ₹${Number(paymentData.amount).toLocaleString('en-IN')} recorded!`, 'success');
      setPreSelectedPaymentBooking(null);
      loadData();
    } catch (err: any) {
      showToast(`Payment error: ${err.message}`, 'error');
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await api.deletePayment(paymentId);
      showToast(`Payment ${paymentId} deleted. Balance recalculated.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(`Delete payment error: ${err.message}`, 'error');
    }
  };

  // Settings
  const handleSaveSettings = async (newSettings: SystemSettings) => {
    try {
      await api.saveSettings(newSettings);
      setSettings(newSettings);
      showToast('Studio profile and business parameters saved!', 'success');
    } catch (err: any) {
      showToast(`Save settings error: ${err.message}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col font-sans">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'new-booking') {
            setEditingBooking(null);
            setIsBookingModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        bookingCount={bookings.length}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileNav={() => setMobileNavOpen(true)}
          onOpenNewBooking={() => {
            setEditingBooking(null);
            setIsBookingModalOpen(true);
          }}
          onSearchChange={setHeaderSearch}
          searchValue={headerSearch}
        />

        {/* Dynamic Views */}
        <main className="p-5 sm:p-8 flex-1">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              loading={loading}
              onFilterChange={handleDashboardFilterChange}
              activeFilter={dashboardFilter}
              onViewBooking={(b) => setViewingBooking(b)}
              onViewAllBookings={() => setActiveTab('all-bookings')}
            />
          )}

          {activeTab === 'all-bookings' && (
            <AllBookings
              bookings={bookings}
              onOpenNewBooking={() => {
                setEditingBooking(null);
                setIsBookingModalOpen(true);
              }}
              onViewBooking={(b) => setViewingBooking(b)}
              onEditBooking={(b) => {
                setEditingBooking(b);
                setIsBookingModalOpen(true);
              }}
              onDeleteBooking={handleDeleteBooking}
              onAddPayment={(bookingNumber) => {
                setPreSelectedPaymentBooking(bookingNumber);
                setActiveTab('payments');
              }}
              onPrintBooking={(b) => setPrintingBooking(b)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              bookings={bookings}
              onViewBooking={(b) => setViewingBooking(b)}
              onSelectDateForNewBooking={(isoDate) => {
                setEditingBooking(null);
                setIsBookingModalOpen(true);
              }}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              bookings={bookings}
              onAddPayment={handleAddPayment}
              onDeletePayment={handleDeletePayment}
              onViewBooking={(b) => setViewingBooking(b)}
              preSelectedBookingNumber={preSelectedPaymentBooking}
            />
          )}

          {activeTab === 'staff-earnings' && (
            <StaffEarningsView bookings={bookings} />
          )}

          {activeTab === 'gods-tithe' && (
            <GodsTitheView titheRecords={titheRecords} bookings={bookings} />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              bookings={bookings}
              payments={payments}
              onAddPayment={(bNum) => {
                setPreSelectedPaymentBooking(bNum);
                setActiveTab('payments');
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              bookings={bookings}
              payments={payments}
            />
          )}
        </main>
      </div>

      {/* Booking Form Modal (New / Edit) */}
      <BookingFormModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setEditingBooking(null);
        }}
        onSubmit={handleSaveBooking}
        editBooking={editingBooking}
      />

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={viewingBooking}
        payments={payments}
        isOpen={!!viewingBooking}
        onClose={() => setViewingBooking(null)}
        onEdit={(b) => {
          setViewingBooking(null);
          setEditingBooking(b);
          setIsBookingModalOpen(true);
        }}
        onAddPayment={(bNum) => {
          setViewingBooking(null);
          setPreSelectedPaymentBooking(bNum);
          setActiveTab('payments');
        }}
        onPrint={(b) => {
          setViewingBooking(null);
          setPrintingBooking(b);
        }}
      />

      {/* Print Receipt Modal */}
      <PrintReceiptModal
        booking={printingBooking}
        payments={payments}
        isOpen={!!printingBooking}
        onClose={() => setPrintingBooking(null)}
        businessName={settings.businessName}
        phone={settings.phone}
      />
    </div>
  );
}

export default App;
