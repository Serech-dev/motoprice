import React from 'react';
import { X, ShieldCheck, Clock, Calendar, CheckCircle2, Phone, CreditCard, Sparkles } from 'lucide-react';
import { formatCurrencyARS } from '../utils/formatters';

export function LicenseModal({ isOpen, onClose, license, shop }) {
  if (!isOpen) return null;

  const daysRemaining = license?.days_remaining ?? shop?.days_remaining ?? 30;
  const isTrial = license?.license_status === 'trial' || shop?.license_status === 'trial';
  const monthlyFee = license?.monthly_fee_ars ?? shop?.monthly_fee_ars ?? 30000;
  const shopName = shop?.name || license?.shop_name || 'Moto Repuestos';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Estado de Licencia & Abono</h3>
              <p className="text-xs text-slate-400">{shopName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* License Status Card */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tipo de Licencia
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              {isTrial ? 'Período de Prueba Bonificado' : 'Licencia Activa'}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-3xl font-extrabold text-amber-400">{daysRemaining}</span>
            <span className="text-sm font-medium text-slate-300">días restantes de prueba sin cargo</span>
          </div>

          <p className="text-xs text-slate-400">
            {license?.message || 'Su sistema se encuentra completamente operativo y habilitado para cotizaciones y actualización de precios.'}
          </p>
        </div>

        {/* Plan Details & Pricing */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detalle del Plan & Mantenimiento Mensual
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block mb-1">Abono de Mantenimiento</span>
              <span className="text-base font-bold text-slate-100">{formatCurrencyARS(monthlyFee)} / mes</span>
              <span className="text-[10px] text-slate-500 block">A partir del 2do mes</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <span className="text-[11px] text-slate-400 block mb-1">Estado de Pagos</span>
              <span className="text-sm font-bold text-emerald-400">Al día (Mes Bonificado)</span>
              <span className="text-[10px] text-slate-500 block">Sin costos pendientes</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/20 border border-slate-800 text-xs text-slate-300 space-y-2">
            <span className="font-semibold text-slate-200 block">El abono mensual incluye:</span>
            <ul className="space-y-1 text-slate-400 text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Actualización continua de listas mayoristas (W-Standard, Pietcard, Far, etc.)
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Soporte técnico directo y resolución de dudas operativas
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Respaldo diario de base de datos de repuestos y ajustes por dólar
              </li>
            </ul>
          </div>
        </div>

        {/* Contact info button */}
        <div className="pt-2 flex justify-between items-center border-t border-slate-800">
          <span className="text-xs text-slate-400">Soporte y Renovación de Licencia:</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
