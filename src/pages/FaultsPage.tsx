import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightCircle,
  Edit3,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  getFaultStatusVariant,
  getPriorityVariant,
} from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useScegman } from '../context/ScegmanContext';
import type {
  FaultPriority,
  FaultReport,
  FaultStatus,
  ModuleKey,
} from '../types/scegman';

const PRIORITIES: FaultPriority[] = ['Baja', 'Media', 'Alta', 'Crítica'];
const STATUSES: FaultStatus[] = ['Abierta', 'En revisión', 'En reparación', 'Resuelta'];

export function FaultsPage({ onNavigate }: { onNavigate: (mod: ModuleKey) => void }) {
  const { state, addFault, updateFault, updateFaultStatus, deleteFault, addTask } = useScegman();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Todas');
  const [filterPriority, setFilterPriority] = useState<string>('Todas');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFault, setEditingFault] = useState<FaultReport | null>(null);
  const [taskCreatedBanner, setTaskCreatedBanner] = useState<string | null>(null);

  const activeWorker =
    state.workers.find((w) => w.id === state.activeWorkerId) ?? state.workers[0];

  const [formData, setFormData] = useState({
    machineId: state.machines[0]?.id ?? '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'Media' as FaultPriority,
    status: 'Abierta' as FaultStatus,
    reportedBy: activeWorker.name,
  });

  const filteredFaults = useMemo(() => {
    return state.faults.filter((f) => {
      const q = search.toLowerCase();
      const matchesSearch =
        f.code.toLowerCase().includes(q) ||
        f.machineName.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.reportedBy.toLowerCase().includes(q);
      const matchesStatus = filterStatus === 'Todas' || f.status === filterStatus;
      const matchesPriority = filterPriority === 'Todas' || f.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [state.faults, search, filterStatus, filterPriority]);

  const openCreateModal = () => {
    setEditingFault(null);
    setFormData({
      machineId: state.machines[0]?.id ?? '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'Media',
      status: 'Abierta',
      reportedBy: activeWorker.name,
    });
    setModalOpen(true);
  };

  const openEditModal = (fault: FaultReport) => {
    setEditingFault(fault);
    setFormData({
      machineId: fault.machineId,
      description: fault.description,
      date: fault.date,
      priority: fault.priority,
      status: fault.status,
      reportedBy: fault.reportedBy,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = state.machines.find((m) => m.id === formData.machineId);
    if (!machine || !formData.description.trim()) return;

    if (editingFault) {
      updateFault(editingFault.id, {
        machineId: machine.id,
        machineName: machine.name,
        area: machine.area,
        description: formData.description.trim(),
        date: formData.date,
        priority: formData.priority,
        status: formData.status,
        reportedBy: formData.reportedBy,
      });
    } else {
      addFault({
        machineId: machine.id,
        machineName: machine.name,
        area: machine.area,
        description: formData.description.trim(),
        date: formData.date,
        priority: formData.priority,
        status: formData.status,
        reportedBy: formData.reportedBy,
      });
    }
    setModalOpen(false);
  };

  const handleCreateTaskFromFault = (fault: FaultReport) => {
    const technician = state.workers.find((w) => w.role.includes('Técnic')) ?? state.workers[0];
    addTask({
      title: `Atender falla ${fault.code} en ${fault.machineName}`,
      description: fault.description,
      machineId: fault.machineId,
      machineName: fault.machineName,
      assignedTo: technician.name,
      priority: fault.priority === 'Crítica' ? 'Urgente' : fault.priority,
      type: 'Correctivo',
      status: 'Pendiente',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      linkedFaultId: fault.id,
    });
    if (fault.status === 'Abierta') {
      updateFaultStatus(fault.id, 'En revisión');
    }
    setTaskCreatedBanner(`Orden de trabajo creada para ${technician.name} desde ${fault.code}.`);
  };

  const openCount = state.faults.filter((f) => f.status === 'Abierta').length;
  const inProgressCount = state.faults.filter(
    (f) => f.status === 'En revisión' || f.status === 'En reparación'
  ).length;
  const resolvedCount = state.faults.filter((f) => f.status === 'Resuelta').length;

  return (
    <div className="space-y-6">
      {/* Top summary strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Reportes</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{state.faults.length}</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
          <p className="text-xs font-semibold text-rose-700 uppercase">Abiertas</p>
          <p className="mt-1 text-2xl font-bold text-rose-900">{openCount}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <p className="text-xs font-semibold text-blue-700 uppercase">En Atención</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">{inProgressCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Resueltas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">{resolvedCount}</p>
        </div>
      </div>

      {taskCreatedBanner && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          <span>{taskCreatedBanner}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('tareas')}
              className="font-semibold text-blue-700 underline"
            >
              Ir a Asignación de Tareas
            </button>
            <button
              type="button"
              onClick={() => setTaskCreatedBanner(null)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Ocultar
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, máquina o falla..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="Todas">Estado: Todos</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="Todas">Prioridad: Todas</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Registrar Falla
        </button>
      </div>

      {/* Table / Cards */}
      {filteredFaults.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-6 w-6" />}
          title="No hay reportes de fallas coincidentes"
          description="Ajusta los filtros de búsqueda o registra una nueva falla de máquina."
          actionLabel="Registrar Falla"
          onAction={openCreateModal}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3.5">Código / Fecha</th>
                  <th className="px-4 py-3.5">Máquina</th>
                  <th className="px-4 py-3.5">Descripción de la Falla</th>
                  <th className="px-4 py-3.5">Prioridad</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5">Reportado por</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaults.map((fault) => (
                  <tr key={fault.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{fault.code}</span>
                      <span className="block text-xs text-slate-500">{fault.date}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800">{fault.machineName}</span>
                      <span className="block text-xs text-slate-500">{fault.area}</span>
                    </td>
                    <td className="max-w-xs px-4 py-3.5 text-slate-600">
                      <p className="line-clamp-2 text-xs leading-relaxed">{fault.description}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={getPriorityVariant(fault.priority)} dot>
                        {fault.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        aria-label={`Estado de ${fault.code}`}
                        value={fault.status}
                        onChange={(e) =>
                          updateFaultStatus(fault.id, e.target.value as FaultStatus)
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1">
                        <Badge variant={getFaultStatusVariant(fault.status)}>{fault.status}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {fault.reportedBy}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {fault.status !== 'Resuelta' && (
                          <button
                            type="button"
                            onClick={() => handleCreateTaskFromFault(fault)}
                            title="Generar tarea de mantenimiento (HU06)"
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                          >
                            <ArrowRightCircle className="h-3.5 w-3.5" />
                            Crear Tarea
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(fault)}
                          title="Editar reporte"
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar el reporte ${fault.code}?`)) {
                              deleteFault(fault.id);
                            }
                          }}
                          title="Eliminar reporte"
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFault ? `Editar Falla ${editingFault.code}` : 'Registrar Nueva Falla'}
        subtitle="Ingresa los detalles de la anomalía detectada en el equipo."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Máquina afectada *
            </label>
            <select
              required
              value={formData.machineId}
              onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {state.machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.name} ({m.area})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Descripción de la falla *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ej.: Vibración anómala en eje principal, fuga hidráulica o código de alarma..."
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Fecha *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Prioridad *
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as FaultPriority })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Estado</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as FaultStatus })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Reportado por *
            </label>
            <select
              value={formData.reportedBy}
              onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {state.workers.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name} ({w.role})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {editingFault ? 'Guardar Cambios' : 'Registrar Falla'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
