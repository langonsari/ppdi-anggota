import React from 'react';
import { usePPDI } from '../context/PPDIContext';
import { Shield, UserCheck, RefreshCw, User, Database, LogOut, Menu, X } from 'lucide-react';

export const Header: React.FC<{
  onOpenAddModal: () => void;
  onOpenVerifyModal: () => void;
  onOpenDbModal: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}> = ({ onOpenAddModal, onOpenVerifyModal, onOpenDbModal, sidebarOpen, setSidebarOpen }) => {
  const {
    currentUser,
    switchUser,
    users,
    resetAllData,
    logout,
    dbStatus,
    isCheckingDb,
    checkDbStatus,
    refreshDataFromMySQL,
    isSyncing,
    appSettings,
  } = usePPDI();

  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F4]/95 backdrop-blur-md border-b border-[#111113]/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Zone 1: Single text element wordmark / brand + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-1 text-[#111113]/70 hover:text-[#064E3B] hover:bg-neutral-200/50 rounded-lg transition-colors md:hidden cursor-pointer"
              title="Buka / Sembunyikan Menu"
              aria-label="Toggle Navigation Menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {appSettings?.logoUrl ? (
              <img
                src={appSettings.logoUrl}
                alt="Logo Organisasi"
                className="w-8 h-8 rounded-sm object-contain bg-white shadow-xs border border-neutral-200 p-0.5"
              />
            ) : (
              <div className="w-8 h-8 rounded-sm bg-[#064E3B] text-white flex items-center justify-center font-bold text-base shadow-xs">
                <Shield className="w-4 h-4 text-emerald-300" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold text-[#111113] tracking-tight whitespace-nowrap leading-tight uppercase">
                {appSettings?.appName || 'PPDI KABUPATEN BANDUNG'}
              </span>
              <span className="brand-meta text-[10px] text-[#111113]/60 whitespace-nowrap hidden sm:inline">
                {appSettings?.appSubtitle || 'SISTEM INFORMASI DATABASE & E-KTA PERANGKAT DESA'}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-[#111113]/70">
            <button
              onClick={onOpenVerifyModal}
              className="flex items-center gap-1.5 hover:text-[#064E3B] transition-colors whitespace-nowrap cursor-pointer text-xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#064E3B]" />
              <span>VERIFIKASI KTA</span>
            </button>

            <span className="text-[#111113]/20">/</span>

            {/* MySQL Status Chip with Live Latency & Diagnostic Trigger */}
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenDbModal}
                title={
                  dbStatus?.success
                    ? `MySQL Terhubung (${dbStatus.latencyMs} ms · ${dbStatus.host}:${dbStatus.port || 3306}) - Klik untuk info tabel & diagnostik`
                    : 'MySQL Offline / Belum Terhubung - Klik untuk diagnosa & solusi hosting'
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono transition-colors cursor-pointer border ${
                  isCheckingDb
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : dbStatus?.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-red-50 text-red-900 border-red-300 hover:bg-red-100 animate-pulse font-bold'
                }`}
              >
                <Database className="w-3 h-3 text-[#064E3B]" />
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCheckingDb
                      ? 'bg-amber-500 animate-ping'
                      : dbStatus?.success
                      ? 'bg-emerald-600'
                      : 'bg-red-600'
                  }`}
                />
                <span>
                  {isCheckingDb
                    ? 'Cek DB...'
                    : dbStatus?.success
                    ? `MySQL (${dbStatus.latencyMs || 0}ms)`
                    : 'MySQL Offline'}
                </span>
              </button>

              <button
                onClick={() => checkDbStatus()}
                disabled={isCheckingDb}
                title="Picu uji ulang koneksi ke database sekarang"
                className="p-1 rounded-sm border border-[#111113]/15 text-[#111113]/70 hover:text-[#064E3B] hover:bg-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingDb ? 'animate-spin text-[#064E3B]' : ''}`} />
              </button>
            </div>

            {/* Sync from MySQL Button */}
            <button
              onClick={() => refreshDataFromMySQL()}
              title="Sinkronkan data langsung dari MySQL database"
              className="flex items-center gap-1 px-2 py-1 rounded-sm text-xs text-[#111113]/70 hover:text-[#064E3B] hover:bg-white transition-colors cursor-pointer border border-[#111113]/15 bg-white/50"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-[#064E3B]' : ''}`} />
              <span className="hidden xl:inline">{isSyncing ? 'Sinkron...' : 'Sync DB'}</span>
            </button>
          </div>

          {/* Zone 3: Actions, Role & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Reset data helper */}
            <button
              onClick={() => {
                if (confirm('Reset seluruh data ke kondisi awal demo?')) {
                  resetAllData();
                }
              }}
              title="Reset data demo"
              className="p-1.5 text-[#111113]/40 hover:text-[#111113] hover:bg-neutral-200/50 rounded-sm transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Logout button */}
            <button
              onClick={() => logout()}
              title="Keluar dari Sistem (Logout)"
              className="p-1.5 text-[#111113]/60 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

