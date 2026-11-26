import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Boxes,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { Badge, getPartStatusVariant } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useScegman } from '../context/ScegmanContext';
import type { MovementType } from '../types/scegman';

export function InventoryPage() {
  const { state, registerMovement, deleteMovement } = useScegman();

  const [search, setSearch] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [movementError, setMovementError] = useState<string | null>(null);

  const activeWorker =
    state.workers.find((w) => w.id === state.activeWorkerId) ?? state.workers[0];

  const [movementForm, setMovementForm] = useState({
    partId: state.spareParts[0]?.id ?? '',
    type: 'Entrada' as MovementType,
    quantity: 1,
    reason: '',
    responsible: activeWorker.name,
    date: new Date().toISOString().split('T')[0],
  });

  const lowStockParts = state.spareParts.filter(
    (p) => p.status === 'Stock bajo' || p.status === 'Agotado'
  );

  const filteredParts = useMemo(() => {
    const q = search.toLowerCase();
    return state.spareParts.filter((p) => {
      const matchesText =
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      const matchesLow =
        !onlyLowStock || p.status === 'Stock bajo' || p.status === 'Agotado';
      return matchesText && matchesLow;
    });
  }, [state.spareParts, search, onlyLowStock]);

  const totalUnits = state.spareParts.reduce((acc, p) => acc + p.quantity, 0);
  const totalValue = state.spareParts.reduce((acc, p) => acc + p.quantity * p.unitCost, 0);

  const openMovementModal = (defaultType: MovementType, preselectedPartId?: string) => {
    setMovementError(null);
    setMovementForm({
      partId: preselectedPartId ?? state.spareParts[0]?.id ?? '',
      type: defaultType,
      quantity: 1,
      reason: '',
      responsible: activeWorker.name,
      date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleRegisterMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const res = registerMovement(movementForm);
    if (!res.ok) {
      setMovementError(res.error ?? 'Error al registrar movimiento.');
      return;
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alert Banner */}
      {lowStockParts.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-xs">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  Alerta de Existencias Bajas en Bodega ({lowStockParts.length} productos)
                </h3>
                <p className="mt-0.5 text-xs text-amber-800">
                  Los siguientes productos están por debajo del mínimo requerido o agotados. Registra una entrada de reposición.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOnlyLowStock((v) => !v)}
              className="shrink-0 rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
            >
              {onlyLowStock ? 'Mostrar todo el inventario' : 'Ver solo alertas'}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {lowStockParts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => openMovementModal('Entrada', p.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 transition hover:border-blue-400"
              >
                <span className="font-bold text-rose-700">
                  {p.quantity}/{p.minStock}
                </span>
                <span>{p.name}</span>
                <span className="text-blue-600 underline">+ Reponer</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Unidades Totales en Bodega</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalUnits}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Valorización de Stock</p>
          <p className="mt-1 text-2xl font-bold text-blue-700">
            ${totalValue.toLocaleString('es-CL')}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase">Movimientos Registrados</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{state.movements.length}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar inventario por producto, SKU o estante..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-3 pl-9 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => openMovementModal('Entrada')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-emerald-700"
          >
            <ArrowDownLeft className="h-4 w-4" />
            Registrar Entrada
          </button>
          <button
            type="button"
            onClick={() => openMovementModal('Salida')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700"
          >
            <ArrowUpRight className="h-4 w-4" />
            Registrar Salida
          </button>
        </div>
      </div>

      {/* Two-Column Inventory + Kardex */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* General Inventory Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs xl:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Boxes className="h-4.5 w-4.5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Existencias Actuales en Bodega</h3>
            </div>
            <span className="text-xs text-slate-500">{filteredParts.length} productos</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Producto / SKU</th>
                  <th className="px-4 py-3">Ubicación</th>
                  <th className="px-4 py-3">Stock / Mín.</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Movimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredParts.map((part) => (
                  <tr key={part.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{part.name}</span>
                      <span className="block text-[11px] text-slate-400">{part.sku}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{part.location}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-slate-900">{part.quantity}</span>{' '}
                      <span className="text-slate-500">{part.unit}</span>
                      <span className="block text-[11px] text-slate-400">
                        Mínimo: {part.minStock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getPartStatusVariant(part.status)} dot>
                        {part.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => openMovementModal('Entrada', part.id)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700 hover:bg-emerald-100"
                        >
                          + Entrada
                        </button>
                        <button
                          type="button"
                          disabled={part.quantity === 0}
                          onClick={() => openMovementModal('Salida', part.id)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 font-semibold text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          - Salida
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Movements Log */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-bold text-slate-900">Historial de Movimientos</h3>
            <button
              type="button"
              onClick={() => openMovementModal('Entrada')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo
            </button>
          </div>
          <div className="max-h-[480px] divide-y divide-slate-100 overflow-y-auto p-2">
            {state.movements.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">
                No hay movimientos registrados.
              </p>
            ) : (
              state.movements.map((mv) => (
                <div key={mv.id} className="rounded-xl p-3 transition hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-lg p-1.5 ${
                          mv.type === 'Entrada'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {mv.type === 'Entrada' ? (
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{mv.partName}</p>
                        <p className="text-[11px] text-slate-400">
                          {mv.date} · {mv.responsible}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold ${
                          mv.type === 'Entrada' ? 'text-emerald-700' : 'text-blue-700'
                        }`}
                      >
                        {mv.type === 'Entrada' ? `+${mv.quantity}` : `-${mv.quantity}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('¿Eliminar este registro del historial de movimientos?')) {
                            deleteMovement(mv.id);
                          }
                        }}
                        title="Eliminar registro"
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600">{mv.reason}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Stock resultante: <strong>{mv.stockAfter}</strong>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Register Movement Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Registrar ${movementForm.type} de Bodega`}
        subtitle="Actualiza el stock disponible y deja trazabilidad del movimiento."
      >
        <form onSubmit={handleRegisterMovement} className="space-y-4">
          {movementError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              {movementError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMovementError(null);
                setMovementForm({ ...movementForm, type: 'Entrada' });
              }}
              className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition ${
                movementForm.type === 'Entrada'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowDownLeft className="h-4 w-4" />
              Entrada
            </button>
            <button
              type="button"
              onClick={() => {
                setMovementError(null);
                setMovementForm({ ...movementForm, type: 'Salida' });
              }}
              className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition ${
                movementForm.type === 'Salida'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ArrowUpRight className="h-4 w-4" />
              Salida
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Producto *</label>
            <select
              required
              value={movementForm.partId}
              onChange={(e) => {
                setMovementError(null);
                setMovementForm({ ...movementForm, partId: e.target.value });
              }}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {state.spareParts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} — {p.name} (Stock actual: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Cantidad *</label>
              <input
                type="number"
                min={1}
                required
                value={movementForm.quantity}
                onChange={(e) =>
                  setMovementForm({ ...movementForm, quantity: Number(e.target.value) || 1 })
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Fecha *</label>
              <input
                type="date"
                required
                value={movementForm.date}
                onChange={(e) => setMovementForm({ ...movementForm, date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Responsable *
            </label>
            <select
              value={movementForm.responsible}
              onChange={(e) => setMovementForm({ ...movementForm, responsible: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {state.workers.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name} ({w.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Motivo / Orden asociada *
            </label>
            <input
              type="text"
              required
              value={movementForm.reason}
              onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
              placeholder="Ej.: Orden de compra #OC-425 o Reparación Prensa 400T"
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
              Confirmar {movementForm.type}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
