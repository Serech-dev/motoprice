import React, { useState } from 'react';
import { 
  Zap, 
  DollarSign, 
  UploadCloud, 
  Package, 
  Users, 
  Calculator, 
  Check, 
  RefreshCw,
  ShieldCheck,
  LogOut,
  Store,
  SlidersHorizontal,
  X,
  ChevronRight
} from 'lucide-react';
import { formatCurrencyARS } from '../utils/formatters';

export function Navbar({ 
  activeTab, 
  setActiveTab, 
  settings, 
  onUpdateSettings,
  user,
  license,
  shop,
  onOpenLicense,
  onLogout
}) {
  const [isEditingFx, setIsEditingFx] = useState(false);
  const [fxInput, setFxInput] = useState(settings?.exchange_rate_usd_ars || 1180);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSaveFx = async () => {
    try {
      await onUpdateSettings({ exchange_rate_usd_ars: parseFloat(fxInput) });
      setIsEditingFx(false);
    } catch (e) {
      alert('Error actualizando tipo de cambio');
    }
  };

  const daysRemaining = license?.days_remaining ?? shop?.days_remaining ?? 30;
  const isTrial = license?.license_status === 'trial' || shop?.license_status === 'trial';
  const shopName = shop?.name || license?.shop_name || 'Moto Repuestos';

  const handleSelectMobileTab = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Brand & Store Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Zap className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-1.5 sm:gap-2">
                <span>MotoPrice</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Motos
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Store className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-[200px] text-slate-300 font-medium">
                  {shopName}
                </span>
              </div>
            </div>
          </div>

          {/* DESKTOP Navigation Tabs (Hidden on Mobile) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            <button
              onClick={() => setActiveTab('quoter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'quoter'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-amber-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Cotizador</span>
            </button>

            <button
              onClick={() => setActiveTab('updater')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'updater'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Actualizador Listas</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catálogo</span>
            </button>

            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'suppliers'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Proveedores</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'simulator'
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Simulador</span>
            </button>
          </nav>

          {/* Right Header Area: USD Ticker, License Badge & User Action */}
          <div className="flex items-center gap-2 shrink-0">
            {/* USD Ticker (Desktop full, mobile compact) */}
            {isEditingFx ? (
              <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-1">
                <span className="text-xs text-slate-400 pl-1">USD:</span>
                <input
                  type="number"
                  value={fxInput}
                  onChange={(e) => setFxInput(e.target.value)}
                  className="w-16 px-1 py-0.5 text-xs bg-slate-900 border border-slate-700 rounded text-amber-300 font-mono focus:outline-none"
                />
                <button
                  onClick={handleSaveFx}
                  className="p-1 rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
                  title="Guardar tipo de cambio"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setFxInput(settings?.exchange_rate_usd_ars || 1180);
                  setIsEditingFx(true);
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition text-xs font-mono cursor-pointer"
                title="Click para cambiar cotización del Dólar"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold">{formatCurrencyARS(settings?.exchange_rate_usd_ars || 1180)}</span>
                <RefreshCw className="w-3 h-3 text-slate-500 hidden sm:inline ml-0.5" />
              </button>
            )}

            {/* License Status Badge */}
            <button
              onClick={onOpenLicense}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition cursor-pointer"
              title="Ver detalle del período de prueba y licencia"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Prueba:</span>
              <span className="font-bold">{daysRemaining}d</span>
            </button>

            {/* User Profile & Logout (Desktop) */}
            <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <div className="flex flex-col text-right leading-none mr-1">
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                  {user?.full_name?.split(' ')[0] || 'Operador'}
                </span>
                <span className="text-[10px] text-amber-400 font-medium capitalize">
                  {user?.role || 'mostrador'}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom on mobile screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        {/* Cotizador Button */}
        <button
          onClick={() => setActiveTab('quoter')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'quoter'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'quoter' ? 'bg-amber-500/20 text-amber-400' : ''}`}>
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Cotizador</span>
        </button>

        {/* Catálogo Button */}
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition cursor-pointer ${
            activeTab === 'catalog'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${activeTab === 'catalog' ? 'bg-amber-500/20 text-amber-400' : ''}`}>
            <Package className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Catálogo</span>
        </button>

        {/* Más / Gestión Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition cursor-pointer ${
            ['updater', 'suppliers', 'simulator'].includes(activeTab)
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg ${['updater', 'suppliers', 'simulator'].includes(activeTab) ? 'bg-amber-500/20 text-amber-400' : ''}`}>
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">Gestión</span>
        </button>
      </nav>

      {/* MOBILE SLIDE-UP DRAWER (Management, Ingestion, Settings) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm animate-fade-in flex flex-col justify-end">
          <div 
            className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Menú de Gestión & Administración</h3>
                  <p className="text-[11px] text-slate-400">{user?.full_name} ({user?.role})</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Options */}
            <div className="space-y-2">
              <button
                onClick={() => handleSelectMobileTab('updater')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-slate-200 block">Actualizador de Listas</span>
                    <span className="text-xs text-slate-400">Procesar Excel o PDF de proveedores</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelectMobileTab('suppliers')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-slate-200 block">Distribuidores & Proveedores</span>
                    <span className="text-xs text-slate-400">W-Standard, Pietcard, Far y descuentos</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelectMobileTab('simulator')}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-slate-200 block">Simulador de Márgenes</span>
                    <span className="text-xs text-slate-400">Cálculo de rentabilidad y redondeos</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenLicense();
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-slate-200 block">Licencia & Abono</span>
                    <span className="text-xs text-slate-400">Prueba activa: {daysRemaining} días restantes</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Logout Button */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold text-sm flex items-center justify-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
