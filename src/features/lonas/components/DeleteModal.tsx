import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import type { InventoryItem } from '../../../lib/types';

interface DeleteModalProps {
  item: InventoryItem;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function DeleteModal({ item, onConfirm, onCancel, isLoading }: DeleteModalProps) {
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
          <div><span className="font-medium">Ubicación en bodega:</span> {item.vendedor}</div>
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
