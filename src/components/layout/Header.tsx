import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Menu,
  PackageOpen,
  Search,
  UserCheck,
} from 'lucide-react';
import { useScegman } from '../../context/ScegmanContext';
import type { ModuleKey } from '../../types/scegman';

interface HeaderProps {
  activeModule: ModuleKey;
  onOpenMobileMenu: () => void;
  onNavigate: (mod: ModuleKey) => void;
}

const MODULE_TITLES: Record<ModuleKey, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Panel Principal de Operaciones',
    subtitle: 'Resumen ejecutivo de disponibilidad, fallas, tareas y bodega',
  },
  fallas: {
    title: 'HU01 — Reporte de Fallas',
    subtitle: 'Registro, seguimiento y priorización de incidencias en planta',
  },
  maquinas: {
    title: 'HU02 — Estado de Máquinas',
    subtitle: 'Control operativo, fichas técnicas y actualización de disponibilidad',
  },
  informes: {
    title: 'HU03 — Estadísticas e Informes',
    subtitle: 'Indicadores clave de rendimiento (KPIs) y reportes exportables',
  },
  repuestos: {
    title: 'HU04 — Gestión de Repuestos',
    subtitle: 'Catálogo maestro de componentes, costos y stock mínimo',
  },
  inventario: {
    title: 'HU05 — Inventario y Bodega',
    subtitle: 'Control de entradas, salidas y alertas de existencias bajas',
  },
  tareas: {
    title: 'HU06 — Asignación de Tareas',
    subtitle: 'Planificación y seguimiento de órdenes de mantenimiento por técnico',
  },
  comunicacion: {
    title: 'HU07 — Comunicación Interna',
    subtitle: 'Mensajería operativa entre técnicos, bodega y supervisión',
  },
  historial: {
    title: 'HU08 — Historial de Reparaciones',
    subtitle: 'Bitácora histórica de intervenciones técnicas realizadas',
  },
};

export function Header({ activeModule, onOpenMobileMenu, onNavigate }: HeaderProps) {
  const { state, setActiveWorkerId } = useScegman();
  const [searchQuery, setSearchQuery] = useState('');
  const [alertsOpen, setAlertsOpen] = useState(false);

  const activeWorker =
    state.workers.find((w) => w.id === state.activeWorkerId) ?? state.workers[0];

  const criticalFaults = state.faults.filter(
    (f) => f.status !== 'Resuelta' && (f.priority === 'Crítica' || f.priority === 'Alta')
  );
  const lowStockParts = state.spareParts.filter(
    (p) => p.status === 'Stock bajo' || p.status === 'Agotado'
  );
  const totalAlerts = criticalFaults.length + lowStockParts.length;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return [];

    const results: { label: string; meta: string; module: ModuleKey }[] = [];

    state.machines.forEach((m) => {
      if (m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q)) {
        results.push({ label: `${m.code} · ${m.name}`, meta: `Máquina (${m.status})`, module: 'maquinas' });
      }
    });
    state.faults.forEach((f) => {
      if (f.description.toLowerCase().includes(q) || f.machineName.toLowerCase().includes(q) || f.code.toLowerCase().includes(q)) {
        results.push({ label: `${f.code} · ${f.machineName}`, meta: `Falla (${f.priority})`, module: 'fallas' });
      }
    });
    state.spareParts.forEach((p) => {
      if (p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) {
        results.push({ label: `${p.sku} · ${p.name}`, meta: `Repuesto (${p.quantity} ${p.unit})`, module: 'repuestos' });
      }
    });
    state.tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q) || t.assignedTo.toLowerCase().includes(q)) {
        results.push({ label: `${t.code} · ${t.title}`, meta: `Tarea (${t.assignedTo})`, module: 'tareas' });
      }
    });

    return results.slice(0, 6);
  }, [searchQuery, state]);

  const info = MODULE_TITLES[activeModule];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mobile menu + Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir navegación"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">{info.title}</h2>
            <p className="hidden text-xs text-slate-500 sm:block">{info.subtitle}</p>
          </div>
        </div>

        {/* Right: Search, Alerts, Active Profile */}
        <div className="flex items-center gap-2.5">
          {/* Global search */}
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar máquina, falla, repuesto..."
              className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-9 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full right-0 left-0 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                {searchResults.map((res, idx) => (
                  <button
                    key={`${res.label}-${idx}`}
                    type="button"
                    onClick={() => {
                      onNavigate(res.module);
                      setSearchQuery('');
                    }}
                    className="flex w-full flex-col border-b border-slate-100 px-3.5 py-2 text-left transition last:border-none hover:bg-blue-50"
                  >
                    <span className="truncate text-xs font-semibold text-slate-900">
                      {res.label}
                    </span>
                    <span className="text-[11px] text-slate-500">{res.meta}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Alerts button & popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAlertsOpen((v) => !v)}
              className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-blue-600"
              title="Alertas activas del sistema"
            >
              <Bell className="h-4.5 w-4.5" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
                  {totalAlerts}
                </span>
              )}
            </button>

            {alertsOpen && (
              <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                  <span className="text-xs font-bold tracking-wide text-slate-700 uppercase">
                    Alertas Activas ({totalAlerts})
                  </span>
                  <button
                    type="button"
                    onClick={() => setAlertsOpen(false)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Cerrar
                  </button>
                </div>
                <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                  {totalAlerts === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-500">
                      Sin alertas críticas o de stock bajo.
                    </p>
                  ) : (
                    <>
                      {criticalFaults.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            onNavigate('fallas');
                            setAlertsOpen(false);
                          }}
                          className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left hover:bg-rose-50/50"
                        >
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900">
                              Falla {f.priority}: {f.machineName}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">{f.description}</p>
                          </div>
                        </button>
                      ))}
                      {lowStockParts.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            onNavigate('inventario');
                            setAlertsOpen(false);
                          }}
                          className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left hover:bg-amber-50/50"
                        >
                          <PackageOpen className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900">
                              {p.status}: {p.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Actual: {p.quantity} {p.unit} (mín. {p.minStock})
                            </p>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Active worker selector */}
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              {activeWorker.avatarInitials}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-blue-600" />
                <select
                  aria-label="Trabajador activo"
                  value={state.activeWorkerId}
                  onChange={(e) => setActiveWorkerId(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  {state.workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-slate-500">{activeWorker.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
