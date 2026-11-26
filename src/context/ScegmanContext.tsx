import React, { createContext, useContext, useEffect, useState } from 'react';
import { SEED_DATA } from '../data/seedData';
import type {
  FaultReport,
  FaultStatus,
  InternalMessage,
  InventoryMovement,
  Machine,
  MachineStatus,
  MaintenanceTask,
  MovementType,
  RepairRecord,
  ScegmanState,
  SparePart,
  SparePartStatus,
  TaskStatus,
} from '../types/scegman';

const STORAGE_KEY = 'scegman_app_state_v1';

interface ScegmanContextValue {
  state: ScegmanState;
  setActiveWorkerId: (workerId: string) => void;
  resetDemoData: () => void;

  // HU01 - Faults
  addFault: (fault: Omit<FaultReport, 'id' | 'code'>) => void;
  updateFault: (id: string, updates: Partial<FaultReport>) => void;
  updateFaultStatus: (id: string, status: FaultStatus) => void;
  deleteFault: (id: string) => void;

  // HU02 - Machines
  addMachine: (machine: Omit<Machine, 'id'>) => void;
  updateMachine: (id: string, updates: Partial<Machine>) => void;
  updateMachineStatus: (id: string, status: MachineStatus) => void;
  deleteMachine: (id: string) => void;

  // HU04 - Spare Parts
  addSparePart: (part: Omit<SparePart, 'id' | 'status' | 'updatedAt'> & { status?: SparePartStatus }) => void;
  updateSparePart: (id: string, updates: Partial<SparePart>) => void;
  deleteSparePart: (id: string) => void;

  // HU05 - Inventory Movements
  registerMovement: (input: {
    partId: string;
    type: MovementType;
    quantity: number;
    reason: string;
    responsible: string;
    date: string;
  }) => { ok: boolean; error?: string };
  deleteMovement: (id: string) => void;

