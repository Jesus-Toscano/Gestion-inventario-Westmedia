import { useState, useEffect } from 'react';
import { Download, Search, History, Loader2, RefreshCw, Pencil, Trash2, X, AlertTriangle, Save } from 'lucide-react';
import { toast } from 'sonner';
import type { InventoryItem, BannerSize, BannerMaterial, BannerCondition, FullInventoryUpdate } from '../lib/types';
import { getInventoryItems, updateInventoryItem, deleteInventoryItem } from '../lib/api';

// ─── Modal de Confirmación de Eliminación ─────────────────────────────────────
interface DeleteModalProps {
  item: InventoryItem;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function DeleteModal({ item, onConfirm, onCancel, isLoading }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <div className="p-2 bg-red-50 rounded-full">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Eliminar Registro</h2>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          ¿Estás seguro de que deseas eliminar el siguiente registro? <strong>Esta acción no se puede deshacer.</strong>
        </p>

        <div className="bg-gray-50 rounded-lg p-3 mb-5 border border-gray-200 text-sm text-gray-700 space-y-1">
          <div><span className="font-medium">Arte/Anunciante:</span> {item.arte_anunciante}</div>
          <div><span className="font-medium">Sitio:</span> {item.sitio_instalacion}</div>
          <div><span className="font-medium">Vendedor:</span> {item.vendedor}</div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {isLoading ? 'Eliminando...' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal de Edición ─────────────────────────────────────────────────────────
interface EditModalProps {
  item: InventoryItem;
  onSave: (updated: InventoryItem) => void;
  onCancel: () => void;
}

function EditModal({ item, onSave, onCancel }: EditModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FullInventoryUpdate>({
    fecha_ingreso: item.fecha_ingreso,
    arte_anunciante: item.arte_anunciante,
    vendedor: item.vendedor,
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
    setLoading(true);
    try {
      const payload: FullInventoryUpdate = {
        ...formData,
        fecha_salida: formData.fecha_salida || null,
        entregado_a: formData.entregado_a || null,
        estado_entrega: formData.fecha_salida ? formData.estado_entrega : null,
        updated_at: new Date().toISOString(),
      };
      const updated = await updateInventoryItem(item.id, payload);
      toast.success('Registro actualizado correctamente');
      onSave(updated);
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el registro. Intenta de nuevo.');
    } finally {
      setLoading(false);
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
                <label className={labelClass}>Vendedor</label>
                <input type="text" required value={formData.vendedor}
                  onChange={(e) => setFormData({ ...formData, vendedor: e.target.value })}
                  className={inputClass} />
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
            <button type="button" onClick={onCancel} disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Componente Principal Admin ────────────────────────────────────────────────
export default function Admin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado para modales
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const items = await getInventoryItems();
      setInventory(items);
    } catch {
      toast.error('Error al cargar el inventario.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // ── Handlers CRUD ──
  const handleSaveEdit = (updated: InventoryItem) => {
    setInventory((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setEditingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setDeleteLoading(true);
    try {
      await deleteInventoryItem(deletingItem.id);
      setInventory((prev) => prev.filter((i) => i.id !== deletingItem.id));
      toast.success('Registro eliminado correctamente');
      setDeletingItem(null);
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar el registro. Intenta de nuevo.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = [
        'ID', 'Fecha Ingreso', 'Arte/Anunciante', 'Vendedor',
        'Sitio de Instalación', 'Tamaño', 'Material',
        'Estado Lona (Ingreso)', 'Fecha Salida', 'Entregado A', 'Estado Lona (Salida)',
      ];

      const csvRows = [
        headers.join(','),
        ...filteredInventory.map((item) =>
          [
            item.id,
            item.fecha_ingreso,
            `"${item.arte_anunciante}"`,
            `"${item.vendedor}"`,
            `"${item.sitio_instalacion}"`,
            item.tamano,
            item.material,
            item.estado_lona,
            item.fecha_salida || 'N/A',
            `"${item.entregado_a || 'N/A'}"`,
            item.estado_entrega || 'N/A',
          ].join(',')
        ),
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Reporte_Inventario_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar CSV:', error);
      toast.error('Ocurrió un error al exportar el reporte');
    }
  };

  return (
    <div className="space-y-6">
      {/* Modales */}
      {editingItem && (
        <EditModal
          item={editingItem}
          onSave={handleSaveEdit}
          onCancel={() => setEditingItem(null)}
        />
      )}
      {deletingItem && (
        <DeleteModal
          item={deletingItem}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingItem(null)}
          isLoading={deleteLoading}
        />
      )}

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por anunciante, vendedor, sitio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchInventory}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-60"
            title="Actualizar datos"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={loading || filteredInventory.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            <span className="text-sm">Cargando inventario...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material / Sitio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingreso
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Especificaciones
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salida
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado Actual
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.arte_anunciante}</div>
                        <div className="text-sm text-gray-500">{item.sitio_instalacion}</div>
                        <div className="text-xs text-indigo-600 mt-1">Vendedor: {item.vendedor}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.fecha_ingreso}</div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          item.estado_lona === 'nueva' ? 'bg-green-100 text-green-800' :
                          item.estado_lona === 'bueno' ? 'bg-blue-100 text-blue-800' :
                          item.estado_lona === 'regular' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.estado_lona}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{item.tamano}</div>
                        <div className="text-sm text-gray-500 capitalize">{item.material}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.fecha_salida ? (
                          <>
                            <div className="text-sm text-gray-900">{item.fecha_salida}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs" title={item.entregado_a ?? ''}>
                              Para: {item.entregado_a}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400 italic">En almacén</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.fecha_salida ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <History className="w-3.5 h-3.5" />
                            Entregado ({item.estado_entrega})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Disponible
                          </span>
                        )}
                      </td>
                      {/* ── Columna Acciones ── */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            title="Editar registro"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            title="Eliminar registro"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      {searchTerm
                        ? 'No se encontraron registros que coincidan con la búsqueda.'
                        : 'No hay registros en el inventario aún.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
