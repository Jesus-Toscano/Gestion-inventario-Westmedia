import React, { useState, useEffect } from 'react';
import { PackagePlus, Loader2, Star, History, Box, Table, Download, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getInsumos, createInsumo, updateInsumo, getMovimientosInsumos, updateMovimientoInsumo } from '../lib/api';
import PasswordModal from './PasswordModal';
import type { Insumo, MovimientoInsumo, UnidadMedida } from '../lib/types';

export default function ModuloInsumosAdmin() {
  const [activeTab, setActiveTab] = useState<'catalogo' | 'historial'>('catalogo');
  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('catalogo')}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'catalogo'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Box className="h-4 w-4" />
          Catálogo y Stock de Insumos
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'historial'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <History className="h-4 w-4" />
          Historial de Movimientos
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {activeTab === 'catalogo' ? <CatalogoInsumos /> : <HistorialMovimientos />}
      </div>
    </div>
  );
}

function CatalogoInsumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchInsumos = async () => {
    setLoading(true);
    try {
      const data = await getInsumos();
      setInsumos(data);
    } catch {
      toast.error('Error al cargar insumos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsumos();
  }, []);

  const togglePrioridad = async (insumo: Insumo) => {
    try {
      const updated = await updateInsumo(insumo.id, { prioritario: !insumo.prioritario });
      setInsumos(prev => prev.map(i => i.id === updated.id ? updated : i));
      if (updated.prioritario) toast.success(`${insumo.nombre} añadido al Dashboard`);
      else toast.success(`${insumo.nombre} removido del Dashboard`);
    } catch {
      toast.error('Error al actualizar prioridad');
    }
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Unidad de Medida', 'Stock Actual', 'Prioritario'];
    const csvContent = [
      headers.join(','),
      ...insumos.map(item => [
        `"${item.nombre}"`,
        `"${item.unidad_medida}"`,
        item.stock_actual,
        item.prioritario ? 'Si' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `catalogo_insumos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Table className="h-5 w-5 text-indigo-500" /> Stock Actual
        </h3>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Exportar CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <PackagePlus className="h-4 w-4" /> Nuevo Insumo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioritario (Dash)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Actual</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {insumos.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">No hay insumos en el catálogo. ¡Agrega uno nuevo!</td></tr>
              ) : (
                insumos.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => togglePrioridad(item)}
                        className={`p-1.5 rounded-full transition-colors ${item.prioritario ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50' : 'text-gray-300 hover:text-gray-400'}`}
                        title={item.prioritario ? "Quitar de prioritarios" : "Marcar como prioritario"}
                      >
                        <Star className={`w-5 h-5 ${item.prioritario ? 'fill-current' : ''}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{item.nombre}</td>
                    <td className="px-6 py-4 text-gray-500">{item.unidad_medida}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{item.stock_actual}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <ModalNuevoInsumo onClose={() => setShowModal(false)} onSuccess={fetchInsumos} />}
    </div>
  );
}

function HistorialMovimientos() {
  const [movimientos, setMovimientos] = useState<MovimientoInsumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete'; item: MovimientoInsumo } | null>(null);

  const fetchMovimientos = () => {
    setLoading(true);
    getMovimientosInsumos().then(setMovimientos).catch(() => toast.error('Error al cargar historial')).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMovimientos();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await updateMovimientoInsumo(id, { cancelado: true });
      toast.success('Movimiento marcado como cancelado');
      fetchMovimientos();
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Insumo', 'Tipo Movimiento', 'Estatus', 'Cantidad', 'Unidad', 'Responsable', 'Sitio Instalacion', 'Notas'];
    const csvContent = [
      headers.join(','),
      ...movimientos.map(mov => [
        `"${mov.fecha ? new Date(mov.fecha).toLocaleString() : ''}"`,
        `"${mov.insumos?.nombre || ''}"`,
        `"${mov.tipo}"`,
        `"${mov.cancelado ? 'CANCELADO' : 'Activo'}"`,
        mov.cantidad,
        `"${mov.insumos?.unidad_medida || ''}"`,
        `"${mov.responsable}"`,
        `"${mov.sitio_instalacion || ''}"`,
        `"${mov.notas_adicionales || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `historial_movimientos_insumos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-500" /> Historial de Movimientos
        </h3>
        <button
          onClick={exportToCSV}
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
        >
          <Download className="h-4 w-4" /> Exportar a Excel (CSV)
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Movimiento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resp / Sitio</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimientos.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No hay movimientos registrados.</td></tr>
              ) : (
                movimientos.map(mov => {
                  const isEntrada = mov.tipo === 'entrada';
                  const dateStr = mov.fecha ? new Date(mov.fecha).toLocaleString() : '';
                  const isCanceled = mov.cancelado;

                  return (
                    <tr key={mov.id} className={`hover:bg-gray-50 ${isCanceled ? 'opacity-50 bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {dateStr}
                        {isCanceled && <span className="block mt-1 text-xs font-bold text-red-500">CANCELADO</span>}
                      </td>
                      <td className={`px-6 py-4 font-medium ${isCanceled ? 'line-through text-gray-400' : 'text-gray-900'}`}>{mov.insumos?.nombre}</td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium border ${isCanceled ? 'bg-gray-100 text-gray-500 border-gray-200' : (isEntrada ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-orange-50 text-orange-700 border-orange-200')}`}>
                          {isEntrada ? '+' : '-'}{mov.cantidad} <span className="text-xs font-normal opacity-80">{mov.insumos?.unidad_medida}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 ${isCanceled ? 'line-through text-gray-400' : ''}`}>
                        <div className="text-sm font-medium">{mov.responsable}</div>
                        {mov.sitio_instalacion && <div className="text-xs text-orange-600 mt-0.5">Sitio: {mov.sitio_instalacion}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {!isCanceled && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setPendingAction({ type: 'delete', item: mov })}
                              title="Cancelar movimiento"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Cancelar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {pendingAction && (
        <PasswordModal
          actionName={pendingAction.type === 'edit' ? 'editar este registro' : 'cancelar este registro'}
          onSuccess={() => {
            if (pendingAction.type === 'delete') handleCancel(pendingAction.item.id);
            setPendingAction(null);
          }}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </div>
  );
}

function ModalNuevoInsumo({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', unidad_medida: 'Kg', prioritario: false });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createInsumo({
        nombre: formData.nombre,
        unidad_medida: formData.unidad_medida as UnidadMedida,
        prioritario: formData.prioritario
      });
      toast.success('Insumo creado correctamente');
      onSuccess();
      onClose();
    } catch {
      toast.error('Error al crear insumo');
    } finally {
      setSaving(false);
    }
  }

  const inputClass = 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 w-full';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nuevo Insumo al Catálogo</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
            <input type="text" required autoFocus className={inputClass} placeholder="Ej. Lijas gruesas" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
            <select className={inputClass} value={formData.unidad_medida} onChange={e => setFormData({...formData, unidad_medida: e.target.value})}>
              {['Kg', 'Piezas', 'Metros', 'Cajas', 'Rollos', 'Litros', 'Bolsas'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <p className="text-xs text-gray-400 mt-1">Cómo lo contarás (esto no se puede cambiar después).</p>
          </div>
          <div className="flex flex-col gap-2 p-3 bg-gray-50 border rounded-lg mt-2">
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" checked={formData.prioritario} onChange={e => setFormData({...formData, prioritario: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
               <span className="text-sm font-medium text-gray-800">Mostrar en el Dashboard Prioritario</span>
             </label>
             <p className="text-xs text-gray-500 pl-6">Si lo marcas, el almacenista verá su stock restante de forma permanente en pantalla.</p>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />} Guardar Insumo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
