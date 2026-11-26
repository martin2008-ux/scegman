import React, { useMemo, useState } from 'react';
import { Edit3, Eye, History, Plus, Search, Trash2 } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useScegman } from '../context/ScegmanContext';
import type { RepairRecord } from '../types/scegman';

export function RepairsPage() {
  const { state, addRepair, updateRepair, deleteRepair } = useScegman();

  const [search, setSearch] = useState('');
  const [machineFilter, setMachineFilter] = useState('Todas');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [detailRepair, setDetailRepair] = useState<RepairRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<RepairRecord | null>(null);

  const [form, setForm] = useState({
    machineId: state.machines[0]?.id ?? '',
    description: '',
    responsible: state.workers[1]?.name ?? state.workers[0]?.name ?? '',
    type: 'Correctivo' as 'Correctivo' | 'Preventivo',
    partsUsed: '',
    durationHours: 2,
    cost: 50000,
    date: new Date().toISOString().split('T')[0],
    observations: '',
  });

  const filteredRepairs = useMemo(() => {
    const q = search.toLowerCase();
    return state.repairs.filter((r) => {
      const matchesText =
        r.code.toLowerCase().includes(q) ||
        r.machineName.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.responsible.toLowerCase().includes(q);
      const matchesMachine = machineFilter === 'Todas' || r.machineId === machineFilter;
      const matchesType = typeFilter === 'Todos' || r.type === typeFilter;
      return matchesText && matchesMachine && matchesType;
    });
  }, [state.repairs, search, machineFilter, typeFilter]);

  const totalHours = filteredRepairs.reduce((acc, r) => acc + r.durationHours, 0);
  const totalCost = filteredRepairs.reduce((acc, r) => acc + r.cost, 0);

  const openCreate = () => {
    setEditingRepair(null);
    setForm({
      machineId: state.machines[0]?.id ?? '',
      description: '',
      responsible: state.workers[1]?.name ?? state.workers[0]?.name ?? '',
      type: 'Correctivo',
      partsUsed: '',
      durationHours: 2,
      cost: 50000,
      date: new Date().toISOString().split('T')[0],
      observations: '',
    });
    setModalOpen(true);
  };

  const openEdit = (r: RepairRecord) => {
    setEditingRepair(r);
    setForm({
      machineId: r.machineId,
      description: r.description,
      responsible: r.responsible,
      type: r.type,
      partsUsed: r.partsUsed,
      durationHours: r.durationHours,
      cost: r.cost,
      date: r.date,
      observations: r.observations,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const machine = state.machines.find((m) => m.id === form.machineId);
    if (!machine || !form.description.trim()) return;

    if (editingRepair) {
      updateRepair(editingRepair.id, {
        ...form,
        machineName: machine.name,
        description: form.description.trim(),
      });
    } else {
      addRepair({
        ...form,
        machineName: machine.name,
        description: form.description.trim(),
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Reparaciones Filtradas</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{filteredRepairs.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Horas Técnicas Invertidas</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">{totalHours.toFixed(1)} h</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Costo Acumulado</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            ${totalCost.toLocaleString('es-CL')}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-56 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar reparación, técnico o código..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <select
            value={machineFilter}
            onChange={(e) => setMachineFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="Todas">Máquina: Todas</option>
            {state.machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} — {m.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="Todos">Tipo: Todos</option>
            <option value="Correctivo">Correctivo</option>
            <option value="Preventivo">Preventivo</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Registrar Reparación
        </button>
      </div>

      {/* Table */}
      {filteredRepairs.length === 0 ? (
        <EmptyState
          icon={<History className="h-6 w-6" />}
          title="No se encontraron reparaciones"
          description="Cambia los filtros o registra una nueva intervención técnica realizada."
          actionLabel="Registrar Reparación"
          onAction={openCreate}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3.5">Código / Fecha</th>
                  <th className="px-4 py-3.5">Máquina</th>
                  <th className="px-4 py-3.5">Descripción del Trabajo</th>
                  <th className="px-4 py-3.5">Responsable</th>
                  <th className="px-4 py-3.5">Tipo</th>
                  <th className="px-4 py-3.5">Duración / Costo</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRepairs.map((repair) => (
                  <tr key={repair.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-bold text-blue-600">{repair.code}</span>
                      <span className="block text-slate-500">{repair.date}</span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {repair.machineName}
                    </td>
                    <td className="max-w-sm px-4 py-3.5 text-slate-600">
                      <p className="line-clamp-2">{repair.description}</p>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                      {repair.responsible}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={repair.type === 'Correctivo' ? 'amber' : 'blue'}>
                        {repair.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="font-semibold text-slate-900">
                        {repair.durationHours} h
                      </span>
                      <span className="block text-slate-500">
                        ${repair.cost.toLocaleString('es-CL')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailRepair(repair)}
                          title="Ver detalle completo"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(repair)}
                          title="Editar"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar registro ${repair.code}?`)) {
                              deleteRepair(repair.id);
                            }
                          }}
                          title="Eliminar"
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

      {/* Detail Modal */}
      <Modal
        open={Boolean(detailRepair)}
        onClose={() => setDetailRepair(null)}
        title={detailRepair ? `Detalle de Reparación ${detailRepair.code}` : ''}
        subtitle={detailRepair?.machineName}
      >
        {detailRepair && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-slate-400">Responsable</span>
                <p className="mt-0.5 font-semibold text-slate-900">{detailRepair.responsible}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <span className="text-slate-400">Fecha / Duración</span>
                <p className="mt-0.5 font-semibold text-slate-900">
                  {detailRepair.date} ({detailRepair.durationHours} h)
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase">Descripción Técnica</h4>
              <p className="mt-1 text-slate-700">{detailRepair.description}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase">Repuestos Utilizados</h4>
              <p className="mt-1 text-slate-700">
                {detailRepair.partsUsed || 'No especificados'}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase">Observaciones</h4>
              <p className="mt-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                {detailRepair.observations || 'Sin observaciones adicionales.'}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingRepair
            ? `Editar Reparación ${editingRepair.code}`
            : 'Registrar Reparación Realizada'
        }
        subtitle="Documenta la intervención técnica para mantener la trazabilidad del equipo."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Máquina *</label>
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
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Responsable *
              </label>
              <select
                value={form.responsible}
                onChange={(e) => setForm({ ...form, responsible: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {state.workers.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name} ({w.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Descripción de la reparación *
            </label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Tipo</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as 'Correctivo' | 'Preventivo' })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Correctivo">Correctivo</option>
                <option value="Preventivo">Preventivo</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Fecha *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Horas</label>
              <input
                type="number"
                step="0.5"
                min={0.5}
                value={form.durationHours}
                onChange={(e) =>
                  setForm({ ...form, durationHours: Number(e.target.value) || 0.5 })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Costo ($)</label>
              <input
                type="number"
                min={0}
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: Number(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Repuestos utilizados
            </label>
            <input
              type="text"
              value={form.partsUsed}
              onChange={(e) => setForm({ ...form, partsUsed: e.target.value })}
              placeholder="Ej.: 2x Rodamiento SKF 6205"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Observaciones posteriores
            </label>
            <textarea
              rows={2}
              value={form.observations}
              onChange={(e) => setForm({ ...form, observations: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
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
              {editingRepair ? 'Guardar Cambios' : 'Registrar Reparación'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
