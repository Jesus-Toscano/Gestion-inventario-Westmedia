import React, { useState } from 'react';
import { useInstalaciones, useCreateInstalacion, useCostosInstalacion, useCreateCostoInstalacion, useDeleteCostoInstalacion, useUpdateInstalacion } from '../features/proyectos/hooks/useProyectos';
import { useMovimientosInsumos } from '../features/insumos/hooks/useInsumos';
import { FolderKanban, Plus, FileText, ChevronRight, CheckCircle2, Circle, Clock, DollarSign, Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Instalacion } from '../lib/types';

export default function Proyectos() {
  const [selectedProject, setSelectedProject] = useState<Instalacion | null>(null);

  if (selectedProject) {
    return <ProjectDetails project={selectedProject} onBack={() => setSelectedProject(null)} />;
  }

  return <ProjectList onSelectProject={setSelectedProject} />;
}

function ProjectList({ onSelectProject }: { onSelectProject: (p: Instalacion) => void }) {
  const { data: proyectos = [], isLoading } = useInstalaciones();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <FolderKanban className="h-6 w-6 text-indigo-600" /> Proyectos e Instalaciones
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" /> Nuevo Proyecto
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectos.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-xl border border-gray-200">
              <FolderKanban className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">No hay proyectos registrados aún.</p>
            </div>
          ) : (
            proyectos.map(p => (
              <div 
                key={p.id} 
                onClick={() => onSelectProject(p)}
                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2.5 py-1 text-xs font-semibold rounded-full ${p.estado === 'Completada' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    {p.estado}
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{p.nombre_proyecto}</h3>
                <p className="text-sm text-gray-500 mb-4">{p.cliente || 'Sin cliente especificado'}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Iniciado: {p.fecha_inicio ? new Date(p.fecha_inicio).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && <ModalNuevoProyecto onClose={() => setShowModal(false)} />}
    </div>
  );
}

function ProjectDetails({ project, onBack }: { project: Instalacion, onBack: () => void }) {
  const { data: costos = [], isLoading: loadingCostos } = useCostosInstalacion(project.id);
  const { data: todosMovimientos = [], isLoading: loadingMovs } = useMovimientosInsumos();
  const updateProjectMutation = useUpdateInstalacion();
  const deleteCostoMutation = useDeleteCostoInstalacion();

  const [showCostModal, setShowCostModal] = useState(false);

  // Filtrar movimientos de insumos asociados a este proyecto
  const matConsumidos = todosMovimientos.filter(m => m.instalacion_id === project.id && m.tipo === 'salida' && !m.cancelado);

  const totalGastosFijos = costos.reduce((acc, curr) => acc + Number(curr.monto), 0);
  const totalMateriales = matConsumidos.reduce((acc, curr) => acc + (curr.cantidad * (curr.costo_unitario || 0)), 0);
  const costoTotalReal = totalGastosFijos + totalMateriales;

  const toggleStatus = async () => {
    const newStatus = project.estado === 'Completada' ? 'En Progreso' : 'Completada';
    try {
      await updateProjectMutation.mutateAsync({ id: project.id, updates: { estado: newStatus } });
      toast.success(`Proyecto marcado como ${newStatus}`);
      project.estado = newStatus; // Optimistic update
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const handleDeleteCosto = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este gasto?')) return;
    try {
      await deleteCostoMutation.mutateAsync({ id, instalacion_id: project.id });
      toast.success('Gasto eliminado');
    } catch {
      toast.error('Error al eliminar gasto');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Volver a Proyectos
        </button>
        <button 
          onClick={toggleStatus}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${project.estado === 'Completada' ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700'}`}
        >
          {project.estado === 'Completada' ? <Circle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {project.estado === 'Completada' ? 'Reabrir Proyecto' : 'Marcar como Completado'}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{project.nombre_proyecto}</h1>
            <p className="text-gray-500">{project.cliente}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Costo Total Real</p>
            <h2 className="text-3xl font-bold text-indigo-600">${costoTotalReal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna Izquierda: Checklist de Gastos */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-400" /> Checklist de Gastos Fijos
              </h3>
              <button 
                onClick={() => setShowCostModal(true)}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Agregar Gasto
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 space-y-3">
              {loadingCostos ? (
                <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
              ) : costos.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No hay gastos registrados aún.</p>
              ) : (
                costos.map(c => (
                  <div key={c.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-gray-100">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{c.concepto}</p>
                      <p className="text-xs text-gray-400">{c.categoria || 'Sin categoría'} • {c.fecha_gasto ? new Date(c.fecha_gasto).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">${Number(c.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      <button onClick={() => handleDeleteCosto(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-bold text-gray-900">
                <span>Subtotal Gastos:</span>
                <span>${totalGastosFijos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Materiales del Almacén */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-400" /> Materiales Consumidos
              </h3>
            </div>
            
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 space-y-3">
              {loadingMovs ? (
                <div className="text-center py-4"><Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" /></div>
              ) : matConsumidos.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No se han extraído materiales del almacén para este proyecto.</p>
              ) : (
                matConsumidos.map(m => {
                  const costoItem = m.cantidad * (m.costo_unitario || 0);
                  return (
                    <div key={m.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-gray-100">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{m.insumos?.nombre}</p>
                        <p className="text-xs text-gray-400">{m.cantidad} {m.insumos?.unidad_medida} a ${(m.costo_unitario || 0).toFixed(2)} c/u</p>
                      </div>
                      <span className="font-semibold text-gray-900">${costoItem.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )
                })
              )}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 font-bold text-gray-900">
                <span>Subtotal Insumos:</span>
                <span>${totalMateriales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Para agregar insumos a esta lista, haz una "Salida" en el módulo de Almacén seleccionando este proyecto.</p>
          </div>
        </div>
      </div>

      {showCostModal && <ModalNuevoGasto instalacionId={project.id} onClose={() => setShowCostModal(false)} />}
    </div>
  );
}

function ModalNuevoProyecto({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({ nombre_proyecto: '', cliente: '', presupuesto_estimado: '' });
  const createMutation = useCreateInstalacion();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        nombre_proyecto: formData.nombre_proyecto,
        cliente: formData.cliente,
        presupuesto_estimado: formData.presupuesto_estimado ? parseFloat(formData.presupuesto_estimado) : 0,
        estado: 'En Progreso'
      });
      toast.success('Proyecto creado con éxito');
      onClose();
    } catch {
      toast.error('Error al crear proyecto');
    }
  };

  const inputClass = 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 w-full';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Proyecto / Instalación</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proyecto / Sitio</label>
            <input type="text" required autoFocus className={inputClass} placeholder="Ej. Estructura Av. Lázaro Cárdenas" value={formData.nombre_proyecto} onChange={e => setFormData({...formData, nombre_proyecto: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente / Anunciante (Opcional)</label>
            <input type="text" className={inputClass} placeholder="Ej. Coca-Cola" value={formData.cliente} onChange={e => setFormData({...formData, cliente: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Presupuesto Estimado ($) (Opcional)</label>
            <input type="number" step="0.01" min="0" className={inputClass} placeholder="Ej. 15000.00" value={formData.presupuesto_estimado} onChange={e => setFormData({...formData, presupuesto_estimado: e.target.value})} />
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Crear Proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ModalNuevoGasto({ instalacionId, onClose }: { instalacionId: string, onClose: () => void }) {
  const [formData, setFormData] = useState({ concepto: '', monto: '', categoria: 'Mano de Obra Externa' });
  const createMutation = useCreateCostoInstalacion();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        instalacion_id: instalacionId,
        concepto: formData.concepto,
        monto: parseFloat(formData.monto),
        categoria: formData.categoria
      });
      toast.success('Gasto agregado con éxito');
      onClose();
    } catch {
      toast.error('Error al agregar gasto');
    }
  };

  const inputClass = 'px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 w-full';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Agregar Gasto al Proyecto</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
            <input type="text" required autoFocus className={inputClass} placeholder="Ej. Renta de Grúa, Permiso de Ayuntamiento..." value={formData.concepto} onChange={e => setFormData({...formData, concepto: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
            <input type="number" required step="0.01" min="0.01" className={inputClass} placeholder="Ej. 3500.00" value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select className={inputClass} value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
              {['Mano de Obra Externa', 'Maquinaria', 'Trámites y Permisos', 'Viáticos', 'Otros'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Guardar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
