import React, { useState } from 'react';
import { PackagePlus, LogOut, CheckCircle2, Loader2, Search as SearchIcon, X, Box, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { BannerSize, BannerMaterial, BannerCondition, InventoryItem } from '../lib/types';
import ModuloInsumosAlmacen from '../features/insumos/components/ModuloInsumosAlmacen';
import { useAvailableInventory, useCreateInventoryItem, useUpdateInventoryItemSalida } from '../features/lonas/hooks/useInventory';
import { useUbicacionesBodega } from '../hooks/useCatalogs';

export default function Almacenista() {
  const [mainTab, setMainTab] = useState<'lonas' | 'insumos'>('lonas');
  const [activeTab, setActiveTab] = useState<'ingreso' | 'salida'>('ingreso');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Main Navigation */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg justify-start max-w-sm mb-4">
        <button
          onClick={() => setMainTab('lonas')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all ${
            mainTab === 'lonas' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Gestión de Lonas
        </button>
        <button
          onClick={() => setMainTab('insumos')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all ${
            mainTab === 'insumos' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Box className="w-4 h-4" />
          Gestión de Insumos
        </button>
      </div>

      {mainTab === 'lonas' ? (
        <>
          {/* Tabs Nav (Lonas) */}
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
        </>
      ) : (
        <ModuloInsumosAlmacen />
      )}
    </div>
  );
}

// ─── Formulario de Ingreso ────────────────────────────────────────────────────
function FormularioIngreso() {
  const createItemMutation = useCreateInventoryItem();
  const { data: ubicaciones = [] } = useUbicacionesBodega();

  const [formData, setFormData] = useState({
    fecha_ingreso: new Date().toISOString().split('T')[0],
    arte_anunciante: '',
    vendedor: '',
    sitio_instalacion: '',
    tamano: 'sencilla' as BannerSize,
    material: 'front' as BannerMaterial,
    estado_lona: 'nueva' as BannerCondition,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createItemMutation.mutateAsync(formData as any);
      toast.success('Ingreso registrado correctamente');
      setFormData({
        fecha_ingreso: new Date().toISOString().split('T')[0],
        arte_anunciante: '',
        vendedor: '',
        sitio_instalacion: '',
        tamano: 'sencilla',
        material: 'front',
        estado_lona: 'nueva',
      });
    } catch (error) {
      toast.error('Error al registrar el ingreso. Intenta de nuevo.');
      console.error(error);
    }
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
            <label className="text-sm font-medium text-gray-700">Ubicación en Bodega</label>
            <select
              required
              value={formData.vendedor}
              onChange={(e) => setFormData({ ...formData, vendedor: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">Seleccione una ubicación...</option>
              {ubicaciones.map(u => <option key={u.id} value={u.nombre}>{u.nombre}{u.descripcion ? ` — ${u.descripcion}` : ''}</option>)}
            </select>
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
          disabled={createItemMutation.isPending}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-md font-medium shadow-sm transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {createItemMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <PackagePlus className="w-5 h-5" />
          )}
          {createItemMutation.isPending ? 'Guardando...' : 'Registrar Ingreso'}
        </button>
      </div>
    </form>
  );
}

// ─── Formulario de Salida ─────────────────────────────────────────────────────
function FormularioSalida() {
  const { data: availableItems = [], isLoading: loadingItems } = useAvailableInventory();
  const updateSalidaMutation = useUpdateInventoryItemSalida();

  // ── Combobox state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [formData, setFormData] = useState({
    fecha_salida: new Date().toISOString().split('T')[0],
    entregado_a: '',
    estado_entrega: 'bueno' as BannerCondition,
    kg_alambre: '',
    llaves_entregadas: false,
    sitio_instalacion: '',
  });

  // Eliminamos el useEffect local, useAvailableInventory hace el trabajo

  // Filtrar en tiempo real
  const filteredItems = availableItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    const clienteNombre = item.arte_anunciante?.toLowerCase() || '';
    const sitioNombre = item.sitio_instalacion?.toLowerCase() || '';
    return (
      clienteNombre.includes(q) ||
      sitioNombre.includes(q) ||
      item.tamano.toLowerCase().includes(q) ||
      item.material.toLowerCase().includes(q)
    );
  });

  const handleSelectItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setSearchQuery(`${item.arte_anunciante} — ${item.sitio_instalacion} (${item.tamano} / ${item.material})`);
    setFormData((prev) => ({ ...prev, sitio_instalacion: item.sitio_instalacion }));
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedItem(null);
    setSearchQuery('');
    setFormData((prev) => ({ ...prev, sitio_instalacion: '' }));
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) {
      toast.error('Por favor selecciona un material para darle salida');
      return;
    }
    try {
      await updateSalidaMutation.mutateAsync({
        id: selectedItem.id,
        salida: {
          fecha_salida: formData.fecha_salida,
          entregado_a: formData.entregado_a,
          estado_entrega: formData.estado_entrega,
          kg_alambre: formData.kg_alambre ? parseFloat(formData.kg_alambre) : 0,
          llaves_entregadas: formData.llaves_entregadas,
          updated_at: new Date().toISOString(),
        }
      });
      toast.success('Salida registrada correctamente');
      setSelectedItem(null);
      setSearchQuery('');
      setFormData({
        fecha_salida: new Date().toISOString().split('T')[0],
        entregado_a: '',
        estado_entrega: 'bueno',
        kg_alambre: '',
        llaves_entregadas: false,
        sitio_instalacion: '',
      });
    } catch (error) {
      toast.error('Error al registrar la salida. Intenta de nuevo.');
      console.error(error);
    }
  };

  const inputClass =
    'px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-full';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <LogOut className="h-5 w-5 text-orange-500" />
          Datos de Salida / Entrega
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── FILA 1: Buscador autocompletable (ancho completo) ── */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Seleccionar Material Disponible
            </label>
            {loadingItems ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando materiales...
              </div>
            ) : (
              <div className="relative">
                {/* Input de búsqueda */}
                <div className="relative flex items-center">
                  <SearchIcon className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Escribe para buscar por anunciante, sitio, tamaño..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedItem(null);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    className={`${inputClass} pl-9 pr-9 ${selectedItem ? 'border-indigo-400 bg-indigo-50' : ''}`}
                  />
                  {(searchQuery || selectedItem) && (
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Chip de selección activa */}
                {selectedItem && (
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-md px-3 py-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    <span className="font-medium">Seleccionado:</span>
                    <span>{selectedItem.arte_anunciante} — {selectedItem.sitio_instalacion} ({selectedItem.tamano} / {selectedItem.material})</span>
                  </div>
                )}

                {/* Dropdown */}
                {showDropdown && !selectedItem && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                    {filteredItems.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 italic">
                        {availableItems.length === 0
                          ? 'No hay materiales disponibles en almacén'
                          : 'Sin resultados para esta búsqueda'}
                      </div>
                    ) : (
                      filteredItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onMouseDown={() => handleSelectItem(item)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-gray-100 last:border-0 flex flex-col"
                        >
                          <span className="font-medium">{item.arte_anunciante}</span>
                          <span className="text-xs text-gray-500">{item.sitio_instalacion} · {item.tamano} / {item.material}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── FILA 2: Fecha de Salida | Entregado a ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Fecha de Salida</label>
            <input
              type="date"
              required
              value={formData.fecha_salida}
              onChange={(e) => setFormData({ ...formData, fecha_salida: e.target.value })}
              className={inputClass}
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
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Sitio de Instalación</label>
            <input
              type="text"
              required
              placeholder="Dirección o ubicación final (se autocompleta con el sitio original, puedes editarlo)"
              value={formData.sitio_instalacion}
              onChange={(e) => setFormData({ ...formData, sitio_instalacion: e.target.value })}
              className={inputClass}
            />
          </div>

          {/* ── FILA 3: Estado de entrega | Kg de alambre + Switch llaves ── */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Estado en que se entrega</label>
            <select
              value={formData.estado_entrega}
              onChange={(e) => setFormData({ ...formData, estado_entrega: e.target.value as BannerCondition })}
              className={`${inputClass} bg-white`}
            >
              <option value="nueva">Nueva</option>
              <option value="bueno">Bueno</option>
              <option value="regular">Regular</option>
              <option value="en mal estado">En mal estado</option>
              <option value="rota">Rota</option>
            </select>
          </div>

          {/* Columna derecha: Kg alambre + switch llaves */}
          <div className="flex flex-col gap-3">
            {/* Kg de alambre */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Kg de alambre entregados</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.kg_alambre}
                onChange={(e) => setFormData({ ...formData, kg_alambre: e.target.value })}
                className={inputClass}
              />
            </div>

            {/* Switch: ¿Se entregaron llaves? */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2.5">
              <span className="text-sm font-medium text-gray-700">¿Se entregaron llaves?</span>
              <button
                type="button"
                role="switch"
                aria-checked={formData.llaves_entregadas}
                onClick={() => setFormData({ ...formData, llaves_entregadas: !formData.llaves_entregadas })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${
                  formData.llaves_entregadas ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.llaves_entregadas ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={updateSalidaMutation.isPending || loadingItems || !selectedItem}
          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-md font-medium shadow-sm transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          {updateSalidaMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          {updateSalidaMutation.isPending ? 'Guardando...' : 'Registrar Salida'}
        </button>
      </div>
    </form>
  );
}
