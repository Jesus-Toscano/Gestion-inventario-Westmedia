import React, { useState } from 'react';
import { Download, Search, History } from 'lucide-react';
import { mockInventory } from '../lib/mockData';
import { toast } from 'sonner';

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInventory = mockInventory.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleExportCSV = () => {
    try {
      // 1. Convert data to CSV format
      const headers = [
        'ID',
        'Fecha Ingreso',
        'Arte/Anunciante',
        'Vendedor',
        'Sitio de Instalación',
        'Tamaño',
        'Material',
        'Estado Lona (Ingreso)',
        'Fecha Salida',
        'Entregado A',
        'Estado Lona (Salida)',
      ];

      const csvRows = [
        headers.join(','), // Header row
        ...filteredInventory.map((item) =>
          [
            item.id,
            item.fecha_ingreso,
            `"${item.arte_anunciante}"`, // Encapsulate in quotes in case of commas
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

      // 2. Create a Blob and generate a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.setAttribute('href', url);
      link.setAttribute('download', `Reporte_Inventario_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // 3. Trigger download and cleanup
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

        <button
          onClick={handleExportCSV}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                          <div className="text-sm text-gray-500 truncate max-w-xs" title={item.entregado_a}>
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
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                          Disponible
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
