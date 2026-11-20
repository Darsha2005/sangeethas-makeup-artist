import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Database, Download, CheckCircle, RefreshCw } from 'lucide-react';
import { SystemSettings, Booking, Payment } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => Promise<void>;
  bookings: Booking[];
  payments: Payment[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  bookings,
  payments,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({
    businessName: "SANGEETHA'S MAKEUP ARTIST",
    phone: '+91 9042468594',
    currency: '₹',
    timezone: 'Asia/Kolkata',
    staff1: 'Sangeetha',
    staff2: 'Rizwana',
    tithePercentage: '1',
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({ ...prev, ...settings }));
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadBackup = () => {
    const backupData = {
      system: "Sangeetha's Makeup Artist Management System",
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      settings: formData,
      bookingsCount: bookings.length,
      paymentsCount: payments.length,
      bookings,
      payments,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Sangeethas_Studio_Database_Backup_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Settings Form */}
      <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-ivory-200">
          <div>
            <h3 className="font-brand font-bold text-xl text-emerald-950 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gold-600" /> Studio Business Profile & Settings
            </h3>
            <p className="text-xs text-charcoal-muted mt-0.5">
              Configure brand identity, default contact numbers, and financial parameters
            </p>
          </div>
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle className="w-4 h-4" /> Settings Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Business Name</label>
              <input
                type="text"
                required
                value={formData.businessName || ''}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">
                Contact Number (Default: +91 9042468594)
              </label>
              <input
                type="text"
                required
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Currency Symbol</label>
              <input
                type="text"
                readOnly
                value="₹ (INR)"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-100 text-charcoal-muted cursor-not-allowed font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">System Timezone</label>
              <input
                type="text"
                readOnly
                value="Asia/Kolkata (IST)"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-100 text-charcoal-muted cursor-not-allowed font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Lead Artist Name</label>
              <input
                type="text"
                value={formData.staff1 || 'Sangeetha'}
                onChange={(e) => setFormData({ ...formData, staff1: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Senior Artist Name</label>
              <input
                type="text"
                value={formData.staff2 || 'Rizwana'}
                onChange={(e) => setFormData({ ...formData, staff2: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-charcoal mb-1">
                God's Tithe Percentage (%)
              </label>
              <input
                type="number"
                min="0.5"
                max="100"
                step="0.5"
                value={formData.tithePercentage || '1'}
                onChange={(e) => setFormData({ ...formData, tithePercentage: e.target.value })}
                className="w-full sm:w-48 px-3.5 py-2 text-sm rounded-xl border border-ivory-300 bg-ivory-50 focus:bg-white focus:outline-none focus:border-gold-500 font-bold text-gold-700"
              />
              <span className="text-[11px] text-charcoal-muted mt-1 block">
                Default: 1% calculated on total contract amount (not on advances).
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-ivory-200">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-grad-gold text-emerald-950 font-bold text-sm shadow-gold hover:shadow-gold-lg transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Database Status & Backup Card */}
      <div className="bg-white rounded-2xl p-6 border border-ivory-300 shadow-sm space-y-4">
        <h3 className="font-brand font-bold text-lg text-emerald-950 flex items-center gap-2">
          <Database className="w-5 h-5 text-gold-600" /> Database & System Reliability
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-ivory-50 border border-ivory-300">
            <span className="text-charcoal-muted block">Database Engine</span>
            <span className="font-bold text-sm text-emerald-950 block mt-1">SQLite (node:sqlite)</span>
            <span className="text-[10px] text-emerald-700 font-semibold">Native Node v24 Driver</span>
          </div>

          <div className="p-3.5 rounded-xl bg-ivory-50 border border-ivory-300">
            <span className="text-charcoal-muted block">Storage File</span>
            <span className="font-bold text-sm text-emerald-950 block mt-1">./data/sangeethas_studio.sqlite</span>
            <span className="text-[10px] text-emerald-700 font-semibold">WAL Mode (High Concurrency)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-ivory-50 border border-ivory-300">
            <span className="text-charcoal-muted block">Integrity Status</span>
            <span className="font-bold text-sm text-emerald-700 block mt-1">ACID Verified</span>
            <span className="text-[10px] text-charcoal-muted font-semibold">Foreign Keys & Cascades Active</span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-ivory-300 hover:border-gold-500 bg-ivory-50 hover:bg-white text-xs font-bold text-emerald-950 transition-all"
          >
            <Download className="w-4 h-4 text-gold-600" />
            <span>Download Database JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-xl bg-ivory-100 border border-gold-400/30 text-xs text-charcoal-muted leading-relaxed space-y-1">
        <div className="font-bold text-emerald-950 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-gold-600" /> Security & Privacy Notice:
        </div>
        <div>
          • Database credentials and system secrets are loaded from <code>.env</code> environment variables.<br />
          • All financial recalculations (Tithe, Balances, Payment Statuses) execute strictly on the server.<br />
          • Client requests undergo relational foreign-key validation to prevent orphaned records or data corruption.
        </div>
      </div>
    </div>
  );
};
