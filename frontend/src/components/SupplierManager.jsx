import React, { useState } from 'react';
import { Users, Plus, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

export function SupplierManager({ suppliers, onSuppliersUpdated }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [currency, setCurrency] = useState('ARS');
  const [d1, setD1] = useState(25);
  const [d2, setD2] = useState(5);
  const [vatInc, setVatInc] = useState(false);

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setName('');
    setContact('');
    setCurrency('ARS');
    setD1(25);
    setD2(5);
    setVatInc(false);
  };

  const handleStartEdit = (s) => {
    setEditingId(s.id);
    setName(s.name);
    setContact(s.contact_info || '');
    setCurrency(s.currency);
    setD1(s.default_discount_1_pct);
    setD2(s.default_discount_2_pct);
    setVatInc(s.vat_included);
    setIsAdding(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload = {
        name: name.trim(),
        contact_info: contact.trim(),
        currency,
        default_discount_1_pct: parseFloat(d1) || 0,
        default_discount_2_pct: parseFloat(d2) || 0,
        vat_included: vatInc,
        custom_vat_pct: 21.0
      };

      if (editingId) {
        await api.updateSupplier(editingId, payload);
      } else {
        await api.createSupplier(payload);
      }
      resetForm();
      const refreshed = await api.getSuppliers();
      onSuppliersUpdated(refreshed);
    } catch (err) {
      alert(err.message || 'Error guardando proveedor');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Distribuidores y Proveedores de Repuestos
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure las cadenas de descuentos predeterminadas ($d_1 + d_2$), IVA y moneda para cada distribuidor.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={() => { resetForm(); setIsAdding(true); }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Proveedor</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">
              {editingId ? 'Modificar Distribuidor' : 'Registrar Nuevo Distribuidor'}
            </h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1">Razón Social / Nombre</label>
              <input
                type="text"
                required
                placeholder="Ej: Distribuidora Warnes"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Contacto / Teléfono</label>
              <input
                type="text"
                placeholder="ventas@distribuidora.com.ar"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Moneda Predeterminada</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value="ARS">ARS ($ Pesos Argentinos)</option>
                <option value="USD">USD (US$ Dólar Estadounidense)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Descuento 1 (%)</label>
              <input
                type="number"
                value={d1}
                onChange={(e) => setD1(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1">Descuento 2 Adicional (%)</label>
              <input
                type="number"
                value={d2}
                onChange={(e) => setD2(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vatInc}
                  onChange={(e) => setVatInc(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Precios de lista incluyen IVA</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              {editingId ? 'Guardar Cambios' : 'Crear Proveedor'}
            </button>
          </div>
        </form>
      )}

      {/* Suppliers Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Distribuidor</th>
              <th className="py-3 px-4">Moneda</th>
              <th className="py-3 px-4">Descuentos Habituales</th>
              <th className="py-3 px-4">IVA en Lista</th>
              <th className="py-3 px-4">Contacto</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {suppliers.map(s => (
              <tr key={s.id} className="hover:bg-slate-800/40 transition">
                <td className="py-3 px-4 font-bold text-white text-sm">
                  {s.name}
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
                  {s.currency}
                </td>
                <td className="py-3 px-4 font-mono text-amber-400 font-bold">
                  {s.default_discount_1_pct}% 
                  {s.default_discount_2_pct ? ` + ${s.default_discount_2_pct}%` : ''}
                </td>
                <td className="py-3 px-4 text-slate-300">
                  {s.vat_included ? 'Incluido' : '+ 21% IVA'}
                </td>
                <td className="py-3 px-4 text-slate-400">
                  {s.contact_info || '-'}
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => handleStartEdit(s)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Editar proveedor"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

