import { Booking, Payment, DashboardStats, SystemSettings, TitheRecord } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || 'API Request failed');
  }
  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Stats
  async getStats(range = 'all'): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats?range=${range}`);
    return handleResponse<DashboardStats>(res);
  },

  // Bookings
  async getBookings(filters?: {
    search?: string;
    eventType?: string;
    paymentStatus?: string;
    confirmationStatus?: string;
    sort?: string;
  }): Promise<Booking[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.append(k, v);
      });
    }
    const res = await fetch(`${API_BASE}/bookings?${params.toString()}`);
    return handleResponse<Booking[]>(res);
  },

  async getBooking(bookingNumber: string): Promise<{ booking: Booking; payments: Payment[]; tithe?: TitheRecord }> {
    const res = await fetch(`${API_BASE}/bookings/${bookingNumber}`);
    return handleResponse<{ booking: Booking; payments: Payment[]; tithe?: TitheRecord }>(res);
  },

  async createBooking(bookingData: any): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return handleResponse<Booking>(res);
  },

  async updateBooking(bookingNumber: string, bookingData: any): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/${bookingNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData),
    });
    return handleResponse<Booking>(res);
  },

  async deleteBooking(bookingNumber: string): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE}/bookings/${bookingNumber}`, {
      method: 'DELETE',
    });
    return handleResponse<{ ok: boolean }>(res);
  },

  // Payments
  async getPayments(): Promise<Payment[]> {
    const res = await fetch(`${API_BASE}/payments`);
    return handleResponse<Payment[]>(res);
  },

  async createPayment(paymentData: {
    bookingId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    notes?: string;
  }): Promise<{ payment: Payment; booking: Booking }> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData),
    });
    return handleResponse<{ payment: Payment; booking: Booking }>(res);
  },

  async deletePayment(paymentId: string): Promise<{ ok: boolean; booking: Booking }> {
    const res = await fetch(`${API_BASE}/payments/${paymentId}`, {
      method: 'DELETE',
    });
    return handleResponse<{ ok: boolean; booking: Booking }>(res);
  },

  // Tithe
  async getTithe(): Promise<{
    totalTithe: number;
    monthTithe: number;
    count: number;
    records: TitheRecord[];
  }> {
    const res = await fetch(`${API_BASE}/tithe`);
    return handleResponse<{
      totalTithe: number;
      monthTithe: number;
      count: number;
      records: TitheRecord[];
    }>(res);
  },

  // Staff Earnings
  async getStaffEarnings(): Promise<{
    sangeethaTotal: number;
    rizwanaTotal: number;
    combinedTotal: number;
    bookings: any[];
  }> {
    const res = await fetch(`${API_BASE}/staff-earnings`);
    return handleResponse<{
      sangeethaTotal: number;
      rizwanaTotal: number;
      combinedTotal: number;
      bookings: any[];
    }>(res);
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse<SystemSettings>(res);
  },

  async saveSettings(settings: SystemSettings): Promise<{ ok: boolean }> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse<{ ok: boolean }>(res);
  },
};
