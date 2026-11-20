export type PaymentStatus = 'Pending' | 'Partially Paid' | 'Fully Paid';
export type ConfirmationStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
export type PaymentMethod = 'UPI' | 'Cash' | 'Bank Transfer' | 'Other';

export interface Booking {
  id: number;
  bookingNumber: string;
  customerName: string;
  phone: string;
  eventType: string;
  eventDate: string; // Strictly YYYY-MM-DD
  eventTime: string; // Strictly HH:mm
  location: string;
  notes?: string;
  totalAmount: number;
  advanceAmount: number;
  balance: number;
  sangeethaEarnings: number;
  rizwanaEarnings: number;
  titheAmount: number;
  paymentStatus: PaymentStatus;
  confirmationStatus: ConfirmationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  paymentId: string;
  bookingId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
  customerName?: string;
  eventType?: string;
  totalAmount?: number;
  balance?: number;
}

export interface TitheRecord {
  id: number;
  bookingId: string;
  bookingAmount: number;
  titheAmount: number;
  eventDate: string;
  createdAt: string;
  customerName?: string;
  eventType?: string;
}

export interface DashboardStats {
  kpis: {
    totalBookings: number;
    confirmedBookings: number;
    totalRevenue: number;
    totalAdvance: number;
    pendingBalance: number;
    sangeethaEarnings: number;
    rizwanaEarnings: number;
    godsTithe: number;
  };
  monthlyData: Array<{
    month: string;
    monthKey: string;
    revenue: number;
    advance: number;
    tithe: number;
    bookingsCount: number;
  }>;
  paymentStatusCounts: {
    fullyPaid: number;
    partiallyPaid: number;
    pending: number;
  };
  eventTypes: Array<{
    name: string;
    value: number;
  }>;
  upcomingEvents: Booking[];
  recentBookings: Booking[];
}

export interface SystemSettings {
  businessName?: string;
  phone?: string;
  currency?: string;
  timezone?: string;
  staff1?: string;
  staff2?: string;
  tithePercentage?: string;
}

export type NavTab = 
  | 'dashboard' 
  | 'new-booking' 
  | 'all-bookings' 
  | 'calendar' 
  | 'payments' 
  | 'staff-earnings' 
  | 'gods-tithe' 
  | 'reports' 
  | 'settings';
