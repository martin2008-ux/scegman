import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Cpu,
  PackageOpen,
  Plus,
  Wrench,
} from 'lucide-react';
import {
  Badge,
  getFaultStatusVariant,
  getMachineStatusVariant,
  getPriorityVariant,
  getTaskStatusVariant,
} from '../components/ui/Badge';
import { DonutChart, GroupedBarChart } from '../components/ui/Charts';
import { StatCard } from '../components/ui/StatCard';
import { useScegman } from '../context/ScegmanContext';
import type { ModuleKey } from '../types/scegman';

export function DashboardPage({ onNavigate }: { onNavigate: (mod: ModuleKey) => void }) {
  const { state } = useScegman();

  const totalMachines = state.machines.length;
  const operationalCount = state.machines.filter((m) => m.status === 'Operativa').length;
  const maintenanceCount = state.machines.filter((m) => m.status === 'En mantenimiento').length;
  const outOfServiceCount = state.machines.filter((m) => m.status === 'Fuera de servicio').length;
  const availabilityPct =
    totalMachines > 0 ? Math.round((operationalCount / totalMachines) * 100) : 0;

  const activeFaults = state.faults.filter((f) => f.status !== 'Resuelta');
  const pendingTasks = state.tasks.filter((t) => t.status !== 'Completada');
  const lowStockParts = state.spareParts.filter(
    (p) => p.status === 'Stock bajo' || p.status === 'Agotado'
  );

  // Build dynamic 6-month trend combined with live data on latest month (Nov)
  const monthlyStats = [
    { label: 'Jun', value: 4, secondaryValue: 5 },
    { label: 'Jul', value: 3, secondaryValue: 6 },
    { label: 'Ago', value: 5, secondaryValue: 4 },
    { label: 'Sep', value: 2, secondaryValue: 5 },
    { label: 'Oct', value: 4, secondaryValue: 7 },
    {
      label: 'Nov',
      value: state.faults.length,
      secondaryValue: state.repairs.length + state.tasks.filter((t) => t.status === 'Completada').length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner + Quick Actions */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-blue-100 bg-linear-to-r from-blue-700 via-blue-600 to-sky-600 p-6 text-white shadow-md sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase">
            Planta Industrial · Estado en Tiempo Real
          </span>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">
            Sistema Centralizado de Gestión y Mantenimiento
          </h2>
          <p className="mt-1 text-sm text-blue-100">
            Supervisa maquinaria, reporta fallas, gestiona bodega y coordina al equipo técnico desde un solo lugar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('fallas')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-xs transition hover:bg-blue-50"
          >
            <Plus className="h-4 w-4" />
            Reportar Falla
          </button>
          <button
            type="button"
            onClick={() => onNavigate('tareas')}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <ClipboardList className="h-4 w-4" />
            Asignar Tarea
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Disponibilidad de Planta"
          value={`${availabilityPct}%`}
          subtitle={`${operationalCount} de ${totalMachines} máquinas operativas`}
          icon={<Cpu className="h-5 w-5" />}
          accent={availabilityPct >= 75 ? 'green' : 'amber'}
          onClick={() => onNavigate('maquinas')}
        />
        <StatCard
          title="Fallas Activas"
          value={activeFaults.length}
          subtitle={`${activeFaults.filter((f) => f.priority === 'Crítica' || f.priority === 'Alta').length} de prioridad alta/crítica`}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent={activeFaults.length > 0 ? 'red' : 'green'}
          onClick={() => onNavigate('fallas')}
        />
        <StatCard
          title="Tareas Pendientes"
          value={pendingTasks.length}
          subtitle={`${state.tasks.filter((t) => t.status === 'Completada').length} completadas en historial`}
          icon={<ClipboardList className="h-5 w-5" />}
          accent="blue"
          onClick={() => onNavigate('tareas')}
        />
        <StatCard
          title="Alertas de Bodega"
          value={lowStockParts.length}
          subtitle={`${state.spareParts.filter((p) => p.status === 'Agotado').length} repuestos agotados`}
          icon={<PackageOpen className="h-5 w-5" />}
          accent={lowStockParts.length > 0 ? 'amber' : 'green'}
          onClick={() => onNavigate('inventario')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Disponibilidad de Máquinas</h3>
              <p className="text-xs text-slate-500">Distribución actual por estado operativo</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('maquinas')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              Ver equipos <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <DonutChart
            centerValue={`${availabilityPct}%`}
            centerLabel="Operativas"
            segments={[
              { label: 'Operativa', value: operationalCount, color: '#10b981' },
              { label: 'En mantenimiento', value: maintenanceCount, color: '#f59e0b' },
              { label: 'Fuera de servicio', value: outOfServiceCount, color: '#ef4444' },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Fallas vs. Mantenimientos (Últimos 6 meses)
              </h3>
              <p className="text-xs text-slate-500">Tendencia mensual de incidencias e intervenciones</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('informes')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              Ir a Informes <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <GroupedBarChart
            items={monthlyStats}
            primaryLabel="Fallas reportadas"
            secondaryLabel="Mantenimientos"
          />
        </div>
      </div>

      {/* Bottom 3-Column Operational Feed */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Faults */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Fallas Recientes (HU01)</h3>
            <button
              type="button"
              onClick={() => onNavigate('fallas')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Gestionar
            </button>
          </div>
          <div className="space-y-2.5">
            {state.faults.slice(0, 4).map((fault) => (
              <div
                key={fault.id}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-blue-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {fault.code} · {fault.machineName}
                  </span>
                  <Badge variant={getPriorityVariant(fault.priority)}>{fault.priority}</Badge>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-slate-600">{fault.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{fault.date}</span>
                  <Badge variant={getFaultStatusVariant(fault.status)} dot>
                    {fault.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Tareas Activas (HU06)</h3>
            <button
              type="button"
              onClick={() => onNavigate('tareas')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Ver tablero
            </button>
          </div>
          <div className="space-y-2.5">
            {state.tasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-blue-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-bold text-slate-800">{task.title}</span>
                  <Badge variant={getTaskStatusVariant(task.status)}>{task.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Responsable: <strong className="text-slate-700">{task.assignedTo}</strong>
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{task.machineName}</span>
                  <span>Límite: {task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Machine Status + Low Stock Snapshot */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Equipos Críticos (HU02)</h3>
              <button
                type="button"
                onClick={() => onNavigate('maquinas')}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Todos
              </button>
            </div>
            <div className="space-y-2">
              {state.machines.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">{m.name}</p>
                    <p className="text-[11px] text-slate-500">{m.area}</p>
                  </div>
                  <Badge variant={getMachineStatusVariant(m.status)} dot>
                    {m.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-700" />
                <h3 className="text-sm font-bold text-amber-950">Existencias Bajas (HU05)</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('inventario')}
                className="text-xs font-semibold text-amber-800 hover:underline"
              >
                Reponer
              </button>
            </div>
            {lowStockParts.length === 0 ? (
              <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>Todos los repuestos sobre el stock mínimo.</span>
              </div>
            ) : (
              <ul className="mt-2.5 space-y-1.5">
                {lowStockParts.slice(0, 3).map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between rounded-lg bg-white/80 px-3 py-1.5 text-xs"
                  >
                    <span className="truncate font-medium text-slate-800">{p.name}</span>
                    <span className="ml-2 shrink-0 font-bold text-rose-700">
                      {p.quantity} / {p.minStock}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