  // HU06 - Tasks
  addTask: (task: Omit<MaintenanceTask, 'id' | 'code' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<MaintenanceTask>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;

  // HU07 - Messages
  sendMessage: (msg: Omit<InternalMessage, 'id' | 'timestamp'>) => void;
  deleteMessage: (id: string) => void;

  // HU08 - Repairs
  addRepair: (repair: Omit<RepairRecord, 'id' | 'code'>) => void;
  updateRepair: (id: string, updates: Partial<RepairRecord>) => void;
  deleteRepair: (id: string) => void;
}

const ScegmanContext = createContext<ScegmanContextValue | null>(null);

export function computePartStatus(quantity: number, minStock: number, currentStatus?: SparePartStatus): SparePartStatus {
  if (currentStatus === 'Descontinuado') return 'Descontinuado';
  if (quantity <= 0) return 'Agotado';
  if (quantity <= minStock) return 'Stock bajo';
  return 'Disponible';
}

function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getNowTimestamp(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${date} ${hours}:${minutes}`;
}

function loadInitialState(): ScegmanState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_DATA;
    const parsed = JSON.parse(raw) as ScegmanState;
    if (!parsed || !Array.isArray(parsed.machines) || !Array.isArray(parsed.faults)) {
      return SEED_DATA;
    }
    return parsed;
  } catch {
    return SEED_DATA;
  }
}

export function ScegmanProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ScegmanState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const setActiveWorkerId = (workerId: string) => {
    setState((prev) => ({ ...prev, activeWorkerId: workerId }));
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(SEED_DATA);
  };

  // HU01 - Faults
  const addFault = (fault: Omit<FaultReport, 'id' | 'code'>) => {
    setState((prev) => {
      const nextNum = 101 + prev.faults.length + Math.floor(Math.random() * 5);
      const newFault: FaultReport = {
        ...fault,
        id: `f-${Date.now()}`,
        code: `FAL-${nextNum}`,
      };
      return { ...prev, faults: [newFault, ...prev.faults] };
    });
  };

  const updateFault = (id: string, updates: Partial<FaultReport>) => {
    setState((prev) => ({
      ...prev,
      faults: prev.faults.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const updateFaultStatus = (id: string, status: FaultStatus) => {
    updateFault(id, { status });
  };

  const deleteFault = (id: string) => {
    setState((prev) => ({
      ...prev,
      faults: prev.faults.filter((f) => f.id !== id),
    }));
  };

  // HU02 - Machines
  const addMachine = (machine: Omit<Machine, 'id'>) => {
    setState((prev) => ({
      ...prev,
      machines: [{ ...machine, id: `m-${Date.now()}` }, ...prev.machines],
    }));
  };

  const updateMachine = (id: string, updates: Partial<Machine>) => {
    setState((prev) => ({
      ...prev,
      machines: prev.machines.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  };

  const updateMachineStatus = (id: string, status: MachineStatus) => {
    updateMachine(id, { status });
  };

  const deleteMachine = (id: string) => {
    setState((prev) => ({
      ...prev,
      machines: prev.machines.filter((m) => m.id !== id),
    }));
  };

  // HU04 - Spare Parts
  const addSparePart = (
    part: Omit<SparePart, 'id' | 'status' | 'updatedAt'> & { status?: SparePartStatus }
  ) => {
    setState((prev) => {
      const computedStatus =
        part.status === 'Descontinuado'
          ? 'Descontinuado'
          : computePartStatus(part.quantity, part.minStock);
      const newPart: SparePart = {
        ...part,
        id: `p-${Date.now()}`,
        status: computedStatus,
        updatedAt: getTodayDate(),
      };
      return { ...prev, spareParts: [newPart, ...prev.spareParts] };
    });
  };

  const updateSparePart = (id: string, updates: Partial<SparePart>) => {
    setState((prev) => ({
      ...prev,
      spareParts: prev.spareParts.map((p) => {
        if (p.id !== id) return p;
        const qty = updates.quantity !== undefined ? updates.quantity : p.quantity;
        const min = updates.minStock !== undefined ? updates.minStock : p.minStock;
        const targetStatus =
          updates.status === 'Descontinuado'
            ? 'Descontinuado'
            : computePartStatus(qty, min, updates.status);
        return {
          ...p,
          ...updates,
          status: targetStatus,
          updatedAt: getTodayDate(),
        };
      }),
    }));
  };

  const deleteSparePart = (id: string) => {
    setState((prev) => ({
      ...prev,
      spareParts: prev.spareParts.filter((p) => p.id !== id),
    }));
  };

  // HU05 - Inventory Movements
  const registerMovement: ScegmanContextValue['registerMovement'] = ({
    partId,
    type,
    quantity,
    reason,
    responsible,
    date,
  }) => {
    if (quantity <= 0) {
      return { ok: false, error: 'La cantidad debe ser mayor a cero.' };
    }
    const target = state.spareParts.find((p) => p.id === partId);
    if (!target) {
      return { ok: false, error: 'Repuesto no encontrado.' };
    }
    if (type === 'Salida' && quantity > target.quantity) {
      return {
        ok: false,
        error: `Stock insuficiente. Disponible: ${target.quantity} ${target.unit}.`,
      };
    }

    const newQuantity = type === 'Entrada' ? target.quantity + quantity : target.quantity - quantity;
    const newStatus = computePartStatus(newQuantity, target.minStock, target.status === 'Descontinuado' ? undefined : target.status);

    const movement: InventoryMovement = {
      id: `mv-${Date.now()}`,
      partId: target.id,
      partName: target.name,
      partSku: target.sku,
      type,
      quantity,
      reason,
      responsible,
      date,
      stockAfter: newQuantity,
    };

    setState((prev) => ({
      ...prev,
      spareParts: prev.spareParts.map((p) =>
        p.id === partId
          ? { ...p, quantity: newQuantity, status: newStatus, updatedAt: date }
          : p
      ),
      movements: [movement, ...prev.movements],
    }));

    return { ok: true };
  };

  const deleteMovement = (id: string) => {
    setState((prev) => ({
      ...prev,
      movements: prev.movements.filter((mv) => mv.id !== id),
    }));
  };

  // HU06 - Tasks
  const addTask = (task: Omit<MaintenanceTask, 'id' | 'code' | 'createdAt'>) => {
    setState((prev) => {
      const nextNum = 301 + prev.tasks.length + Math.floor(Math.random() * 5);
      const newTask: MaintenanceTask = {
        ...task,
        id: `t-${Date.now()}`,
        code: `TAR-${nextNum}`,
        createdAt: getTodayDate(),
      };
      return { ...prev, tasks: [newTask, ...prev.tasks] };
    });
  };

  const updateTask = (id: string, updates: Partial<MaintenanceTask>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
  };

  const deleteTask = (id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  // HU07 - Messages
  const sendMessage = (msg: Omit<InternalMessage, 'id' | 'timestamp'>) => {
    setState((prev) => ({
      ...prev,
      messages: [
        {
          ...msg,
          id: `msg-${Date.now()}`,
          timestamp: getNowTimestamp(),
        },
        ...prev.messages,
      ],
    }));
  };

  const deleteMessage = (id: string) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.filter((m) => m.id !== id),
    }));
  };

  // HU08 - Repairs
  const addRepair = (repair: Omit<RepairRecord, 'id' | 'code'>) => {
    setState((prev) => {
      const nextNum = 501 + prev.repairs.length + Math.floor(Math.random() * 5);
      const newRepair: RepairRecord = {
        ...repair,
        id: `r-${Date.now()}`,
        code: `REP-${nextNum}`,
      };
      return { ...prev, repairs: [newRepair, ...prev.repairs] };
    });
  };

  const updateRepair = (id: string, updates: Partial<RepairRecord>) => {
    setState((prev) => ({
      ...prev,
      repairs: prev.repairs.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    }));
  };

  const deleteRepair = (id: string) => {
    setState((prev) => ({
      ...prev,
      repairs: prev.repairs.filter((r) => r.id !== id),
    }));
  };

  return (
    <ScegmanContext.Provider
      value={{
        state,
        setActiveWorkerId,
        resetDemoData,
        addFault,
        updateFault,
        updateFaultStatus,
        deleteFault,
        addMachine,
        updateMachine,
        updateMachineStatus,
        deleteMachine,
        addSparePart,
        updateSparePart,
        deleteSparePart,
        registerMovement,
        deleteMovement,
        addTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        sendMessage,
        deleteMessage,
        addRepair,
        updateRepair,
        deleteRepair,
      }}
    >
      {children}
    </ScegmanContext.Provider>
  );
}

export function useScegman() {
  const ctx = useContext(ScegmanContext);
  if (!ctx) {
    throw new Error('useScegman must be used inside ScegmanProvider');
  }
  return ctx;
}
