import React, { useState } from 'react';
import { PackagePlus, LogOut, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { BannerSize, BannerMaterial, BannerCondition, InventoryItem } from '../lib/mockData';

export default function Almacenista() {
  const [activeTab, setActiveTab] = useState<'ingreso' | 'salida'>('ingreso');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('ingreso')}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'ingreso'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <PackagePlus className="h-4 w-4" />
          Ingreso de Material
        </button>
        <button
          onClick={() => setActiveTab('salida')}
          className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
            activeTab === 'salida'
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <LogOut className="h-4 w-4" />
          Salida / Entrega
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {activeTab === 'ingreso' ? <FormularioIngreso /> : <FormularioSalida />}
      </div>
    </div>
  );
}

function FormularioIngreso() {
  const [formData, setFormData] = useState({
    fecha_ingreso: new Date().toISOString().split('T')[0],
    arte_anunciante: '',
    vendedor: '',
    sitio_instalacion: '',
    tamano: 'sencilla' as BannerSize,
    material: 'front' as BannerMaterial,
    estado_lona: 'nueva' as BannerCondition,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate DB save
    console.log('Guardando ingreso:', formData);
    toast.success('Ingreso registrado correctamente');
    // Reset form
    setFormData({
      fecha_ingreso: new Date().toISOString().split('T')[0],
      arte_anunciante: '',
      vendedor: '',
      sitio_instalacion: '',
      tamano: 'sencilla',
      material: 'front',
      estado_lona: 'nueva',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          Datos del Ingreso
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Fecha de Ingreso</label>
            <input
              type="date"
              required
              value={formData.fecha_ingreso}
              onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Arte / Anunciante</label>
            <input
              type="text"
              required
              placeholder="Ej. Campaña Navideña"
              value={formData.arte_anunciante}
              onChange={(e) => setFormData({ ...formData, arte_anunciante: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Vendedor</label>
            <input
              type="text"
              required
              placeholder="Nombre del vendedor"
              value={formData.vendedor}
              onChange={(e) => setFormData({ ...formData, vendedor: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Sitio de Instalación</label>
            <input
              type="text"
              required
              placeholder="Dirección o ubicación"
              value={formData.sitio_instalacion}
              onChange={(e) => setFormData({ ...formData, sitio_instalacion: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Tamaño</label>
            <select
              value={formData.tamano}
              onChange={(e) => setFormData({ ...formData, tamano: e.target.value as BannerSize })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="sencilla">Sencilla</option>
              <option value="doble">Doble</option>
              <option value="cuadruple">Cuádruple</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Material</label>
            <select
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value as BannerMaterial })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="front">Front</option>
              <option value="mesh">Mesh</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Estado de la Lona</label>
            <select
              value={formData.estado_lona}
              onChange={(e) => setFormData({ ...formData, estado_lona: e.target.value as BannerCondition })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="nueva">Nueva</option>
              <option value="bueno">Bueno</option>
              <option value="regular">Regular</option>
              <option value="en mal estado">En mal estado</option>
              <option value="rota">Rota</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md font-medium shadow-sm transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <PackagePlus className="w-5 h-5" />
          Registrar Ingreso
        </button>
      </div>
    </form>
  );
}

function FormularioSalida() {
  const [formData, setFormData] = useState({
    itemId: '', // Simulate selecting an item to check out
    fecha_salida: new Date().toISOString().split('T')[0],
    entregado_a: '',
    estado_entrega: 'bueno' as BannerCondition,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId) {
      toast.error('Por favor selecciona un material para darle salida');
      return;
    }
    console.log('Guardando salida:', formData);
    toast.success('Salida registrada correctamente');
    setFormData({
      itemId: '',
      fecha_salida: new Date().toISOString().split('T')[0],
      entregado_a: '',
      estado_entrega: 'bueno',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <LogOut className="h-5 w-5 text-orange-500" />
          Datos de Salida / Entrega
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Seleccionar Material Disponible</label>
            <select
              value={formData.itemId}
              onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">-- Seleccione un material --</option>
              <option value="1">Campaña Verano 2026 - Av. Reforma 123 (Doble / Front)</option>
              <option value="2">Lanzamiento Producto X - Periférico Sur Km 15 (Cuádruple / Mesh)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Fecha de Salida</label>
            <input
              type="date"
              required
              value={formData.fecha_salida}
              onChange={(e) => setFormData({ ...formData, fecha_salida: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Entregado a</label>
            <input
              type="text"
              required
              placeholder="Nombre de quien recibe"
              value={formData.entregado_a}
              onChange={(e) => setFormData({ ...formData, entregado_a: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Estado en que se entrega</label>
            <select
              value={formData.estado_entrega}
              onChange={(e) => setFormData({ ...formData, estado_entrega: e.target.value as BannerCondition })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="nueva">Nueva</option>
              <option value="bueno">Bueno</option>
              <option value="regular">Regular</option>
              <option value="en mal estado">En mal estado</option>
              <option value="rota">Rota</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-md font-medium shadow-sm transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          <LogOut className="w-5 h-5" />
          Registrar Salida
        </button>
      </div>
    </form>
  );
}
