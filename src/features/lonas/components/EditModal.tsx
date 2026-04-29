import React, { useState } from 'react';
import { Pencil, X, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { InventoryItem, BannerSize, BannerMaterial, BannerCondition, FullInventoryUpdate } from '../../../lib/types';
import { useUpdateInventoryItem } from '../hooks/useInventory';
import { useEmpleados } from '../../../hooks/useCatalogs';

interface EditModalProps {
  item: InventoryItem;
  onSave: () => void;
  onCancel: () => void;
}

export function EditModal({ item, onSave, onCancel }: EditModalProps) {
  const { data: empleados = [] } = useEmpleados();

  const updateItemMutation = useUpdateInventoryItem();
  const [formData, setFormData] = useState<FullInventoryUpdate>({
    fecha_ingreso: item.fecha_ingreso,
    arte_anunciante: item.arte_anunciante,
    vendedor_id: item.vendedor_id,
    sitio_instalacion: item.sitio_instalacion,
    tamano: item.tamano,
    material: item.material,
    estado_lona: item.estado_lona,
    fecha_salida: item.fecha_salida ?? null,
    entregado_a: item.entregado_a ?? null,
    estado_entrega: item.estado_entrega ?? null,
    updated_at: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: FullInventoryUpdate = {
        ...formData,
        fecha_salida: formData.fecha_salida || null,
        entregado_a: formData.entregado_a || null,
        estado_entrega: formData.fecha_salida ? formData.estado_entrega : null,
        updated_at: new Date().toISOString(),
      };
      await updateItemMutation.mutateAsync({ id: item.id, data: payload });
      toast.success('Registro actualizado correctamente');
      onSave();
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el registro. Intenta de nuevo.');
    }
  };

  const inputClass =
    'px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2 text-indigo-600">
            <Pencil className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-gray-900">Editar Registro</h2>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Sección Ingreso */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Datos de Ingreso</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fecha de Ingreso</label>
                <input type="date" required value={formData.fecha_ingreso}
                  onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Arte / Anunciante</label>
                <input type="text" required value={formData.arte_anunciante}
                  onChange={(e) => setFormData({ ...formData, arte_anunciante: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ubicación en Bodega</label>
                <select required value={formData.vendedor_id}
                  onChange={(e) => setFormData({ ...formData, vendedor_id: e.target.value })}
                  className={`${inputClass} bg-white`}>
                  <option value="">Seleccione...</option>
                  {empleados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Sitio de Instalación</label>
                <input type="text" required value={formData.sitio_instalacion}
                  onChange={(e) => setFormData({ ...formData, sitio_instalacion: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tamaño</label>
                <select value={formData.tamano}
                  onChange={(e) => setFormData({ ...formData, tamano: e.target.value as BannerSize })}
                  className={`${inputClass} bg-white`}>
                  <option value="sencilla">Sencilla</option>
                  <option value="doble">Doble</option>
                  <option value="cuadruple">Cuádruple</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Material</label>
                <select value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value as BannerMaterial })}
                  className={`${inputClass} bg-white`}>
                  <option value="front">Front</option>
                  <option value="mesh">Mesh</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Estado de la Lona</label>
                <select value={formData.estado_lona}
                  onChange={(e) => setFormData({ ...formData, estado_lona: e.target.value as BannerCondition })}
                  className={`${inputClass} bg-white`}>
                  <option value="nueva">Nueva</option>
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="en mal estado">En mal estado</option>
                  <option value="rota">Rota</option>
                </select>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-100" />

          {/* Sección Salida (opcional) */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Datos de Salida <span className="normal-case text-gray-400 font-normal">(opcional)</span></h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fecha de Salida</label>
                <input type="date" value={formData.fecha_salida ?? ''}
                  onChange={(e) => setFormData({ ...formData, fecha_salida: e.target.value || null })}
                  className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Entregado a</label>
                <input type="text" value={formData.entregado_a ?? ''}
                  placeholder="Nombre de quien recibe"
                  onChange={(e) => setFormData({ ...formData, entregado_a: e.target.value || null })}
                  className={inputClass} disabled={!formData.fecha_salida} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Estado en que se entrega</label>
                <select value={formData.estado_entrega ?? ''}
                  onChange={(e) => setFormData({ ...formData, estado_entrega: (e.target.value as BannerCondition) || null })}
                  className={`${inputClass} bg-white`} disabled={!formData.fecha_salida}>
                  <option value="">-- Sin datos de entrega --</option>
                  <option value="nueva">Nueva</option>
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="en mal estado">En mal estado</option>
                  <option value="rota">Rota</option>
                </select>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onCancel} disabled={updateItemMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60">
              Cancelar
            </button>
            <button type="submit" disabled={updateItemMutation.isPending}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center gap-2">
              {updateItemMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {updateItemMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
