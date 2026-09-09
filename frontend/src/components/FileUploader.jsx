import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Settings2, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';

export function FileUploader({ suppliers, settings, onBatchCreated }) {
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Form overrides
  const [discount1, setDiscount1] = useState('');
  const [discount2, setDiscount2] = useState('');
  const [vatIncluded, setVatIncluded] = useState(false);
  const [roundingRule, setRoundingRule] = useState('nearest_100');

  const fileInputRef = useRef(null);

  // Active supplier object
  const activeSupplier = suppliers.find(s => s.id === Number(selectedSupplierId)) || suppliers[0];

  const handleSupplierChange = (supId) => {
    setSelectedSupplierId(supId);
    const sup = suppliers.find(s => s.id === Number(supId));
    if (sup) {
      setDiscount1(sup.default_discount_1_pct ?? '');
      setDiscount2(sup.default_discount_2_pct ?? '');
      setVatIncluded(sup.vat_included);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      validateAndSetFile(dropped);
    }
  };

  const validateAndSetFile = (f) => {
    setError(null);
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext)) {
      setError('Formato inválido. Por favor cargue una lista de precios en formato .xlsx, .xls o .csv');
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Seleccione o arrastre un archivo de lista de precios');
      return;
    }
    if (!selectedSupplierId) {
      setError('Seleccione un proveedor para aplicar los descuentos correspondientes');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('supplier_id', selectedSupplierId);

      if (discount1 !== '') formData.append('discount_1', parseFloat(discount1));
      if (discount2 !== '') formData.append('discount_2', parseFloat(discount2));
      formData.append('vat_included', vatIncluded);
      if (roundingRule) formData.append('rounding_rule', roundingRule);

      const batch = await api.uploadPriceList(formData);
      onBatchCreated(batch);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al procesar la lista.');
    } finally {
      setLoading(false);
    }
  };

  // Quick sample loader
  const handleLoadSample = async (sampleType) => {
    setLoading(true);
    setError(null);
    try {
      let filename = 'wstandard_transmisiones_y_frenos.csv';
      let supName = 'W-Standard';
      if (sampleType === 'pietcard') {
        filename = 'pietcard_cdi_y_electricidad.csv';
        supName = 'Pietcard';
      }

      const targetSupplier = suppliers.find(s => s.name.includes(supName)) || suppliers[0];
      if (targetSupplier) {
        setSelectedSupplierId(targetSupplier.id);
        setDiscount1(targetSupplier.default_discount_1_pct);
        setDiscount2(targetSupplier.default_discount_2_pct);
        setVatIncluded(targetSupplier.vat_included);
      }

      let fileBlob;
      if (sampleType === 'pietcard') {
        const csvContent = `CODIGO;DESCRIPCION;P_LISTA;MARCA
2120;CDI Alimentado a Bateria 4 Pines 110;14200;Pietcard
1035;Regulador de Voltaje 12V 4 Pines 110;17900;Pietcard
PIET-DESCONOCIDO-77;Bobina de Encendido Racing con Capuchon;24000;Pietcard`;
        fileBlob = new Blob([csvContent], { type: 'text/csv' });
      } else {
        const csvWStandard = `CODIGO;DESCRIPCION;MARCA;PRECIO_LISTA
WST-1436;Kit Transmisión 14/36 110cc (Smash, Wave);W-Standard;20500
WST-1543;Kit Transmisión 15/43 CG Titan 150;W-Standard;26800
WST-CIN110;Zapatas de Freno Traseras 110cc;W-Standard;7500
WST-PDTOR;Pastillas Freno Delanteras Tornado 250;W-Standard;12400
C7HSA;Bujía NGK C7HSA 110cc;NGK;4600
WST-CARB110;Carburador Completo 110cc Cebador Manual;W-Standard;31800
5100-15W50;Aceite Motul 5100 15W50 4T 1L;Motul;21400
FAR-5021;Cable Embrague CG Titan (ALERTA SPIKE);Far;11500
MOTO-NUEVO-999;Corona Competición 40T Titan;W-Standard;32000`;
        fileBlob = new Blob([csvWStandard], { type: 'text/csv' });
        filename = 'wstandard_transmisiones_y_frenos.csv';
      }

      const sampleFile = new File([fileBlob], filename, { type: 'text/csv' });
      setFile(sampleFile);

      const formData = new FormData();
      formData.append('file', sampleFile);
      formData.append('supplier_id', targetSupplier ? targetSupplier.id : 1);
      formData.append('discount_1', targetSupplier ? targetSupplier.default_discount_1_pct : 25);
      formData.append('discount_2', targetSupplier ? targetSupplier.default_discount_2_pct : 5);
      formData.append('vat_included', false);
      formData.append('rounding_rule', 'nearest_100');

      const batch = await api.uploadPriceList(formData);
      onBatchCreated(batch);
    } catch (err) {
      setError(err.message || 'Error cargando lista de ejemplo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-amber-400" />
            Ingesta de Lista de Precios de Distribuidor
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Suba archivos Excel (.xlsx) o CSV con precios de lista. El motor detecta códigos OEM y cruces de marca (Fram, Mann, Wega, etc.)
          </p>
        </div>

        {/* Quick Demo Test Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Probar ejemplos rápidos:
          </span>
          <button
            onClick={() => handleLoadSample('wstandard')}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition disabled:opacity-50 font-medium"
          >
            W-Standard (Transmisión y Frenos)
          </button>
          <button
            onClick={() => handleLoadSample('pietcard')}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 hover:border-sky-500/60 transition disabled:opacity-50 font-medium"
          >
            Pietcard (CDI y Electricidad)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        
        {/* Left Column: Supplier & Calculation Rules */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              1. Seleccionar Distribuidor / Proveedor
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => handleSupplierChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500 transition"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Discount Chain Info */}
          {activeSupplier && (
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span>Cadena de Descuentos:</span>
                <span className="font-mono font-bold text-amber-400">
                  {activeSupplier.default_discount_1_pct}% 
                  {activeSupplier.default_discount_2_pct ? ` + ${activeSupplier.default_discount_2_pct}%` : ''}
                  {activeSupplier.default_discount_3_pct ? ` + ${activeSupplier.default_discount_3_pct}%` : ''}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Tratamiento de IVA:</span>
                <span className="font-semibold text-slate-200">
                  {activeSupplier.vat_included ? 'Incluido en Lista' : '+ 21% IVA en Costo'}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Moneda de Lista:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {activeSupplier.currency}
                </span>
              </div>
            </div>
          )}

          {/* Collapsible Advanced Calculation Overrides */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition font-medium"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Ajustar descuentos o redondeo para esta lista</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Descuento 1 (%)</label>
                    <input
                      type="number"
                      placeholder="Ej: 25"
                      value={discount1}
                      onChange={(e) => setDiscount1(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Descuento 2 (%)</label>
                    <input
                      type="number"
                      placeholder="Ej: 5"
                      value={discount2}
                      onChange={(e) => setDiscount2(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Regla de Redondeo</label>
                  <select
                    value={roundingRule}
                    onChange={(e) => setRoundingRule(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="nearest_10">Redondear a $10 más cercano</option>
                    <option value="nearest_50">Redondear a $50 más cercano</option>
                    <option value="nearest_100">Redondear a $100 más cercano</option>
                    <option value="nearest_500">Redondear a $500 más cercano</option>
                    <option value="psychological_990">Terminación psicológica $990</option>
                    <option value="none">Sin redondeo (con centavos)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="vat-override"
                    checked={vatIncluded}
                    onChange={(e) => setVatIncluded(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="vat-override" className="text-slate-300">
                    Precios de lista ya incluyen IVA
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (2 spans): Drag and Drop Upload Zone */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[220px] ${
              isDragging 
                ? 'border-amber-400 bg-amber-500/10' 
                : file 
                  ? 'border-emerald-500/50 bg-emerald-950/20' 
                  : 'border-slate-700 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-950/80'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="font-semibold text-white text-base">{file.name}</span>
                <span className="text-xs text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB — Click para cambiar archivo
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 text-amber-400 flex items-center justify-center shadow-inner">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-slate-200">
                    Arrastre su archivo Excel (.xlsx) o CSV aquí
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    o haga click para explorar en su computadora
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Soporta listas de Warnes, Distrabol, Bosch, Fram, Mann, Mahle
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Procesando & Cruzando Códigos...</span>
                </>
              ) : (
                <>
                  <span>Analizar Lista & Ver Comparativa de Precios</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

