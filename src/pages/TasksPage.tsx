import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Edit3,
  History,
  Plus,
  Search,
  Trash2,
  User,
} from 'lucide-react';
import {
  Badge,
  getPriorityVariant,
  getTaskStatusVariant,
} from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useScegman } from '../context/ScegmanContext';
import type {
  MaintenanceTask,
  MaintenanceType,
  ModuleKey,
  TaskPriority,
  TaskStatus,
} from '../types/scegman';

const TASK_PRIORITIES: TaskPriority[] = ['Baja', 'Media', 'Alta', 'Urgente'];
const TASK_TYPES: MaintenanceType[] = ['Correctivo', 'Preventivo', 'Inspección'];
const TASK_STATUSES: TaskStatus[] = ['Pendiente', 'En proceso', 'Completada'];

export function TasksPage({ onNavigate }: { onNavigate: (mod: ModuleKey) => void }) {
  const { state, addTask, updateTask, updateTaskStatus, deleteTask, addRepair } = useScegman();

  const [search, setSearch] = useState('');
  const [workerFilter, setWorkerFilter] = useState('Todos');
  const [viewMode, setViewMode] = useState<'kanban' | 'lista'>('kanban');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);
  const [repairSavedMsg, setRepairSavedMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    machineId: state.machines[0]?.id ?? '',
    assignedTo: state.workers[1]?.name ?? state.workers[0]?.name ?? '',
    priority: 'Media' as TaskPriority,
    type: 'Preventivo' as MaintenanceType,
    status: 'Pendiente' as TaskStatus,
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
  });

  const filteredTasks = useMemo(() => {
    const q = search.toLowerCase();
    return state.tasks.filter((t) => {
      const matchesText =
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.machineName.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q);
      const matchesWorker = workerFilter === 'Todos' || t.assignedTo === workerFilter;
      return matchesText && matchesWorker;
    });
  }, [state.tasks, search, workerFilter]);

  const openCreate = () => {
    setEditingTask(null);
    setForm({
      title: '',
      description: '',
      machineId: state.machines[0]?.id ?? '',
      assignedTo: state.workers[1]?.name ?? state.workers[0]?.name ?? '',
      priority: 'Media',
      type: 'Preventivo',
      status: 'Pendiente',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const openEdit = (task: MaintenanceTask) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      machineId: task.machineId,
      assignedTo: task.assignedTo,
      priority: task.priority,
      type: task.type,
      status: task.status,
      dueDate: task.dueDate,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = state.machines.find((m) => m.id === form.machineId);
    if (!machine || !form.title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        machineName: machine.name,
      });
    } else {
      addTask({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        machineName: machine.name,
      });
    }
    setModalOpen(false);
  };

  const handleLogToRepairHistory = (task: MaintenanceTask) => {
    addRepair({
      machineId: task.machineId,
      machineName: task.machineName,
      description: `${task.title}: ${task.description}`,
      responsible: task.assignedTo,
      type: task.type === 'Preventivo' ? 'Preventivo' : 'Correctivo',
      partsUsed: 'Según orden de trabajo ' + task.code,
      durationHours: 2.5,
      cost: 75000,
      date: new Date().toISOString().split('T')[0],
      observations: `Registrado automáticamente desde tarea ${task.code}.`,
    });
    setRepairSavedMsg(`Se registró la reparación de "${task.title}" en el Historial (HU08).`);
  };

  return (
    <div className="space-y-6">
      {/* Status counters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-xs font-semibold text-amber-700 uppercase">Pendientes</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">
            {state.tasks.filter((t) => t.status === 'Pendiente').length}
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <p className="text-xs font-semibold text-blue-700 uppercase">En Proceso</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {state.tasks.filter((t) => t.status === 'En proceso').length}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Completadas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">
            {state.tasks.filter((t) => t.status === 'Completada').length}
          </p>
        </div>
      </div>

      {repairSavedMsg && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{repairSavedMsg}</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('historial')}
              className="font-semibold text-emerald-700 underline"
            >
              Ver Historial de Reparaciones
            </button>
            <button
              type="button"
              onClick={() => setRepairSavedMsg(null)}
              className="text-xs text-slate-500"
            >
              Cerrar
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
              placeholder="Buscar tarea, código o máquina..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <select
            value={workerFilter}
            onChange={(e) => setWorkerFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="Todos">Responsable: Todos</option>
            {state.workers.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>

          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tablero
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lista')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                viewMode === 'lista' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              Lista
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Asignar Tarea
        </button>
      </div>

      {/* Content */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title="No hay tareas asignadas"
          description="Crea una nueva orden de mantenimiento para asignarla a un técnico."
          actionLabel="Asignar Tarea"
          onAction={openCreate}
        />
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {TASK_STATUSES.map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            const colHeaderColor =
              colStatus === 'Pendiente'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : colStatus === 'En proceso'
                  ? 'border-blue-200 bg-blue-50 text-blue-900'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-900';

            return (
              <div
                key={colStatus}
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5"
              >
                <div
                  className={`mb-3 flex items-center justify-between rounded-xl border px-3.5 py-2.5 ${colHeaderColor}`}
                >
                  <span className="text-xs font-bold uppercase">{colStatus}</span>
                  <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-bold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colTasks.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-400">
                      Sin tareas en esta columna
                    </p>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-blue-300"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-bold text-blue-600">{task.code}</span>
                          <Badge variant={getPriorityVariant(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <h4 className="mt-1 text-sm font-bold text-slate-900">{task.title}</h4>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                          {task.description}
                        </p>

                        <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <User className="h-3.5 w-3.5 text-blue-500" />
                            <span>{task.assignedTo}</span>
                          </div>
                          <div>
                            Equipo: <strong className="text-slate-700">{task.machineName}</strong>
                          </div>
                          <div>
                            Tipo: {task.type} · Fecha límite: <strong>{task.dueDate}</strong>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                          <select
                            aria-label={`Estado tarea ${task.code}`}
                            value={task.status}
                            onChange={(e) =>
                              updateTaskStatus(task.id, e.target.value as TaskStatus)
                            }
                            className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700"
                          >
                            {TASK_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            {task.status === 'Completada' && (
                              <button
                                type="button"
                                onClick={() => handleLogToRepairHistory(task)}
                                title="Registrar en Historial de Reparaciones (HU08)"
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                              >
                                <History className="h-3.5 w-3.5" />
                                Archivar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => openEdit(task)}
                              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-blue-600"
                              title="Editar tarea"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Eliminar tarea ${task.code}?`)) {
                                  deleteTask(task.id);
                                }
                              }}
                              className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                              title="Eliminar tarea"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3.5">Código / Tarea</th>
                  <th className="px-4 py-3.5">Máquina</th>
                  <th className="px-4 py-3.5">Responsable</th>
                  <th className="px-4 py-3.5">Prioridad</th>
                  <th className="px-4 py-3.5">Fecha Límite</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-blue-600">{t.code}</span>
                      <p className="font-semibold text-slate-900">{t.title}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{t.machineName}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{t.assignedTo}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={getPriorityVariant(t.priority)}>{t.priority}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{t.dueDate}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={getTaskStatusVariant(t.status)} dot>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {t.status !== 'Completada' && (
                          <button
                            type="button"
                            onClick={() => updateTaskStatus(t.id, 'Completada')}
                            title="Marcar completada"
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEdit(t)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(t.id)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
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

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? `Editar Tarea ${editingTask.code}` : 'Asignar Nueva Tarea'}
        subtitle="Asigna responsable, prioridad y fecha límite para el trabajo técnico."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Título de la tarea *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej.: Cambio de rodamientos eje principal"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Descripción del trabajo *
            </label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Responsable *
              </label>
              <select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {state.workers.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name} — {w.role}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Máquina asociada *
              </label>
              <select
                value={form.machineId}
                onChange={(e) => setForm({ ...form, machineId: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {state.machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code} — {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Prioridad</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as MaintenanceType })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {TASK_TYPES.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Estado</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Fecha límite *
              </label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
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
              {editingTask ? 'Guardar Cambios' : 'Asignar Tarea'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
