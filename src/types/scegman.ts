export type ModuleKey =
  | 'dashboard'
  | 'fallas'
  | 'maquinas'
  | 'informes'
  | 'repuestos'
  | 'inventario'
  | 'tareas'
  | 'comunicacion'
  | 'historial';

export type MachineStatus = 'Operativa' | 'En mantenimiento' | 'Fuera de servicio';
export type FaultPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export type FaultStatus = 'Abierta' | 'En revisión' | 'En reparación' | 'Resuelta';
export type TaskPriority = 'Baja' | 'Media' | 'Alta' | 'Urgente';
export type TaskStatus = 'Pendiente' | 'En proceso' | 'Completada';
export type MaintenanceType = 'Preventivo' | 'Correctivo' | 'Inspección';
export type SparePartStatus = 'Disponible' | 'Stock bajo' | 'Agotado' | 'Descontinuado';
export type MovementType = 'Entrada' | 'Salida';
export type MessageTag = 'General' | 'Urgente' | 'Repuesto' | 'Turno';

export interface Worker {
  id: string;
  name: string;
  role: string;
  area: string;
  avatarInitials: string;
  email: string;
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  area: string;
  model: string;
  manufacturer: string;
  serialNumber: string;
  installDate: string;
  operatingHours: number;
  lastMaintenance: string;
  nextMaintenance: string;
  status: MachineStatus;
  notes: string;
}

export interface FaultReport {
  id: string;
  code: string;
  machineId: string;
  machineName: string;
  description: string;
  date: string;
  priority: FaultPriority;
  status: FaultStatus;
  reportedBy: string;
  area: string;
}

export interface SparePart {
  id: string;
  sku: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  minStock: number;
  unitCost: number;
  supplier: string;
  status: SparePartStatus;
  unit: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  partId: string;
  partName: string;
  partSku: string;
  type: MovementType;
  quantity: number;
  reason: string;
  responsible: string;
  date: string;
  stockAfter: number;
}

export interface MaintenanceTask {
  id: string;
  code: string;
  title: string;
  description: string;
  machineId: string;
  machineName: string;
  assignedTo: string;
  priority: TaskPriority;
  type: MaintenanceType;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  linkedFaultId?: string;
}

export interface InternalMessage {
  id: string;
  channel: 'General Planta' | 'Turno Mañana' | 'Bodega y Repuestos' | 'Supervisión';
  senderId: string;
  senderName: string;
  senderRole: string;
  recipient: string;
  subject: string;
  content: string;
  tag: MessageTag;
  timestamp: string;
}

export interface RepairRecord {
  id: string;
  code: string;
  machineId: string;
  machineName: string;
  description: string;
  responsible: string;
  type: 'Correctivo' | 'Preventivo';
  partsUsed: string;
  durationHours: number;
  cost: number;
  date: string;
  observations: string;
}

export interface ScegmanState {
  workers: Worker[];
  activeWorkerId: string;
  machines: Machine[];
  faults: FaultReport[];
  spareParts: SparePart[];
  movements: InventoryMovement[];
  tasks: MaintenanceTask[];
  messages: InternalMessage[];
  repairs: RepairRecord[];
}
