import React, { useState } from 'react';
import { PackagePlus, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useInsumos, useCreateMovimientoInsumo, useUpdateInsumo } from '../hooks/useInsumos';
import { useInstalaciones } from '../../proyectos/hooks/useProyectos';
import type { Insumo, TipoMovimiento } from '../../../lib/types';

export default function ModuloInsumosAlmacen() {
  const [activeTab, setActiveTab] = useState<'entrada' | 'salida'>('entrada');
  const { data: insumos = [], isLoading: loadingItems } = useInsumos();

  const prioritarios = insumos.filter(i => i.prioritario);

  return (
    <div className="space-y-6">
      {/* Mini Dashboard de Insumos Prioritarios */}
      {prioritarios.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Insumos Prioritarios</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {prioritarios.map(insumo => (
              <div key={insumo.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm flex flex-col justify-between">
                <div className="flex truncate">
                   <span className="text-sm font-medium text-gray-800 truncate" title={insumo.nombre}>{insumo.nombre}</span>
                </div>
                <div className="mt-2 text-xl font-bold text-indigo-600 flex items-baseline gap-1">
                  {insumo.stock_actual} <span className="text-xs font-normal text-gray-500">{insumo.unidad_medida}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('entrada')}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'entrada'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <PackagePlus className="h-4 w-4" />
          Ingreso a Almacén
        </button>
        <button
          onClick={() => setActiveTab('salida')}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'salida'
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <LogOut className="h-4 w-4" />
          Salida (Soportada)
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {loadingItems ? (
          <div className="flex items-center justify-center gap-2 py-10 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Cargando catálogo...
          </div>
        ) : (
          <FormularioMovimiento 
            tipoMovimiento={activeTab} 
            insumos={insumos} 
          />
        )}
      </div>
    </div>
  );
}

function FormularioMovimiento({ 
  tipoMovimiento, 
  insumos 
}: { 
  tipoMovimiento: TipoMovimiento, 
  insumos: Insumo[] 
}) {
  const [formData, setFormData] = useState({
    insumo_id: '',
    cantidad: '',
    responsable: '',
    sitio_instalacion: '',
    notas_adicionales: '',
    costo_unitario: '',
    instalacion_id: ''
  });

  const createMovimientoInsumoMutation = useCreateMovimientoInsumo();
  const updateInsumoMutation = useUpdateInsumo();
  const { data: instalaciones = [] } = useInstalaciones();
  const proyectosActivos = instalaciones.filter(p => p.estado !== 'Completada' && p.estado !== 'Cancelada');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.insumo_id || !formData.cantidad) {
      toast.error('Completa los campos requeridos.');
      return;
    }

    try {
      const parsedCosto = formData.costo_unitario ? parseFloat(formData.costo_unitario) : undefined;
      const instalacionId = formData.instalacion_id || null;
      
      await createMovimientoInsumoMutation.mutateAsync({
        tipo: tipoMovimiento,
        insumo_id: formData.insumo_id,
        cantidad: parseFloat(formData.cantidad),
        responsable: formData.responsable,
        sitio_instalacion: tipoMovimiento === 'salida' && !instalacionId ? formData.sitio_instalacion : null,
        notas_adicionales: formData.notas_adicionales || null,
        costo_unitario: tipoMovimiento === 'entrada' ? parsedCosto : undefined,
        instalacion_id: tipoMovimiento === 'salida' ? instalacionId : null
      } as any);

      // Si es entrada y definieron un costo, actualizamos el costo en el catálogo
      if (tipoMovimiento === 'entrada' && parsedCosto !== undefined) {
        await updateInsumoMutation.mutateAsync({ id: formData.insumo_id, updates: { costo_unitario: parsedCosto } });
      }

      toast.success(tipoMovimiento === 'entrada' ? 'Ingreso registrado' : 'Salida registrada');
      setFormData({
        insumo_id: '',
        cantidad: '',
        responsable: '',
        sitio_instalacion: '',
        notas_adicionales: '',
        costo_unitario: '',
        instalacion_id: ''
      });
    } catch (err: any) {
      toast.error('Error al registrar: ' + err.message);
    }
  };

  const inputClass = 'px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full bg-white';
  const isSalida = tipoMovimiento === 'salida';

  // Autocomplete data - Extraído de los mismos sitios pero aquí dejamos campo abierto para más simplicidad por ahora
  // Podríamos alimentar un datalist con los sitios guardados si los trajéramos.

  const selectedInsumo = insumos.find(i => i.id === formData.insumo_id);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isSalida ? 'text-orange-600' : 'text-indigo-600'}`}>
          {isSalida ? <LogOut className="h-5 w-5" /> : <PackagePlus className="h-5 w-5" />}
          {isSalida ? 'Registrar Salida de Insumos' : 'Registrar Ingreso de Insumos al Almacén'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Insumo / Material</label>
            <select
              required
              value={formData.insumo_id}
              onChange={e => setFormData({ ...formData, insumo_id: e.target.value })}
              className={inputClass}
            >
              <option value="">-- Selecciona el Insumo --</option>
              {insumos.map(ins => (
                <option key={ins.id} value={ins.id}>
                  {ins.nombre} (Stock actual: {ins.stock_actual} {ins.unidad_medida})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Cantidad {selectedInsumo ? `(en ${selectedInsumo.unidad_medida})` : ''}
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={formData.cantidad}
              onChange={e => setFormData({ ...formData, cantidad: e.target.value })}
              className={inputClass}
              placeholder="Ej. 10.5"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              {isSalida ? 'Entregado a' : 'Recibido de'}
            </label>
            <input
              type="text"
              required
              value={formData.responsable}
              onChange={e => setFormData({ ...formData, responsable: e.target.value })}
              className={inputClass}
              placeholder={isSalida ? "Nombre del técnico o instalador" : "Nombre del proveedor o persona"}
            />
          </div>

          {!isSalida && (
            <div className="flex flex-col gap-1.5 md:col-span-2 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              <label className="text-sm font-medium text-indigo-800">
                Costo de Compra Unitario ($) (Opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.costo_unitario}
                onChange={e => setFormData({ ...formData, costo_unitario: e.target.value })}
                className={`${inputClass} border-indigo-200 mt-1`}
                placeholder="Ej. 15.50"
              />
              <p className="text-xs text-indigo-600 mt-1">Si lo llenas, el costo de este insumo se actualizará en el catálogo para futuros cálculos.</p>
            </div>
          )}

          {isSalida && (
            <div className="flex flex-col gap-1.5 md:col-span-2 bg-orange-50 p-3 rounded-lg border border-orange-100">
              <label className="text-sm font-medium text-orange-800 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> Proyecto / Sitio de Instalación
              </label>
              <select
                value={formData.instalacion_id}
                onChange={e => setFormData({ ...formData, instalacion_id: e.target.value, sitio_instalacion: '' })}
                className={`${inputClass} border-orange-200 mt-1 mb-2`}
              >
                <option value="">-- No aplica / Otro (Uso interno) --</option>
                {proyectosActivos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre_proyecto}</option>
                ))}
              </select>

              {!formData.instalacion_id && (
                <>
                  <label className="text-sm font-medium text-orange-800 mt-2">Justificación Manual (Requerido si no es proyecto)</label>
                  <input
                    type="text"
                    required={!formData.instalacion_id}
                    value={formData.sitio_instalacion}
                    onChange={e => setFormData({ ...formData, sitio_instalacion: e.target.value })}
                    className={`${inputClass} border-orange-200 mt-1`}
                    placeholder="Ej. Mantenimiento general taller"
                  />
                </>
              )}
              <p className="text-xs text-orange-600 mt-2">Asigna la salida a un proyecto para llevar el conteo del costo real de instalación.</p>
            </div>
          )}

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Notas Adicionales (Opcional)</label>
            <input
              type="text"
              value={formData.notas_adicionales}
              onChange={e => setFormData({ ...formData, notas_adicionales: e.target.value })}
              className={inputClass}
              placeholder="Algún detalle extra..."
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={createMovimientoInsumoMutation.isPending || !formData.insumo_id}
          className={`${isSalida ? 'bg-orange-600 hover:bg-orange-700' : 'bg-indigo-600 hover:bg-indigo-700'} disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-md font-medium shadow-sm transition-colors flex items-center gap-2`}
        >
          {createMovimientoInsumoMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isSalida ? (
            <LogOut className="w-5 h-5" />
          ) : (
            <PackagePlus className="w-5 h-5" />
          )}
          {createMovimientoInsumoMutation.isPending ? 'Guardando...' : (isSalida ? 'Registrar Salida' : 'Registrar Ingreso')}
        </button>
      </div>
    </form>
  );
}
