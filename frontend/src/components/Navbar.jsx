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
  User as UserIcon,
  Store
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

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand & Store Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Zap className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="font-bold text-base sm:text-lg tracking-tight flex items-center gap-2">
              <span>MotoPrice</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Motos
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Store className="w-3 h-3 text-slate-500" />
              <span className="truncate max-w-[140px] sm:max-w-[200px] text-slate-300 font-medium">
                {shopName}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('quoter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'updater'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden md:inline">Actualizador Listas</span>
            <span className="md:hidden">Listas</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
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
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Simulador</span>
          </button>
        </nav>

        {/* Right side: USD Ticker, License Badge & User Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* USD Exchange Rate Ticker */}
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
              className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition text-xs font-mono cursor-pointer"
              title="Click para cambiar cotización del Dólar"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">{formatCurrencyARS(settings?.exchange_rate_usd_ars || 1180)}</span>
              <RefreshCw className="w-3 h-3 text-slate-500 ml-0.5" />
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

          {/* User Profile & Logout */}
          <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
            <div className="hidden xl:flex flex-col text-right leading-none mr-1">
              <span className="text-xs font-semibold text-slate-200 truncate max-w-[100px]">
                {user?.full_name?.split(' ')[0] || 'Operador'}
              </span>
              <span className="text-[10px] text-amber-400 font-medium capitalize">
                {user?.role || 'mostrador'}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
