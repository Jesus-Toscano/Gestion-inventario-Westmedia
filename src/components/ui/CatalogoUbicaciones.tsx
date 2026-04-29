import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Warehouse, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  useUbicacionesBodega,
  useCreateUbicacionBodega,
  useUpdateUbicacionBodega,
  useDeleteUbicacionBodega,
} from '../../hooks/useCatalogs';
import PasswordModal from './PasswordModal';
import type { UbicacionBodega } from '../../lib/types';

export default function CatalogoUbicaciones() {
  const { data: ubicaciones = [], isLoading } = useUbicacionesBodega();
  const createMutation = useCreateUbicacionBodega();
  const updateMutation = useUpdateUbicacionBodega();
  const deleteMutation = useDeleteUbicacionBodega();

  // Modal de contraseña
  const [pendingAction, setPendingAction] = useState<{ type: 'delete' | 'edit'; id: string } | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Formulario de creación
  const [showCreate, setShowCreate] = useState(false);
  const [newNombre, setNewNombre] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Edición inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNombre.trim()) return;
    try {
      await createMutation.mutateAsync({ nombre: newNombre.trim(), descripcion: newDesc.trim() || undefined });
      toast.success('Ubicación creada correctamente');
      setNewNombre('');
      setNewDesc('');
      setShowCreate(false);
    } catch (err: any) {
      toast.error('Error al crear: ' + err.message);
    }
  };

  const startEdit = (ub: UbicacionBodega) => {
    setEditNombre(ub.nombre);
    setEditDesc(ub.descripcion || '');
    setPendingAction({ type: 'edit', id: ub.id });
    setShowPasswordModal(true);
  };

  const startDelete = (id: string) => {
    setPendingAction({ type: 'delete', id });
    setShowPasswordModal(true);
  };

  const handlePasswordConfirm = async () => {
    setShowPasswordModal(false);
    if (!pendingAction) return;

    if (pendingAction.type === 'edit') {
      setEditingId(pendingAction.id);
    } else {
      try {
        await deleteMutation.mutateAsync(pendingAction.id);
        toast.success('Ubicación eliminada');
      } catch (err: any) {
        toast.error('Error al eliminar: ' + err.message);
      }
    }
    setPendingAction(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editNombre.trim()) return;
    try {
      await updateMutation.mutateAsync({ id, updates: { nombre: editNombre.trim(), descripcion: editDesc.trim() || undefined } });
      toast.success('Ubicación actualizada');
      setEditingId(null);
    } catch (err: any) {
      toast.error('Error al actualizar: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-semibold text-gray-900">Ubicaciones en Bodega</h3>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-medium px-2 py-0.5 rounded-full">
            {ubicaciones.length}
          </span>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Ubicación
        </button>
      </div>

      {/* Formulario de creación */}
      {showCreate && (
        <form onSubmit={handleCreateSubmit} className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
          <p className="text-sm font-medium text-indigo-800">Nueva Ubicación en Bodega</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nombre <span className="text-red-500">*</span></label>
              <input
                autoFocus
                required
                type="text"
                value={newNombre}
                onChange={e => setNewNombre(e.target.value)}
                placeholder="Ej. Tarima 8"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Descripción (Opcional)</label>
              <input
                type="text"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                placeholder="Ej. Lado norte del almacén"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1"
            >
              {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Guardar
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando...
        </div>
      ) : ubicaciones.length === 0 ? (
        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
          <Warehouse className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No hay ubicaciones registradas.</p>
          <p className="text-xs mt-1">Crea la primera con el botón de arriba.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {ubicaciones.map(ub => (
                <tr key={ub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {editingId === ub.id ? (
                      <input
                        autoFocus
                        value={editNombre}
                        onChange={e => setEditNombre(e.target.value)}
                        className="px-2 py-1 border border-indigo-400 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    ) : ub.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {editingId === ub.id ? (
                      <input
                        value={editDesc}
                        onChange={e => setEditDesc(e.target.value)}
                        className="px-2 py-1 border border-indigo-400 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Descripción opcional"
                      />
                    ) : (ub.descripcion || <span className="text-gray-300 italic">Sin descripción</span>)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === ub.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleSaveEdit(ub.id)}
                          disabled={updateMutation.isPending}
                          className="flex items-center gap-1 px-2.5 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700 transition-colors"
                        >
                          {updateMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1 px-2.5 py-1 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                        >
                          <X className="w-3 h-3" /> Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => startEdit(ub)}
                          className="flex items-center gap-1 px-2.5 py-1 border border-gray-300 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                        >
                          <Pencil className="w-3 h-3" /> Editar
                        </button>
                        <button
                          onClick={() => startDelete(ub.id)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showPasswordModal && (
        <PasswordModal
          actionName={pendingAction?.type === 'delete' ? 'eliminar esta ubicación' : 'editar esta ubicación'}
          onSuccess={handlePasswordConfirm}
          onCancel={() => { setShowPasswordModal(false); setPendingAction(null); }}
        />
      )}
    </div>
  );
}
