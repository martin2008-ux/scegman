import React, { useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2, Wrench } from 'lucide-react';
import { Badge, getPartStatusVariant } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { useScegman } from '../context/ScegmanContext';
import type { SparePart, SparePartStatus } from '../types/scegman';

const PART_CATEGORIES = [
  'Rodamientos',
  'Hidráulica',
  'Filtros',
  'Eléctrica y Control',
  'Transmisión',
  'Lubricantes',
  'Neumática',
];

const PART_STATUSES: SparePartStatus[] = [
  'Disponible',
  'Stock bajo',
  'Agotado',
  'Descontinuado',
];

export function SparePartsPage() {
  const { state, addSparePart, updateSparePart, deleteSparePart } = useScegman();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);

  const [form, setForm] = useState({
    sku: '',
    name: '',
    category: PART_CATEGORIES[0],
    location: '',
    quantity: 0,
    minStock: 2,
    unitCost: 0,
    supplier: '',
    unit: 'unidades',
    status: 'Disponible' as SparePartStatus,
  });

  const filteredParts = useMemo(() => {
    const q = search.toLowerCase();
    return state.spareParts.filter((p) => {
      const matchesText =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q);
      const matchesCat = categoryFilter === 'Todas' || p.category === categoryFilter;
      const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
      return matchesText && matchesCat && matchesStatus;
    });
  }, [state.spareParts, search, categoryFilter, statusFilter]);

  const openCreate = () => {
    setEditingPart(null);
    setForm({
      sku: `REP-${String(100 + state.spareParts.length * 7)}`,
      name: '',
      category: PART_CATEGORIES[0],
      location: 'Estante A-01',
      quantity: 5,
      minStock: 3,
      unitCost: 15000,
      supplier: '',
      unit: 'unidades',
      status: 'Disponible',
    });
    setModalOpen(true);
  };

  const openEdit = (part: SparePart) => {
    setEditingPart(part);
    setForm({
      sku: part.sku,
      name: part.name,
      category: part.category,
      location: part.location,
      quantity: part.quantity,
      minStock: part.minStock,
      unitCost: part.unitCost,
      supplier: part.supplier,
      unit: part.unit,
      status: part.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.sku.trim()) return;

    if (editingPart) {
      updateSparePart(editingPart.id, {
        ...form,
        name: form.name.trim(),
        sku: form.sku.trim(),
      });
    } else {
      addSparePart({
        ...form,
        name: form.name.trim(),
        sku: form.sku.trim(),
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Catálogo Repuestos</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{state.spareParts.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-xs font-semibold text-emerald-700 uppercase">Disponibles</p>
          <p className="mt-1 text-2xl font-bold text-emerald-900">
            {state.spareParts.filter((p) => p.status === 'Disponible').length}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <p className="text-xs font-semibold text-amber-700 uppercase">Stock Bajo</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">
            {state.spareParts.filter((p) => p.status === 'Stock bajo').length}
          </p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
          <p className="text-xs font-semibold text-rose-700 uppercase">Agotados</p>
          <p className="mt-1 text-2xl font-bold text-rose-900">
            {state.spareParts.filter((p) => p.status === 'Agotado').length}
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
              placeholder="Buscar por nombre, SKU o proveedor..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="Todas">Categoría: Todas</option>
            {PART_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="Todos">Estado: Todos</option>
            {PART_STATUSES.map((s) => (
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
          Nuevo Repuesto
        </button>
      </div>

      {/* Table */}
      {filteredParts.length === 0 ? (
        <EmptyState
          icon={<Wrench className="h-6 w-6" />}
          title="No hay repuestos que coincidan"
          description="Modifica los filtros o registra un nuevo repuesto en el catálogo."
          actionLabel="Registrar Repuesto"
          onAction={openCreate}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3.5">SKU / Nombre</th>
                  <th className="px-4 py-3.5">Categoría</th>
                  <th className="px-4 py-3.5">Ubicación</th>
                  <th className="px-4 py-3.5">Cantidad</th>
                  <th className="px-4 py-3.5">Costo Unit.</th>
                  <th className="px-4 py-3.5">Estado</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParts.map((part) => (
                  <tr key={part.id} className="transition hover:bg-slate-50/80">
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-bold text-blue-600">{part.sku}</span>
                      <p className="font-semibold text-slate-900">{part.name}</p>
                      <span className="text-xs text-slate-400">Prov.: {part.supplier || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600">
                      {part.category}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{part.location}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-bold text-slate-900">
                        {part.quantity} {part.unit}
                      </span>
                      <span className="block text-[11px] text-slate-400">
                        Mínimo: {part.minStock}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">
                      ${part.unitCost.toLocaleString('es-CL')}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={getPartStatusVariant(part.status)} dot>
                        {part.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(part)}
                          title="Modificar repuesto"
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-blue-600"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar el repuesto ${part.name}?`)) {
                              deleteSparePart(part.id);
                            }
                          }}
                          title="Eliminar repuesto"
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

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPart ? `Modificar ${editingPart.sku}` : 'Registrar Nuevo Repuesto'}
        subtitle="El estado se calcula automáticamente según el stock mínimo, o puedes marcarlo como Descontinuado."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Código SKU *</label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nombre del repuesto *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej.: Rodamiento SKF 6205-2RSH"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Categoría</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {PART_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Ubicación en bodega *
              </label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Cantidad *</label>
              <input
                type="number"
                min={0}
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Stock mínimo *
              </label>
              <input
                type="number"
                min={0}
                required
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Unidad</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Costo unit. ($)
              </label>
              <input
                type="number"
                min={0}
                value={form.unitCost}
                onChange={(e) => setForm({ ...form, unitCost: Number(e.target.value) || 0 })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Proveedor</label>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Estado (opcional)
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as SparePartStatus })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Disponible">Automático según stock</option>
                <option value="Descontinuado">Descontinuado</option>
              </select>
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
              {editingPart ? 'Guardar Cambios' : 'Registrar Repuesto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
