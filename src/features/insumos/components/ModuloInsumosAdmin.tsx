import React, { useState } from 'react';
import { PackagePlus, Loader2, Star, History, Box, Table, Download, Trash2, Pencil, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useInsumos, useUpdateInsumo, useMovimientosInsumos, useUpdateMovimientoInsumo, useCreateInsumo, useDeleteInsumo } from '../hooks/useInsumos';
import PasswordModal from '../../../components/ui/PasswordModal';
import type { Insumo, MovimientoInsumo, UnidadMedida } from '../../../lib/types';
import { useProveedores, useCreateProveedor } from '../../../hooks/useCatalogs';

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
  const { data: insumos = [], isLoading: loading } = useInsumos();
  const [showModal, setShowModal] = useState(false);
  const [showProveedorModal, setShowProveedorModal] = useState(false);
  const [pendingActionInsumo, setPendingActionInsumo] = useState<{ type: 'edit' | 'delete'; item: Insumo } | null>(null);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);

  const updateInsumoMutation = useUpdateInsumo();
  const deleteInsumoMutation = useDeleteInsumo();

  const handleDelete = async (id: string) => {
    try {
      await deleteInsumoMutation.mutateAsync(id);
      toast.success('Insumo eliminado correctamente');
    } catch {
      toast.error('Error al eliminar insumo. Puede que tenga movimientos asociados.');
    }
  };

  const togglePrioridad = async (insumo: Insumo) => {
    try {
      await updateInsumoMutation.mutateAsync({ id: insumo.id, updates: { prioritario: !insumo.prioritario } });
      if (!insumo.prioritario) toast.success(`${insumo.nombre} añadido al Dashboard`);
      else toast.success(`${insumo.nombre} removido del Dashboard`);
    } catch {
      toast.error('Error al actualizar prioridad');
    }
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Unidad de Medida', 'Stock Actual', 'Costo Unitario', 'Proveedor', 'Prioritario'];
    const csvContent = [
      headers.join(','),
      ...insumos.map(item => [
        `"${item.nombre}"`,
        `"${item.unidad_medida}"`,
        item.stock_actual,
        item.costo_unitario ?? 0,
        `"${item.proveedor?.nombre || 'N/A'}"`,
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
            onClick={() => setShowProveedorModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <Users className="h-4 w-4" /> Nuevo Proveedor
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finanzas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {insumos.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">No hay insumos en el catálogo. ¡Agrega uno nuevo!</td></tr>
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
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">${(item.costo_unitario ?? 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{item.proveedor?.nombre || 'Sin proveedor'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPendingActionInsumo({ type: 'edit', item })}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPendingActionInsumo({ type: 'delete', item })}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <ModalNuevoInsumo onClose={() => setShowModal(false)} />}
      
      {showProveedorModal && <ModalNuevoProveedor onClose={() => setShowProveedorModal(false)} />}
      
      {editingInsumo && (
        <ModalEditInsumo 
          insumo={editingInsumo} 
          onClose={() => setEditingInsumo(null)} 
        />
      )}

      {pendingActionInsumo && (
        <PasswordModal
          actionName={pendingActionInsumo.type === 'edit' ? 'editar este insumo' : 'eliminar este insumo'}
          onSuccess={() => {
            if (pendingActionInsumo.type === 'delete') {
              handleDelete(pendingActionInsumo.item.id);
            } else if (pendingActionInsumo.type === 'edit') {
              setEditingInsumo(pendingActionInsumo.item);
            }
            setPendingActionInsumo(null);
          }}
          onCancel={() => setPendingActionInsumo(null)}
        />
      )}
    </div>
  );
}

function HistorialMovimientos() {
  const { data: movimientos = [], isLoading: loading } = useMovimientosInsumos();
  const [pendingAction, setPendingAction] = useState<{ type: 'edit' | 'delete'; item: MovimientoInsumo } | null>(null);
  const updateMovimientoInsumoMutation = useUpdateMovimientoInsumo();

  const handleCancel = async (id: string) => {
    try {
      await updateMovimientoInsumoMutation.mutateAsync({ id, updates: { cancelado: true } });
      toast.success('Movimiento marcado como cancelado');
    } catch (e: any) {
      toast.error('Error: ' + e.message);
    }
  };

  const exportToCSV = () => {
    const headers = ['Fecha', 'Insumo', 'Tipo Movimiento', 'Estatus', 'Cantidad', 'Unidad', 'Responsable', 'Sitio Instalacion', 'Notas'];
    const csvContent = [
      headers.join(','),
      ...movimientos.map(mov => {
        const responsableStr = `"${mov.responsable || 'N/A'}"`;
        const sitioStr = `"${mov.sitio_instalacion || 'N/A'}"`;
        return [
          `"${mov.fecha ? new Date(mov.fecha).toLocaleString() : ''}"`,
          `"${mov.insumos?.nombre || ''}"`,
          `"${mov.tipo}"`,
          `"${mov.cancelado ? 'CANCELADO' : 'Activo'}"`,
          mov.cantidad,
          `"${mov.insumos?.unidad_medida || ''}"`,
          responsableStr,
          sitioStr,
          `"${mov.notas_adicionales || ''}"`
        ].join(',')
      })
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
                        <div className="text-sm font-medium">{mov.responsable || '-'}</div>
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

function ModalNuevoInsumo({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ nombre: '', unidad_medida: 'Kg', prioritario: false, costo_unitario: '', proveedor_id: '' });
  const createInsumoMutation = useCreateInsumo();
  const { data: proveedores = [] } = useProveedores();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInsumoMutation.mutateAsync({
        nombre: formData.nombre,
        unidad_medida: formData.unidad_medida as UnidadMedida,
        prioritario: formData.prioritario,
        costo_unitario: formData.costo_unitario ? parseFloat(formData.costo_unitario) : 0,
        proveedor_id: formData.proveedor_id || null
      });
      toast.success('Insumo creado correctamente');
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al crear insumo: ' + (err.message || 'Desconocido'));
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo Unitario ($)</label>
              <input type="number" step="0.01" min="0" className={inputClass} placeholder="Ej. 150.50" value={formData.costo_unitario} onChange={e => setFormData({...formData, costo_unitario: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor (Opcional)</label>
              <select className={inputClass} value={formData.proveedor_id} onChange={e => setFormData({...formData, proveedor_id: e.target.value})}>
                <option value="">Seleccione...</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
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
            <button type="submit" disabled={createInsumoMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
              {createInsumoMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Guardar Insumo
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalEditInsumo({ insumo, onClose }: { insumo: Insumo, onClose: () => void }) {
  const [formData, setFormData] = useState({ 
    nombre: insumo.nombre, 
    unidad_medida: insumo.unidad_medida, 
    prioritario: insumo.prioritario, 
    costo_unitario: insumo.costo_unitario?.toString() || '', 
    proveedor_id: insumo.proveedor_id || '' 
  });
  const updateInsumoMutation = useUpdateInsumo();
  const { data: proveedores = [] } = useProveedores();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateInsumoMutation.mutateAsync({
        id: insumo.id,
        updates: {
          nombre: formData.nombre,
          unidad_medida: formData.unidad_medida as UnidadMedida,
          prioritario: formData.prioritario,
          costo_unitario: formData.costo_unitario ? parseFloat(formData.costo_unitario) : 0,
          proveedor_id: formData.proveedor_id || null
        }
      });
      toast.success('Insumo actualizado correctamente');
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Error al actualizar insumo: ' + (err.message || 'Desconocido'));
    }
  }

  const inputClass = 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 w-full';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Editar Insumo</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
            <input type="text" required autoFocus className={inputClass} value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
            <select className={inputClass} value={formData.unidad_medida} onChange={e => setFormData({...formData, unidad_medida: e.target.value as UnidadMedida})}>
              {['Kg', 'Piezas', 'Metros', 'Cajas', 'Rollos', 'Litros', 'Bolsas'].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo Unitario ($)</label>
              <input type="number" step="0.01" min="0" className={inputClass} value={formData.costo_unitario} onChange={e => setFormData({...formData, costo_unitario: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor (Opcional)</label>
              <select className={inputClass} value={formData.proveedor_id} onChange={e => setFormData({...formData, proveedor_id: e.target.value})}>
                <option value="">Seleccione...</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-3 bg-gray-50 border rounded-lg mt-2">
             <label className="flex items-center gap-2 cursor-pointer">
               <input type="checkbox" checked={formData.prioritario} onChange={e => setFormData({...formData, prioritario: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded" />
               <span className="text-sm font-medium text-gray-800">Mostrar en el Dashboard Prioritario</span>
             </label>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={updateInsumoMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
              {updateInsumoMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ModalNuevoProveedor({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ nombre: '', contacto: '', telefono: '' });
  const createProveedorMutation = useCreateProveedor();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProveedorMutation.mutateAsync({
        nombre: formData.nombre,
        contacto: formData.contacto || undefined,
        telefono: formData.telefono || undefined
      });
      toast.success('Proveedor creado correctamente');
      onClose();
    } catch {
      toast.error('Error al crear proveedor');
    }
  }

  const inputClass = 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 w-full';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Agregar Nuevo Proveedor</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial de Empresa</label>
            <input type="text" required autoFocus className={inputClass} placeholder="Ej. Comex, Home Depot..." value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Contacto (Opcional)</label>
            <input type="text" className={inputClass} placeholder="Ej. Juan Pérez" value={formData.contacto} onChange={e => setFormData({...formData, contacto: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (Opcional)</label>
            <input type="text" className={inputClass} placeholder="Ej. 555-1234-567" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={createProveedorMutation.isPending} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2">
              {createProveedorMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Guardar Proveedor
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
