import React, { useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  Cpu,
  Edit3,
  Eye,
  MapPin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  Badge,
  getFaultStatusVariant,
  getMachineStatusVariant,
} from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useScegman } from '../context/ScegmanContext';
import type { Machine, MachineStatus } from '../types/scegman';

const MACHINE_STATUSES: MachineStatus[] = [
  'Operativa',
  'En mantenimiento',
  'Fuera de servicio',
];

export function MachinesPage() {
  const { state, addMachine, updateMachine, updateMachineStatus, deleteMachine } = useScegman();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todas');
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  const [form, setForm] = useState({
    code: '',
    name: '',
    area: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    installDate: new Date().toISOString().split('T')[0],
    operatingHours: 0,
    lastMaintenance: new Date().toISOString().split('T')[0],
    nextMaintenance: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    status: 'Operativa' as MachineStatus,
    notes: '',
  });

  const filteredMachines = useMemo(() => {
    const q = search.toLowerCase();
    return state.machines.filter((m) => {
      const matchesText =
        m.code.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.area.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'Todas' || m.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [state.machines, search, statusFilter]);

  const counts = {
    Operativa: state.machines.filter((m) => m.status === 'Operativa').length,
    'En mantenimiento': state.machines.filter((m) => m.status === 'En mantenimiento').length,
    'Fuera de servicio': state.machines.filter((m) => m.status === 'Fuera de servicio').length,
  };

  const openCreate = () => {
    setEditingMachine(null);
    const nextNum = String(state.machines.length + 1).padStart(3, '0');
    setForm({
      code: `MAQ-${nextNum}`,
      name: '',
      area: 'Mecanizado - Nave 1',
      model: '',
      manufacturer: '',
      serialNumber: '',
      installDate: new Date().toISOString().split('T')[0],
      operatingHours: 0,
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      status: 'Operativa',
      notes: '',
    });
    setFormOpen(true);
  };

  const openEdit = (machine: Machine) => {
    setEditingMachine(machine);
    setForm({
      code: machine.code,
      name: machine.name,
      area: machine.area,
      model: machine.model,
      manufacturer: machine.manufacturer,
      serialNumber: machine.serialNumber,
      installDate: machine.installDate,
      operatingHours: machine.operatingHours,
      lastMaintenance: machine.lastMaintenance,
      nextMaintenance: machine.nextMaintenance,
      status: machine.status,
      notes: machine.notes,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) return;
    if (editingMachine) {
      updateMachine(editingMachine.id, form);
    } else {
      addMachine(form);
    }
    setFormOpen(false);
  };

  const detailMachine = selectedMachine
    ? state.machines.find((m) => m.id === selectedMachine.id) ?? selectedMachine
    : null;

  return (
    <div className="space-y-6">
      {/* Status Summary Cards (clickable filters) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setStatusFilter('Todas')}
          className={`rounded-xl border p-4 text-left transition ${
            statusFilter === 'Todas'
              ? 'border-blue-500 bg-blue-50/70 ring-1 ring-blue-500'
              : 'border-slate-200 bg-white hover:border-blue-300'
          }`}
        >
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Maquinaria</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{state.machines.length}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Operativa')}
          className={`rounded-xl border p-4 text-left transition ${
            statusFilter === 'Operativa'
              ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500'
              : 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400'
          }`}
        >
          <p className="text-xs font-semibold text-emerald-700 uppercase">Operativas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">{counts.Operativa}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('En mantenimiento')}
          className={`rounded-xl border p-4 text-left transition ${
            statusFilter === 'En mantenimiento'
              ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
              : 'border-amber-200 bg-amber-50/40 hover:border-amber-400'
          }`}
        >
          <p className="text-xs font-semibold text-amber-700 uppercase">En Mantenimiento</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">{counts['En mantenimiento']}</p>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('Fuera de servicio')}
          className={`rounded-xl border p-4 text-left transition ${
            statusFilter === 'Fuera de servicio'
              ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-500'
              : 'border-rose-200 bg-rose-50/40 hover:border-rose-400'
          }`}
        >
          <p className="text-xs font-semibold text-rose-700 uppercase">Fuera de Servicio</p>
          <p className="mt-1 text-2xl font-bold text-rose-900">{counts['Fuera de servicio']}</p>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, equipo, fabricante o área..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="Todas">Todos los estados</option>
            {MACHINE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Registrar Máquina
        </button>
      </div>

      {/* Machines Grid */}
      {filteredMachines.length === 0 ? (
        <EmptyState
          icon={<Cpu className="h-6 w-6" />}
          title="No se encontraron máquinas"
          description="Prueba cambiando el filtro de estado o registra una nueva máquina en el sistema."
          actionLabel="Registrar Máquina"
          onAction={openCreate}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMachines.map((machine) => {
            const machineFaults = state.faults.filter(
              (f) => f.machineId === machine.id && f.status !== 'Resuelta'
            ).length;

            return (
              <div
                key={machine.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold tracking-wide text-blue-600">
                        {machine.code}
                      </span>
                      <h3 className="mt-0.5 text-base font-bold text-slate-900">{machine.name}</h3>
                    </div>
                    <Badge variant={getMachineStatusVariant(machine.status)} dot>
                      {machine.status}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>{machine.area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {machine.manufacturer} · {machine.model} ({machine.operatingHours.toLocaleString('es-CL')} h)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Próx. mant.: {machine.nextMaintenance}</span>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                    {machine.notes || 'Sin observaciones técnicas registradas.'}
                  </p>
                </div>

                <div className="mt-4 space-y-3 border-t border-slate-100 pt-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Actualizar estado:
                    </label>
                    <select
                      aria-label={`Estado de ${machine.name}`}
                      value={machine.status}
                      onChange={(e) =>
                        updateMachineStatus(machine.id, e.target.value as MachineStatus)
                      }
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                    >
                      {MACHINE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-500">
                      {machineFaults > 0 ? (
                        <span className="font-semibold text-rose-600">
                          {machineFaults} falla(s) activa(s)
                        </span>
                      ) : (
                        'Sin fallas activas'
                      )}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedMachine(machine)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ficha
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(machine)}
                        title="Editar máquina"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Eliminar la máquina ${machine.name}?`)) {
                            deleteMachine(machine.id);
                          }
                        }}
                        title="Eliminar máquina"
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        open={Boolean(detailMachine)}
        onClose={() => setSelectedMachine(null)}
        title={detailMachine ? `${detailMachine.code} — ${detailMachine.name}` : ''}
        subtitle="Ficha técnica e historial asociado del equipo"
        size="xl"
      >
        {detailMachine && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-xs text-slate-500">Estado Operativo Actual</p>
                <div className="mt-1">
                  <Badge variant={getMachineStatusVariant(detailMachine.status)} dot>
                    {detailMachine.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Cambiar a:</span>
                <select
                  value={detailMachine.status}
                  onChange={(e) =>
                    updateMachineStatus(detailMachine.id, e.target.value as MachineStatus)
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  {MACHINE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
              <div className="rounded-lg border border-slate-100 p-3">
                <span className="text-slate-400">Área / Ubicación</span>
                <p className="mt-0.5 font-semibold text-slate-800">{detailMachine.area}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <span className="text-slate-400">Fabricante / Modelo</span>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {detailMachine.manufacturer} · {detailMachine.model}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <span className="text-slate-400">N° de Serie</span>
                <p className="mt-0.5 font-semibold text-slate-800">{detailMachine.serialNumber}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <span className="text-slate-400">Horas de Operación</span>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {detailMachine.operatingHours.toLocaleString('es-CL')} h
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <span className="text-slate-400">Último Mantenimiento</span>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {detailMachine.lastMaintenance}
                </p>
              </div>
              <div className="rounded-lg border border-slate-100 p-3">
                <span className="text-slate-400">Próximo Mantenimiento</span>
                <p className="mt-0.5 font-semibold text-slate-800">
                  {detailMachine.nextMaintenance}
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-bold tracking-wide text-slate-600 uppercase">
                Fallas vinculadas a este equipo
              </h4>
              {state.faults.filter((f) => f.machineId === detailMachine.id).length === 0 ? (
                <p className="text-xs text-slate-500">Sin fallas registradas para esta máquina.</p>
              ) : (
                <div className="space-y-2">
                  {state.faults
                    .filter((f) => f.machineId === detailMachine.id)
                    .map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{f.code}:</span>{' '}
                          <span className="text-slate-600">{f.description}</span>
                        </div>
                        <Badge variant={getFaultStatusVariant(f.status)}>{f.status}</Badge>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-xs font-bold tracking-wide text-slate-600 uppercase">
                Reparaciones anteriores (HU08)
              </h4>
              {state.repairs.filter((r) => r.machineId === detailMachine.id).length === 0 ? (
                <p className="text-xs text-slate-500">Sin reparaciones registradas aún.</p>
              ) : (
                <div className="space-y-2">
                  {state.repairs
                    .filter((r) => r.machineId === detailMachine.id)
                    .map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                      >
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span>
                            {r.code} · {r.type}
                          </span>
                          <span>{r.date}</span>
                        </div>
                        <p className="mt-1 text-slate-600">{r.description}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Responsable: {r.responsible}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Machine Modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingMachine ? `Editar ${editingMachine.code}` : 'Registrar Nueva Máquina'}
        subtitle="Completa los datos técnicos y operativos del equipo."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Código *</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nombre de la máquina *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej.: Torno CNC Mazak QT-250"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Área *</label>
              <input
                type="text"
                required
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Estado</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as MachineStatus })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {MACHINE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Fabricante</label>
              <input
                type="text"
                value={form.manufacturer}
                onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Modelo</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">N° Serie</label>
              <input
                type="text"
                value={form.serialNumber}
                onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Horas operación
              </label>
              <input
                type="number"
                min={0}
                value={form.operatingHours}
                onChange={(e) =>
                  setForm({ ...form, operatingHours: Number(e.target.value) || 0 })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Último mant.
              </label>
              <input
                type="date"
                value={form.lastMaintenance}
                onChange={(e) => setForm({ ...form, lastMaintenance: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Próximo mant.
              </label>
              <input
                type="date"
                value={form.nextMaintenance}
                onChange={(e) => setForm({ ...form, nextMaintenance: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Notas técnicas
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {editingMachine ? 'Guardar Cambios' : 'Registrar Máquina'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
