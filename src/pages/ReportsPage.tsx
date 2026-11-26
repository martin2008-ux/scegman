import { useMemo, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Printer,
  TrendingUp,
} from 'lucide-react';
import {
  DonutChart,
  GroupedBarChart,
  HorizontalProgressBars,
} from '../components/ui/Charts';
import { StatCard } from '../components/ui/StatCard';
import { useScegman } from '../context/ScegmanContext';

type ReportCategory = 'General' | 'Fallas' | 'Máquinas' | 'Reparaciones' | 'Inventario';

export function ReportsPage() {
  const { state } = useScegman();
  const [selectedReport, setSelectedReport] = useState<ReportCategory>('General');
  const [dateFrom, setDateFrom] = useState('2026-10-01');
  const [dateTo, setDateTo] = useState('2026-12-31');

  const totalMachines = state.machines.length;
  const operational = state.machines.filter((m) => m.status === 'Operativa').length;
  const availability = totalMachines > 0 ? Math.round((operational / totalMachines) * 100) : 0;

  const resolvedFaults = state.faults.filter((f) => f.status === 'Resuelta').length;
  const resolutionRate =
    state.faults.length > 0 ? Math.round((resolvedFaults / state.faults.length) * 100) : 0;

  const avgRepairHours =
    state.repairs.length > 0
      ? (
          state.repairs.reduce((acc, r) => acc + r.durationHours, 0) / state.repairs.length
        ).toFixed(1)
      : '0';

  const totalRepairCost = state.repairs.reduce((acc, r) => acc + r.cost, 0);

  const inventoryValue = state.spareParts.reduce(
    (acc, p) => acc + p.quantity * p.unitCost,
    0
  );

  // Dynamic fault priority distribution
  const faultPriorityCounts = {
    Crítica: state.faults.filter((f) => f.priority === 'Crítica').length,
    Alta: state.faults.filter((f) => f.priority === 'Alta').length,
    Media: state.faults.filter((f) => f.priority === 'Media').length,
    Baja: state.faults.filter((f) => f.priority === 'Baja').length,
  };

  // Filtered report rows
  const filteredReportRows = useMemo(() => {
    const inRange = (d: string) => d >= dateFrom && d <= dateTo;

    if (selectedReport === 'Fallas') {
      return state.faults
        .filter((f) => inRange(f.date))
        .map((f) => ({
          id: f.code,
          fecha: f.date,
          detalle: `${f.machineName} — ${f.description}`,
          categoria: `Prioridad ${f.priority}`,
          responsable: f.reportedBy,
          estado: f.status,
        }));
    }
    if (selectedReport === 'Máquinas') {
      return state.machines.map((m) => ({
        id: m.code,
        fecha: m.lastMaintenance,
        detalle: `${m.name} (${m.area})`,
        categoria: `${m.operatingHours} h operación`,
        responsable: m.manufacturer,
        estado: m.status,
      }));
    }
    if (selectedReport === 'Reparaciones') {
      return state.repairs
        .filter((r) => inRange(r.date))
        .map((r) => ({
          id: r.code,
          fecha: r.date,
          detalle: `${r.machineName} — ${r.description}`,
          categoria: `${r.type} (${r.durationHours} h)`,
          responsable: r.responsible,
          estado: `$${r.cost.toLocaleString('es-CL')}`,
        }));
    }
    if (selectedReport === 'Inventario') {
      return state.spareParts.map((p) => ({
        id: p.sku,
        fecha: p.updatedAt,
        detalle: `${p.name} (${p.location})`,
        categoria: `${p.quantity} / mín. ${p.minStock} ${p.unit}`,
        responsable: p.supplier,
        estado: p.status,
      }));
    }

    // General combined executive report
    return [
      ...state.faults.filter((f) => inRange(f.date)).map((f) => ({
        id: f.code,
        fecha: f.date,
        detalle: `[Falla] ${f.machineName}: ${f.description}`,
        categoria: f.priority,
        responsable: f.reportedBy,
        estado: f.status,
      })),
      ...state.repairs.filter((r) => inRange(r.date)).map((r) => ({
        id: r.code,
        fecha: r.date,
        detalle: `[Reparación] ${r.machineName}: ${r.description}`,
        categoria: r.type,
        responsable: r.responsible,
        estado: 'Completada',
      })),
    ].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }, [selectedReport, dateFrom, dateTo, state]);

  const exportCsv = () => {
    const headers = ['Código', 'Fecha', 'Detalle', 'Categoría', 'Responsable', 'Estado/Valor'];
    const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
    const rows = filteredReportRows.map((r) =>
      [r.id, r.fecha, r.detalle, r.categoria, r.responsable, r.estado].map(escape).join(',')
    );
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SCEGMAN_Informe_${selectedReport}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Disponibilidad Global"
          value={`${availability}%`}
          subtitle={`${operational} equipos operativos en planta`}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="green"
        />
        <StatCard
          title="Resolución de Fallas"
          value={`${resolutionRate}%`}
          subtitle={`${resolvedFaults} de ${state.faults.length} fallas resueltas`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="blue"
        />
        <StatCard
          title="Tiempo Medio (MTTR)"
          value={`${avgRepairHours} h`}
          subtitle={`Basado en ${state.repairs.length} reparaciones`}
          icon={<Clock className="h-5 w-5" />}
          accent="amber"
        />
        <StatCard
          title="Valor Inventario / Costo Mant."
          value={`$${Math.round(inventoryValue / 1000)}k`}
          subtitle={`Costo reparaciones: $${totalRepairCost.toLocaleString('es-CL')}`}
          icon={<BarChart3 className="h-5 w-5" />}
          accent="slate"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Disponibilidad de Equipos</h3>
          <p className="mb-4 text-xs text-slate-500">Estado actual de la flota</p>
          <DonutChart
            centerValue={`${availability}%`}
            centerLabel="Disponible"
            segments={[
              { label: 'Operativa', value: operational, color: '#10b981' },
              {
                label: 'En mantenimiento',
                value: state.machines.filter((m) => m.status === 'En mantenimiento').length,
                color: '#f59e0b',
              },
              {
                label: 'Fuera de servicio',
                value: state.machines.filter((m) => m.status === 'Fuera de servicio').length,
                color: '#ef4444',
              },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Fallas por Prioridad</h3>
          <p className="mb-4 text-xs text-slate-500">Severidad de incidencias registradas</p>
          <HorizontalProgressBars
            items={[
              {
                label: 'Crítica',
                value: faultPriorityCounts.Crítica,
                max: Math.max(1, state.faults.length),
                colorClass: 'bg-rose-600',
              },
              {
                label: 'Alta',
                value: faultPriorityCounts.Alta,
                max: Math.max(1, state.faults.length),
                colorClass: 'bg-amber-500',
              },
              {
                label: 'Media',
                value: faultPriorityCounts.Media,
                max: Math.max(1, state.faults.length),
                colorClass: 'bg-blue-600',
              },
              {
                label: 'Baja',
                value: faultPriorityCounts.Baja,
                max: Math.max(1, state.faults.length),
                colorClass: 'bg-slate-400',
              },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">
            Mantenimientos vs. Fallas (Semestral)
          </h3>
          <p className="mb-4 text-xs text-slate-500">Comparativa mensual operativa</p>
          <GroupedBarChart
            items={[
              { label: 'Jun', value: 4, secondaryValue: 5 },
              { label: 'Jul', value: 3, secondaryValue: 6 },
              { label: 'Ago', value: 5, secondaryValue: 4 },
              { label: 'Sep', value: 2, secondaryValue: 5 },
              { label: 'Oct', value: 4, secondaryValue: 7 },
              { label: 'Nov', value: state.faults.length, secondaryValue: state.repairs.length },
            ]}
            primaryLabel="Fallas"
            secondaryLabel="Reparaciones"
          />
        </div>
      </div>

      {/* Interactive Report Generator & Viewer */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Generador y Consulta de Informes
              </h3>
              <p className="text-xs text-slate-500">
                Filtra por módulo y rango de fechas, exporta a CSV o imprime el informe oficial.
              </p>
            </div>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4 text-blue-600" />
              Exportar CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Printer className="h-4 w-4" />
              Imprimir Informe
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="no-print mt-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(['General', 'Fallas', 'Máquinas', 'Reparaciones', 'Inventario'] as ReportCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedReport(cat)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                    selectedReport === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2 text-xs">
            <span className="font-medium text-slate-500">Desde:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700"
            />
            <span className="font-medium text-slate-500">Hasta:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700"
            />
          </div>
        </div>

        {/* Report Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Descripción / Equipo</th>
                <th className="px-4 py-3">Categoría / Métrica</th>
                <th className="px-4 py-3">Responsable / Proveedor</th>
                <th className="px-4 py-3">Estado / Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredReportRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No existen registros en el rango de fechas seleccionado.
                  </td>
                </tr>
              ) : (
                filteredReportRows.map((row, i) => (
                  <tr key={`${row.id}-${i}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{row.id}</td>
                    <td className="px-4 py-3 text-slate-500">{row.fecha}</td>
                    <td className="max-w-md px-4 py-3 text-slate-700">{row.detalle}</td>
                    <td className="px-4 py-3 text-slate-600">{row.categoria}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{row.responsable}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{row.estado}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
