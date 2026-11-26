import React from 'react';

type BadgeVariant =
  | 'blue'
  | 'green'
  | 'amber'
  | 'red'
  | 'slate'
  | 'indigo'
  | 'cyan';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  cyan: 'bg-sky-50 text-sky-700 border-sky-200',
};

export function Badge({
  children,
  variant = 'slate',
  dot = false,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}) {
  const dotColors: Record<BadgeVariant, string> = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-rose-500',
    slate: 'bg-slate-500',
    indigo: 'bg-indigo-500',
    cyan: 'bg-sky-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${VARIANT_CLASSES[variant]}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

export function getMachineStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Operativa':
      return 'green';
    case 'En mantenimiento':
      return 'amber';
    case 'Fuera de servicio':
      return 'red';
    default:
      return 'slate';
  }
}

export function getPriorityVariant(priority: string): BadgeVariant {
  switch (priority) {
    case 'Crítica':
    case 'Urgente':
      return 'red';
    case 'Alta':
      return 'amber';
    case 'Media':
      return 'blue';
    case 'Baja':
      return 'slate';
    default:
      return 'slate';
  }
}

export function getFaultStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Abierta':
      return 'red';
    case 'En revisión':
      return 'amber';
    case 'En reparación':
      return 'blue';
    case 'Resuelta':
      return 'green';
    default:
      return 'slate';
  }
}

export function getPartStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Disponible':
      return 'green';
    case 'Stock bajo':
      return 'amber';
    case 'Agotado':
      return 'red';
    case 'Descontinuado':
      return 'slate';
    default:
      return 'slate';
  }
}

export function getTaskStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'Pendiente':
      return 'amber';
    case 'En proceso':
      return 'blue';
    case 'Completada':
      return 'green';
    default:
      return 'slate';
  }
}
