import React, { useState } from 'react';
import { toast } from 'sonner';

interface PasswordModalProps {
  onSuccess: () => void;
  onCancel: () => void;
  actionName: string;
}

export default function PasswordModal({ onSuccess, onCancel, actionName }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1302') {
      onSuccess();
    } else {
      setError(true);
      toast.error('Contraseña incorrecta');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Autenticación Requerida</h2>
        <p className="text-sm text-gray-600 mb-4">Ingresa la contraseña para {actionName}.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(false); }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 ${error ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Contraseña"
          />
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
