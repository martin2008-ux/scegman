import React from 'react';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ClipboardList,
  Cpu,
  History,
  LayoutDashboard,
  MessageSquare,
  RotateCcw,
  Wrench,
  X,
} from 'lucide-react';
import { useScegman } from '../../context/ScegmanContext';
import type { ModuleKey } from '../../types/scegman';

interface SidebarProps {
  activeModule: ModuleKey;
  onSelectModule: (mod: ModuleKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  key: ModuleKey;
  label: string;
  hu?: string;
  icon: React.ReactNode;
  badgeCount?: number;
  badgeTone?: 'red' | 'amber' | 'blue';
}

export function Sidebar({
  activeModule,
  onSelectModule,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { state, resetDemoData } = useScegman();

  const openFaults = state.faults.filter((f) => f.status !== 'Resuelta').length;
  const downMachines = state.machines.filter((m) => m.status === 'Fuera de servicio').length;
  const lowStockParts = state.spareParts.filter(
    (p) => p.status === 'Stock bajo' || p.status === 'Agotado'
  ).length;
  const pendingTasks = state.tasks.filter((t) => t.status !== 'Completada').length;

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      label: 'Panel Principal',
      icon: <LayoutDashboard className="h-4.5 w-4.5" />,
    },
    {
      key: 'fallas',
      label: 'Reporte de Fallas',
      hu: 'HU01',
      icon: <AlertTriangle className="h-4.5 w-4.5" />,
      badgeCount: openFaults,
      badgeTone: 'red',
    },
    {
      key: 'maquinas',
      label: 'Estado de Máquinas',
      hu: 'HU02',
      icon: <Cpu className="h-4.5 w-4.5" />,
      badgeCount: downMachines,
      badgeTone: 'red',
    },
    {
      key: 'informes',
      label: 'Estadísticas e Informes',
      hu: 'HU03',
      icon: <BarChart3 className="h-4.5 w-4.5" />,
    },
    {
      key: 'repuestos',
      label: 'Repuestos',
      hu: 'HU04',
      icon: <Wrench className="h-4.5 w-4.5" />,
    },
    {
      key: 'inventario',
      label: 'Inventario y Bodega',
      hu: 'HU05',
      icon: <Boxes className="h-4.5 w-4.5" />,
      badgeCount: lowStockParts,
      badgeTone: 'amber',
    },
    {
      key: 'tareas',
      label: 'Asignación de Tareas',
      hu: 'HU06',
      icon: <ClipboardList className="h-4.5 w-4.5" />,
      badgeCount: pendingTasks,
      badgeTone: 'blue',
    },
    {
      key: 'comunicacion',
      label: 'Comunicación Interna',
      hu: 'HU07',
      icon: <MessageSquare className="h-4.5 w-4.5" />,
      badgeCount: state.messages.length,
      badgeTone: 'blue',
    },
    {
      key: 'historial',
      label: 'Historial Reparaciones',
      hu: 'HU08',
      icon: <History className="h-4.5 w-4.5" />,
    },
  ];

  const handleReset = () => {
    if (
      window.confirm(
        '¿Deseas restaurar los datos de demostración iniciales? Se perderán los cambios guardados localmente.'
      )
    ) {
      resetDemoData();
    }
  };

  const badgeColors = {
    red: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    blue: 'bg-blue-400/20 text-blue-200 border-blue-400/30',
  };

  const content = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-900/50">
            SC
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">SCEGMAN</h1>
            <p className="text-[11px] text-slate-400">Gestión y Mantenimiento</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          Módulos del Sistema
        </p>
        {navItems.map((item) => {
          const active = activeModule === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onSelectModule(item.key);
                onCloseMobile();
              }}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                active
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-950/50'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className={active ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}>
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <span className="block truncate">{item.label}</span>
                  {item.hu && (
                    <span
                      className={`text-[10px] font-semibold ${
                        active ? 'text-blue-100' : 'text-slate-500'
                      }`}
                    >
                      {item.hu}
                    </span>
                  )}
                </div>
              </div>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span
                  className={`ml-2 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                    active
                      ? 'border-white/30 bg-white/20 text-white'
                      : badgeColors[item.badgeTone ?? 'blue']
                  }`}
                >
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Demo Controls */}
      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl bg-slate-800/70 p-3">
          <p className="text-xs font-medium text-slate-300">Almacenamiento Local</p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Persistencia automática activa en navegador.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-blue-500/50 hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restaurar datos demo
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-68 shrink-0 border-r border-slate-800 lg:block">
        <div className="sticky top-0 h-screen">{content}</div>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <aside className="relative z-50 h-full w-72 shadow-2xl">{content}</aside>
        </div>
      )}
    </>
  );
}
