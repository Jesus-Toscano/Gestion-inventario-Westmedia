import { useEffect, useState } from 'react';
import { useInsumos, useMovimientosInsumos } from '../features/insumos/hooks/useInsumos';
import { useAvailableInventory } from '../features/lonas/hooks/useInventory';
import { supabase } from '../lib/supabase';
import { Loader2, DollarSign, AlertTriangle, TrendingDown, Package, Image as ImageIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  const { data: insumos = [], isLoading: loadingInsumos } = useInsumos();
  const { data: movimientos = [], isLoading: loadingMovs } = useMovimientosInsumos();
  const { data: availableLonas = [], isLoading: loadingLonas } = useAvailableInventory();

  const [totalLonasStats, setTotalLonasStats] = useState<{ tamano: string; count: number }[]>([]);
  const [loadingTotalLonas, setLoadingTotalLonas] = useState(true);

  useEffect(() => {
    async function fetchTotalLonas() {
      const { data, error } = await supabase.from('inventory_items').select('tamano');
      if (!error && data) {
        const counts = data.reduce((acc: any, item: any) => {
          acc[item.tamano] = (acc[item.tamano] || 0) + 1;
          return acc;
        }, {});
        setTotalLonasStats(
          Object.keys(counts).map(key => ({ tamano: key, count: counts[key] }))
        );
      }
      setLoadingTotalLonas(false);
    }
    fetchTotalLonas();
  }, []);

  const isLoading = loadingInsumos || loadingMovs || loadingLonas || loadingTotalLonas;

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  // ─── 1. Costos y Dinero Congelado ───
  const dineroCongelado = insumos.reduce((acc, curr) => acc + (curr.stock_actual * (curr.costo_unitario || 0)), 0);

  // ─── 2. Insumos Más Consumidos (Mes Actual) ───
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const consumosMes = movimientos
    .filter(m => m.tipo === 'salida' && !m.cancelado)
    .filter(m => {
      if (!m.fecha) return false;
      const d = new Date(m.fecha);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc: any, curr) => {
      const name = curr.insumos?.nombre || 'Desconocido';
      acc[name] = (acc[name] || 0) + curr.cantidad;
      return acc;
    }, {});

  const dataConsumo = Object.keys(consumosMes)
    .map(key => ({ name: key, cantidad: consumosMes[key] }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 5); // Top 5

  // ─── 3. Lonas Pendientes de Instalación ───
  const lonasNuevasPendientes = availableLonas.filter(l => l.estado_lona === 'nueva');

  // ─── 4. Alertas de Stock Crítico ───
  const stockCritico = insumos.filter(i => i.stock_actual < 5); // Umbral de 5 unidades

  // ─── Colores para gráficas ───
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Analítico</h1>
      </div>

      {/* Tarjetas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Capital Congelado (Insumos)</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">${dineroCongelado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Lonas Nuevas (En Bodega)</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{lonasNuevasPendientes.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Lonas Disponibles Totales</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{availableLonas.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Insumos Críticos (&lt; 5)</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{stockCritico.length}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica 1: Insumos Más Consumidos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Top 5: Insumos Más Consumidos (Mes Actual)</h2>
          </div>
          <div className="h-72">
            {dataConsumo.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataConsumo} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="cantidad" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                No hay consumos registrados este mes.
              </div>
            )}
          </div>
        </div>

        {/* Gráfica 2: Distribución de Lonas Histórica */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Distribución de Lonas (Histórico)</h2>
          </div>
          <div className="h-72">
            {totalLonasStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={totalLonasStats}
                    dataKey="count"
                    nameKey="tamano"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={5}
                    label={({ name, percent }) => percent !== undefined ? `${name} ${(percent * 100).toFixed(0)}%` : name}
                    labelLine={false}
                  >
                    {totalLonasStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                No hay lonas registradas.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel Inferior: Alertas Críticas */}
      {stockCritico.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">¡Alerta de Stock Crítico!</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {stockCritico.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-red-100 flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900">{item.nombre}</h4>
                  <p className="text-xs text-gray-500">{item.proveedor?.nombre || 'Sin proveedor'}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-red-600">{item.stock_actual}</span>
                  <span className="text-xs text-red-500 ml-1">{item.unidad_medida}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
